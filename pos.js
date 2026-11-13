// 품사: n 명사, v 동사, a 형용사, d 부사, p 전치사, i 숙어
// 기본은 뜻의 끝말로 맞추고(…다=동사, …한/운/은/는/인/의=형용사, 나머지=명사), 예외는 아래에 적는다.
// (새 단어 파일은 세 번째 칸에 품사를 직접 적으므로 아래 예외 목록은 앞쪽 옛 파일용이에요)
const WD_POS_NAME = { n: '명사', v: '동사', a: '형용사', d: '부사', p: '전치사', c: '접속사', i: '숙어' };
const WD_POS_FIX = {};
function wdFix(pos, words) { words.split(/\s+/).forEach(w => { if (w) WD_POS_FIX[w] = pos; }); }

wdFix('d', 'tonight yesterday tomorrow probably immediately merely likewise nevertheless hence meanwhile instead seldom');
wdFix('p', 'during despite via');
// 뜻의 끝말로는 틀리게 나오는 것들
wdFix('a', 'expensive hungry angry funny excited surprised sick blind outstanding');
wdFix('n', 'ocean giant attention campaign cause engine justice lecture soldier adult democracy consensus factor individual merchant');

function wdPosOf(en, ko) {
  if (WD_POS_FIX[en]) return WD_POS_FIX[en];
  const last = ko.trim().slice(-1);
  if (last == '다') return 'v';
  if ('한운은는인의된찬빈쁜진린친른던'.includes(last)) return 'a';
  return 'n';
}
