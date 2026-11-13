// 단어 친구들 - 게임 전부 (전역 이름은 wd 로 시작)
const WD_KEY = 'wordfriends-v3';
const WD_MASTER = 5;      // 이 칸에 닿으면 "외웠어요"
const WD_STAGE = 20;      // 20개를 외우면 친구 1명
const WD_LEVELS = [
  { n: '초등 고학년', t: '초등', e: '🎒', c: '', s: [WD_L1, WD_L1B, WD_L1C].join('\n') },
  { n: '중학교', t: '중등', e: '📘', c: 'blue', s: [WD_L2, WD_L2B, WD_L2C, WD_L2D].join('\n') },
  { n: '고등학교', t: '고등', e: '🎓', c: 'green', s: [WD_L3, WD_L3B, WD_L3C, WD_L3D, WD_L3E, WD_L3F, WD_L3G, WD_L3H, WD_L3I].join('\n') },
  { n: '숙어', t: '숙어', e: '🔗', c: 'purple', s: WD_L4 + '\n' + WD_L4B, idiom: true }
];
const WD_APK = 'https://github.com/tiottu/Englishwords/releases/latest/download/englishwords.apk';
const WD_TIER =['', '금빛 ', '무지개 '];   // 동물을 한 바퀴 다 만나면 다음 모습으로

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
const WD_OFF = (() => {   // 단계마다 친구 번호가 어디서 시작하는지
  let o = 0;
  return WD_LEVELS.map((_, l) => { const s = o; o += Math.ceil(WORDS.filter(w => w.lv == l).length / WD_STAGE); return s; });
})();
function wdFriend(lv, i) {
  const n = WD_OFF[lv] + i, A = WD_ANIMALS.length, a = WD_ANIMALS[n % A], tier = Math.floor(n / A) % WD_TIER.length;
  return { e: a[0], name: WD_TIER[tier] + a[1], tier };
}
const wdFriendHtml = f => `<span class="fr t${f.tier}">${f.e}</span>`;
const wdStageOf = w => wdStages(w.lv)[Math.floor(wdPool(w.lv).indexOf(w) / WD_STAGE)];
const wdBadge = w => `<span class="pos ${w.pos}">${WD_POS_NAME[w.pos]}</span>`;
const wdBigWord = t => `<div class="word" style="font-size:${t.length > 18 ? 26 : t.length > 11 ? 36 : 50}px">${t}</div>`;

// ---- 소리 ----
// 폰(특히 안드로이드 크롬)에서 소리가 안 나는 흔한 까닭을 피한다:
// 1) 목소리 목록이 늦게 올라온다 -> 올라오면 영어 목소리를 고른다
// 2) cancel 바로 뒤의 speak 는 조용히 무시된다 -> 잠깐 쉬었다가 읽는다
// 3) 읽는 도중 객체가 치워진다 -> 변수에 붙잡아 둔다
let wdVoice = null, wdUtter = null, wdSayTimer = null;
function wdPickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    wdVoice = vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  } catch (e) {}
}
try { speechSynthesis.onvoiceschanged = wdPickVoice; wdPickVoice(); } catch (e) {}
function wdToast(msg) {
  let el = document.getElementById('wdToast');
  if (!el) { el = document.createElement('div'); el.id = 'wdToast'; document.body.appendChild(el); }
  el.textContent = msg; el.className = 'show';
  clearTimeout(wdToast.t); wdToast.t = setTimeout(() => { el.className = ''; }, 3500);
}
// 앱(웹뷰)에서는 브라우저 음성 기능이 없어서, 앱이 폰의 음성 엔진을 직접 부르는 AndroidTTS 를 쓴다
const WD_IN_APP = typeof AndroidTTS !== 'undefined';
const WD_TTS_MSG = {
  nodata: '폰에 영어 음성 데이터가 없어요. 소리 점검 화면에서 "음성 설정 열기"를 눌러 영어를 설치해 주세요',
  notsupported: '이 폰의 음성 엔진은 영어를 지원하지 않아요. 소리 점검 화면에서 음성 설정을 열어 엔진을 바꿔 보세요',
  noengine: '폰에 음성 엔진이 없어요. 소리 점검 화면에서 음성 설정을 확인해 주세요',
  notready: '음성을 준비하는 중이에요. 잠시 뒤 다시 눌러 주세요'
};
function wdSay(t) {
  if (WD_IN_APP) {
    try { const r = AndroidTTS.speak(t); wdSayLog(r); if (r != 'ok') wdToast(WD_TTS_MSG[r] || '발음이 안 나와요 (' + r + ')'); }
    catch (e) { wdToast('발음을 들려줄 수 없어요'); }
    return;
  }
  if (!('speechSynthesis' in window)) { wdToast('이 브라우저는 발음을 지원하지 않아요. 앱이나 크롬으로 열어 주세요'); return; }
  const ss = speechSynthesis;
  // useVoice=true: 고른 영어 목소리로 / false: 목소리를 지정하지 않고 폰 기본 영어로 (한 번 더 시도)
  const go = useVoice => {
    try {
      if (!wdVoice) wdPickVoice();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = (useVoice && wdVoice) ? wdVoice.lang : 'en-US';
      if (useVoice && wdVoice) u.voice = wdVoice;
      u.rate = .85; u.volume = 1;
      let started = false;
      u.onstart = () => { started = true; wdSayLog('start'); };
      u.onend = () => wdSayLog('end');
      u.onerror = e => {
        wdSayLog('error ' + e.error);
        if (e.error && e.error != 'canceled' && e.error != 'interrupted') {
          if (useVoice && wdVoice) { go(false); return; }
          wdToast('발음이 안 나와요 (' + e.error + ') 폰 음량과 음성 설정을 확인해 주세요');
        }
      };
      wdUtter = u;
      if (ss.paused) ss.resume();
      ss.speak(u);
      // 1.5초가 지나도 시작을 안 하면 목소리 지정 없이 다시 한 번
      setTimeout(() => { if (!started && useVoice && wdVoice && !ss.speaking) { ss.cancel(); go(false); } }, 1500);
    } catch (e) { wdToast('발음을 들려줄 수 없어요'); }
  };
  clearTimeout(wdSayTimer);
  if (ss.speaking || ss.pending) { ss.cancel(); wdSayTimer = setTimeout(() => go(true), 120); } else go(true);
}
let wdSayLogFn = null;
function wdSayLog(m) { if (wdSayLogFn) wdSayLogFn(m); }

// 소리 점검 화면: 폰이 발음을 낼 수 있는지 눈으로 확인한다
function wdSoundTest() {
  const ok = WD_IN_APP || 'speechSynthesis' in window;
  const vs = (!WD_IN_APP && ok) ? speechSynthesis.getVoices() : [];
  const en = vs.filter(v => /^en/i.test(v.lang));
  const NAMES = { ok: '영어 음성 준비됨', nodata: '영어 음성 데이터가 없음', notsupported: '영어 지원 안 함', noengine: '음성 엔진 없음', notready: '준비 중' };
  let st = '';
  if (WD_IN_APP) { try { st = AndroidTTS.status(); } catch (e) { st = 'noengine'; } }
  const info = WD_IN_APP
    ? `<div class="row"><span>실행 방식</span><b>앱</b></div><div class="row"><span>폰 음성 엔진</span><b>${NAMES[st] || st}</b></div>
       <button class="btn small" style="background:#9a9a9a;box-shadow:0 5px 0 #6f6f6f" onclick="AndroidTTS.openTtsSettings()">⚙️ 음성 설정 열기</button>`
    : `<div class="row"><span>실행 방식</span><b>브라우저</b></div><div class="row"><span>발음 기능</span><b>${ok ? '있음' : '없음'}</b></div>
       <div class="row"><span>폰 목소리</span><b>${vs.length}개 (영어 ${en.length}개)</b></div>
       <div class="row"><span>고른 목소리</span><b>${wdVoice ? wdVoice.name : '없음(기본)'}</b></div>`;
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">🔧 소리 점검</h1>${info}
    <button class="btn green" onclick="wdSay('hello')">🔊 hello 말하기</button>
    <button class="btn blue" onclick="wdGoodSnd()">🔔 효과음 들어 보기</button>
    <div class="tag">아래 줄에 ok (또는 start → end)가 뜨면 발음이 난 거예요</div>
    <div class="row" style="min-height:48px"><span id="wdLogBox">(아직 안 눌렀어요)</span></div>
    <div class="tag" style="font-size:14px;color:#8a6d3b">소리가 안 나면: 폰 미디어 음량, 무음/방해 금지, 설정의 "텍스트 음성 변환(TTS)"에서 영어를 확인해 주세요.</div>`;
  const box = document.getElementById('wdLogBox'); let lines = [];
  wdSayLogFn = m => { lines.push(m); box.textContent = lines.slice(-6).join(' → '); };
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
    <button class="btn small" style="background:#b08850;box-shadow:0 5px 0 #7d5e30" onclick="wdDex(0)">📖 내 친구들</button>
    <button class="btn small" style="background:#9a9a9a;box-shadow:0 5px 0 #6f6f6f" onclick="wdSoundTest()">🔧 소리 점검</button>
    ${WD_IN_APP ? '' : `<a class="btn small" style="background:#3fa34d;box-shadow:0 5px 0 #2a7a36;text-align:center;text-decoration:none" href="${WD_APK}">📱 앱으로 받기 (안드로이드)</a>`}`;
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
    ? `<div class="tag">새 친구가 생겼어요!</div><div class="friends">${R.friends.map(f => wdFriendHtml(f) + `<div class="tag">${f.name}</div>`).join('')}</div>` : '';
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
    const n = st.filter(wdIsDone).length, full = n == st.length, f = wdFriend(lv, i);
    return `<div class="card ${full ? '' : 'lock'}" onclick="wdStageView(${lv},${i})">${full ? wdFriendHtml(f) : '❓'}<small>${full ? f.name : n + '/' + st.length}</small></div>`;
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
    <div class="friends">${wdStages(lv)[i].every(wdIsDone) ? wdFriendHtml(wdFriend(lv, i)) + `<div class="tag">${wdFriend(lv, i).name}</div>` : '❓'}</div>${rows}`;
}

wdHome();
