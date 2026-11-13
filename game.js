// 단어 친구들 - 게임 핵심 (전역 이름은 wd 로 시작)
// 읽는 순서: 단어(words-*) -> pos -> friends -> 예문(ex-*) -> sound -> game -> custom -> puzzle -> start
const WD_KEY = 'wordfriends-v3';
const WD_MASTER = 5;      // 이 칸에 닿으면 "외웠어요"
const WD_MAXBOX = 7;
const WD_INT = [0, 0, 0, 1, 2, 4, 7, 14];   // 칸이 오른 뒤 다시 풀 때까지 며칠 (날짜 기준 복습)
const WD_STAGE = 20;      // 20개를 외우면 친구 1명
const WD_LEVELS = [
  { n: '초등 고학년', t: '초등', e: '🎒', c: '', s: [WD_L1, WD_L1B, WD_L1C].join('\n') },
  { n: '중학교', t: '중등', e: '📘', c: 'blue', s: [WD_L2, WD_L2B, WD_L2C, WD_L2D].join('\n') },
  { n: '고등학교', t: '고등', e: '🎓', c: 'green', s: [WD_L3, WD_L3B, WD_L3C, WD_L3D, WD_L3E, WD_L3F, WD_L3G, WD_L3H, WD_L3I].join('\n') },
  { n: '숙어', t: '숙어', e: '🔗', c: 'purple', s: WD_L4 + '\n' + WD_L4B, idiom: true },
  { n: '내 단어장', t: '내것', e: '✏️', c: 'pink', s: '', custom: true }
];
const WD_APK = 'https://github.com/tiottu/Englishwords/releases/latest/download/englishwords.apk';
const WD_TIER = ['', '금빛 ', '무지개 '];   // 동물을 한 바퀴 다 만나면 다음 모습으로

const $app = document.getElementById('app');
function wdLoad() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(WD_KEY)); } catch (e) {}
  if (!s || !s.box) s = { box: {}, stars: 0, days: [] };
  s.due = s.due || {};        // 단어마다 다시 풀 날짜
  s.got = s.got || {};        // 얻은 친구 ("단계:번호") - 복습에서 틀려도 사라지지 않는다
  s.custom = s.custom || [];  // 내 단어장 [{en, ko, pos, ex}]
  return s;
}
let wd = wdLoad();
function wdSave() { try { localStorage.setItem(WD_KEY, JSON.stringify(wd)); } catch (e) {} }

const WORDS = [];
const WD_EXMAP = {};   // 단어 -> 영어 예문
(() => {
  const seen = new Set();
  WD_LEVELS.forEach((L, i) => L.s.split('\n').forEach(line => {
    const p = line.trim().split('|');
    if (p.length < 2 || !p[0] || seen.has(p[0])) return;
    seen.add(p[0]);
    // 세 번째 칸에 품사가 적혀 있으면 그대로, 없으면 뜻의 끝말로 맞춘다
    WORDS.push({ en: p[0], ko: p[1], lv: i, pos: L.idiom ? 'i' : (WD_POS_NAME[p[2]] ? p[2] : wdPosOf(p[0], p[1])) });
  }));
  (window.WD_EXS || []).forEach(txt => txt.split('\n').forEach(line => {
    const k = line.indexOf('|');
    if (k > 0) WD_EXMAP[line.slice(0, k).trim()] = line.slice(k + 1).trim();
  }));
  wd.custom.forEach(c => {
    if (seen.has(c.en)) return;
    seen.add(c.en);
    WORDS.push({ en: c.en, ko: c.ko, lv: 4, pos: c.pos || 'n' });
    if (c.ex) WD_EXMAP[c.en] = c.ex;
  });
})();

let R = null;   // 지금 하는 한 판
let S = null;   // 철자 맞추기 상태

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const wdEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wdBox = w => wd.box[w.en];
const wdPool = lv => WORDS.filter(w => w.lv == lv);
const wdIsDone = w => wdBox(w) >= WD_MASTER;
function wdStages(lv) {
  const p = wdPool(lv), out = [];
  for (let i = 0; i < p.length; i += WD_STAGE) out.push(p.slice(i, i + WD_STAGE));
  return out;
}
const WD_OFF = (() => {   // 단계마다 친구 번호가 어디서 시작하는지
  let o = 0;
  return WD_LEVELS.map((_, l) => { const s = o; o += Math.ceil(WORDS.filter(w => w.lv == l).length / WD_STAGE); return s; });
})();
function wdFriend(lv, i) {
  const n = WD_OFF[lv] + i, A = WD_ANIMALS.length, a = WD_ANIMALS[n % A], tier = Math.floor(n / A) % WD_TIER.length;
  return { e: a[0], name: WD_TIER[tier] + a[1], tier };
}
const wdFriendHtml = f => `<span class="fr t${f.tier}">${f.e}</span>`;
const wdStageIdx = w => Math.floor(wdPool(w.lv).indexOf(w) / WD_STAGE);   // 이 단어가 몇 번째 묶음(친구)인지
const wdGotKey = (lv, i) => lv + ':' + i;
const wdHasFriend = (lv, i, st) => !!wd.got[wdGotKey(lv, i)] || st.every(wdIsDone);
const wdBadge = w => `<span class="pos ${w.pos}">${WD_POS_NAME[w.pos]}</span>`;
const wdBigWord = t => `<div class="word" style="font-size:${t.length > 18 ? 26 : t.length > 11 ? 36 : 50}px">${t}</div>`;
// 이미 20개를 다 외운 단계의 친구는 기록해 둔다 (이전 버전에서 올 때)
function wdBackfillGot() {
  WD_LEVELS.forEach((_, lv) => wdStages(lv).forEach((st, i) => { if (st.length && st.every(wdIsDone)) wd.got[wdGotKey(lv, i)] = 1; }));
  wdSave();
}

// ---- 기록 / 날짜 ----
function wdDate(offset) { const d = new Date(); d.setDate(d.getDate() + (offset || 0)); return d.toLocaleDateString('sv-SE'); }
function wdToday() { return wdDate(0); }
function wdStreak() {
  const d = new Date(), has = x => wd.days.includes(x.toLocaleDateString('sv-SE'));
  let n = 0;
  if (!has(d)) d.setDate(d.getDate() - 1);
  while (has(d)) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
// 복습할 날이 된 단어 (본 적 있고, 정해진 날짜가 오늘이거나 지난 것)
const wdIsDue = w => wdBox(w) !== undefined && (wd.due[w.en] || '') <= wdToday();
const wdDueCount = lv => wdPool(lv).filter(wdIsDue).length;

// ---- 첫 화면 ----
function wdHome() {
  const friends = Object.keys(wd.got).length;
  const dueAll = WD_LEVELS.reduce((s, _, i) => s + wdDueCount(i), 0);
  const lv = WD_LEVELS.map((L, i) => {
    const total = wdPool(i).length, n = wdPool(i).filter(wdIsDone).length, d = wdDueCount(i);
    const go = L.custom && !total ? 'wdMine()' : `wdStart(${i})`;
    return `<button class="btn lvbtn ${L.c}" onclick="${go}"><span>${L.e} ${L.n}</span><small>${d ? '📅' + d + ' · ' : ''}${n}/${total}</small></button>`;
  }).join('');
  const pz = typeof wdPzHomeLabel == 'function' ? wdPzHomeLabel() : '';
  $app.innerHTML = `<div class="big" style="font-size:64px">🐾</div><h1>단어 친구들</h1>
    <div class="stats"><span>🧸 친구 ${friends}명</span><span>⭐ ${wd.stars}</span><span>🔥 ${wdStreak()}일</span></div>
    <div class="tag">${dueAll ? '새 단어와 옛 단어 ' + dueAll + '개가 섞여서 나와요' : '어디서 시작할까요?'}</div>${lv}
    ${pz ? `<button class="btn pzbtn" onclick="wdPuzzle()">${pz}</button>` : ''}
    <button class="btn small" style="background:#b08850;box-shadow:0 5px 0 #7d5e30" onclick="wdDex(0)">📖 내 친구들</button>
    <button class="btn small" style="background:#e0709a;box-shadow:0 5px 0 #a8426b" onclick="wdMine()">✏️ 내 단어장 관리</button>
    <button class="btn small" style="background:#9a9a9a;box-shadow:0 5px 0 #6f6f6f" onclick="wdSoundTest()">🔧 소리 점검</button>
    ${WD_IN_APP ? '' : `<a class="btn small" style="background:#3fa34d;box-shadow:0 5px 0 #2a7a36;text-align:center;text-decoration:none" href="${WD_APK}">📱 앱으로 받기 (안드로이드)</a>`}`;
}

// ---- 한 판 ----
// 복습할 날이 된 단어 먼저, 새 단어를 조금 섞고, 모자라면 아직 날짜가 안 된 단어로 연습만 한다
function wdPickRound(lv) {
  const pool = wdPool(lv);
  const seen = pool.filter(w => wdBox(w) !== undefined);
  const fresh = pool.filter(w => wdBox(w) === undefined);
  const due = seen.filter(wdIsDue);
  // 새 단어를 배우면서 옛 단어가 저절로 섞여 나온다: 새 단어 3개 + 날짜가 돌아온 옛 단어 5개쯤.
  // 옛 단어는 배우는 중(0~2칸)과 오래된 것(3칸 이상)을 반반, 오래 밀린 것부터.
  const lrn = shuffle(due.filter(w => wdBox(w) < 3));
  const rev = shuffle(due.filter(w => wdBox(w) >= 3)).sort((a, b) => (wd.due[a.en] || '').localeCompare(wd.due[b.en] || ''));
  const newN = Math.min(fresh.length, due.length > 20 ? 1 : due.length < 3 ? 5 : 3);   // 옛 단어가 너무 밀려 있을 때만 새 단어를 줄인다
  const pastN = 8 - newN, half = Math.ceil(pastN / 2);
  let past = rev.slice(0, half).concat(lrn.slice(0, pastN - half));
  if (past.length < pastN) past = past.concat(rev.slice(half).concat(lrn.slice(pastN - half)).slice(0, pastN - past.length));
  let list = past.concat(fresh.slice(0, newN));
  let practice = [];
  if (list.length < 5) {
    practice = seen.filter(w => !list.includes(w))
      .sort((a, b) => (wd.due[a.en] || '').localeCompare(wd.due[b.en] || '')).slice(0, 5 - list.length);
  }
  return { list, practice };
}
function wdStart(lv) {
  const today = wdToday();
  if (!wd.days.includes(today)) { wd.days.push(today); wd.days = wd.days.slice(-60); wdSave(); }
  const { list, practice } = wdPickRound(lv);
  const words = list.concat(practice);
  if (!words.length) { wdToast('이 단계에는 아직 단어가 없어요'); return; }
  R = { lv, words, queue: [], total: words.length, done: 0, mistakes: 0, tried: {}, friends: [], practice: practice.length };
  practice.forEach(w => { R.tried[w.en] = 1; });   // 연습만: 기록(칸)은 올리지 않는다
  const fresh = words.filter(w => wdBox(w) === undefined);
  fresh.forEach(w => R.queue.push({ t: 'learn', w }));
  shuffle(words).forEach(w => R.queue.push({ t: 'q', w }));
  shuffle(fresh).forEach(w => R.queue.push({ t: 'q', w, extra: true }));   // 새 단어는 판 끝에 한 번 더 (바로 반복)
  wdNext();
}
function wdNext() {
  const it = R.queue.shift();
  if (!it) return wdResult();
  R.curExtra = !!it.extra;
  it.t == 'learn' ? wdLearn(it.w) : wdQuiz(it.w);
}
function wdTop() {
  return `<div class="top"><button class="x" onclick="wdHome()">✕</button>
    <div class="bar"><i style="width:${R.done / R.total * 100}%"></i></div></div>`;
}
const wdBtnSay = w => `<button class="btn green small" onclick="wdSay('${w.en}')">🔊 듣기</button>`;

// ---- 예문 ----
const wdExRe = w => new RegExp('\\b' + w.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'i');
function wdExHtml(w) {
  const s = WD_EXMAP[w.en];
  return s ? wdEsc(s).replace(wdExRe(w), m => `<b>${m}</b>`) : '';
}
function wdBlank(w) {   // 빈칸 문제로 쓸 수 있는 예문 (단어가 문장에 들어 있어야 한다)
  const s = WD_EXMAP[w.en];
  return s && wdExRe(w).test(s) ? wdEsc(s).replace(wdExRe(w), '_____') : null;
}
const wdSayEx = en => { if (WD_EXMAP[en]) wdSay(WD_EXMAP[en]); };

function wdLearn(w) {
  wd.box[w.en] = 0; wd.due[w.en] = wdToday(); wdSave(); wdSay(w.en);
  const ex = wdExHtml(w);
  $app.innerHTML = `${wdTop()}<div class="tag">새 ${w.pos == 'i' ? '숙어' : '단어'}를 만났어요!</div>
    <div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}
    <div class="ko" style="font-size:34px;font-weight:bold">${wdEsc(w.ko)}</div>${wdBtnSay(w)}
    ${ex ? `<div class="ex">${ex}<button class="exsay" onclick="wdSayEx('${w.en}')">🔊</button></div>` : ''}
    <button class="btn" onclick="wdNext()">다음 ▶</button>`;
}

// 문제 종류: 외운 칸이 올라갈수록 달라져요 (철자는 한 번뿐)
function wdKind(w) {
  const b = wdBox(w) || 0, idi = w.pos == 'i', pick = a => a[Math.floor(Math.random() * a.length)];
  const blank = wdBlank(w) ? ['blank', 'blank'] : [];
  if (b <= 0) return 'en2ko';
  if (b == 1) return pick(['en2ko', 'ox'].concat(blank));   // 소리 없이도 풀 수 있게: 듣기 전용 문제는 없다
  if (b == 2) return 'ko2en';
  if (b == 3) return pick((idi ? ['ox'] : ['pos', 'ox']).concat(blank));
  if (b == 4) return (!idi && /^[a-z]{3,12}$/.test(w.en) && Math.random() < .5) ? 'spell' : (blank.length ? 'blank' : 'ko2en');
  return pick(['en2ko', 'ko2en', 'ox'].concat(blank));
}
// 헷갈리는 보기: 같은 품사에서 길이가 비슷한 것 먼저
function wdOthers(w, n) {
  let pool = WORDS.filter(x => x.lv == w.lv && x !== w && x.ko != w.ko);
  if (pool.length < 8) pool = WORDS.filter(x => x !== w && x.ko != w.ko && (x.lv == w.lv || x.lv < 3));   // 내 단어장처럼 적을 때
  const rank = x => [(x.pos == w.pos ? 0 : 100) + Math.abs(x.en.length - w.en.length) + Math.random() * 6, x];
  const out = [], seen = new Set([w.ko]);
  pool.map(rank).sort((a, b) => a[0] - b[0]).forEach(([, x]) => {
    if (out.length < n && !seen.has(x.ko)) { seen.add(x.ko); out.push(x); }
  });
  return out;
}

function wdQuiz(w) {
  const kind = wdKind(w);
  if (kind == 'spell') return wdSpell(w);
  R.cur = w; R.locked = false;
  let head, opts, say = false, fixed = false;
  const koOpts = () => wdOthers(w, 3).map(x => [wdEsc(x.ko), 0]).concat([[wdEsc(w.ko), 1]]);
  if (kind == 'en2ko') {
    head = `<div class="tag">무슨 뜻일까요?</div><div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}${wdBtnSay(w)}`;
    opts = koOpts(); say = true;
  } else if (kind == 'ko2en') {
    head = `<div class="tag">영어로 뭐라고 할까요?</div><div style="text-align:center">${wdBadge(w)}</div><div class="ko" style="font-size:38px;font-weight:bold">${wdEsc(w.ko)}</div>`;
    opts = wdOthers(w, 3).map(x => [x.en, 0]).concat([[w.en, 1]]);
  } else if (kind == 'blank') {
    head = `<div class="tag">빈칸에 알맞은 말은?</div><div style="text-align:center">${wdBadge(w)}</div>
      <div class="ex blank">${wdBlank(w)}</div><div class="ko" style="font-size:22px">뜻: ${wdEsc(w.ko)}</div>`;
    opts = wdOthers(w, 3).map(x => [x.en, 0]).concat([[w.en, 1]]);
  } else if (kind == 'ox') {
    const yes = Math.random() < .5;
    const shown = yes ? w.ko : wdOthers(w, 1)[0].ko;
    head = `<div class="tag">뜻이 맞으면 ⭕, 틀리면 ❌</div><div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}
      <div class="ko" style="font-size:32px;font-weight:bold">= ${wdEsc(shown)}</div>${wdBtnSay(w)}`;
    opts = [['⭕', yes ? 1 : 0], ['❌', yes ? 0 : 1]]; fixed = 'ox';
  } else {   // pos
    head = `<div class="tag">품사가 무엇일까요?</div>${wdBigWord(w.en)}<div class="ko">${wdEsc(w.ko)}</div>${wdBtnSay(w)}`;
    const base = ['n', 'v', 'a', 'd'];
    if (!base.includes(w.pos)) base[3] = w.pos;
    opts = base.map(p => [WD_POS_NAME[p], p == w.pos ? 1 : 0]); fixed = 'pos';
  }
  if (!fixed) opts = shuffle(opts);
  const body = opts.map(([t, ok]) =>
    `<button class="opt k ${fixed == 'ox' ? 'ox' : ''} ${t.length > 14 ? 'long' : ''}" data-ok="${ok}" onclick="wdPick(this)">${t}</button>`).join('');
  $app.innerHTML = `${wdTop()}${head}<div class="grid2">${body}</div>`;
  if (say) wdSay(w.en);
}
function wdPick(btn) {
  if (R.locked) return;
  R.locked = true;
  const ok = btn.dataset.ok == '1';
  btn.classList.add(ok ? 'good' : 'bad');
  if (!ok) document.querySelector('[data-ok="1"]').classList.add('good');
  ok ? wdGoodSnd() : wdBadSnd();
  wdSay(R.cur.en);
  wdDone(R.cur, ok, ok ? 900 : 2200);
}

// 철자 맞추기
function wdSpell(w) {
  S = { w, pos: 0, mist: false, used: [], locked: false, letters: shuffle(w.en.split('')) };
  R.cur = w;
  wdSpellDraw();
}
function wdSpellDraw() {
  const w = S.w, word = w.en;
  const slots = word.split('').map((c, i) => `<span class="slot">${i < S.pos ? c : ''}</span>`).join('');
  const tiles = S.letters.map((c, k) => `<button class="tile" ${S.used.includes(k) ? 'disabled' : ''} onclick="wdTile(${k},this)">${c}</button>`).join('');
  $app.innerHTML = `${wdTop()}<div class="tag">철자를 맞춰 보세요</div>
    <div style="text-align:center">${wdBadge(w)}</div>
    <div class="ko" style="font-size:36px;font-weight:bold">${wdEsc(w.ko)}</div>${wdBtnSay(w)}
    <div class="${word.length > 8 ? 'sm' : ''}"><div class="slots">${slots}</div><br><div class="tiles">${tiles}</div></div>`;
}
function wdTile(k, el) {
  if (S.locked) return;
  const word = S.w.en;
  if (S.letters[k] == word[S.pos]) {
    S.used.push(k); S.pos++; wdBeep(700, .08);
    wdSpellDraw();
    if (S.pos == word.length) {
      S.locked = true; wdGoodSnd(); wdSay(word);
      document.querySelectorAll('.slot').forEach(s => s.style.color = '#2f9a4b');
      wdDone(S.w, !S.mist, 1100);
    }
  } else {
    S.mist = true; wdBadSnd();
    el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 350);
  }
}

// 채점 (한 판에서 처음 푼 결과만 칸에 반영). 맞으면 칸이 오르고 다음에 풀 날짜가 정해져요
function wdGrade(w, ok) {
  if (R.tried[w.en]) return;
  R.tried[w.en] = 1;
  const b = wdBox(w) || 0;
  if (ok) {
    const nb = Math.min(WD_MAXBOX, b + 1);
    wd.box[w.en] = nb; wd.due[w.en] = wdDate(WD_INT[nb]);
    if (b < WD_MASTER && nb >= WD_MASTER) {
      const idx = wdStageIdx(w), st = wdStages(w.lv)[idx], key = wdGotKey(w.lv, idx);
      if (st && st.every(wdIsDone) && !wd.got[key]) { wd.got[key] = 1; R.friends.push(wdFriend(w.lv, idx)); }
    }
  } else {
    wd.box[w.en] = Math.max(0, b - 2); wd.due[w.en] = wdToday();
    R.mistakes++;
  }
  wdSave();
}
function wdDone(w, ok, delay) {
  wdGrade(w, ok);
  if (ok) { if (!R.curExtra) R.done++; } else R.queue.push({ t: 'q', w, extra: R.curExtra });
  setTimeout(wdNext, delay);
}

function wdResult() {
  const stars = R.mistakes == 0 ? 3 : R.mistakes <= 2 ? 2 : 1;
  wd.stars += stars;
  const pieces = stars + R.friends.length * 5;       // 퍼즐 조각: 별 개수 + 새 친구마다 5개
  if (typeof wdPzAdd == 'function') wdPzAdd(pieces);
  wdSave();
  const fr = R.friends.length
    ? `<div class="tag">새 친구가 생겼어요!</div><div class="friends">${R.friends.map(f => wdFriendHtml(f) + `<div class="tag">${f.name}</div>`).join('')}</div>` : '';
  const rows = R.words.map(w => `<div class="row"><span>${wdBadge(w)} <b>${w.en}</b></span><span>${wdEsc(w.ko)}</span></div>`).join('');
  const note = R.practice ? `<div class="tag" style="font-size:14px;color:#8a6d3b">아직 다시 볼 날이 안 된 옛 단어 ${R.practice}개는 연습만 했어요</div>` : '';
  const left = wdDueCount(R.lv);
  $app.innerHTML = `<div class="big" style="font-size:64px">${'⭐'.repeat(stars)}</div>
    <h1>참 잘했어요!</h1>${fr}<div class="tag">🧩 퍼즐 조각 +${pieces}</div>
    <div class="tag" style="font-size:15px">${left ? '다시 만날 옛 단어가 ' + left + '개 더 있어요' : '오늘 만날 옛 단어는 다 만났어요!'}</div>${note}
    <div class="tag">오늘 만난 단어</div>${rows}
    <button class="btn" onclick="wdStart(${R.lv})">▶ 또 하기</button>
    <button class="btn pzbtn" onclick="wdPuzzle()">🧩 퍼즐 맞추기</button>
    <button class="btn blue" onclick="wdHome()">🏠 처음으로</button>`;
  wdGoodSnd();
}

// ---- 도감 ----
function wdDex(lv) {
  const tabs = WD_LEVELS.map((L, i) => `<button class="btn ${i == lv ? '' : 'blue'}" onclick="wdDex(${i})">${L.e} ${L.t}</button>`).join('');
  const cells = wdStages(lv).map((st, i) => {
    const n = st.filter(wdIsDone).length, full = wdHasFriend(lv, i, st), f = wdFriend(lv, i);
    return `<div class="card ${full ? '' : 'lock'}" onclick="wdStageView(${lv},${i})">${full ? wdFriendHtml(f) : '❓'}<small>${full ? f.name : n + '/' + st.length}</small></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <div class="tabs">${tabs}</div><div class="tag">${WD_STAGE}개를 모두 외우면 친구가 나타나요</div>
    <div class="dex">${cells || '<div class="tag">단어가 아직 없어요</div>'}</div>`;
}
function wdStageView(lv, i) {
  const st = wdStages(lv)[i];
  const rows = st.map(w => {
    const b = wdBox(w), cls = b === undefined ? 'lock' : wdIsDone(w) ? '' : 'part';
    const due = b !== undefined && wdIsDue(w) ? ' 📅' : '';
    return `<div class="row ${cls}" onclick="${b === undefined ? '' : `wdSay('${w.en}')`}">
      <span>${b === undefined ? '' : wdBadge(w) + ' '}<b>${b === undefined ? '???' : w.en}</b>${due}</span><span>${b === undefined ? '' : wdEsc(w.ko)}</span></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdDex(${lv})">← 뒤로</button></div>
    <div class="friends">${wdHasFriend(lv, i, st) ? wdFriendHtml(wdFriend(lv, i)) + `<div class="tag">${wdFriend(lv, i).name}</div>` : '❓'}</div>${rows}`;
}
