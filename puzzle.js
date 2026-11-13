// 퍼즐: 한 판을 하면 조각을 받고, 큰 그림(100조각)에서 자리를 찾아 하나씩 맞춘다 (전역 이름은 wd 로 시작)
// 조각을 받는 법: 한 판을 끝낼 때 별 개수만큼, 새 친구를 얻으면 5개 더 (game.js 의 wdResult).
// 퍼즐마다 그림이 달라지고(scenes.js), 다 맞추면 갤러리에 모인다.
const WD_PZ_N = 10, WD_PZ_ALL = 100;
// 그림(WD_THEMES, wdPzPicture)은 scenes.js 에 있다
function wdPzRng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function wdPz() {
  const P = wd.pz = wd.pz || {};
  if (typeof P.n != 'number') P.n = 0;
  if (typeof P.placed != 'string' || P.placed.length != WD_PZ_ALL) P.placed = '0'.repeat(WD_PZ_ALL);
  if (typeof P.tray != 'number') P.tray = 0;
  P.gallery = P.gallery || [];
  return P;
}
const wdPzCount = P => P.placed.split('1').length - 1;
function wdPzOrder(n) {   // 조각을 받는 순서 (퍼즐마다 정해진 섞인 순서)
  const rnd = wdPzRng(n * 313 + 7), a = [...Array(WD_PZ_ALL).keys()];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const wdPzNext = P => wdPzOrder(P.n).find(i => P.placed[i] == '0');
function wdPzAdd(k) { wdPz().tray += k; }
function wdPzHomeLabel() {
  const P = wdPz();
  return `🧩 퍼즐 맞추기 · ${wdPzCount(P)}/${WD_PZ_ALL}${P.tray ? ` · 조각 ${P.tray}개 기다려요` : ''}`;
}

let wdPzZoom = false, wdPzWrong = 0, wdPzHint = -1, wdPzLast = -1;
const wdPzPos = i => `background-position:${(i % WD_PZ_N) * 100 / (WD_PZ_N - 1)}% ${Math.floor(i / WD_PZ_N) * 100 / (WD_PZ_N - 1)}%`;

function wdPuzzle() {
  const P = wdPz(), T = WD_THEMES[P.n % WD_THEMES.length], done = wdPzCount(P);
  const old = document.querySelector('.pzscroll'), keep = old ? [old.scrollLeft, old.scrollTop] : null;
  const fit = Math.floor((Math.min(window.innerWidth || 375, 480) - 40) / WD_PZ_N), c = wdPzZoom ? fit * 2 : fit;
  const next = wdPzNext(P);
  const cells = [];
  for (let i = 0; i < WD_PZ_ALL; i++) {
    const cls = (P.placed[i] == '1' ? ' on' : '') + (wdPzHint == i ? ' hint' : '') + (wdPzLast == i ? ' pop' : '');
    cells.push(`<div class="pzc${cls}" id="pc${i}" style="${wdPzPos(i)}" onclick="wdPzTap(${i})"></div>`);
  }
  const tray = P.tray > 0
    ? `<div class="pztray"><div class="pzp" style="${wdPzPos(next)}"></div>
       <div><b>내 조각 ${P.tray}개</b><br>이 조각이 들어갈 자리를<br>아래 그림에서 눌러 보세요</div></div>`
    : `<div class="tag">조각이 없어요. 단어 게임을 하면 조각을 받아요! 🧩<br><small>한 판 끝날 때 별 개수만큼, 새 친구가 생기면 5개 더</small></div>`;
  const gal = P.gallery.length
    ? `<div class="tag">🏆 완성한 퍼즐 ${P.gallery.length}개</div><div class="grid2">${P.gallery.map(n =>
        `<div><img class="pzthumb" src="${wdPzPicture(n)}"><div class="tag" style="font-size:14px">${WD_THEMES[n % WD_THEMES.length].name} #${n + 1}</div></div>`).join('')}</div>` : '';
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button><b style="flex:1;text-align:center">${T.name} #${P.n + 1}</b>
    <button class="x" onclick="wdPzZoom=!wdPzZoom;wdPuzzle()">${wdPzZoom ? '🔍 작게' : '🔍 크게'}</button></div>
    <div class="top"><div class="bar"><i style="width:${done}%"></i></div><b>${done}/${WD_PZ_ALL}</b></div>
    ${tray}
    <div id="pzroot"><div class="pzscroll"><div class="pzboard" style="--c:${c}px">${cells.join('')}</div></div></div>
    <button class="btn" onclick="wdHome()">🏠 처음으로</button>${gal}`;
  const root = document.getElementById('pzroot'), img = `url(${wdPzPicture(P.n)})`;
  root.style.setProperty('--img', img);
  const pzp = document.querySelector('.pzp'); if (pzp) pzp.style.setProperty('--img', img);
  const sc = document.querySelector('.pzscroll'); if (keep && sc) { sc.scrollLeft = keep[0]; sc.scrollTop = keep[1]; }
  wdPzLast = -1;
}

function wdPzTap(i) {
  const P = wdPz();
  if (P.placed[i] == '1') return;
  if (P.tray <= 0) { wdToast('퍼즐 조각이 없어요. 단어 게임을 하면 받아요!'); return; }
  const want = wdPzNext(P);
  if (i == want) {
    P.placed = P.placed.slice(0, i) + '1' + P.placed.slice(i + 1);
    P.tray--; wdPzWrong = 0; wdPzHint = -1; wdPzLast = i;
    wdGoodSnd(); wdSave();
    if (P.placed.indexOf('0') < 0) return wdPzDone();
    wdPuzzle();
  } else {
    wdBadSnd(); wdPzWrong++;
    const el = document.getElementById('pc' + i);
    if (el) { el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 350); }
    if (wdPzWrong >= 3) {   // 세 번 틀리면 자리를 깜박여 알려 준다
      wdPzHint = want;
      const h = document.getElementById('pc' + want);
      if (h) { h.classList.add('hint'); h.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      wdToast('깜박이는 곳이 이 조각의 자리예요');
    }
  }
}

function wdPzDone() {
  const P = wdPz(), n = P.n, T = WD_THEMES[n % WD_THEMES.length], nt = WD_THEMES[(n + 1) % WD_THEMES.length];
  P.gallery.push(n); P.n++; P.placed = '0'.repeat(WD_PZ_ALL); wdPzHint = -1; wdPzWrong = 0;
  wdSave();
  $app.innerHTML = `<div class="big" style="font-size:56px">🎉</div><h1>퍼즐 완성!</h1>
    <div class="tag">${T.name} #${n + 1} 을(를) 다 맞췄어요</div>
    <img class="pzfull" src="${wdPzPicture(n)}">
    <button class="btn" onclick="wdPuzzle()">▶ 다음 퍼즐: ${nt.name}</button>
    <button class="btn blue" onclick="wdHome()">🏠 처음으로</button>`;
  wdGoodSnd(); setTimeout(wdGoodSnd, 400); setTimeout(wdGoodSnd, 800);
}
