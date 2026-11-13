// 소리: 발음(음성 합성)과 효과음, 화면 아래 안내 문구, 소리 점검 화면 (전역 이름은 wd 로 시작)
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

// 효과음
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
