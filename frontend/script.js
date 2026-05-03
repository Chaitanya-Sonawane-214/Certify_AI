const API_SINGLE = '/verify';
const API_BULK   = '/verify-bulk';

// DOM refs
const uploadArea  = document.getElementById('upload-area');
const fileInput   = document.getElementById('file-input');
const uploadIcon  = document.getElementById('upload-icon');
const uploadLabel = document.getElementById('upload-label');
const uploadSub   = document.getElementById('upload-sub');
const previewImg  = document.getElementById('preview-img');
const verifyBtn   = document.getElementById('verify-btn');
const loader      = document.getElementById('loader');
const loaderText  = document.getElementById('loader-text');
const errorMsg    = document.getElementById('error-msg');
const resultEl    = document.getElementById('result');
const verdictBadge = document.getElementById('verdict-badge');
const verdictIcon  = document.getElementById('verdict-icon');
const verdictText  = document.getElementById('verdict-text');
const fieldsEl    = document.getElementById('fields');
const bulkList    = document.getElementById('bulk-list');
const bulkResult  = document.getElementById('bulk-result');

let selectedFiles = [];

function toggle(el, show) {
  if (show) el.classList.add('visible');
  else el.classList.remove('visible');
}

// ── Reset UI ──────────────────────────────────────────────────
function resetUI() {
  selectedFiles = [];
  fileInput.value = '';

  uploadArea.classList.remove('has-preview');
  previewImg.classList.remove('visible');
  previewImg.src = '';
  uploadIcon.style.display  = '';
  uploadLabel.style.display = '';
  uploadSub.style.display   = '';

  toggle(bulkList,   false);
  toggle(loader,     false);
  toggle(errorMsg,   false);
  toggle(resultEl,   false);
  toggle(bulkResult, false);

  verifyBtn.disabled = true;
  fieldsEl.innerHTML = '';
  bulkList.innerHTML = '';
  verdictBadge.className  = 'verdict-badge';
  verdictIcon.textContent = '';
  verdictText.textContent = '';
  errorMsg.textContent    = '';
}

// ── Apply Files ───────────────────────────────────────────────
function applyFiles(files) {
  selectedFiles = Array.from(files);
  bulkList.innerHTML = '';

  // Show preview if single image
  if (selectedFiles.length === 1 && selectedFiles[0].type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.classList.add('visible');
      uploadArea.classList.add('has-preview');
      uploadIcon.style.display  = 'none';
      uploadLabel.style.display = 'none';
      uploadSub.style.display   = 'none';
    };
    reader.readAsDataURL(selectedFiles[0]);
  } else {
    uploadArea.classList.remove('has-preview');
    previewImg.classList.remove('visible');
    uploadIcon.style.display  = 'none';
    uploadLabel.style.display = 'none';
    uploadSub.style.display   = 'none';
  }

  // File count badge
  const countBadge = document.createElement('div');
  countBadge.className = 'bulk-count';
  countBadge.textContent = selectedFiles.length + ' file' + (selectedFiles.length > 1 ? 's' : '') + ' selected';
  bulkList.appendChild(countBadge);

  // File items
  selectedFiles.forEach(function(file, index) {
    const item = document.createElement('div');
    item.className = 'bulk-item';
    item.innerHTML =
      '<div class="file-dot"></div>' +
      '<span class="bulk-item-name">' + file.name + '</span>' +
      '<span class="bulk-item-remove" data-index="' + index + '">✕</span>';
    bulkList.appendChild(item);
  });

  // Remove individual file
  bulkList.querySelectorAll('.bulk-item-remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-index'));
      selectedFiles.splice(idx, 1);
      if (selectedFiles.length === 0) {
        resetUI();
        uploadLabel.textContent = 'Click or drag & drop to upload certificates';
        uploadSub.textContent   = 'PNG, JPG or PDF — single or multiple';
      } else {
        applyFiles(selectedFiles);
      }
    });
  });

  toggle(bulkList,   true);
  toggle(resultEl,   false);
  toggle(bulkResult, false);
  toggle(errorMsg,   false);
  verifyBtn.disabled = false;
  verifyBtn.textContent = selectedFiles.length > 1 ? 'Verify All & Download Excel' : 'Verify Certificate';
}

// ── Show Error ────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  toggle(errorMsg, true);
  toggle(loader,   false);
}

// ── Render Single Result ──────────────────────────────────────
function renderResult(data) {
  toggle(loader,   false);
  toggle(resultEl, true);

  const isVerified = data.verdict === 'Verified';
  verdictBadge.className  = 'verdict-badge ' + (isVerified ? 'verified' : 'fraud');
  verdictIcon.textContent = isVerified ? '✓' : '✗';
  verdictText.textContent = isVerified ? 'Certificate Verified' : 'Certificate Fraudulent';

  fieldsEl.innerHTML = '';
  const fieldDefs = [
    { key: 'name',   label: 'Name'   },
    { key: 'course', label: 'Course' },
    { key: 'date',   label: 'Date'   },
  ];

  fieldDefs.forEach(function(def) {
    const info = data[def.key];
    if (!info) return;
    const row = document.createElement('div');
    row.className = 'field-row';
    const ocrVal  = info.ocr   || '—';
    const qrVal   = info.qr    || '—';
    const matched = info.match;
    row.innerHTML =
      '<span class="field-label">'  + def.label + '</span>' +
      '<span class="field-ocr" title="' + ocrVal + '">' + ocrVal + '</span>' +
      '<span class="field-qr"  title="' + qrVal  + '">' + qrVal  + '</span>' +
      '<span class="match-icon ' + (matched ? 'ok' : 'fail') + '">' + (matched ? '✓' : '✗') + '</span>';
    fieldsEl.appendChild(row);
  });
}

// ── File Input ────────────────────────────────────────────────
fileInput.addEventListener('change', function() {
  if (fileInput.files && fileInput.files.length > 0) applyFiles(fileInput.files);
});

// ── Drag & Drop ───────────────────────────────────────────────
uploadArea.addEventListener('dragenter', function(e) { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragover',  function(e) { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', function(e) {
  if (!uploadArea.contains(e.relatedTarget)) uploadArea.classList.remove('drag-over');
});
uploadArea.addEventListener('drop', function(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) applyFiles(e.dataTransfer.files);
});

// ── Verify Button ─────────────────────────────────────────────
verifyBtn.addEventListener('click', async function() {
  if (selectedFiles.length === 0) return;

  toggle(errorMsg,   false);
  toggle(resultEl,   false);
  toggle(bulkResult, false);
  toggle(loader,     true);
  verifyBtn.disabled = true;

  const formData = new FormData();

  if (selectedFiles.length === 1) {
    // Single mode
    loaderText.textContent = 'Analyzing certificate...';
    formData.append('certificate', selectedFiles[0]);

    try {
      const response = await fetch(API_SINGLE, { method: 'POST', body: formData });

      if (!response.ok) {
        let errText = 'Server error (' + response.status + ')';
        try {
          const errJson = await response.json();
          if (errJson.detail) errText = errJson.detail;
          if (errJson.error)  errText = errJson.error;
        } catch (_) {}
        showError(errText);
        return;
      }

      const data = await response.json();
      renderResult(data);

    } catch (err) {
      showError('Could not connect to the server. Make sure backend is running.');
    } finally {
      verifyBtn.disabled = false;
      toggle(loader, false);
    }

  } else {
    // Bulk mode
    loaderText.textContent = 'Processing ' + selectedFiles.length + ' certificates...';
    selectedFiles.forEach(function(file) {
      formData.append('certificates', file);
    });

    try {
      const response = await fetch(API_BULK, { method: 'POST', body: formData });

      if (!response.ok) {
        showError('Server error (' + response.status + ')');
        return;
      }

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'verification_results.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

      toggle(loader,     false);
      toggle(bulkResult, true);

    } catch (err) {
      showError('Could not connect to the server. Make sure backend is running.');
    } finally {
      verifyBtn.disabled = false;
      toggle(loader, false);
    }
  }
});

// ── Keyboard accessibility ────────────────────────────────────
uploadArea.setAttribute('tabindex', '0');
uploadArea.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});