// 기록 백업과 복원: 외운 단어, 친구, 퍼즐, 스티커 같은 모든 기록을 글자(코드) 하나로 만들어 다른 앱·폰으로 옮긴다.
// (폰에서 앱을 지우면 기록도 같이 지워지므로, 앱을 새로 깔기 전에 쓴다.) 전역 이름은 wd 로 시작한다.
function wdB64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
async function wdPack() {   // 기록 -> 짧게 줄인 코드 (EW2: 압축, EW1: 압축 없이)
  const raw = new TextEncoder().encode(JSON.stringify(wd));
  try {
    if (window.CompressionStream) {
      const cs = new CompressionStream('gzip'), w = cs.writable.getWriter();
      w.write(raw); w.close();
      return 'EW2:' + wdB64(new Uint8Array(await new Response(cs.readable).arrayBuffer()));
    }
  } catch (e) {}
  return 'EW1:' + wdB64(raw);
}
async function wdUnpack(code) {
  code = code.replace(/\s+/g, '');
  const kind = code.slice(0, 4), u8 = Uint8Array.from(atob(code.slice(4)), c => c.charCodeAt(0));
  if (kind == 'EW2:') {
    const ds = new DecompressionStream('gzip'), w = ds.writable.getWriter();
    w.write(u8); w.close();
    return JSON.parse(await new Response(ds.readable).text());
  }
  if (kind == 'EW1:') return JSON.parse(new TextDecoder().decode(u8));
  throw new Error('코드 모양이 달라요');
}

function wdBackup(msg) {
  $app.innerHTML = `<div class="top"><button class="x" onclick="wdHome()">← 뒤로</button></div>
    <h1 style="font-size:26px">💾 기록 백업</h1>
    <div class="tag">${msg ? wdEsc(msg) : '앱을 새로 깔 때 기록을 옮기는 곳이에요'}</div>
    <div class="row"><span>지금 기록</span><b>외운 단어 ${WORDS.filter(wdIsDone).length}개 · 친구 ${Object.keys(wd.got).length}명</b></div>
    <button class="btn" onclick="wdBackupCopy()">📋 1. 기록 코드 복사하기</button>
    <textarea id="bkOut" class="inp" rows="3" readonly placeholder="여기에 코드가 나와요" onclick="this.select()"></textarea>
    <div class="tag" style="font-size:14px;color:#8a6d3b">복사한 코드를 카카오톡 &quot;나에게 보내기&quot; 같은 곳에 붙여 두면 안전해요</div>
    <div class="tag">새 앱에서는 아래에 코드를 붙여 넣어요</div>
    <textarea id="bkIn" class="inp" rows="3" placeholder="여기에 코드를 붙여 넣으세요 (EW2: 로 시작)"></textarea>
    <button class="btn blue" onclick="wdBackupLoad()">📥 2. 기록 가져오기</button>`;
}
async function wdBackupCopy() {
  const code = await wdPack(), box = document.getElementById('bkOut');
  box.value = code; box.focus(); box.select();
  let ok = false;
  try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {}
  if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} }
  wdToast(ok ? '복사했어요! (' + Math.round(code.length / 1024) + 'KB) 새 앱에 붙여 넣으세요' : '위 글자를 길게 눌러 직접 복사해 주세요');
}
async function wdBackupLoad() {
  const code = document.getElementById('bkIn').value.trim();
  if (!code) return wdToast('코드를 붙여 넣어 주세요');
  let data;
  try { data = await wdUnpack(code); if (!data || !data.box) throw new Error('x'); }
  catch (e) { return wdToast('코드를 읽을 수 없어요. 처음부터 끝까지 다 복사했는지 확인해 주세요'); }
  const n = Object.keys(data.box).length;
  if (!confirm('지금 기록을 지우고, 코드의 기록(단어 ' + n + '개 본 기록)으로 바꿀까요?')) return;
  try { localStorage.setItem(WD_KEY, JSON.stringify(data)); } catch (e) { return wdToast('저장에 실패했어요'); }
  location.reload();
}
