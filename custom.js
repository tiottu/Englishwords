// 내 단어장: 아이(또는 부모님)가 직접 단어를 넣어서 같은 방식으로 외운다 (전역 이름은 wd 로 시작)
const WD_MINE_POS = [['n', '명사'], ['v', '동사'], ['a', '형용사'], ['d', '부사'], ['i', '숙어']];

function wdMine(msg) {
  const rows = wd.custom.map((c, i) =>
    `<div class="row"><span>${wdBadge({ pos: c.pos || 'n' })} <b>${wdEsc(c.en)}</b></span>
     <span>${wdEsc(c.ko)} <button class="del" onclick="wdMineDel(${i})">✕</button></span></div>`).join('');
  const opts = WD_MINE_POS.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">✏️ 내 단어장</h1>
    <div class="tag">${msg ? wdEsc(msg) : '배우는 단어를 넣으면 같은 방식으로 외울 수 있어요'}</div>
    <input id="mEn" class="inp" placeholder="영어 (예: umbrella)" autocapitalize="none" autocomplete="off">
    <input id="mKo" class="inp" placeholder="뜻 (예: 우산)" autocomplete="off">
    <select id="mPos" class="inp">${opts}</select>
    <input id="mEx" class="inp" placeholder="예문 (없어도 돼요)" autocapitalize="none" autocomplete="off">
    <button class="btn" onclick="wdMineAdd()">➕ 추가하기</button>
    ${wd.custom.length ? `<button class="btn pink" onclick="wdStart(4)">▶ 내 단어장으로 외우기 (${wd.custom.length}개)</button>` : ''}
    <div class="tag">넣은 단어 ${wd.custom.length}개</div>${rows}`;
}

function wdMineAdd() {
  const en = document.getElementById('mEn').value.trim().toLowerCase().replace(/\s+/g, ' ');
  const ko = document.getElementById('mKo').value.trim().replace(/\|/g, ' ');
  const pos = document.getElementById('mPos').value;
  const ex = document.getElementById('mEx').value.trim().replace(/[|`]/g, ' ');
  if (!/^[a-z][a-z -]*$/.test(en)) return wdMine('영어는 알파벳으로 써 주세요 (띄어쓰기는 괜찮아요)');
  if (!ko) return wdMine('뜻을 써 주세요');
  if (ko.length > 30) return wdMine('뜻이 너무 길어요. 짧게 써 주세요');
  if (WORDS.some(w => w.en == en)) return wdMine('이미 있는 단어예요: ' + en);
  const c = { en, ko, pos, ex: ex.slice(0, 120) };
  wd.custom.push(c);
  WORDS.push({ en, ko, lv: 4, pos });
  if (c.ex) WD_EXMAP[en] = c.ex;
  wdSave();
  wdMine('추가했어요: ' + en);
}

function wdMineDel(i) {
  const c = wd.custom[i];
  if (!c || !confirm(c.en + ' 단어를 지울까요?')) return;
  wd.custom.splice(i, 1);
  const k = WORDS.findIndex(w => w.en == c.en && w.lv == 4);
  if (k >= 0) WORDS.splice(k, 1);
  delete wd.box[c.en]; delete wd.due[c.en]; delete WD_EXMAP[c.en];
  wdSave();
  wdMine('지웠어요');
}
