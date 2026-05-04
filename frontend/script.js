const API_SINGLE = '/verify';
const API_BULK   = '/verify-bulk';

// DOM refs
const uploadArea   = document.getElementById('upload-area');
const fileInput    = document.getElementById('file-input');
const uploadLabel  = document.getElementById('upload-label');
const uploadSub    = document.getElementById('upload-sub');
const previewImg   = document.getElementById('preview-img');
const verifyBtn    = document.getElementById('verify-btn');
const btnLabel     = document.getElementById('btn-label');
const loader       = document.getElementById('loader');
const loaderText   = document.getElementById('loader-text');
const errorMsg     = document.getElementById('error-msg');
const resultEl     = document.getElementById('result');
const verdictBanner = document.getElementById('verdict-banner');
const verdictIcon  = document.getElementById('verdict-icon');
const verdictText  = document.getElementById('verdict-text');
const fieldsEl     = document.getElementById('fields');
const resultNote   = document.getElementById('result-note');
const bulkList     = document.getElementById('bulk-list');
const bulkResult   = document.getElementById('bulk-result');

let selectedFiles = [];
let currentTab = 'single';

function show(el)  { el.classList.add('visible'); }
function hide(el)  { el.classList.remove('visible'); }

// ── Tab switching ──────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-single').classList.toggle('active', tab === 'single');
  document.getElementById('tab-bulk').classList.toggle('active',   tab === 'bulk');
  fileInput.multiple = (tab === 'bulk');
  resetUI();
  if (tab === 'single') {
    uploadLabel.textContent = 'Drop your certificate here';
    uploadSub.innerHTML = 'or <span class="upload-link">click to browse</span> · PNG, JPG, PDF';
    btnLabel.textContent = 'Verify Certificate';
  } else {
    uploadLabel.textContent = 'Drop multiple certificates here';
    uploadSub.innerHTML = 'or <span class="upload-link">click to browse</span> · PNG, JPG, PDF';
    btnLabel.textContent = 'Verify All & Download Excel';
  }
}

// ── Reset ─────────────────────────────────────────────────────
function resetUI() {
  selectedFiles = [];
  fileInput.value = '';
  uploadArea.classList.remove('has-preview');
  previewImg.classList.remove('visible');
  previewImg.src = '';
  hide(bulkList);
  hide(loader);
  hide(errorMsg);
  hide(resultEl);
  hide(bulkResult);
  verifyBtn.disabled = true;
  fieldsEl.innerHTML = '';
  bulkList.innerHTML = '';
  errorMsg.textContent = '';
  resultNote.textContent = '';
  hide(resultNote);
}

// ── Apply files ───────────────────────────────────────────────
function applyFiles(files) {
  selectedFiles = Array.from(files);
  bulkList.innerHTML = '';

  if (selectedFiles.length === 1 && selectedFiles[0].type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      show(previewImg);
      uploadArea.classList.add('has-preview');
    };
    reader.readAsDataURL(selectedFiles[0]);
  } else {
    uploadArea.classList.remove('has-preview');
    previewImg.classList.remove('visible');
  }

  // File count
  const count = document.createElement('p');
  count.className = 'file-count';
  count.textContent = `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`;
  bulkList.appendChild(count);

  // File items
  selectedFiles.forEach((file, idx) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML =
      '<div class="file-dot"></div>' +
      `<span class="file-name">${file.name}</span>` +
      `<span class="file-remove" data-idx="${idx}" title="Remove">✕</span>`;
    bulkList.appendChild(item);
  });

  bulkList.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      selectedFiles.splice(idx, 1);
      selectedFiles.length === 0 ? resetUI() : applyFiles(selectedFiles);
    });
  });

  show(bulkList);
  hide(resultEl);
  hide(bulkResult);
  hide(errorMsg);
  verifyBtn.disabled = false;
}

// ── Error ─────────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  show(errorMsg);
  hide(loader);
}

// ── Render single result ──────────────────────────────────────
function renderResult(data) {
  hide(loader);
  show(resultEl);

  const verdict = data.verdict || '';
  const isVerified = verdict === 'Verified';
  const isManual   = verdict.startsWith('Manual');
  const isFraud    = !isVerified && !isManual;

  verdictBanner.className = 'verdict-banner ' + (isVerified ? 'verified' : isManual ? 'manual' : 'fraud');
  verdictIcon.textContent = isVerified ? '✅' : isManual ? '⚠️' : '❌';

  if (isVerified) {
    verdictText.textContent = 'Certificate is Authentic';
  } else if (isManual) {
    verdictText.textContent = verdict.replace('Manual Review - ', '');
  } else {
    verdictText.textContent = 'Certificate appears Fraudulent';
  }

  // Fields
  fieldsEl.innerHTML = '';
  [
    { key: 'name',   label: 'Name'   },
    { key: 'course', label: 'Course' },
    { key: 'date',   label: 'Date'   },
  ].forEach(({ key, label }) => {
    const info = data[key];
    if (!info) return;
    const row = document.createElement('div');
    row.className = 'field-row';
    const ocr  = info.ocr  || '—';
    const qr   = info.qr   || '—';
    const ok   = info.match;
    row.innerHTML =
      `<span class="field-label">${label}</span>` +
      `<span class="field-ocr" title="${ocr}">${ocr}</span>` +
      `<span class="field-qr"  title="${qr}">${qr}</span>` +
      `<span class="match-icon ${ok ? 'ok' : 'fail'}">${ok ? '✓' : '✗'}</span>`;
    fieldsEl.appendChild(row);
  });

  // Contextual note
  resultNote.textContent = '';
  if (isVerified) {
    resultNote.textContent = 'All fields — name, course, and date — matched between the certificate text and its embedded QR code.';
    show(resultNote);
  } else if (verdict.includes('QR Unreadable')) {
    resultNote.textContent = 'The QR code on this certificate could not be scanned. This may be due to image quality. Please verify manually.';
    show(resultNote);
  } else if (isFraud) {
    resultNote.textContent = 'One or more fields did not match the QR code data. The certificate may have been altered.';
    show(resultNote);
  }
}

// ── File input ────────────────────────────────────────────────
fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files.length > 0) applyFiles(fileInput.files);
});

// ── Drag & drop ───────────────────────────────────────────────
uploadArea.addEventListener('dragenter', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', e => { if (!uploadArea.contains(e.relatedTarget)) uploadArea.classList.remove('drag-over'); });
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) applyFiles(e.dataTransfer.files);
});

// ── Verify click ──────────────────────────────────────────────
verifyBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return;

  hide(errorMsg);
  hide(resultEl);
  hide(bulkResult);
  show(loader);
  verifyBtn.disabled = true;

  const formData = new FormData();

  if (currentTab === 'single' || selectedFiles.length === 1) {
    loaderText.textContent = 'Reading certificate…';
    formData.append('certificate', selectedFiles[0]);

    try {
      const res = await fetch(API_SINGLE, { method: 'POST', body: formData });
      const data = await res.json();
      renderResult(data);
    } catch {
      showError('Could not connect to the server. Make sure the app is running.');
    } finally {
      verifyBtn.disabled = false;
      hide(loader);
    }

  } else {
    loaderText.textContent = `Processing ${selectedFiles.length} certificates…`;
    selectedFiles.forEach(f => formData.append('certificates', f));

    try {
      const res = await fetch(API_BULK, { method: 'POST', body: formData });
      if (!res.ok) { showError('Server error during bulk verification.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'verification_results.xlsx'; a.click();
      URL.revokeObjectURL(url);
      hide(loader);
      show(bulkResult);
    } catch {
      showError('Could not connect to the server.');
    } finally {
      verifyBtn.disabled = false;
      hide(loader);
    }
  }
});

// ── Keyboard ──────────────────────────────────────────────────
uploadArea.setAttribute('tabindex', '0');
uploadArea.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

// Init
switchTab('single');