'use strict';

const STORAGE_KEY = 'notice-generator-v1';
const initialState = {
  title: '接受幸福的时刻', subtitle: '', sender: '', sentAt: '',
  body: '您好，距离国庆节还有5天，马上就要国庆假期了，要一起快乐起来吗？',
  status: '您于2026-09-25 14:00接受了一张快乐邀请函',
  detailsTitle: '一些信息', breadcrumb: '我的待录取通知', pageTitle: '待录取通知详情',
  showBreadcrumb: false, width: '1200', scale: '2', fontSize: '22',
  rows: [
    ['我也', '不知道', '发生', '了什么'],
    ['但是听说', '这种图片配色', '就算', '不点开看'],
    ['也有人', '会点赞', '提前', '祝愿'],
    ['朋友圈', '的各位', '国庆节', '快乐！']
  ]
};
const copyInitial = () => JSON.parse(JSON.stringify(initialState));
let state = copyInitial();
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object') {
    for (const key of Object.keys(initialState)) {
      if (key !== 'rows' && typeof saved[key] === typeof initialState[key]) state[key] = saved[key];
    }
    if (Array.isArray(saved.rows) && saved.rows.every(row => Array.isArray(row) && row.length === 4 && row.every(cell => typeof cell === 'string'))) state.rows = saved.rows;
    if (!['960', '1200', '1440'].includes(state.width)) state.width = '1200';
    if (!['1', '2', '3'].includes(state.scale)) state.scale = '2';
    if (!Number.isFinite(Number(state.fontSize)) || Number(state.fontSize) < 16 || Number(state.fontSize) > 30) state.fontSize = '22';
  }
} catch { /* Storage can be unavailable when opening a local file. */ }

const $ = id => document.getElementById(id);
const form = $('editorForm');
let exporting = false;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $('saveStatus').textContent = '内容已自动保存在此浏览器';
  } catch {
    $('saveStatus').textContent = '当前浏览器无法保存，关闭前请导出图片';
  }
}

function fillForm() {
  for (const [key, value] of Object.entries(state)) {
    const input = form.elements.namedItem(key);
    if (!input) continue;
    if (input.type === 'checkbox') input.checked = value;
    else input.value = value;
  }
  renderRowEditor();
}

function renderRowEditor() {
  $('rowEditor').replaceChildren();
  state.rows.forEach((row, rowIndex) => {
    const block = document.createElement('div');
    block.className = 'row-edit';
    const header = document.createElement('div');
    header.className = 'row-edit-header';
    const label = document.createElement('span');
    label.textContent = `第 ${rowIndex + 1} 行`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-row';
    remove.textContent = '删除';
    remove.setAttribute('aria-label', `删除第 ${rowIndex + 1} 行`);
    remove.addEventListener('click', () => {
      state.rows.splice(rowIndex, 1);
      renderRowEditor();
      update();
    });
    header.append(label, remove);
    const fields = document.createElement('div');
    fields.className = 'row-edit-fields';
    row.forEach((value, cellIndex) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = value;
      input.placeholder = cellIndex % 2 === 0 ? '字段' : '内容';
      input.setAttribute('aria-label', `第 ${rowIndex + 1} 行${cellIndex < 2 ? '左' : '右'}侧${input.placeholder}`);
      input.addEventListener('input', () => {
        state.rows[rowIndex][cellIndex] = input.value;
        update();
      });
      fields.append(input);
    });
    block.append(header, fields);
    $('rowEditor').append(block);
  });
}

function render() {
  const bindings = { noticeTitle: 'title', noticeSubtitle: 'subtitle', sender: 'sender', sentAt: 'sentAt', body: 'body', status: 'status', detailsTitle: 'detailsTitle', breadcrumb: 'breadcrumb', pageTitle: 'pageTitle' };
  for (const [id, key] of Object.entries(bindings)) $(id).textContent = state[key];
  $('noticeSubtitle').hidden = !state.subtitle.trim();
  $('senderLine').hidden = !state.sender.trim() && !state.sentAt.trim();
  $('statusLine').hidden = !state.status.trim();
  $('noticeBreadcrumb').hidden = !state.showBreadcrumb;
  $('breadcrumbFields').hidden = !state.showBreadcrumb;
  $('detailsTitle').hidden = !state.detailsTitle.trim();
  $('detailsTable').hidden = !state.rows.length;
  $('notice').style.width = `${state.width}px`;
  $('notice').style.fontSize = `${state.fontSize}px`;
  $('fontSizeLabel').textContent = `${state.fontSize} px`;
  const body = $('tableBody');
  body.replaceChildren();
  for (const row of state.rows) {
    const tr = document.createElement('tr');
    const cells = !row[2].trim() && !row[3].trim() ? row.slice(0, 2) : row;
    cells.forEach((value, index) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (cells.length === 2 && index === 1) td.colSpan = 3;
      tr.append(td);
    });
    body.append(tr);
  }
  fitPreview();
}

function fitPreview() {
  const notice = $('notice');
  const stage = $('previewStage');
  const style = getComputedStyle(stage);
  const available = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const ratio = Math.min(1, Math.max(0, available) / Number(state.width));
  notice.style.transform = `scale(${ratio})`;
  $('previewFit').style.width = `${Number(state.width) * ratio}px`;
  $('previewFit').style.height = `${notice.offsetHeight * ratio}px`;
  $('dimensions').textContent = `导出尺寸 ${Number(state.width) * Number(state.scale)} × ${notice.offsetHeight * Number(state.scale)} px`;
}

function update() { render(); persist(); }

form.addEventListener('input', event => {
  const input = event.target;
  if (!Object.hasOwn(initialState, input.name)) return;
  state[input.name] = input.type === 'checkbox' ? input.checked : input.value;
  update();
});
$('addRow').addEventListener('click', () => {
  state.rows.push(['', '', '', '']);
  renderRowEditor();
  update();
  $('rowEditor').lastElementChild.querySelector('input').focus();
});
$('reset').addEventListener('click', () => $('resetDialog').showModal());
$('cancelReset').addEventListener('click', () => $('resetDialog').close());
$('confirmReset').addEventListener('click', () => {
  state = copyInitial();
  fillForm();
  update();
  $('resetDialog').close();
});

$('export').addEventListener('click', async () => {
  if (exporting) return;
  exporting = true;
  const button = $('export');
  button.disabled = true;
  button.textContent = '正在生成…';
  $('feedback').textContent = '';
  let captureHost;
  try {
    if (typeof html2canvas !== 'function') throw new Error('导出组件未加载，请检查 vendor 文件夹是否完整。');
    await document.fonts.ready;
    // Capture a fixed-width clone so responsive preview scaling never affects PNG size.
    const snapshot = JSON.parse(JSON.stringify(state));
    captureHost = document.createElement('div');
    captureHost.style.cssText = 'position:absolute;left:-20000px;top:0;pointer-events:none;';
    const clone = $('notice').cloneNode(true);
    clone.style.transform = 'none';
    captureHost.append(clone);
    document.body.append(captureHost);
    const canvas = await html2canvas(clone, {
      scale: Number(snapshot.scale), backgroundColor: '#ffffff', logging: false,
      width: Number(snapshot.width), height: clone.offsetHeight,
      windowWidth: Math.max(1600, Number(snapshot.width)), scrollX: 0, scrollY: 0
    });
    const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('图片过大，请减少行数或降低清晰度。')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = snapshot.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim().slice(0, 60) || '通知';
    link.download = `${filename}-${canvas.width}x${canvas.height}.png`;
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    $('feedback').textContent = `图片已生成（${canvas.width} × ${canvas.height} px），请查看浏览器下载。`;
  } catch (error) {
    $('feedback').textContent = `导出失败：${error.message || '请重试或降低清晰度。'}`;
  } finally {
    captureHost?.remove();
    exporting = false;
    button.disabled = false;
    button.textContent = '↓ 导出 PNG';
  }
});

fillForm();
render();
new ResizeObserver(fitPreview).observe($('previewStage'));
document.fonts.ready.then(fitPreview);
