// 퍼즐 그림 6장: 캔버스로 직접 그린 풍경 (전역 이름은 wd 로 시작)
// 하늘 그라데이션, 빛 번짐, 겹겹의 산, 반짝이는 별 같은 것을 겹쳐서 그린다. 퍼즐마다 번호(seed)로 약간 다르게 그려진다.
function wdPzSky(g, stops) {
  const gr = g.createLinearGradient(0, 0, 0, 800);
  stops.forEach(([p, c]) => gr.addColorStop(p, c));
  g.fillStyle = gr; g.fillRect(0, 0, 800, 800);
}
function wdPzGlow(g, x, y, r, c0, c1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, c0); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
function wdPzRidge(g, rnd, base, amp, color, steps) {   // 부드럽게 오르내리는 능선 (아래는 모두 채움)
  const pts = []; for (let i = 0; i <= steps; i++) pts.push(base + (rnd() - .5) * 2 * amp);
  g.beginPath(); g.moveTo(0, 800);
  for (let x = 0; x <= 800; x += 8) {
    const t = x / 800 * steps, i = Math.floor(t), f = t - i, s = (1 - Math.cos(f * Math.PI)) / 2;
    g.lineTo(x, pts[i] * (1 - s) + pts[Math.min(i + 1, steps)] * s);
  }
  g.lineTo(800, 800); g.closePath(); g.fillStyle = color; g.fill();
}
function wdPzStars(g, rnd, n, ymax) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * 800, y = rnd() * ymax, r = .6 + rnd() * 1.8;
    g.fillStyle = `rgba(255,255,255,${.4 + rnd() * .6})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    if (rnd() < .12) {   // 가끔 십자로 반짝
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.stroke();
    }
  }
}
function wdPzCloud(g, x, y, s, a) {
  g.fillStyle = `rgba(255,255,255,${a})`;
  [[0, 0, 1], [.9, .2, .8], [-.9, .25, .75], [.4, -.3, .7], [-.4, -.25, .65]].forEach(([dx, dy, k]) => {
    g.beginPath(); g.arc(x + dx * s, y + dy * s, s * .7 * k, 0, 7); g.fill();
  });
}
function wdPzPine(g, x, y, h, c) {
  g.fillStyle = c;
  for (let k = 0; k < 3; k++) {
    const top = y - h + k * h * .25, bot = top + h * .45, w = h * .22 * (1 + k * .45);
    g.beginPath(); g.moveTo(x, top); g.lineTo(x - w, bot); g.lineTo(x + w, bot); g.closePath(); g.fill();
  }
  g.fillRect(x - h * .03, y - h * .12, h * .06, h * .12);
}
function wdPzBird(g, x, y, s, c) {
  g.strokeStyle = c; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - s, y); g.quadraticCurveTo(x - s / 2, y - s * .7, x, y); g.quadraticCurveTo(x + s / 2, y - s * .7, x + s, y); g.stroke();
}
function wdPzMoon(g, x, y, r, glow) {
  wdPzGlow(g, x, y, r * 3.2, glow, glow.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = 'rgba(214,204,160,.5)';
  [[-.3, -.2, .22], [.25, .15, .3], [-.1, .45, .16]].forEach(([a, b, k]) => { g.beginPath(); g.arc(x + a * r, y + b * r, k * r, 0, 7); g.fill(); });
}

const WD_THEMES = [
  { name: '노을 바다', draw(g, r) {
    wdPzSky(g, [[0, '#2b1055'], [.3, '#a23a8f'], [.52, '#ff7a5c'], [.6, '#ffd27a']]);
    wdPzGlow(g, 400, 470, 340, 'rgba(255,236,160,.95)', 'rgba(255,160,90,0)');
    g.fillStyle = '#fff4c9'; g.beginPath(); g.arc(400, 470, 64, 0, 7); g.fill();
    for (let i = 0; i < 7; i++) {   // 길쭉한 노을 구름
      g.fillStyle = `rgba(255,205,175,${.25 + r() * .25})`;
      g.beginPath(); g.ellipse(100 + r() * 600, 120 + i * 45 + r() * 20, 120 + r() * 120, 6 + r() * 5, 0, 0, 7); g.fill();
    }
    wdPzRidge(g, r, 470, 14, '#4a1f6b', 9);   // 먼 섬
    const sea = g.createLinearGradient(0, 482, 0, 800);
    sea.addColorStop(0, '#ff9a6b'); sea.addColorStop(.25, '#c04a7a'); sea.addColorStop(1, '#1b1650');
    g.fillStyle = sea; g.fillRect(0, 482, 800, 320);
    for (let i = 0; i < 24; i++) {   // 햇빛이 비친 길
      const w = 40 + i * 9 + r() * 20;
      g.fillStyle = `rgba(255,232,165,${Math.max(.08, .78 - i * .028)})`;
      g.fillRect(400 - w / 2, 488 + i * 13, w, 4 + i * .25);
    }
    for (let k = 0; k < 14; k++) {   // 물결
      g.strokeStyle = `rgba(255,255,255,${.06 + r() * .08})`; g.lineWidth = 2; g.beginPath();
      for (let x = 0; x <= 800; x += 10) { const y = 505 + k * 21 + Math.sin(x / 38 + k) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.fillStyle = '#1a1030';   // 돛단배
    g.beginPath(); g.moveTo(560, 540); g.lineTo(652, 540); g.lineTo(632, 558); g.lineTo(580, 558); g.closePath(); g.fill();
    g.fillRect(603, 470, 4, 72);
    g.fillStyle = 'rgba(255,233,194,.95)'; g.beginPath(); g.moveTo(609, 474); g.lineTo(609, 534); g.lineTo(652, 534); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,208,160,.95)'; g.beginPath(); g.moveTo(600, 486); g.lineTo(600, 534); g.lineTo(566, 534); g.closePath(); g.fill();
    for (let i = 0; i < 5; i++) wdPzBird(g, 80 + r() * 640, 80 + r() * 200, 12 + r() * 10, '#3a1550');
  } },
  { name: '별빛 산', draw(g, r) {
    wdPzSky(g, [[0, '#040a26'], [.45, '#18286a'], [.8, '#4b3f94'], [1, '#7a5aa8']]);
    wdPzStars(g, r, 170, 520);
    [['rgba(80,255,190,', 0], ['rgba(120,160,255,', 1], ['rgba(200,120,255,', 2]].forEach(([c, k]) => {   // 오로라
      const gr = g.createLinearGradient(0, 120 + k * 40, 0, 360 + k * 40);
      gr.addColorStop(0, c + '0)'); gr.addColorStop(.5, c + '.38)'); gr.addColorStop(1, c + '0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, 200 + k * 40);
      for (let x = 0; x <= 800; x += 10) g.lineTo(x, 200 + k * 40 + Math.sin(x / 90 + k * 2) * 45 + Math.sin(x / 37 + k) * 12);
      g.lineTo(800, 380 + k * 40); g.lineTo(0, 380 + k * 40); g.closePath(); g.fill();
    });
    wdPzMoon(g, 610, 150, 46, 'rgba(255,250,210,.7)');
    wdPzRidge(g, r, 470, 90, '#3a4a98', 10); wdPzRidge(g, r, 520, 70, '#26357a', 9); wdPzRidge(g, r, 575, 50, '#16215a', 8);
    const lake = g.createLinearGradient(0, 650, 0, 800); lake.addColorStop(0, '#0d1745'); lake.addColorStop(1, '#050a26');
    g.fillStyle = lake; g.fillRect(0, 650, 800, 150);
    for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(255,250,210,${.5 - i * .04})`; g.fillRect(610 - (70 - i * 5) / 2, 662 + i * 13, 70 - i * 5, 4); }
    for (let i = 0; i < 18; i++) wdPzPine(g, 20 + i * 45 + r() * 20, 652, 56 + r() * 54, '#0a1238');
  } },
  { name: '동화 속 성', draw(g, r) {
    wdPzSky(g, [[0, '#6fc3ff'], [.65, '#c9ecff'], [1, '#fff3d2']]);
    wdPzGlow(g, 120, 120, 240, 'rgba(255,255,220,.9)', 'rgba(255,255,220,0)');
    ['#ff5a6e', '#ff9b4a', '#ffd84a', '#6fd36a', '#4aa8ff', '#6a6aff', '#b06aff'].forEach((c, i) => {   // 무지개
      g.strokeStyle = c; g.globalAlpha = .55; g.lineWidth = 22; g.beginPath(); g.arc(110, 640, 400 - i * 22, Math.PI * 1.12, Math.PI * 1.93); g.stroke();
    });
    g.globalAlpha = 1;
    wdPzCloud(g, 220, 150, 50, .95); wdPzCloud(g, 540, 90, 60, .9); wdPzCloud(g, 700, 240, 45, .85);
    wdPzRidge(g, r, 560, 30, '#9bdc72', 7);
    const roof = (x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + w / 2, y - h); g.lineTo(x + w + 10, y); g.closePath(); g.fill(); };
    const flag = (x, y) => { g.fillStyle = '#7a5a8a'; g.fillRect(x - 1.5, y - 38, 3, 38); g.fillStyle = '#ff5a6e'; g.beginPath(); g.moveTo(x + 1.5, y - 38); g.lineTo(x + 30, y - 30); g.lineTo(x + 1.5, y - 22); g.fill(); };
    g.fillStyle = '#ead6ff'; g.fillRect(440, 430, 150, 140);   // 본관
    for (let x = 440; x < 590; x += 26) g.fillRect(x, 418, 14, 14);   // 성가퀴
    g.fillStyle = '#f3e3ff'; g.fillRect(400, 380, 56, 190); g.fillRect(604, 380, 56, 190); g.fillRect(490, 330, 80, 240);
    roof(400, 380, 56, 80, '#e5456f'); roof(604, 380, 56, 80, '#e5456f'); roof(490, 330, 80, 100, '#7a5af0');
    flag(428, 300); flag(632, 300); flag(530, 230);
    g.fillStyle = 'rgba(90,60,140,.1)'; g.fillRect(530, 330, 40, 240); g.fillRect(632, 380, 28, 190);   // 그림자
    g.fillStyle = '#ffd86b';
    [[420, 420], [624, 420], [512, 380], [538, 380], [512, 460], [538, 460], [466, 480], [566, 480]].forEach(([x, y]) => {
      g.beginPath(); g.arc(x + 8, y + 8, 8, Math.PI, 0); g.lineTo(x + 16, y + 26); g.lineTo(x, y + 26); g.closePath(); g.fill();
    });
    g.fillStyle = '#6b3fa0'; g.beginPath(); g.arc(530, 520, 26, Math.PI, 0); g.lineTo(556, 572); g.lineTo(504, 572); g.closePath(); g.fill();   // 성문
    wdPzRidge(g, r, 612, 30, '#6cc04a', 8); wdPzRidge(g, r, 690, 26, '#4fae4a', 7);
    g.fillStyle = 'rgba(255,236,190,.9)'; g.beginPath(); g.moveTo(512, 585); g.quadraticCurveTo(470, 650, 520, 700); g.lineTo(640, 700); g.quadraticCurveTo(560, 640, 548, 585); g.closePath(); g.fill();   // 길
    [[100, 600], [720, 610]].forEach(([x, y]) => {   // 나무
      g.fillStyle = '#8a5a3a'; g.fillRect(x - 8, y - 20, 16, 70);
      g.fillStyle = '#3f9e4a'; [[0, -50, 52], [-34, -22, 38], [34, -22, 38]].forEach(([dx, dy, rr]) => { g.beginPath(); g.arc(x + dx, y + dy, rr, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x - 14, y - 66, 24, 0, 7); g.fill();
    });
    const cols = ['#ff5a8a', '#ffd23f', '#ffffff', '#b46bff'];
    for (let i = 0; i < 50; i++) { g.fillStyle = cols[i % 4]; g.beginPath(); g.arc(r() * 800, 650 + r() * 140, 4 + r() * 4, 0, 7); g.fill(); }
    for (let i = 0; i < 4; i++) wdPzBird(g, 150 + r() * 500, 60 + r() * 150, 12 + r() * 8, '#5a7ab0');
  } },
  { name: '우주 성운', draw(g, r) {
    g.fillStyle = '#04020e'; g.fillRect(0, 0, 800, 800);
    [['rgba(140,60,220,', '.55'], ['rgba(240,80,160,', '.45'], ['rgba(40,170,220,', '.4'], ['rgba(90,60,200,', '.5'], ['rgba(255,140,80,', '.3']].forEach(([c, a]) => {
      wdPzGlow(g, r() * 800, r() * 800, 200 + r() * 200, c + a + ')', c + '0)');
    });
    wdPzStars(g, r, 320, 800);
    const px = 560, py = 330, pr = 120, ring = (a0, a1) => {
      g.save(); g.translate(px, py); g.rotate(-.4);
      for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(255,${220 - k * 18},170,${.8 - k * .12})`; g.lineWidth = 8 - k; g.beginPath(); g.ellipse(0, 0, pr * (1.55 + k * .14), pr * (.38 + k * .04), 0, a0, a1); g.stroke(); }
      g.restore();
    };
    ring(Math.PI, Math.PI * 2);   // 뒤쪽 고리
    const pg = g.createRadialGradient(px - 40, py - 40, 10, px, py, pr);
    pg.addColorStop(0, '#ffd9a0'); pg.addColorStop(.55, '#e08a4a'); pg.addColorStop(1, '#5a2326');
    g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(px, py, pr, 0, 7); g.clip();
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(120,50,30,.16)'; g.fillRect(px - pr, py - 80 + k * 34, pr * 2, 13); }
    g.restore();
    ring(0, Math.PI);   // 앞쪽 고리
    const mg = g.createRadialGradient(175, 165, 4, 190, 180, 40); mg.addColorStop(0, '#e6f3ff'); mg.addColorStop(1, '#6d86b8');
    g.fillStyle = mg; g.beginPath(); g.arc(190, 180, 38, 0, 7); g.fill();
    g.fillStyle = 'rgba(70,90,140,.35)'; g.beginPath(); g.arc(200, 190, 10, 0, 7); g.fill(); g.beginPath(); g.arc(178, 172, 7, 0, 7); g.fill();
    const sg = g.createLinearGradient(110, 80, 330, 170); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(255,255,255,.95)');
    g.strokeStyle = sg; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(110, 80); g.lineTo(330, 170); g.stroke();   // 별똥별
    g.save(); g.translate(230, 590); g.rotate(.62);   // 로켓
    wdPzGlow(g, 0, 100, 70, 'rgba(255,190,80,.8)', 'rgba(255,120,40,0)');
    g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(-18, 70); g.quadraticCurveTo(0, 160, 18, 70); g.fill();
    g.fillStyle = '#fff2a0'; g.beginPath(); g.moveTo(-9, 70); g.quadraticCurveTo(0, 120, 9, 70); g.fill();
    g.fillStyle = '#e8445a'; g.beginPath(); g.moveTo(-28, 30); g.lineTo(-64, 84); g.lineTo(-28, 70); g.fill(); g.beginPath(); g.moveTo(28, 30); g.lineTo(64, 84); g.lineTo(28, 70); g.fill();
    g.fillStyle = '#f4f6ff'; g.beginPath(); g.moveTo(0, -92); g.bezierCurveTo(48, -42, 48, 40, 28, 72); g.lineTo(-28, 72); g.bezierCurveTo(-48, 40, -48, -42, 0, -92); g.fill();
    g.fillStyle = '#e8445a'; g.beginPath(); g.moveTo(0, -92); g.bezierCurveTo(26, -66, 34, -50, 38, -38); g.lineTo(-38, -38); g.bezierCurveTo(-34, -50, -26, -66, 0, -92); g.fill();
    g.fillStyle = '#4aa8ff'; g.beginPath(); g.arc(0, 0, 19, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke();
    g.restore();
  } },
  { name: '꽃 피는 언덕', draw(g, r) {
    wdPzSky(g, [[0, '#ffc6d9'], [.5, '#ffe2c4'], [1, '#fff7dc']]);
    g.save(); g.translate(640, 150);   // 햇살
    for (let k = 0; k < 14; k++) { g.rotate(Math.PI / 7); g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-40, 900); g.lineTo(40, 900); g.closePath(); g.fill(); }
    g.restore();
    wdPzGlow(g, 640, 150, 170, 'rgba(255,250,200,1)', 'rgba(255,240,170,0)');
    g.fillStyle = '#fff6bf'; g.beginPath(); g.arc(640, 150, 58, 0, 7); g.fill();
    wdPzCloud(g, 160, 130, 46, .92); wdPzCloud(g, 420, 80, 38, .85); wdPzCloud(g, 330, 250, 32, .7);
    wdPzRidge(g, r, 470, 30, '#c9e88a', 7); wdPzRidge(g, r, 540, 30, '#a6da72', 8); wdPzRidge(g, r, 620, 28, '#7fc95e', 8); wdPzRidge(g, r, 700, 24, '#5db04f', 7);
    const tree = (x, y, s) => {
      g.fillStyle = '#8a5a3a'; g.fillRect(x - 11 * s, y - 20 * s, 22 * s, 110 * s);
      [['#3f9e4a', 0, -70, 70], ['#4fb15a', -52, -34, 52], ['#4fb15a', 52, -34, 52], ['#63c36b', -20, -92, 40]].forEach(([c, dx, dy, rr]) => { g.fillStyle = c; g.beginPath(); g.arc(x + dx * s, y + dy * s, rr * s, 0, 7); g.fill(); });
    };
    tree(150, 560, 1.1); tree(690, 580, .7);
    const cols = ['#ff5a8a', '#ffd23f', '#ffffff', '#b46bff', '#ff8a3d'];
    const fl = [];
    for (let i = 0; i < 150; i++) fl.push([r() * 800, 600 + r() * 195, cols[i % 5]]);
    fl.sort((a, b) => a[1] - b[1]).forEach(([x, y, c]) => {   // 아래쪽 꽃이 더 크고 앞에 보인다
      const s = 7 + (y - 600) / 195 * 14;
      g.strokeStyle = '#3f8f3f'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + s * 2.2); g.stroke();
      g.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; g.beginPath(); g.arc(x + Math.cos(a) * s * .8, y + Math.sin(a) * s * .8, s * .55, 0, 7); g.fill(); }
      g.fillStyle = '#ffeb7a'; g.beginPath(); g.arc(x, y, s * .4, 0, 7); g.fill();
    });
    [[300, 400, '#ff7aa8'], [480, 330, '#7ab8ff'], [220, 470, '#ffc24a'], [560, 450, '#b87aff']].forEach(([x, y, c]) => {   // 나비
      g.fillStyle = c; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.ellipse(x + sx * 14, y + sy * 9, 14, 9, sx * sy * .5, 0, 7); g.fill(); });
      g.fillStyle = '#4a3a5a'; g.fillRect(x - 2, y - 12, 4, 24);
    });
  } },
  { name: '도시의 밤', draw(g, r) {
    wdPzSky(g, [[0, '#0a0d2e'], [.45, '#2e2a6e'], [.72, '#c0507a'], [.9, '#ff9a7a']]);
    wdPzStars(g, r, 130, 330);
    wdPzMoon(g, 180, 150, 40, 'rgba(255,250,215,.6)');
    const layer = (base, minH, maxH, minW, maxW, color, lit) => {
      let x = -10;
      while (x < 810) {
        const w = minW + r() * (maxW - minW), h = minH + r() * (maxH - minH);
        g.fillStyle = color; g.fillRect(x, base - h, w, h + 200);
        if (lit) for (let wy = base - h + 12; wy < base - 8; wy += 18) for (let wx = x + 8; wx < x + w - 10; wx += 16) {
          if (r() < .42) { g.fillStyle = r() < .8 ? '#ffd86b' : '#9fe4ff'; g.fillRect(wx, wy, 7, 9); }
        }
        x += w + r() * 6;
      }
    };
    layer(610, 120, 330, 50, 95, '#2a2358', false);
    g.fillStyle = '#18153e'; g.fillRect(398, 250, 6, 200); g.beginPath(); g.moveTo(388, 330); g.lineTo(401, 250); g.lineTo(414, 330); g.fill();   // 탑
    g.fillStyle = '#ff4a5a'; g.beginPath(); g.arc(401, 244, 5, 0, 7); g.fill();
    layer(655, 90, 260, 60, 110, '#15123a', true);
    const rv = g.createLinearGradient(0, 655, 0, 800); rv.addColorStop(0, '#2e2358'); rv.addColorStop(1, '#0a0820');
    g.fillStyle = rv; g.fillRect(0, 655, 800, 145);
    for (let i = 0; i < 70; i++) { g.fillStyle = r() < .8 ? `rgba(255,216,107,${.12 + r() * .2})` : `rgba(159,228,255,${.12 + r() * .2})`; g.fillRect(r() * 800, 662 + r() * 20, 3 + r() * 2, 20 + r() * 80); }
    for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 800; x += 10) { const y = 680 + k * 22 + Math.sin(x / 30 + k) * 2.5; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  } }
];

const wdPzCache = {};
function wdPzPicture(n) {
  if (wdPzCache[n]) return wdPzCache[n];
  if (n >= 1000) return '';   // 사진 퍼즐은 photos.js 가 불러온 뒤에 있다
  const c = document.createElement('canvas'); c.width = c.height = 800;
  const g = c.getContext('2d');
  WD_THEMES[n % WD_THEMES.length].draw(g, wdPzRng(n * 7919 + 101));
  return (wdPzCache[n] = c.toDataURL('image/jpeg', .92));
}
