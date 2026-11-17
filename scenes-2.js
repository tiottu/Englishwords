// 퍼즐 그림 8장 더 (scenes.js 의 도우미 함수를 쓴다). 순서대로 WD_THEMES 뒤에 이어 붙는다.
function wdPzHouse(g, x, y, w, h, wall) {   // 눈 덮인 지붕에 불 켜진 창문
  g.fillStyle = wall; g.fillRect(x, y - h, w, h);
  g.fillStyle = '#5a3a46'; g.beginPath(); g.moveTo(x - 10, y - h); g.lineTo(x + w / 2, y - h - w * .45); g.lineTo(x + w + 10, y - h); g.closePath(); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - 10, y - h); g.lineTo(x + w / 2, y - h - w * .45); g.lineTo(x + w + 10, y - h); g.stroke();
  wdPzGlow(g, x + w * .32, y - h * .55, w * .4, 'rgba(255,210,120,.65)', 'rgba(255,210,120,0)');
  g.fillStyle = '#ffd27a'; g.fillRect(x + w * .2, y - h * .72, w * .2, h * .32); g.fillRect(x + w * .6, y - h * .72, w * .2, h * .32);
  g.fillStyle = '#7a4a2a'; g.fillRect(x + w * .44, y - h * .42, w * .14, h * .42);
  g.fillStyle = '#6b4a56'; g.fillRect(x + w * .7, y - h - w * .3, w * .1, w * .22);
  for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(255,255,255,${.4 - k * .1})`; g.beginPath(); g.arc(x + w * .75 + k * 8, y - h - w * .38 - k * 16, 8 + k * 4, 0, 7); g.fill(); }
}
function wdPzBalloon(g, x, y, s, cols) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.ellipse(0, 0, s * .8, s, 0, 0, 7); g.save(); g.clip();
  const bw = s * 1.6 / cols.length;
  cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(-s * .8 + i * bw, -s, bw + 1, s * 2); });
  const sh = g.createRadialGradient(-s * .3, -s * .3, s * .1, 0, 0, s); sh.addColorStop(0, 'rgba(255,255,255,.4)'); sh.addColorStop(1, 'rgba(0,0,0,.2)');
  g.fillStyle = sh; g.fillRect(-s, -s, s * 2, s * 2); g.restore();
  g.strokeStyle = '#5a3a22'; g.lineWidth = 2;
  [-1, 1].forEach(k => { g.beginPath(); g.moveTo(k * s * .5, s * .85); g.lineTo(k * s * .22, s * 1.5); g.stroke(); });
  g.fillStyle = '#9a6a3a'; g.fillRect(-s * .25, s * 1.5, s * .5, s * .3);
  g.restore();
}
function wdPzFish(g, x, y, s, c, dir) {
  g.save(); g.translate(x, y); g.scale(dir, 1); g.fillStyle = c;
  g.beginPath(); g.ellipse(0, 0, s, s * .55, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-s * .8, 0); g.lineTo(-s * 1.55, -s * .55); g.lineTo(-s * 1.55, s * .55); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-s * .15, -s * .5, s * .18, s);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(s * .5, -s * .15, s * .15, 0, 7); g.fill();
  g.fillStyle = '#123'; g.beginPath(); g.arc(s * .54, -s * .15, s * .07, 0, 7); g.fill();
  g.restore();
}
function wdPzCoral(g, r, x, y, len, ang, w, c, d) {
  if (d <= 0 || len < 6) return;
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
  wdPzCoral(g, r, x2, y2, len * .72, ang - .45 - r() * .25, w * .75, c, d - 1);
  wdPzCoral(g, r, x2, y2, len * .72, ang + .45 + r() * .25, w * .75, c, d - 1);
  if (d == 1) { g.fillStyle = c; g.beginPath(); g.arc(x2, y2, w * .9, 0, 7); g.fill(); }
}
function wdPzJelly(g, x, y, s, c) {   // c 예: 'rgba(255,150,220,'
  wdPzGlow(g, x, y, s * 2.2, c + '.45)', c + '0)');
  g.fillStyle = c + '.85)'; g.beginPath(); g.arc(x, y, s, Math.PI, 0); g.quadraticCurveTo(x, y + s * .35, x - s, y); g.fill();
  g.strokeStyle = c + '.7)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * s * .28, y + s * .1); g.bezierCurveTo(x + k * s * .28 + s * .2, y + s * .6, x + k * s * .28 - s * .2, y + s, x + k * s * .28, y + s * 1.5); g.stroke(); }
}
function wdPzPalm(g, x, y, h, c, lean) {
  g.strokeStyle = c; g.lineWidth = h * .06; g.lineCap = 'round';
  const tx = x + lean, ty = y - h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * .2, y - h * .6, tx, ty); g.stroke();
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * .5, l = h * .55;
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * l * .6, ty + Math.sin(a) * l * .6 - l * .25, tx + Math.cos(a) * l, ty + Math.sin(a) * l + l * .25); g.stroke();
  }
}

WD_THEMES.push(
  { name: '눈 내리는 마을', draw(g, r) {
    wdPzSky(g, [[0, '#0b1a3f'], [.5, '#27467a'], [1, '#9ec3ea']]);
    wdPzStars(g, r, 90, 330); wdPzMoon(g, 620, 130, 40, 'rgba(230,240,255,.6)');
    wdPzRidge(g, r, 430, 60, '#b8d0ee', 9); wdPzRidge(g, r, 480, 45, '#9db9dd', 8);
    for (let i = 0; i < 18; i++) { const x = r() * 800, y = 520 + r() * 30, h = 70 + r() * 60; wdPzPine(g, x, y, h, '#1d3f5a'); wdPzPine(g, x, y - h * .12, h * .8, 'rgba(255,255,255,.55)'); }
    wdPzRidge(g, r, 565, 18, '#eef5ff', 8);
    wdPzHouse(g, 90, 570, 120, 84, '#e8c9a0'); wdPzHouse(g, 320, 590, 140, 96, '#d9a888'); wdPzHouse(g, 570, 575, 124, 88, '#e8c9a0');
    wdPzRidge(g, r, 660, 16, '#f8fbff', 8); wdPzRidge(g, r, 735, 12, '#dce9fa', 7);
    g.fillStyle = '#fff'; [[690, 700, 38], [690, 656, 28], [690, 624, 20]].forEach(([x, y, rr]) => { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); });   // 눈사람
    g.fillStyle = '#222'; g.beginPath(); g.arc(683, 620, 2.5, 0, 7); g.arc(697, 620, 2.5, 0, 7); g.fill();
    g.fillStyle = '#ff8a3d'; g.beginPath(); g.moveTo(690, 626); g.lineTo(712, 630); g.lineTo(690, 633); g.fill();
    g.fillStyle = '#d83a4a'; g.fillRect(674, 636, 32, 8);
    for (let i = 0; i < 170; i++) { g.fillStyle = `rgba(255,255,255,${.35 + r() * .55})`; g.beginPath(); g.arc(r() * 800, r() * 800, 1.5 + r() * 2.8, 0, 7); g.fill(); }
  } },
  { name: '열기구 하늘', draw(g, r) {
    wdPzSky(g, [[0, '#5aa9ff'], [.6, '#bfe6ff'], [1, '#ffe9c9']]);
    wdPzGlow(g, 650, 120, 260, 'rgba(255,255,230,.95)', 'rgba(255,255,230,0)');
    for (let i = 0; i < 7; i++) wdPzCloud(g, 60 + r() * 700, 90 + r() * 420, 26 + r() * 26, .55 + r() * .35);
    wdPzRidge(g, r, 600, 35, '#a9d8a0', 8); wdPzRidge(g, r, 660, 28, '#86c48a', 7); wdPzRidge(g, r, 725, 22, '#5fae6a', 7);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,235,120,${.35 + r() * .2})`; g.fillRect(r() * 720, 690 + r() * 90, 60 + r() * 60, 10); }   // 밭
    wdPzBalloon(g, 250, 250, 105, ['#ff5a6e', '#ffd84a', '#ff5a6e', '#ffd84a', '#ff5a6e']);
    wdPzBalloon(g, 560, 190, 80, ['#4aa8ff', '#fff', '#4aa8ff', '#fff', '#4aa8ff']);
    wdPzBalloon(g, 470, 430, 62, ['#7ad36a', '#fff3a0', '#7ad36a', '#fff3a0']);
    wdPzBalloon(g, 110, 470, 50, ['#b06aff', '#ffc2e8', '#b06aff', '#ffc2e8']);
    wdPzBalloon(g, 690, 400, 46, ['#ff9b4a', '#fff', '#ff9b4a', '#fff']);
    for (let i = 0; i < 5; i++) wdPzBird(g, 80 + r() * 640, 60 + r() * 360, 10 + r() * 8, '#4a6a98');
  } },
  { name: '산호초 바다', draw(g, r) {
    wdPzSky(g, [[0, '#7fe3ff'], [.45, '#1a9ad8'], [1, '#07306b']]);
    g.save(); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.moveTo(60 + k * 140, 0); g.lineTo(150 + k * 140, 0); g.lineTo(60 + k * 140 + 230, 800); g.lineTo(k * 140 - 40, 800); g.closePath(); g.fill(); } g.restore();
    for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(r() * 800, r() * 700, 3 + r() * 9, 0, 7); g.stroke(); }
    wdPzJelly(g, 160, 230, 40, 'rgba(255,150,225,'); wdPzJelly(g, 620, 150, 30, 'rgba(160,200,255,'); wdPzJelly(g, 500, 330, 24, 'rgba(255,200,140,');
    wdPzRidge(g, r, 690, 24, '#f2d49a', 8);
    for (let k = 0; k < 7; k++) wdPzCoral(g, r, 60 + k * 120 + r() * 40, 740, 62 + r() * 36, -Math.PI / 2 + (r() - .5) * .5, 12, ['#ff6f91', '#ff9a4a', '#b46bff', '#ff5a6e', '#ffc24a'][k % 5], 4);
    for (let k = 0; k < 8; k++) { const x = 30 + k * 100 + r() * 40; g.strokeStyle = '#2fa86a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 760); g.bezierCurveTo(x - 30, 700, x + 30, 640, x - 10, 570 + r() * 40); g.stroke(); }
    wdPzFish(g, 300, 380, 44, '#ffb02e', 1); wdPzFish(g, 520, 470, 34, '#ff6f91', -1); wdPzFish(g, 200, 520, 28, '#5ad2ff', 1); wdPzFish(g, 650, 330, 38, '#ffd84a', -1);
    for (let i = 0; i < 12; i++) wdPzFish(g, 380 + r() * 120, 560 + r() * 60, 9 + r() * 4, '#bfe9ff', i % 2 ? 1 : -1);
  } },
  { name: '마법의 숲', draw(g, r) {
    wdPzSky(g, [[0, '#080a2e'], [.5, '#1a2f5a'], [1, '#2a6a6a']]);
    wdPzStars(g, r, 110, 300); wdPzMoon(g, 560, 140, 52, 'rgba(210,240,255,.55)');
    for (let i = 0; i < 9; i++) {   // 나무 기둥과 잎
      const x = 20 + i * 95 + r() * 30, h = 330 + r() * 160;
      g.fillStyle = '#0a1a2c'; g.fillRect(x - 14, 800 - h, 28, h);
      g.fillStyle = 'rgba(14,44,60,.95)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + (r() - .5) * 90, 800 - h + (r() - .5) * 60, 50 + r() * 40, 0, 7); g.fill(); }
    }
    for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(160,230,230,.1)'; g.beginPath(); g.ellipse(r() * 800, 560 + k * 50, 300, 30, 0, 0, 7); g.fill(); }   // 안개
    wdPzRidge(g, r, 690, 20, '#0d2f3a', 7);
    [[150, 690, 46, '#ff6fd8'], [330, 720, 34, '#6ff0ff'], [520, 700, 56, '#ffd86f'], [690, 730, 38, '#a58bff'], [60, 740, 28, '#7dffb0']].forEach(([x, y, s, c]) => {   // 빛나는 버섯
      wdPzGlow(g, x, y - s * .4, s * 2.4, c + '66', c + '00');
      g.fillStyle = '#e9e4d8'; g.fillRect(x - s * .16, y - s * .5, s * .32, s * .6);
      g.fillStyle = c; g.beginPath(); g.arc(x, y - s * .45, s * .75, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - s * .25, y - s * .7, s * .1, 0, 7); g.arc(x + s * .22, y - s * .6, s * .08, 0, 7); g.fill();
    });
    for (let i = 0; i < 40; i++) { const x = r() * 800, y = 250 + r() * 520; wdPzGlow(g, x, y, 14, 'rgba(255,245,150,.95)', 'rgba(255,245,150,0)'); g.fillStyle = '#fffbd0'; g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); }   // 반딧불이
  } },
  { name: '사막의 밤', draw(g, r) {
    wdPzSky(g, [[0, '#0a0e33'], [.55, '#3b2a6b'], [.85, '#e8845a'], [1, '#ffc07a']]);
    wdPzStars(g, r, 200, 470);
    wdPzGlow(g, 580, 150, 200, 'rgba(255,240,200,.35)', 'rgba(255,240,200,0)');
    g.fillStyle = '#fff4cf'; g.beginPath(); g.arc(580, 150, 54, 0, 7); g.fill();   // 초승달
    g.fillStyle = '#2b2370'; g.beginPath(); g.arc(602, 138, 48, 0, 7); g.fill();
    wdPzRidge(g, r, 520, 12, '#a3573f', 6);
    [[170, 540, 190], [330, 548, 120], [470, 538, 150]].forEach(([x, y, s]) => {   // 피라미드
      g.fillStyle = '#e9b36a'; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x, y - s * .8); g.lineTo(x, y); g.closePath(); g.fill();
      g.fillStyle = '#b97a45'; g.beginPath(); g.moveTo(x + s, y); g.lineTo(x, y - s * .8); g.lineTo(x, y); g.closePath(); g.fill();
    });
    wdPzRidge(g, r, 600, 40, '#c9835a', 7); wdPzRidge(g, r, 680, 34, '#a8603f', 7); wdPzRidge(g, r, 755, 24, '#7e4330', 6);
    wdPzPalm(g, 640, 640, 190, '#2a1530', 26); wdPzPalm(g, 700, 660, 130, '#2a1530', -18); wdPzPalm(g, 90, 700, 150, '#1c0f26', 20);
    [[360, 690], [440, 700]].forEach(([x, y]) => {   // 낙타 그림자
      g.fillStyle = '#1c0f26'; g.beginPath(); g.ellipse(x, y, 34, 17, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x - 6, y - 18, 11, 0, 7); g.fill();
      g.fillRect(x + 24, y - 36, 8, 26); g.beginPath(); g.arc(x + 28, y - 38, 9, 0, 7); g.fill();
      [-22, -8, 10, 24].forEach(lx => g.fillRect(x + lx, y + 8, 5, 28));
    });
  } },
  { name: '등대와 노을', draw(g, r) {
    wdPzSky(g, [[0, '#1a1b4b'], [.35, '#8a3f8a'], [.55, '#ff7a6a'], [.68, '#ffc27a']]);
    wdPzGlow(g, 220, 470, 300, 'rgba(255,230,150,.85)', 'rgba(255,170,90,0)');
    g.fillStyle = '#fff1bf'; g.beginPath(); g.arc(220, 470, 56, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,190,170,${.25 + r() * .2})`; g.beginPath(); g.ellipse(100 + r() * 600, 120 + i * 55 + r() * 25, 110 + r() * 110, 6 + r() * 5, 0, 0, 7); g.fill(); }
    const sea = g.createLinearGradient(0, 520, 0, 800); sea.addColorStop(0, '#ff9a6b'); sea.addColorStop(.3, '#b04a8a'); sea.addColorStop(1, '#161650');
    g.fillStyle = sea; g.fillRect(0, 520, 800, 280);
    for (let i = 0; i < 16; i++) { const w = 30 + i * 8 + r() * 20; g.fillStyle = `rgba(255,225,160,${Math.max(.06, .7 - i * .04)})`; g.fillRect(220 - w / 2, 526 + i * 14, w, 4); }
    for (let k = 0; k < 12; k++) { g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 800; x += 10) { const y = 545 + k * 22 + Math.sin(x / 36 + k) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.fillStyle = '#2a1a2e'; g.beginPath(); g.moveTo(470, 700); g.lineTo(520, 640); g.lineTo(552, 598); g.lineTo(650, 586); g.lineTo(700, 600); g.lineTo(760, 650); g.lineTo(800, 668); g.lineTo(800, 720); g.lineTo(700, 730); g.lineTo(540, 725); g.closePath(); g.fill();   // 바위섬
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,255,255,${.12 + r() * .12})`; g.beginPath(); g.ellipse(470 + r() * 330, 722 + r() * 14, 40 + r() * 40, 5 + r() * 4, 0, 0, 7); g.fill(); }   // 바위에 부서지는 물거품
    const lx = 610;   // 등대
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(lx - 38, 580); g.lineTo(lx - 22, 330); g.lineTo(lx + 22, 330); g.lineTo(lx + 38, 580); g.closePath(); g.fill();
    g.fillStyle = '#d8404a';
    [[560, 505], [470, 430], [390, 350]].forEach(([y0, y1]) => { const w0 = 22 + (y0 - 330) / 250 * 16, w1 = 22 + (y1 - 330) / 250 * 16; g.beginPath(); g.moveTo(lx - w0, y0); g.lineTo(lx + w0, y0); g.lineTo(lx + w1, y1); g.lineTo(lx - w1, y1); g.closePath(); g.fill(); });
    g.fillStyle = '#3a2a3e'; g.fillRect(lx - 30, 318, 60, 14); g.fillRect(lx - 26, 290, 52, 30);
    wdPzGlow(g, lx, 304, 90, 'rgba(255,240,150,.9)', 'rgba(255,240,150,0)'); g.fillStyle = '#fff2a0'; g.fillRect(lx - 20, 294, 40, 22);
    g.fillStyle = '#d8404a'; g.beginPath(); g.moveTo(lx - 32, 290); g.lineTo(lx, 252); g.lineTo(lx + 32, 290); g.closePath(); g.fill();
    const beam = g.createLinearGradient(lx, 304, lx - 520, 280); beam.addColorStop(0, 'rgba(255,245,170,.55)'); beam.addColorStop(1, 'rgba(255,245,170,0)');
    g.fillStyle = beam; g.beginPath(); g.moveTo(lx, 298); g.lineTo(lx - 560, 210); g.lineTo(lx - 560, 400); g.lineTo(lx, 310); g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) wdPzBird(g, 80 + r() * 340, 90 + r() * 200, 12 + r() * 8, '#3a1a40');
  } },
  { name: '단풍 호수', draw(g, r) {
    wdPzSky(g, [[0, '#ffcf9a'], [.5, '#ffe6c7'], [1, '#fff6ea']]);
    wdPzGlow(g, 200, 170, 240, 'rgba(255,250,210,.95)', 'rgba(255,230,170,0)');
    wdPzRidge(g, r, 330, 40, '#e8a58a', 9); wdPzRidge(g, r, 390, 30, '#d4806a', 8);
    const shore = 470, cols = ['#d8402a', '#f08a2a', '#f2b834', '#c8302a', '#e86a2a'];
    const trees = []; for (let i = 0; i < 13; i++) trees.push({ x: 20 + i * 62 + r() * 30, h: 90 + r() * 90, c: cols[Math.floor(r() * 5)] });
    const draw = (flip) => trees.forEach(t => {
      const sy = flip ? shore + 4 : shore, d = flip ? -1 : 1;
      g.fillStyle = flip ? 'rgba(70,40,30,.4)' : '#5a3a2a'; g.fillRect(t.x - 5, flip ? sy : sy - t.h * .55, 10, t.h * .55 * (flip ? 1 : 1));
      g.fillStyle = flip ? t.c + '66' : t.c;
      [[0, -.75, 44], [-30, -.55, 34], [30, -.55, 34], [0, -.5, 40]].forEach(([dx, dy, rr]) => { g.beginPath(); g.arc(t.x + dx, sy + d * t.h * dy, rr, 0, 7); g.fill(); });
    });
    wdPzRidge(g, r, shore - 6, 6, '#8a6a3a', 6);
    const lake = g.createLinearGradient(0, shore, 0, 800); lake.addColorStop(0, '#f0b890'); lake.addColorStop(.4, '#c8946f'); lake.addColorStop(1, '#6a5a78');
    g.fillStyle = lake; g.fillRect(0, shore, 800, 330);
    draw(true);   // 물에 비친 모습
    for (let k = 0; k < 14; k++) { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 800; x += 10) { const y = shore + 20 + k * 22 + Math.sin(x / 30 + k) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    draw(false);
    for (let i = 0; i < 40; i++) { g.save(); g.translate(r() * 800, 150 + r() * 640); g.rotate(r() * 6); g.fillStyle = cols[i % 5]; g.beginPath(); g.ellipse(0, 0, 8, 4, 0, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = '#4a3040'; g.beginPath(); g.moveTo(450, 640); g.lineTo(560, 640); g.lineTo(545, 662); g.lineTo(468, 662); g.closePath(); g.fill();
    g.fillRect(505, 590, 3, 50); g.fillStyle = '#fff3e0'; g.beginPath(); g.moveTo(508, 594); g.lineTo(508, 636); g.lineTo(540, 636); g.closePath(); g.fill();
  } },
  { name: '화산과 공룡', draw(g, r) {
    wdPzSky(g, [[0, '#3a1030'], [.45, '#c4452f'], [.78, '#ffb347'], [1, '#ffe08a']]);
    wdPzGlow(g, 400, 330, 340, 'rgba(255,200,90,.7)', 'rgba(255,140,60,0)');
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(60,30,40,${.35 + r() * .3})`; g.beginPath(); g.arc(300 + r() * 200, 80 + i * 26, 40 + r() * 50, 0, 7); g.fill(); }   // 화산재 구름
    for (let i = 0; i < 6; i++) { const x = 60 + r() * 700, y = 40 + r() * 200; g.strokeStyle = 'rgba(255,230,160,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 70, y + 40); g.stroke(); g.fillStyle = '#fff1b0'; g.beginPath(); g.arc(x + 70, y + 40, 5, 0, 7); g.fill(); }
    g.fillStyle = '#2a1418'; g.beginPath(); g.moveTo(130, 640); g.lineTo(350, 330); g.lineTo(450, 330); g.lineTo(680, 640); g.closePath(); g.fill();   // 화산
    wdPzGlow(g, 400, 330, 120, 'rgba(255,170,60,.95)', 'rgba(255,100,30,0)');
    g.fillStyle = '#ff7a2a'; g.beginPath(); g.moveTo(350, 330); g.quadraticCurveTo(400, 300, 450, 330); g.lineTo(440, 336); g.quadraticCurveTo(400, 318, 360, 336); g.closePath(); g.fill();
    g.strokeStyle = '#ff8a2a'; g.lineWidth = 9; g.lineCap = 'round';
    [[380, 340, 330, 640], [410, 340, 430, 640], [440, 340, 560, 620]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.bezierCurveTo(a - 20, b + 100, c + 30, d - 120, c, d); g.stroke(); });
    wdPzRidge(g, r, 650, 22, '#2a1a1e', 7);
    const sil = '#140a10';   // 공룡 그림자
    g.fillStyle = sil; g.strokeStyle = sil; g.lineCap = 'round';
    g.beginPath(); g.ellipse(180, 640, 80, 38, 0, 0, 7); g.fill();   // 브라키오
    g.lineWidth = 22; g.beginPath(); g.moveTo(230, 620); g.bezierCurveTo(290, 560, 270, 470, 300, 420); g.stroke();
    g.beginPath(); g.ellipse(310, 412, 24, 14, -.3, 0, 7); g.fill();
    g.lineWidth = 26; g.beginPath(); g.moveTo(110, 636); g.bezierCurveTo(60, 650, 30, 640, 10, 600); g.stroke();
    [-40, -10, 40, 70].forEach(lx => g.fillRect(180 + lx - 8, 640, 16, 64));
    g.beginPath(); g.ellipse(600, 650, 62, 40, -.15, 0, 7); g.fill();   // 티라노
    g.beginPath(); g.moveTo(640, 630); g.lineTo(700, 580); g.lineTo(740, 585); g.lineTo(745, 612); g.lineTo(690, 628); g.closePath(); g.fill();
    g.lineWidth = 22; g.beginPath(); g.moveTo(545, 655); g.quadraticCurveTo(480, 690, 440, 650); g.stroke();
    g.fillRect(584, 670, 16, 56); g.fillRect(618, 670, 16, 56);
    g.lineWidth = 6; g.beginPath(); g.moveTo(644, 660); g.lineTo(668, 672); g.stroke();
    wdPzPalm(g, 60, 760, 160, '#140a10', 24); wdPzPalm(g, 760, 770, 140, '#140a10', -22);
  } }
);
