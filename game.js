// 단어 친구들 - 게임 전부 (전역 이름은 wd 로 시작)
const WD_KEY = 'wordfriends-v3';
const WD_MASTER = 5;      // 이 칸에 닿으면 "외웠어요"
const WD_STAGE = 20;      // 20개를 외우면 친구 1명
const WD_LEVELS = [
  { n: '초등 고학년', t: '초등', e: '🎒', c: '', s: [WD_L1, WD_L1B, WD_L1C].join('\n') },
  { n: '중학교', t: '중등', e: '📘', c: 'blue', s: [WD_L2, WD_L2B, WD_L2C, WD_L2D].join('\n') },
  { n: '고등학교', t: '고등', e: '🎓', c: 'green', s: [WD_L3, WD_L3B, WD_L3C, WD_L3D, WD_L3E].join('\n') },
  { n: '숙어', t: '숙어', e: '🔗', c: 'purple', s: WD_L4 + '\n' + WD_L4B, idiom: true }
];
const WD_FRIENDS = ['🐱','🐶','🐰','🐻','🐼','🦊','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦',
  '🦆','🦉','🐴','🦄','🐝','🦋','🐢','🐙','🐬','🐳','🦈','🐘','🦒','🦓','🐨',
  '🐹','🐭','🐺','🦝','🐗','🐫','🦘','🦥','🦦','🦔','🦇','🐊','🦎','🐍','🦖',
  '🦕','🐌','🐞','🐜','🦀','🦞','🦐','🦑','🐠','🐡','🦜','🦢','🦩','🦚','🐓',
  '🐲','🦏','🦛','🐃','🐂','🐏','🦙','🐐','🦌','🐕'];

const WORDS = [];
(() => {
  const seen = new Set();
  WD_LEVELS.forEach((L, i) => L.s.split('\n').forEach(line => {
    const p = line.trim().split('|');
    if (p.length < 2 || !p[0] || seen.has(p[0])) return;
    seen.add(p[0]);
    // 세 번째 칸에 품사가 적혀 있으면 그대로, 없으면 뜻의 끝말로 맞춘다
    WORDS.push({ en: p[0], ko: p[1], lv: i, pos: L.idiom ? 'i' : (WD_POS_NAME[p[2]] ? p[2] : wdPosOf(p[0], p[1])) });
  }));
})();

const $app = document.getElementById('app');
let wd = wdLoad();
let R = null;   // 지금 하는 한 판
let S = null;   // 철자 맞추기 상태

function wdLoad() {
  try { const s = JSON.parse(localStorage.getItem(WD_KEY)); if (s && s.box) return s; } catch (e) {}
  return { box: {}, stars: 0, days: [] };
}
function wdSave() { try { localStorage.setItem(WD_KEY, JSON.stringify(wd)); } catch (e) {} }
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const wdBox = w => wd.box[w.en];
const wdPool = lv => WORDS.filter(w => w.lv == lv);
const wdIsDone = w => wdBox(w) >= WD_MASTER;
function wdStages(lv) {
  const p = wdPool(lv), out = [];
  for (let i = 0; i < p.length; i += WD_STAGE) out.push(p.slice(i, i + WD_STAGE));
  return out;
}
function wdFriend(lv, i) {
  let off = 0;
  for (let l = 0; l < lv; l++) off += wdStages(l).length;
  return WD_FRIENDS[(off + i) % WD_FRIENDS.length];
}
const wdStageOf = w => wdStages(w.lv)[Math.floor(wdPool(w.lv).indexOf(w) / WD_STAGE)];
const wdBadge = w => `<span class="pos ${w.pos}">${WD_POS_NAME[w.pos]}</span>`;
const wdBigWord = t => `<div class="word" style="font-size:${t.length > 18 ? 26 : t.length > 11 ? 36 : 50}px">${t}</div>`;

// ---- 소리 ----
function wdSay(t) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = .85; speechSynthesis.speak(u); } catch (e) {}
}
let wdAC;
function wdBeep(f, d) {
  try {
    wdAC = wdAC || new (window.AudioContext || window.webkitAudioContext)();
    const o = wdAC.createOscillator(), g = wdAC.createGain();
    o.frequency.value = f; g.gain.value = .08; o.connect(g); g.connect(wdAC.destination);
    o.start(); o.stop(wdAC.currentTime + d);
  } catch (e) {}
}
const wdGoodSnd = () => { wdBeep(660, .12); setTimeout(() => wdBeep(880, .15), 120); };
const wdBadSnd = () => wdBeep(190, .3);

// ---- 기록 ----
function wdToday() { return new Date().toLocaleDateString('sv-SE'); }
function wdStreak() {
  const d = new Date(), has = x => wd.days.includes(x.toLocaleDateString('sv-SE'));
  let n = 0;
  if (!has(d)) d.setDate(d.getDate() - 1);
  while (has(d)) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// ---- 첫 화면 ----
function wdHome() {
  const friends = WD_LEVELS.reduce((s, L, i) => s + wdStages(i).filter(st => st.every(wdIsDone)).length, 0);
  const lv = WD_LEVELS.map((L, i) => {
    const n = wdPool(i).filter(wdIsDone).length;
    return `<button class="btn lvbtn ${L.c}" onclick="wdStart(${i})"><span>${L.e} ${L.n}</span><small>${n}/${wdPool(i).length}</small></button>`;
  }).join('');
  $app.innerHTML = `<div class="big" style="font-size:72px">🐾</div><h1>단어 친구들</h1>
    <div class="stats"><span>🧸 친구 ${friends}명</span><span>⭐ ${wd.stars}</span><span>🔥 ${wdStreak()}일</span></div>
    <div class="tag">어디서 시작할까요?</div>${lv}
    <button class="btn small" style="background:#b08850;box-shadow:0 5px 0 #7d5e30" onclick="wdDex(0)">📖 내 친구들</button>`;
}

// ---- 한 판 ----
function wdPickRound(lv) {
  const pool = wdPool(lv);
  const seen = pool.filter(w => wdBox(w) !== undefined && !wdIsDone(w));
  const fresh = pool.filter(w => wdBox(w) === undefined);
  seen.sort((a, b) => wdBox(a) - wdBox(b) + (Math.random() - .5) * 1.5);
  let list = seen.slice(0, 5);
  list = list.concat(fresh.slice(0, list.length >= 5 ? 3 : 5));
  if (list.length < 6) list = list.concat(shuffle(pool.filter(w => wdIsDone(w) && !list.includes(w))).slice(0, 6 - list.length));
  return list;
}
function wdStart(lv) {
  const today = wdToday();
  if (!wd.days.includes(today)) { wd.days.push(today); wd.days = wd.days.slice(-60); wdSave(); }
  const words = wdPickRound(lv);
  R = { lv, words, queue: [], total: words.length, done: 0, mistakes: 0, tried: {}, friends: [] };
  words.filter(w => wdBox(w) === undefined).forEach(w => R.queue.push({ t: 'learn', w }));
  shuffle(words).forEach(w => R.queue.push({ t: 'q', w }));
  wdNext();
}
function wdNext() {
  const it = R.queue.shift();
  if (!it) return wdResult();
  it.t == 'learn' ? wdLearn(it.w) : wdQuiz(it.w);
}
function wdTop() {
  return `<div class="top"><button class="x" onclick="wdHome()">✕</button>
    <div class="bar"><i style="width:${R.done / R.total * 100}%"></i></div></div>`;
}
const wdBtnSay = w => `<button class="btn green small" onclick="wdSay('${w.en}')">🔊 듣기</button>`;

function wdLearn(w) {
  wd.box[w.en] = 0; wdSave(); wdSay(w.en);
  $app.innerHTML = `${wdTop()}<div class="tag">새 ${w.pos == 'i' ? '숙어' : '단어'}를 만났어요!</div>
    <div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}
    <div class="ko" style="font-size:34px;font-weight:bold">${w.ko}</div>${wdBtnSay(w)}
    <button class="btn" onclick="wdNext()">다음 ▶</button>`;
}

// 문제 종류: 외운 칸이 올라갈수록 달라져요 (철자는 한 번뿐)
function wdKind(w) {
  const b = wdBox(w) || 0, idi = w.pos == 'i';
  if (b <= 0) return 'en2ko';
  if (b == 1) return 'listen';
  if (b == 2) return 'ko2en';
  if (b == 3) return idi ? 'ox' : (Math.random() < .5 ? 'pos' : 'ox');
  if (b == 4) return (!idi && /^[a-z]{3,12}$/.test(w.en) && Math.random() < .5) ? 'spell' : 'ko2en';
  return ['en2ko', 'listen', 'ko2en', 'ox'][Math.floor(Math.random() * 4)];
}
// 헷갈리는 보기: 같은 품사에서 길이가 비슷한 것 먼저
function wdOthers(w, n) {
  const pool = WORDS.filter(x => x.lv == w.lv && x !== w && x.ko != w.ko);
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
  const koOpts = () => wdOthers(w, 3).map(x => [x.ko, 0]).concat([[w.ko, 1]]);
  if (kind == 'en2ko') {
    head = `<div class="tag">무슨 뜻일까요?</div><div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}${wdBtnSay(w)}`;
    opts = koOpts(); say = true;
  } else if (kind == 'listen') {
    head = `<div class="tag">잘 듣고 뜻을 골라요</div><div class="big" style="font-size:72px">🔊</div>${wdBtnSay(w)}`;
    opts = koOpts(); say = true;
  } else if (kind == 'ko2en') {
    head = `<div class="tag">영어로 뭐라고 할까요?</div><div style="text-align:center">${wdBadge(w)}</div><div class="ko" style="font-size:38px;font-weight:bold">${w.ko}</div>`;
    opts = wdOthers(w, 3).map(x => [x.en, 0]).concat([[w.en, 1]]);
  } else if (kind == 'ox') {
    const yes = Math.random() < .5;
    const shown = yes ? w.ko : wdOthers(w, 1)[0].ko;
    head = `<div class="tag">뜻이 맞으면 ⭕, 틀리면 ❌</div><div style="text-align:center">${wdBadge(w)}</div>${wdBigWord(w.en)}
      <div class="ko" style="font-size:32px;font-weight:bold">= ${shown}</div>${wdBtnSay(w)}`;
    opts = [['⭕', yes ? 1 : 0], ['❌', yes ? 0 : 1]]; fixed = 'ox';
  } else {   // pos
    head = `<div class="tag">품사가 무엇일까요?</div>${wdBigWord(w.en)}<div class="ko">${w.ko}</div>${wdBtnSay(w)}`;
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
    <div class="ko" style="font-size:36px;font-weight:bold">${w.ko}</div>${wdBtnSay(w)}
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

// 채점 (한 판에서 처음 푼 결과만 칸에 반영)
function wdGrade(w, ok) {
  if (R.tried[w.en]) return;
  R.tried[w.en] = 1;
  const b = wdBox(w) || 0;
  if (ok) {
    wd.box[w.en] = Math.min(WD_MASTER + 1, b + 1);
    if (b < WD_MASTER && wd.box[w.en] >= WD_MASTER) {
      const st = wdStageOf(w);
      if (st.every(wdIsDone)) R.friends.push(wdFriend(w.lv, wdStages(w.lv).indexOf(st)));
    }
  } else {
    wd.box[w.en] = Math.max(0, b - 2);
    R.mistakes++;
  }
  wdSave();
}
function wdDone(w, ok, delay) {
  wdGrade(w, ok);
  if (ok) R.done++; else R.queue.push({ t: 'q', w });
  setTimeout(wdNext, delay);
}

function wdResult() {
  const stars = R.mistakes == 0 ? 3 : R.mistakes <= 2 ? 2 : 1;
  wd.stars += stars; wdSave();
  const fr = R.friends.length
    ? `<div class="tag">새 친구가 생겼어요!</div><div class="friends">${R.friends.join(' ')}</div>` : '';
  const rows = R.words.map(w => `<div class="row"><span>${wdBadge(w)} <b>${w.en}</b></span><span>${w.ko}</span></div>`).join('');
  $app.innerHTML = `<div class="big" style="font-size:64px">${'⭐'.repeat(stars)}</div>
    <h1>참 잘했어요!</h1>${fr}<div class="tag">오늘 만난 단어</div>${rows}
    <button class="btn" onclick="wdStart(${R.lv})">▶ 또 하기</button>
    <button class="btn blue" onclick="wdHome()">🏠 처음으로</button>`;
  wdGoodSnd();
}

// ---- 도감 ----
function wdDex(lv) {
  const tabs = WD_LEVELS.map((L, i) => `<button class="btn ${i == lv ? '' : 'blue'}" onclick="wdDex(${i})">${L.e} ${L.t}</button>`).join('');
  const cells = wdStages(lv).map((st, i) => {
    const n = st.filter(wdIsDone).length, full = n == st.length;
    return `<div class="card ${full ? '' : 'lock'}" onclick="wdStageView(${lv},${i})">${full ? wdFriend(lv, i) : '❓'}<small>${n}/${st.length}</small></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <div class="tabs">${tabs}</div><div class="tag">${WD_STAGE}개를 모두 외우면 친구가 나타나요</div>
    <div class="dex">${cells}</div>`;
}
function wdStageView(lv, i) {
  const rows = wdStages(lv)[i].map(w => {
    const b = wdBox(w), cls = b === undefined ? 'lock' : wdIsDone(w) ? '' : 'part';
    return `<div class="row ${cls}" onclick="${b === undefined ? '' : `wdSay('${w.en}')`}">
      <span>${b === undefined ? '' : wdBadge(w) + ' '}<b>${b === undefined ? '???' : w.en}</b></span><span>${b === undefined ? '' : w.ko}</span></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdDex(${lv})">← 뒤로</button></div>
    <div class="friends">${wdStages(lv)[i].every(wdIsDone) ? wdFriend(lv, i) : '❓'}</div>${rows}`;
}

wdHome();
