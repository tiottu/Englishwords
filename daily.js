// 매일 오고 싶게 만드는 것들: 오늘의 도전, 오늘의 상자와 스티커, 연속 출석 보상, 주간 목표 (전역 이름은 wd 로 시작)
const WD_STICKERS = ['🌈', '🍀', '⚡', '🎈', '🎁', '🍭', '🍩', '🍦', '🍉', '🍓', '🎨', '🎸', '🎮', '🚀', '🛸', '🏆',
  '🥇', '👑', '💎', '🔮', '🧸', '🪁', '🎩', '🎪', '🎡', '🏰', '🗼', '🌋', '🌵', '🌻', '🍄', '🐾',
  '🦴', '🧩', '🎯', '🔔', '📚', '🧠', '💡', '🎵', '🌟', '🎀', '🧁', '🍪', '🥐', '🍕', '🍔', '🌮'];
const WD_STREAK_REWARD = { 3: 5, 7: 10, 14: 15, 30: 30, 60: 50, 100: 80 };   // 며칠 연속 -> 조각 개수
const WD_WEEK_GOAL = 30;   // 한 주에 새로 만날 단어 수 (한 판에 3~5개라 매일 조금씩 해도 채울 수 있다)

// ---- 날짜별 기록 ----
function wdDayStat() {
  const k = wdToday();
  const t = wd.stat[k] = wd.stat[k] || { r: 0, ok: 0, no: 0, m: 0, n: 0 };   // r 한 판, ok/no 맞힘/틀림, m 새로 외움, n 새로 만남
  ['r', 'ok', 'no', 'm', 'n'].forEach(f => { t[f] = t[f] || 0; });   // 예전 기록에 없는 칸을 채운다
  return t;
}
function wdWeekStart(offset) {   // 그 주 월요일 (offset: 0 이번 주, -1 지난주)
  const d = new Date(), dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow + (offset || 0) * 7);
  return d.toLocaleDateString('sv-SE');
}
function wdWeekDays(offset) {
  const out = [], d = new Date(wdWeekStart(offset) + 'T00:00:00');
  for (let i = 0; i < 7; i++) { out.push(d.toLocaleDateString('sv-SE')); d.setDate(d.getDate() + 1); }
  return out;
}
function wdWeekSum(offset) {
  const s = { r: 0, ok: 0, no: 0, m: 0, n: 0, played: 0 };
  wdWeekDays(offset).forEach(k => {
    const t = wd.stat[k];
    if (t) {
      s.r += t.r || 0; s.ok += t.ok || 0; s.no += t.no || 0; s.m += t.m || 0; s.n += t.n || 0;
      if (t.r || t.ok || t.no) s.played++;   // 한 판을 다 못 끝내고 나가도 문제를 풀었으면 공부한 날
    }
  });
  return s;
}

// ---- 오늘의 도전: 하루 5문제, 끝내면 조각 보너스 ----
const wdDailyDone = () => !!(wd.daily && wd.daily.date == wdToday() && wd.daily.done);
function wdStartDaily() {
  if (wdDailyDone()) { wdToast('오늘의 도전은 이미 끝냈어요! 내일 또 만나요'); return; }
  const today = wdToday();
  if (!wd.days.includes(today)) { wd.days.push(today); wd.days = wd.days.slice(-60); }
  if (!wd.daily || wd.daily.date != today || !wd.daily.words) {   // 하루 동안은 같은 5문제
    const rnd = wdPzRng(Number(today.replace(/-/g, '')));
    const a = WORDS.filter(w => wdBox(w) !== undefined);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    let ws = a.slice(0, 5).map(w => w.en);
    if (ws.length < 5) ws = ws.concat(WORDS.filter(w => w.lv == 0 && wdBox(w) === undefined).slice(0, 5 - ws.length).map(w => w.en));
    wd.daily = { date: today, done: 0, words: ws };
    wdSave();
  }
  const words = wd.daily.words.map(en => WORDS.find(w => w.en == en)).filter(Boolean);
  if (!words.length) { wdToast('단어를 조금 배우고 다시 해 보세요'); return; }
  R = { lv: words[0].lv, words, queue: [], total: words.length, done: 0, mistakes: 0, tried: {}, friends: [], practice: 0, daily: true };
  // 아직 다시 볼 날이 안 된 단어는 연습만 한다 (복습 간격이 흐트러지지 않게)
  words.filter(w => wdBox(w) !== undefined && !wdIsDue(w)).forEach(w => { R.tried[w.en] = 1; });
  words.filter(w => wdBox(w) === undefined).forEach(w => R.queue.push({ t: 'learn', w }));
  shuffle(words).forEach(w => R.queue.push({ t: 'q', w }));
  wdNext();
}

// ---- 한 판이 끝날 때마다: 기록, 도전 완료, 연속 출석, 주간 목표, 상자 알림 ----
function wdAfterRound() {
  const st = wdDayStat(); st.r++;
  Object.keys(wd.stat).sort().slice(0, -70).forEach(k => delete wd.stat[k]);   // 오래된 기록은 지운다
  let pieces = 0, html = '';
  const line = t => { html += `<div class="bonus">${t}</div>`; };
  if (R.daily) {
    const perfect = R.mistakes == 0, p = perfect ? 6 : 3;
    wd.daily = { date: wdToday(), done: 1, perfect, words: wd.daily && wd.daily.words };
    pieces += p; line(`🎯 오늘의 도전 ${perfect ? '만점!' : '완료!'} 조각 +${p}`);
  }
  const s = wdStreak();
  Object.keys(WD_STREAK_REWARD).forEach(m => {
    if (s >= m && !wd.streakGot[m]) { wd.streakGot[m] = 1; const p = WD_STREAK_REWARD[m]; pieces += p; line(`🔥 ${m}일 연속 출석! 조각 +${p}`); }
  });
  const key = wdWeekStart(0);
  if (wdWeekSum(0).n >= WD_WEEK_GOAL && wd.weekGoal !== key) { wd.weekGoal = key; pieces += 10; line(`🏁 이번 주 목표를 이뤘어요! 조각 +10`); }
  if (st.r == 1 && wdGiftReady()) line('🎁 오늘의 상자가 생겼어요! 첫 화면에서 열어 보세요');
  return { pieces, html };
}

// ---- 오늘의 상자: 하루 한 판 하면 한 개, 조각 또는 스티커 ----
function wdGiftReady() {
  const t = wdToday();
  return wd.gift !== t && !!(wd.stat[t] && wd.stat[t].r > 0);
}
function wdGiftOpen() {
  if (!wdGiftReady()) { wdToast(wd.gift == wdToday() ? '오늘 상자는 이미 열었어요' : '오늘 한 판을 먼저 해 보세요'); return; }
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">오늘의 상자</h1><div class="tag">상자를 눌러 열어 보세요!</div>
    <button class="giftbox" onclick="wdGiftReveal()">🎁</button>`;
}
function wdGiftReveal() {
  if (!wdGiftReady()) return wdHome();
  const lacking = WD_STICKERS.filter(e => !wd.stickers[e]);
  let big, msg;
  if (lacking.length && Math.random() < .45) {
    const e = lacking[Math.floor(Math.random() * lacking.length)];
    wd.stickers[e] = 1; big = e; msg = `새 스티커를 얻었어요! (${WD_STICKERS.length - lacking.length + 1}/${WD_STICKERS.length})`;
  } else {
    const n = 2 + Math.floor(Math.random() * 5);
    wdPzAdd(n); big = '🧩'; msg = `퍼즐 조각 ${n}개를 얻었어요!`;
  }
  wd.gift = wdToday(); wdSave(); wdGoodSnd();
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">짜잔!</h1><div class="big giftpop">${big}</div><div class="tag">${msg}</div>
    <button class="btn" onclick="wdHome()">🏠 처음으로</button>`;
}
