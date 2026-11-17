// 가족 사진 퍼즐: photos/ 폴더의 조각 그림 p번호-칸.jpg (한 장을 2x2 로 나눈 4개)를 불러와 한 장으로 합친다.
// 사진 퍼즐의 번호는 1000부터 (풍경 퍼즐은 0, 1, 2 ...). 이름은 아래에서 바꿀 수 있다. (전역 이름은 wd 로 시작)
const WD_PHOTO_BASE = 1000;
const WD_PHOTOS = [
  { name: '은행나무 길' }, { name: '단풍 나들이' }, { name: '대학 캠퍼스' },
  { name: '낙엽 길 산책' }, { name: '서울 전망대' }, { name: '노을 가족사진' },
  { name: '해바라기 농장' }, { name: '한옥 마을 나들이' }, { name: '바다에서 물놀이' }, { name: '해변 불꽃놀이' },
  { name: '족욕 체험' }, { name: '현수교 가족 셀카' }, { name: '졸린 숙제 시간' }, { name: '골목길 친구들' },
  { name: '축구장 응원' }, { name: '야구장 나들이' }, { name: '바닷가 셀카' }
];
const wdPzIsPhoto = n => n >= WD_PHOTO_BASE;
const wdPzName = n => wdPzIsPhoto(n) ? WD_PHOTOS[n - WD_PHOTO_BASE].name : WD_THEMES[n % WD_THEMES.length].name;
const wdPzNo = n => wdPzIsPhoto(n) ? '' : ' #' + (n + 1);

// ids 중 아직 안 불러온 사진을 불러와서 합친 뒤 done() 을 부른다 (풍경 퍼즐은 바로 done)
function wdPzLoad(ids, done) {
  const todo = ids.filter(n => wdPzIsPhoto(n) && !wdPzCache[n]);
  if (!todo.length) return done();
  let left = todo.length, failed = false;
  todo.forEach(n => {
    const i = n - WD_PHOTO_BASE, c = document.createElement('canvas');
    c.width = c.height = 640;
    const g = c.getContext('2d');
    let got = 0;
    for (let t = 0; t < 4; t++) {
      const im = new Image();
      im.onload = () => {
        g.drawImage(im, (t % 2) * 320, Math.floor(t / 2) * 320);
        if (++got == 4) { wdPzCache[n] = c.toDataURL('image/jpeg', .92); if (--left == 0 && !failed) done(); }
      };
      im.onerror = () => { if (!failed) { failed = true; wdToast('사진을 불러오지 못했어요. 인터넷을 확인해 주세요'); wdHome(); } };
      im.src = 'photos/p' + i + '-' + t + '.jpg';
    }
  });
}

// 다음 퍼즐 번호: 가족 사진 퍼즐을 차례로 모두 보여 주고, 다 끝나면 풍경 퍼즐이 이어진다
function wdPzNextId(n) {
  const P = wdPz();
  if (!wdPzIsPhoto(n)) P.sceneN = n + 1;
  if (typeof P.sceneN != 'number') P.sceneN = 0;
  const k = P.photoNext || 0;
  if (k < WD_PHOTOS.length) { P.photoNext = k + 1; return WD_PHOTO_BASE + k; }
  return P.sceneN;
}
