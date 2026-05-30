const API_SINGLE = '/verify';
const API_BULK   = '/verify-bulk';

// Elements
const flipper         = document.getElementById('flipper');
const tabSingle       = document.getElementById('tab-single');
const tabBulk         = document.getElementById('tab-bulk');

// Single
const uploadSingle    = document.getElementById('upload-area-single');
const inputSingle     = document.getElementById('file-input-single');
const singleLabel     = document.getElementById('single-label');
const previewImg      = document.getElementById('preview-img');
const btnSingle       = document.getElementById('verify-btn-single');
const loaderSingle    = document.getElementById('loader-single');
const errorSingle     = document.getElementById('error-single');
const resultSingle    = document.getElementById('result-single');
const verdictBanner   = document.getElementById('verdict-banner');
const verdictText     = document.getElementById('verdict-text');
const verdictDot      = document.getElementById('verdict-dot');
const fieldsEl        = document.getElementById('fields');
const resultNote      = document.getElementById('result-note');

// Bulk
const uploadBulk      = document.getElementById('upload-area-bulk');
const inputBulk       = document.getElementById('file-input-bulk');
const bulkLabel       = document.getElementById('bulk-label');
const bulkFileList    = document.getElementById('bulk-file-list');
const btnBulk         = document.getElementById('verify-btn-bulk');
const loaderBulk      = document.getElementById('loader-bulk');
const loaderBulkText  = document.getElementById('loader-bulk-text');
const errorBulk       = document.getElementById('error-bulk');
const bulkDone        = document.getElementById('bulk-done');
const doneTitle       = document.getElementById('done-title');
const doneSub         = document.getElementById('done-sub');

let currentTab  = 'single';
let singleFile  = null;
let bulkFiles   = [];

// ── Helpers ───────────────────────────────────
const show = el => el.classList.add('visible');
const hide = el => el.classList.remove('visible');

// Keep the flipper height in sync so the card-back's absolute pos works
function syncHeight() {
  const active = currentTab === 'single'
    ? document.querySelector('.card-front')
    : document.querySelector('.card-back');
  flipper.style.height = active.offsetHeight + 'px';
}

// ── Tab switch ────────────────────────────────
function switchTab(tab) {
  if (tab === currentTab) return;
  currentTab = tab;
  tabSingle.classList.toggle('active', tab === 'single');
  tabBulk.classList.toggle('active', tab === 'bulk');
  flipper.classList.toggle('flipped', tab === 'bulk');
  // After transition sync height
  setTimeout(syncHeight, 520);
}

// Initial height sync
window.addEventListener('load', syncHeight);
window.addEventListener('resize', syncHeight);

// ── Single file ───────────────────────────────
function applySingleFile(file) {
  singleFile = file;
  singleLabel.textContent = file.name;
  hide(resultSingle);
  hide(errorSingle);
  hide(resultNote);

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      show(previewImg);
      uploadSingle.classList.add('has-preview');
    };
    reader.readAsDataURL(file);
  } else {
    previewImg.classList.remove('visible');
    uploadSingle.classList.remove('has-preview');
  }
  btnSingle.disabled = false;
  syncHeight();
}

inputSingle.addEventListener('change', () => {
  if (inputSingle.files[0]) applySingleFile(inputSingle.files[0]);
});

// Drag & drop single
['dragenter','dragover'].forEach(e => {
  uploadSingle.addEventListener(e, ev => { ev.preventDefault(); uploadSingle.classList.add('drag-over'); });
});
['dragleave','drop'].forEach(e => {
  uploadSingle.addEventListener(e, ev => {
    ev.preventDefault();
    uploadSingle.classList.remove('drag-over');
    if (e === 'drop' && ev.dataTransfer.files[0]) applySingleFile(ev.dataTransfer.files[0]);
  });
});

// ── Bulk files ────────────────────────────────
function applyBulkFiles(files) {
  bulkFiles = Array.from(files);
  hide(errorBulk);
  hide(bulkDone);
  renderBulkList();
  btnBulk.disabled = bulkFiles.length === 0;
  syncHeight();
}

function renderBulkList() {
  bulkFileList.innerHTML = '';
  if (bulkFiles.length === 0) { hide(bulkFileList); return; }

  const countEl = document.createElement('p');
  countEl.className = 'file-list-count';
  countEl.textContent = `${bulkFiles.length} file${bulkFiles.length !== 1 ? 's' : ''} selected`;
  bulkFileList.appendChild(countEl);

  bulkFiles.forEach((file, idx) => {
    const row = document.createElement('div');
    row.className = 'file-item';
    row.innerHTML =
      `<div class="file-dot"></div>` +
      `<span class="file-name" title="${file.name}">${file.name}</span>` +
      `<span class="file-remove" data-idx="${idx}">✕</span>`;
    bulkFileList.appendChild(row);
  });

  bulkFileList.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      bulkFiles.splice(+btn.dataset.idx, 1);
      renderBulkList();
      btnBulk.disabled = bulkFiles.length === 0;
      syncHeight();
    });
  });

  show(bulkFileList);
}

inputBulk.addEventListener('change', () => {
  if (inputBulk.files.length) applyBulkFiles(inputBulk.files);
});

['dragenter','dragover'].forEach(e => {
  uploadBulk.addEventListener(e, ev => { ev.preventDefault(); uploadBulk.classList.add('drag-over'); });
});
['dragleave','drop'].forEach(e => {
  uploadBulk.addEventListener(e, ev => {
    ev.preventDefault();
    uploadBulk.classList.remove('drag-over');
    if (e === 'drop' && ev.dataTransfer.files.length) applyBulkFiles(ev.dataTransfer.files);
  });
});

// ── Single verify ─────────────────────────────
btnSingle.addEventListener('click', async () => {
  if (!singleFile) return;
  hide(errorSingle); hide(resultSingle);
  show(loaderSingle);
  btnSingle.disabled = true;
  syncHeight();

  try {
    const fd = new FormData();
    fd.append('certificate', singleFile);
    const res  = await fetch(API_SINGLE, { method: 'POST', body: fd });
    const data = await res.json();
    renderResult(data);
  } catch {
    errorSingle.textContent = 'Connection failed. Is the server running?';
    show(errorSingle);
  } finally {
    hide(loaderSingle);
    btnSingle.disabled = false;
    syncHeight();
  }
});

// ── Bulk verify ───────────────────────────────
btnBulk.addEventListener('click', async () => {
  if (!bulkFiles.length) return;

  hide(errorBulk); hide(bulkDone);
  loaderBulkText.textContent = `Processing ${bulkFiles.length} file${bulkFiles.length > 1 ? 's' : ''}\u2026`;
  show(loaderBulk);
  btnBulk.disabled = true;
  syncHeight();

  try {
    const fd = new FormData();
    bulkFiles.forEach(f => fd.append('certificates', f));

    const res = await fetch(API_BULK, { method: 'POST', body: fd });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Server error' }));
      errorBulk.textContent = err.detail || 'Server error during bulk verification.';
      show(errorBulk);
      return;
    }

    // Trigger Excel download
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'verification_results.xlsx'; a.click();
    URL.revokeObjectURL(url);
    doneTitle.textContent = 'Verification complete';
    doneSub.textContent   = 'Excel report is downloading';
    show(bulkDone);

  } catch {
    errorBulk.textContent = 'Connection failed. Is the server running?';
    show(errorBulk);
  } finally {
    hide(loaderBulk);
    btnBulk.disabled = false;
    syncHeight();
  }
});

// ── Render single result ──────────────────────
function renderResult(data) {
  show(resultSingle);
  const verdict = data.verdict || '';
  const isVerified = verdict === 'Verified';
  const isManual   = verdict.startsWith('Manual');

  verdictBanner.className = 'verdict-row ' + (isVerified ? 'verified' : isManual ? 'manual' : 'fraud');

  if (isVerified) {
    verdictText.textContent = 'Certificate is Authentic';
  } else if (isManual) {
    verdictText.textContent = verdict.replace('Manual Review - ', '');
  } else {
    verdictText.textContent = 'Possible Fraud Detected';
  }

  fieldsEl.innerHTML = '';
  [
    { key: 'name',   label: 'Name'   },
    { key: 'course', label: 'Course' },
    { key: 'date',   label: 'Date'   },
  ].forEach(({ key, label }) => {
    const info = data[key]; if (!info) return;
    const row = document.createElement('div');
    row.className = 'match-row';
    row.innerHTML =
      `<span class="match-field">${label}</span>` +
      `<span class="match-ocr" title="${info.ocr||''}">${info.ocr||'—'}</span>` +
      `<span class="match-qr"  title="${info.qr||''}">${info.qr||'—'}</span>` +
      `<span class="${info.match ? 'match-ok' : 'match-fail'}">${info.match ? '✓' : '✗'}</span>`;
    fieldsEl.appendChild(row);
  });

  // Note
  if (isVerified) {
    resultNote.textContent = 'All fields matched between the printed certificate and QR code.';
    show(resultNote);
  } else if (verdict.includes('QR')) {
    resultNote.textContent = 'QR code could not be scanned. Please verify manually or use a higher quality scan.';
    show(resultNote);
  } else if (!isVerified && !isManual) {
    resultNote.textContent = 'One or more fields did not match the QR code. This certificate may have been tampered with.';
    show(resultNote);
  } else {
    hide(resultNote);
  }

  syncHeight();
}