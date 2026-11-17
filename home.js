// 첫 화면, 짝꿍(키우기), 스티커북, 성적표 (전역 이름은 wd 로 시작)

// 짝꿍: 얻은 친구 중 하나를 골라 같이 자란다. 단어를 10개 외울 때마다 한 단계 크고, 오래 안 오면 보고 싶어 한다.
function wdPet() {
  const M = WORDS.filter(wdIsDone).length, lv = 1 + Math.floor(M / 10);
  const keys = Object.keys(wd.got), key = wd.petKey && wd.got[wd.petKey] ? wd.petKey : keys[0];
  let f = null;
  if (key) { const [l, i] = key.split(':').map(Number); f = wdFriend(l, i); }
  const e = f ? f.e : (M >= 5 ? '🐣' : '🥚'), name = f ? f.name : (M >= 5 ? '아기 병아리' : '알');
  const last = wd.days.length ? wd.days[wd.days.length - 1] : null;
  const gap = last ? Math.round((new Date(wdToday()) - new Date(last)) / 86400000) : 99;
  const pick = a => a[Number(wdToday().replace(/-/g, '')) % a.length];
  let face, msg;
  if (!last) { face = '😊'; msg = '처음 만나서 반가워! 같이 단어를 외워 보자!'; }
  else if (gap == 0) { face = '😄'; msg = pick(['오늘도 같이 공부해서 신나!', '우와, 벌써 했네! 최고야!', '너랑 있으면 힘이 나!']); }
  else if (gap == 1) { face = '🙂'; msg = pick(['오늘도 같이 공부하자!', '어서 와! 기다렸어!']); }
  else if (gap <= 3) { face = '😟'; msg = '어디 있었어? 보고 싶었어…'; }
  else { face = '😢'; msg = '너무 오래 기다렸어. 같이 하자!'; }
  return { e, name, lv, face, msg, px: Math.min(104, 56 + lv * 3), next: 10 - M % 10, hasFriends: keys.length > 0 };
}
function wdPetPick() {
  const keys = Object.keys(wd.got);
  const cells = keys.map(k => {
    const [l, i] = k.split(':').map(Number), f = wdFriend(l, i);
    return `<div class="card" onclick="wd.petKey='${k}';wdSave();wdHome()">${wdFriendHtml(f)}<small>${f.name}</small></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">내 짝꿍 고르기</h1>
    <div class="tag">${keys.length ? '같이 자랄 친구를 골라요' : '친구를 얻으면 짝꿍으로 고를 수 있어요. 단어 20개를 외우면 첫 친구가 나타나요!'}</div>
    <div class="dex">${cells}</div>`;
}

// 첫 화면
function wdHome() {
  const friends = Object.keys(wd.got).length;
  const dueAll = WD_LEVELS.reduce((s, _, i) => s + wdDueCount(i), 0);
  const lv = WD_LEVELS.map((L, i) => {
    const total = wdPool(i).length, n = wdPool(i).filter(wdIsDone).length, d = wdDueCount(i);
    const go = L.custom && !total ? 'wdMine()' : `wdStart(${i})`;
    return `<button class="btn lvbtn ${L.c}" onclick="${go}"><span>${L.e} ${L.n}</span><small>${d ? '📅' + d + ' · ' : ''}${n}/${total}</small></button>`;
  }).join('');
  const P = wdPet(), wk = wdWeekSum(0), goal = Math.min(100, Math.round(wk.n / WD_WEEK_GOAL * 100));
  const done = wdDailyDone();
  $app.innerHTML = `<h1 style="font-size:27px">주하지수의 영어단어 정복</h1>
    <div class="pet" onclick="wdPetPick()">
      <div class="petE" style="font-size:${P.px}px">${P.e}<span class="petMood">${P.face}</span></div>
      <div class="bubble">${P.msg}</div>
      <small>${P.name} · Lv.${P.lv} · 다음 레벨까지 ${P.next}개</small></div>
    <div class="stats"><span>🧸 친구 ${friends}명</span><span>⭐ ${wd.stars}</span><span>🔥 ${wdStreak()}일</span></div>
    <button class="btn dailybtn ${done ? 'off' : ''}" onclick="wdStartDaily()">🎯 오늘의 도전 · 5문제 ${done ? '✅ 완료' : '→ 조각 보너스'}</button>
    ${wdGiftReady() ? '<button class="btn giftbtn" onclick="wdGiftOpen()">🎁 오늘의 상자 열기</button>' : ''}
    <div class="weekbar" onclick="wdReport()"><span>이번 주 목표: 새 단어 만나기 ${wk.n}/${WD_WEEK_GOAL}개</span><div class="bar"><i style="width:${goal}%"></i></div></div>
    <div class="tag">${dueAll ? '새 단어와 옛 단어 ' + dueAll + '개가 섞여서 나와요' : '어디서 시작할까요?'}</div>${lv}
    <button class="btn pzbtn" onclick="wdPuzzle()">${wdPzHomeLabel()}</button>
    <div class="grid2">
      <button class="btn small" style="background:#b08850;box-shadow:0 5px 0 #7d5e30" onclick="wdDex(0)">📖 내 친구들</button>
      <button class="btn small" style="background:#e0a030;box-shadow:0 5px 0 #a8731a" onclick="wdStickerBook()">🏷️ 스티커북</button>
      <button class="btn small" style="background:#3a8fd8;box-shadow:0 5px 0 #2468a3" onclick="wdReport()">📊 성적표</button>
      <button class="btn small" style="background:#e0709a;box-shadow:0 5px 0 #a8426b" onclick="wdMine()">✏️ 내 단어장 관리</button>
      <button class="btn small" style="background:#9a9a9a;box-shadow:0 5px 0 #6f6f6f" onclick="wdSoundTest()">🔧 소리 점검</button>
      <button class="btn small" style="background:#6b7fd8;box-shadow:0 5px 0 #4658a8" onclick="wdBackup()">💾 기록 백업</button>
      ${WD_IN_APP ? '' : `<a class="btn small" style="background:#3fa34d;box-shadow:0 5px 0 #2a7a36;text-align:center;text-decoration:none" href="${WD_APK}">📱 앱으로 받기</a>`}
    </div>`;
}

// 스티커북
function wdStickerBook() {
  const got = WD_STICKERS.filter(e => wd.stickers[e]).length;
  const cells = WD_STICKERS.map(e => wd.stickers[e]
    ? `<div class="card">${e}<small>${wd.stickers[e] > 1 ? '×' + wd.stickers[e] : '&nbsp;'}</small></div>`
    : `<div class="card lock">❓<small>&nbsp;</small></div>`).join('');
  const badges = Object.keys(WD_STREAK_REWARD).map(m => `<span class="badge ${wd.streakGot[m] ? 'on' : ''}">🔥${m}일</span>`).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">🏷️ 스티커북 ${got}/${WD_STICKERS.length}</h1>
    <div class="tag">매일 오늘의 상자에서 스티커를 모아요</div><div class="dex">${cells}</div>
    <div class="tag">연속 출석 뱃지</div><div class="badges">${badges}</div>`;
}

// 성적표: 오늘 한 것, 이번 주 공부한 날과 새로 만난/외운 단어, 정답률
function wdReport() {
  const w = wdWeekSum(0), p = wdWeekSum(-1), today = wdToday(), td = wd.stat[today] || { r: 0, ok: 0, no: 0, m: 0, n: 0 };
  const acc = (ok, no) => ok + no ? Math.round(ok / (ok + no) * 100) : 0;
  const dots = wdWeekDays(0).map((d, i) => {
    const t = wd.stat[d], on = t && (t.r > 0 || t.ok + t.no > 0);
    return `<div class="wk ${d == today ? 'today' : ''}"><b>${'월화수목금토일'[i]}</b><span>${on ? '✅' : d > today ? '·' : '⬜'}</span></div>`;
  }).join('');
  const goal = Math.min(100, Math.round(w.n / WD_WEEK_GOAL * 100));
  const diff = p.ok + p.no && w.ok + w.no ? acc(w.ok, w.no) - acc(p.ok, p.no) : null;
  const rows = WD_LEVELS.map((L, i) => {
    const pool = wdPool(i), seen = pool.filter(x => wdBox(x) !== undefined).length, done = pool.filter(wdIsDone).length;
    return `<div class="row"><span>${L.e} ${L.n}</span><span>만난 ${seen} · 외운 ${done} / ${pool.length}개</span></div>`;
  }).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">📊 성적표</h1>
    <div class="tag">오늘</div>
    <div class="row"><span>새로 만난 단어</span><b>${td.n || 0}개</b></div>
    <div class="row"><span>푼 문제</span><b>${td.ok + td.no}개 (정답률 ${td.ok + td.no ? acc(td.ok, td.no) + '%' : '-'})</b></div>
    <div class="tag">이번 주</div>
    <div class="wkrow">${dots}</div>
    <div class="row"><span>공부한 날</span><b>${w.played}일</b></div>
    <div class="row"><span>새로 만난 단어</span><b>${w.n}개 (목표 ${WD_WEEK_GOAL}개)</b></div>
    <div class="bar" style="flex:none"><i style="width:${goal}%"></i></div>
    <div class="row"><span>새로 외운 단어</span><b>${w.m}개</b></div>
    <div class="row"><span>푼 문제</span><b>${w.ok + w.no}개</b></div>
    <div class="row"><span>정답률</span><b>${w.ok + w.no ? acc(w.ok, w.no) + '%' : '-'}${diff === null ? '' : ` (지난주보다 ${diff >= 0 ? '+' : ''}${diff}%)`}</b></div>
    <div class="tag" style="font-size:14px;color:#8a6d3b">외웠다는 건 날짜 복습을 거쳐 5단계에 닿은 단어예요 (보통 3~4일 걸려요)</div>
    <div class="tag">지난주: 새 단어 ${p.n}개 만남 · ${p.m}개 외움 · 공부한 날 ${p.played}일</div>
    <div class="tag">지금까지</div>${rows}
    <div class="row"><span>🔥 연속 출석</span><b>${wdStreak()}일</b></div>
    <div class="row"><span>🧸 얻은 친구</span><b>${Object.keys(wd.got).length}명</b></div>
    <div class="row"><span>🏆 완성한 퍼즐</span><b>${wdPz().gallery.length}장</b></div>`;
}