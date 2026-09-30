/**
 * QR-Craft - Sistem QR-Code Generator Multifungsi & Interaktif
 * Professional Modern Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE & QR CODE INSTANCE INITIALIZATION
  // ==========================================
  const state = {
    activeType: 'link', // 'link' | 'file' | 'image' | 'text' | 'wifi' | 'vcard'
    currentData: 'https://qrcraft.app',
    resolution: 2000,
    colorType: 'single', // 'single' | 'gradient'
    fgColor1: '#000000',
    fgColor2: '#334155',
    gradientRotation: 45,
    bgColor: '#ffffff',
    bgTransparent: false,
    dotsType: 'rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    logoType: 'qrcraft', // 'none' | 'qrcraft' | 'drive' | 'pdf' | 'link' | 'whatsapp' | 'wifi' | 'custom'
    logoUrl: '/assets/qrcraft_logo.svg',
    logoSize: 0.35,
    logoMargin: 6,
    uploadedFileUrl: '',
    uploadedImageUrl: '',
  };

  // Check if QRCodeStyling is loaded
  const QRCodeClass = window.QRCodeStyling;
  if (!QRCodeClass) {
    console.error('QRCodeStyling library not loaded!');
    showToast('Gagal memuat engine QR. Silakan periksa koneksi.', 'danger');
    return;
  }

  // Create QRCodeStyling instance
  const qrCode = new QRCodeClass({
    width: 320,
    height: 320,
    type: 'canvas',
    data: state.currentData,
    image: state.logoUrl,
    dotsOptions: {
      type: state.dotsType,
      color: state.fgColor1,
    },
    cornersSquareOptions: {
      type: state.cornerSquareType,
      color: state.fgColor1,
    },
    cornersDotOptions: {
      type: state.cornerDotType,
      color: state.fgColor1,
    },
    backgroundOptions: {
      color: state.bgColor,
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: state.logoMargin,
      imageSize: state.logoSize,
      hideBackgroundDots: true,
    }
  });

  const qrCanvasContainer = document.getElementById('qrCanvasContainer');
  if (qrCanvasContainer) {
    qrCanvasContainer.innerHTML = '';
    qrCode.append(qrCanvasContainer);
  }

  // Function to re-render QR with current options
  function updateQRCode() {
    const dotsOptions = {
      type: state.dotsType,
    };

    if (state.colorType === 'gradient') {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: (state.gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: state.fgColor1 },
          { offset: 1, color: state.fgColor2 },
        ],
      };
      delete dotsOptions.color;
    } else {
      dotsOptions.color = state.fgColor1;
      delete dotsOptions.gradient;
    }

    const options = {
      data: state.currentData || 'https://qrcraft.app',
      dotsOptions: dotsOptions,
      cornersSquareOptions: {
        type: state.cornerSquareType,
        color: state.fgColor1,
      },
      cornersDotOptions: {
        type: state.cornerDotType,
        color: state.fgColor1,
      },
      backgroundOptions: {
        color: state.bgTransparent ? 'transparent' : state.bgColor,
      },
      image: state.logoType === 'none' ? '' : state.logoUrl,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: state.logoMargin,
        imageSize: state.logoSize,
        hideBackgroundDots: true,
      }
    };

    qrCode.update(options);
    updatePreviewInfoBadge();
  }

  // Update badge in preview box
  function updatePreviewInfoBadge() {
    const typeChip = document.getElementById('previewTypeChip');
    if (!typeChip) return;
    const names = {
      link: 'Link / URL',
      file: 'File / Dokumen',
      image: 'Galeri Gambar',
      text: 'Teks Catatan',
      wifi: 'Wi-Fi Network',
      vcard: 'Kontak Digital',
    };
    typeChip.textContent = `Tipe: ${names[state.activeType] || 'QR-Code'}`;
  }



  // ==========================================
  // 3. THEME TOGGLE (DARK / LIGHT MODE)
  // ==========================================
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIcon) themeIcon.className = 'bi bi-moon-fill';
      localStorage.setItem('theme', 'light');
    }
  }

  // Init theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(!isDark);
      showToast(!isDark ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan');
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn && topNav) {
    mobileMenuBtn.addEventListener('click', () => {
      topNav.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-list');
        icon.classList.toggle('bi-x-lg');
      }
    });
  }

  // ==========================================
  // 4. CONTENT TYPE SWITCHER (TABS)
  // ==========================================
  const typeTabBtns = document.querySelectorAll('.type-tab-btn');
  const formSections = document.querySelectorAll('.form-section');

  typeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      state.activeType = type;

      typeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      formSections.forEach(sec => {
        if (sec.id === `section-${type}`) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });

      calculateAndSetData();
    });
  });

  // Calculate QR Data based on currently active type
  function calculateAndSetData() {
    switch (state.activeType) {
      case 'link': {
        const input = document.getElementById('urlInput');
        let val = input ? input.value.trim() : '';
        if (val && !/^https?:\/\//i.test(val)) {
          val = 'https://' + val;
        }
        state.currentData = val || 'https://qrcraft.app';
        break;
      }
      case 'file': {
        state.currentData = state.uploadedFileUrl || 'https://qrcraft.app/f/demo';
        break;
      }
      case 'image': {
        state.currentData = state.uploadedImageUrl || 'https://qrcraft.app/img/demo';
        break;
      }
      case 'text': {
        const input = document.getElementById('textInput');
        state.currentData = input && input.value.trim() ? input.value.trim() : 'QR-Craft — Platform generator QR-Code modern dengan resolusi tinggi dan kustomisasi canggih.';
        break;
      }
      case 'wifi': {
        const ssid = (document.getElementById('wifiSsid')?.value || '').trim();
        const pass = document.getElementById('wifiPass')?.value || '';
        const enc = document.getElementById('wifiEnc')?.value || 'WPA';
        const hidden = document.getElementById('wifiHidden')?.checked;
        if (!ssid) {
          state.currentData = 'WIFI:S:WiFi-Zone-HighSpeed;T:WPA;P:qrcraftpass123;;';
        } else {
          state.currentData = `WIFI:S:${ssid};T:${enc};P:${pass};${hidden ? 'H:true;' : ''};`;
        }
        break;
      }
      case 'vcard': {
        const firstName = (document.getElementById('vcardFirst')?.value || '').trim();
        const lastName = (document.getElementById('vcardLast')?.value || '').trim();
        const phone = (document.getElementById('vcardPhone')?.value || '').trim();
        const wa = (document.getElementById('vcardWa')?.value || '').trim();
        const email = (document.getElementById('vcardEmail')?.value || '').trim();
        const org = (document.getElementById('vcardOrg')?.value || '').trim();
        const title = (document.getElementById('vcardTitle')?.value || '').trim();
        const note = (document.getElementById('vcardNote')?.value || '').trim();

        if (!firstName && !phone) {
          state.currentData = `BEGIN:VCARD\nVERSION:3.0\nFN:Alex Pratama\nORG:Digital Creative Studio\nTEL;TYPE=CELL:0812-3456-7890\nEMAIL:kontak@qrcraft.app\nEND:VCARD`;
        } else {
          let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
          vcard += `N:${lastName};${firstName};;;\n`;
          vcard += `FN:${firstName} ${lastName}\n`.trim() + '\n';
          if (org) vcard += `ORG:${org}\n`;
          if (title) vcard += `TITLE:${title}\n`;
          if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
          if (wa) vcard += `TEL;TYPE=WORK:${wa}\n`;
          if (email) vcard += `EMAIL:${email}\n`;
          if (note) vcard += `NOTE:${note}\n`;
          vcard += `END:VCARD`;
          state.currentData = vcard;
        }
        break;
      }
    }

    updateQRCode();
  }

  // ==========================================
  // 5. INPUT LISTENERS FOR INSTANT REACTION
  // ==========================================
  // URL Input
  const urlInput = document.getElementById('urlInput');
  const urlValidationBadge = document.getElementById('urlValidationBadge');
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (val) {
        if (urlValidationBadge) {
          urlValidationBadge.style.display = 'inline-flex';
          urlValidationBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> URL Aktif';
          urlValidationBadge.className = 'feat-chip text-success';
        }
      } else {
        if (urlValidationBadge) urlValidationBadge.style.display = 'none';
      }
      calculateAndSetData();
    });

    urlInput.addEventListener('blur', () => {
      let val = urlInput.value.trim();
      if (val && !/^https?:\/\//i.test(val)) {
        urlInput.value = 'https://' + val;
        calculateAndSetData();
      }
    });
  }

  // URL Shorten Button
  const btnShortenUrl = document.getElementById('btnShortenUrl');
  if (btnShortenUrl && urlInput) {
    btnShortenUrl.addEventListener('click', async () => {
      let val = urlInput.value.trim();
      if (!val) {
        showToast('Masukkan URL terlebih dahulu.', 'warning');
        return;
      }
      btnShortenUrl.disabled = true;
      btnShortenUrl.innerHTML = '<i class="bi bi-hourglass-split"></i> Memendekkan...';

      try {
        const res = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: val })
        });
        const json = await res.json();
        if (json.success) {
          urlInput.value = json.shortUrl;
          showToast(`URL dipendekkan: ${json.shortUrl}`, 'success');
          calculateAndSetData();
        } else {
          showToast(json.message || 'Gagal memperpendek URL', 'danger');
        }
      } catch (err) {
        showToast('Terjadi kesalahan koneksi server.', 'danger');
      } finally {
        btnShortenUrl.disabled = false;
        btnShortenUrl.innerHTML = '<i class="bi bi-scissors"></i> Buat Short URL';
      }
    });
  }

  // Custom Alias Toggle
  const toggleCustomAlias = document.getElementById('toggleCustomAlias');
  const aliasInputWrap = document.getElementById('aliasInputWrap');
  const customAliasInput = document.getElementById('customAliasInput');

  if (toggleCustomAlias && aliasInputWrap) {
    toggleCustomAlias.addEventListener('change', () => {
      aliasInputWrap.style.display = toggleCustomAlias.checked ? 'block' : 'none';
      if (toggleCustomAlias.checked && customAliasInput) {
        customAliasInput.focus();
      }
    });
  }

  // Primary Generate QR Button & Loading Modal
  const btnGenerateQr = document.getElementById('btnGenerateQr');
  const loadingModalOverlay = document.getElementById('loadingModalOverlay');
  const loadingRing = document.getElementById('loadingRing');
  const loadingSuccessIcon = document.getElementById('loadingSuccessIcon');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingDesc = document.getElementById('loadingDesc');
  const loadingStatusText = document.getElementById('loadingStatusText');

  function showLoadingModal(titleText = 'Men-generate QR-Code...') {
    if (!loadingModalOverlay) return;
    if (loadingRing) loadingRing.style.display = 'flex';
    if (loadingSuccessIcon) loadingSuccessIcon.style.display = 'none';
    if (loadingTitle) loadingTitle.textContent = titleText;
    if (loadingDesc) loadingDesc.textContent = 'Menerapkan konfigurasi visual & data tautan Anda...';
    if (loadingStatusText) loadingStatusText.textContent = 'Sedang Memproses...';
    loadingModalOverlay.classList.add('active');
  }

  function finishGeneration() {
    if (loadingRing) loadingRing.style.display = 'none';
    if (loadingSuccessIcon) loadingSuccessIcon.style.display = 'block';
    if (loadingTitle) loadingTitle.textContent = '✓ QR-Code Berhasil Dibuat!';
    if (loadingDesc) loadingDesc.textContent = 'Data Anda telah tersinkronisasi ke QR-Code.';
    if (loadingStatusText) loadingStatusText.textContent = 'Selesai!';

    updateQRCode();

    setTimeout(() => {
      if (loadingModalOverlay) loadingModalOverlay.classList.remove('active');

      // Auto-scroll to QR Preview Card (with header offset)
      const previewEl = document.querySelector('.preview-card') || document.getElementById('qrCanvasWrapper');
      if (previewEl) {
        const headerOffset = 100;
        const elementPosition = previewEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        previewEl.classList.remove('qr-highlight-pulse');
        void previewEl.offsetWidth; // trigger reflow
        previewEl.classList.add('qr-highlight-pulse');
      }
      showToast('QR-Code Anda siap! Silakan kustomisasi tampilan di bawah.', 'success');
    }, 450);
  }

  async function handleGenerateQr() {
    // If Link tab & custom alias is toggled, process custom alias shortening
    if (state.activeType === 'link' && toggleCustomAlias && toggleCustomAlias.checked) {
      let rawUrl = urlInput ? urlInput.value.trim() : '';
      const alias = customAliasInput ? customAliasInput.value.trim() : '';

      if (!rawUrl) {
        showToast('Masukkan alamat URL terlebih dahulu.', 'warning');
        return;
      }
      if (!alias) {
        showToast('Masukkan nama alias kustom Anda (misal: oprect-ormawa).', 'warning');
        return;
      }

      showLoadingModal('Membuat Tautan Kustom & Men-generate QR...');

      try {
        const res = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawUrl, customAlias: alias })
        });
        const json = await res.json();
        if (json.success) {
          if (urlInput) urlInput.value = json.shortUrl;
          state.currentData = json.shortUrl;
          finishGeneration();
        } else {
          if (loadingModalOverlay) loadingModalOverlay.classList.remove('active');
          showToast(json.message || 'Gagal membuat alias kustom', 'danger');
        }
      } catch (err) {
        if (loadingModalOverlay) loadingModalOverlay.classList.remove('active');
        showToast('Terjadi kesalahan jaringan ke server.', 'danger');
      }
      return;
    }

    // Normal generation (or when user manually edits urlInput directly)
    showLoadingModal('Men-generate QR-Code Anda...');
    calculateAndSetData();
    setTimeout(() => {
      finishGeneration();
    }, 550);
  }

  if (btnGenerateQr) {
    btnGenerateQr.addEventListener('click', handleGenerateQr);
  }

  // Text Input
  const textInput = document.getElementById('textInput');
  const textCharCount = document.getElementById('textCharCount');
  const textWordCount = document.getElementById('textWordCount');
  if (textInput) {
    textInput.addEventListener('input', () => {
      const len = textInput.value.length;
      const words = textInput.value.trim() ? textInput.value.trim().split(/\s+/).length : 0;
      if (textCharCount) textCharCount.textContent = `${len} karakter`;
      if (textWordCount) textWordCount.textContent = `${words} kata`;
      calculateAndSetData();
    });
  }

  // Wi-Fi Inputs
  ['wifiSsid', 'wifiPass', 'wifiEnc', 'wifiHidden'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateAndSetData);
      el.addEventListener('change', calculateAndSetData);
    }
  });

  // Toggle Wi-Fi Password Visibility
  const btnToggleWifiPass = document.getElementById('btnToggleWifiPass');
  const wifiPass = document.getElementById('wifiPass');
  if (btnToggleWifiPass && wifiPass) {
    btnToggleWifiPass.addEventListener('click', () => {
      const isPass = wifiPass.type === 'password';
      wifiPass.type = isPass ? 'text' : 'password';
      const icon = btnToggleWifiPass.querySelector('i');
      if (icon) {
        icon.className = isPass ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
      }
    });
  }

  // vCard Inputs
  ['vcardFirst', 'vcardLast', 'vcardPhone', 'vcardWa', 'vcardEmail', 'vcardOrg', 'vcardTitle', 'vcardNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateAndSetData);
  });

  // ==========================================
  // 6. FILE & DOCUMENT UPLOAD (DRAG & DROP)
  // ==========================================
  const fileDropzone = document.getElementById('fileDropzone');
  const fileInputEl = document.getElementById('fileInputEl');
  const fileProgressContainer = document.getElementById('fileProgressContainer');
  const fileProgressBar = document.getElementById('fileProgressBar');
  const fileProgressText = document.getElementById('fileProgressText');
  const fileResultChip = document.getElementById('fileResultChip');
  const fileResultName = document.getElementById('fileResultName');
  const fileResultSize = document.getElementById('fileResultSize');
  const btnRemoveFile = document.getElementById('btnRemoveFile');

  if (fileDropzone && fileInputEl) {
    fileDropzone.addEventListener('click', () => fileInputEl.click());

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('dragover');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        uploadFile(e.dataTransfer.files[0]);
      }
    });

    fileInputEl.addEventListener('change', () => {
      if (fileInputEl.files.length) {
        uploadFile(fileInputEl.files[0]);
      }
    });
  }

  function uploadFile(file) {
    if (file.size > 20 * 1024 * 1024) {
      showToast('Ukuran file melebihi batas maksimal 20MB!', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fileProgressContainer.style.display = 'block';
    fileProgressBar.style.width = '0%';
    fileProgressText.textContent = '0%';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-file', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        fileProgressBar.style.width = `${percent}%`;
        fileProgressText.textContent = `${percent}%`;
      }
    };

    xhr.onload = () => {
      fileProgressContainer.style.display = 'none';
      if (xhr.status === 200) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp.success) {
            state.uploadedFileUrl = resp.publicUrl;
            fileResultName.textContent = resp.originalName;
            fileResultSize.textContent = `${resp.formattedSize} • Siap diunduh publik`;
            fileResultChip.style.display = 'flex';
            showToast('File berhasil diunggah! QR-Code diperbarui.', 'success');
            calculateAndSetData();
          } else {
            showToast(resp.message || 'Gagal mengunggah file', 'danger');
          }
        } catch (err) {
          showToast('Respon server tidak valid.', 'danger');
        }
      } else {
        showToast('Gagal mengunggah file ke server.', 'danger');
      }
    };

    xhr.onerror = () => {
      fileProgressContainer.style.display = 'none';
      showToast('Terjadi kesalahan jaringan saat mengunggah.', 'danger');
    };

    xhr.send(formData);
  }

  if (btnRemoveFile) {
    btnRemoveFile.addEventListener('click', (e) => {
      e.stopPropagation();
      state.uploadedFileUrl = '';
      fileResultChip.style.display = 'none';
      if (fileInputEl) fileInputEl.value = '';
      calculateAndSetData();
      showToast('File dilepas.');
    });
  }

  // ==========================================
  // 7. IMAGE UPLOAD & GALLERY VIEWER
  // ==========================================
  const imageDropzone = document.getElementById('imageDropzone');
  const imageInputEl = document.getElementById('imageInputEl');
  const imageProgressContainer = document.getElementById('imageProgressContainer');
  const imageProgressBar = document.getElementById('imageProgressBar');
  const imageProgressText = document.getElementById('imageProgressText');
  const imageResultChip = document.getElementById('imageResultChip');
  const imageResultName = document.getElementById('imageResultName');
  const imagePreviewThumb = document.getElementById('imagePreviewThumb');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const btnRemoveImage = document.getElementById('btnRemoveImage');

  if (imageDropzone && imageInputEl) {
    imageDropzone.addEventListener('click', () => imageInputEl.click());

    imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageDropzone.classList.add('dragover');
    });

    imageDropzone.addEventListener('dragleave', () => {
      imageDropzone.classList.remove('dragover');
    });

    imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imageDropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        uploadImage(e.dataTransfer.files[0]);
      }
    });

    imageInputEl.addEventListener('change', () => {
      if (imageInputEl.files.length) {
        uploadImage(imageInputEl.files[0]);
      }
    });
  }

  function uploadImage(file) {
    if (file.size > 20 * 1024 * 1024) {
      showToast('Ukuran gambar melebihi batas maksimal 20MB!', 'danger');
      return;
    }

    // Instant local preview thumbnail
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imagePreviewImg) imagePreviewImg.src = e.target.result;
      if (imagePreviewThumb) imagePreviewThumb.style.display = 'block';
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    imageProgressContainer.style.display = 'block';
    imageProgressBar.style.width = '0%';
    imageProgressText.textContent = '0%';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-image', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        imageProgressBar.style.width = `${percent}%`;
        imageProgressText.textContent = `${percent}%`;
      }
    };

    xhr.onload = () => {
      imageProgressContainer.style.display = 'none';
      if (xhr.status === 200) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp.success) {
            state.uploadedImageUrl = resp.viewerUrl;
            imageResultName.textContent = resp.originalName;
            imageResultChip.style.display = 'flex';
            showToast('Gambar berhasil diunggah ke Galeri!', 'success');
            calculateAndSetData();
          } else {
            showToast(resp.message || 'Gagal mengunggah gambar', 'danger');
          }
        } catch (err) {
          showToast('Respon server gambar tidak valid.', 'danger');
        }
      } else {
        showToast('Gagal mengunggah gambar ke server.', 'danger');
      }
    };

    xhr.onerror = () => {
      imageProgressContainer.style.display = 'none';
      showToast('Terjadi kesalahan jaringan saat mengunggah gambar.', 'danger');
    };

    xhr.send(formData);
  }

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', (e) => {
      e.stopPropagation();
      state.uploadedImageUrl = '';
      imageResultChip.style.display = 'none';
      if (imagePreviewThumb) imagePreviewThumb.style.display = 'none';
      if (imageInputEl) imageInputEl.value = '';
      calculateAndSetData();
      showToast('Gambar dilepas.');
    });
  }

  // ==========================================
  // 8. ACCORDION EXPANSION / COLLAPSE
  // ==========================================
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('open');
    });
  });

  // ==========================================
  // 9. QR CUSTOMIZATION CONTROLS
  // ==========================================
  // Color Type Toggle (Solid vs Gradient)
  const colorTypeRadios = document.querySelectorAll('input[name="colorType"]');
  const gradientControls = document.getElementById('gradientControls');
  colorTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.colorType = radio.value;
      if (gradientControls) {
        gradientControls.style.display = state.colorType === 'gradient' ? 'block' : 'none';
      }
      updateQRCode();
    });
  });

  // Foreground Color 1
  const fgColor1Input = document.getElementById('fgColor1');
  const fgColor1Text = document.getElementById('fgColor1Text');
  if (fgColor1Input) {
    fgColor1Input.addEventListener('input', (e) => {
      state.fgColor1 = e.target.value;
      if (fgColor1Text) fgColor1Text.textContent = e.target.value;
      updateQRCode();
    });
  }

  // Foreground Color 2 (Gradient)
  const fgColor2Input = document.getElementById('fgColor2');
  const fgColor2Text = document.getElementById('fgColor2Text');
  if (fgColor2Input) {
    fgColor2Input.addEventListener('input', (e) => {
      state.fgColor2 = e.target.value;
      if (fgColor2Text) fgColor2Text.textContent = e.target.value;
      updateQRCode();
    });
  }

  // Gradient Direction Buttons
  document.querySelectorAll('.grad-dir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.grad-dir-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gradientRotation = parseInt(btn.dataset.deg, 10) || 45;
      updateQRCode();
    });
  });

  // Background Color
  const bgColorInput = document.getElementById('bgColor');
  const bgColorText = document.getElementById('bgColorText');
  const bgTransparentCheckbox = document.getElementById('bgTransparent');

  if (bgColorInput) {
    bgColorInput.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      if (bgColorText) bgColorText.textContent = e.target.value;
      if (bgTransparentCheckbox) bgTransparentCheckbox.checked = false;
      state.bgTransparent = false;
      updateQRCode();
    });
  }

  if (bgTransparentCheckbox) {
    bgTransparentCheckbox.addEventListener('change', (e) => {
      state.bgTransparent = e.target.checked;
      updateQRCode();
    });
  }

  // Dots Style Selection
  document.querySelectorAll('.dots-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dots-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.dotsType = btn.dataset.style;
      updateQRCode();
    });
  });

  // Corner Square Style
  document.querySelectorAll('.corner-square-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.corner-square-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.cornerSquareType = btn.dataset.style;
      updateQRCode();
    });
  });

  // Corner Dot Style
  document.querySelectorAll('.corner-dot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.corner-dot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.cornerDotType = btn.dataset.style;
      updateQRCode();
    });
  });

  // Center Logo Presets
  const logoPresetItems = document.querySelectorAll('.logo-preset-item');
  const customLogoWrap = document.getElementById('customLogoWrap');
  const customLogoInput = document.getElementById('customLogoInput');

  logoPresetItems.forEach(item => {
    item.addEventListener('click', () => {
      logoPresetItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const logoType = item.dataset.logo;
      state.logoType = logoType;

      if (logoType === 'custom') {
        if (customLogoWrap) customLogoWrap.style.display = 'block';
      } else {
        if (customLogoWrap) customLogoWrap.style.display = 'none';
        const urlMap = {
          none: '',
          qrcraft: '/assets/qrcraft_logo.svg',
          drive: '/assets/drive.svg',
          pdf: '/assets/pdf.svg',
          link: '/assets/link.svg',
          whatsapp: '/assets/whatsapp.svg',
          wifi: '/assets/wifi.svg',
        };
        state.logoUrl = urlMap[logoType] || '';
        updateQRCode();
      }
    });
  });

  if (customLogoInput) {
    customLogoInput.addEventListener('change', () => {
      if (customLogoInput.files && customLogoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          state.logoUrl = e.target.result;
          updateQRCode();
          showToast('Logo kustom berhasil diterapkan!', 'success');
        };
        reader.readAsDataURL(customLogoInput.files[0]);
      }
    });
  }

  // Logo Size & Margin Sliders
  const logoSizeSlider = document.getElementById('logoSizeSlider');
  const logoMarginSlider = document.getElementById('logoMarginSlider');

  if (logoSizeSlider) {
    logoSizeSlider.addEventListener('input', (e) => {
      state.logoSize = parseFloat(e.target.value);
      updateQRCode();
    });
  }

  if (logoMarginSlider) {
    logoMarginSlider.addEventListener('input', (e) => {
      state.logoMargin = parseInt(e.target.value, 10);
      updateQRCode();
    });
  }

  // ==========================================
  // 10. RESOLUTION PICKER
  // ==========================================
  const resBtns = document.querySelectorAll('.res-btn');
  const btnDownloadPng = document.getElementById('btnDownloadPng');

  resBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      resBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.resolution = parseInt(btn.dataset.res, 10);
      if (btnDownloadPng) {
        btnDownloadPng.innerHTML = `<i class="bi bi-download"></i> Unduh PNG (${state.resolution}px)`;
      }
    });
  });

  // ==========================================
  // 11. DOWNLOAD ACTIONS (PNG, SVG, PDF)
  // ==========================================
  // Download PNG (High Res)
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', async () => {
      try {
        btnDownloadPng.disabled = true;
        btnDownloadPng.innerHTML = '<i class="bi bi-hourglass-split"></i> Menyiapkan PNG...';

        // Create high-res instance for crisp export
        const exportQr = new QRCodeClass({
          width: state.resolution,
          height: state.resolution,
          type: 'canvas',
          data: state.currentData,
          image: state.logoType === 'none' ? '' : state.logoUrl,
          dotsOptions: {
            type: state.dotsType,
            color: state.colorType === 'single' ? state.fgColor1 : undefined,
            gradient: state.colorType === 'gradient' ? {
              type: 'linear',
              rotation: (state.gradientRotation * Math.PI) / 180,
              colorStops: [
                { offset: 0, color: state.fgColor1 },
                { offset: 1, color: state.fgColor2 },
              ]
            } : undefined
          },
          cornersSquareOptions: {
            type: state.cornerSquareType,
            color: state.fgColor1,
          },
          cornersDotOptions: {
            type: state.cornerDotType,
            color: state.fgColor1,
          },
          backgroundOptions: {
            color: state.bgTransparent ? 'transparent' : state.bgColor,
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: state.logoMargin * (state.resolution / 300),
            imageSize: state.logoSize,
            hideBackgroundDots: true,
          }
        });

        await exportQr.download({
          name: `QR-Craft-${state.activeType}-${Date.now()}`,
          extension: 'png'
        });

        showToast(`QR-Code PNG (${state.resolution}px) berhasil diunduh!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Gagal mengunduh gambar PNG.', 'danger');
      } finally {
        btnDownloadPng.disabled = false;
        btnDownloadPng.innerHTML = `<i class="bi bi-download"></i> Unduh PNG (${state.resolution}px)`;
      }
    });
  }

  // Download SVG (Lossless Vector)
  const btnDownloadSvg = document.getElementById('btnDownloadSvg');
  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', async () => {
      try {
        btnDownloadSvg.disabled = true;
        await qrCode.download({
          name: `QR-Craft-${state.activeType}-${Date.now()}`,
          extension: 'svg'
        });
        showToast('QR-Code SVG (Vektor) berhasil diunduh!', 'success');
      } catch (err) {
        showToast('Gagal mengunduh file SVG.', 'danger');
      } finally {
        btnDownloadSvg.disabled = false;
      }
    });
  }

  // Print / PDF Export
  const btnExportPdf = document.getElementById('btnExportPdf');
  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', async () => {
      const { jsPDF } = window.jspdf || {};
      if (jsPDF) {
        try {
          showToast('Menyiapkan dokumen PDF...', 'info');
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Canvas to DataURL
          const canvas = qrCanvasContainer.querySelector('canvas');
          if (!canvas) {
            window.print();
            return;
          }
          const imgData = canvas.toDataURL('image/png');

          // Header Branding
          doc.setFillColor(11, 19, 41);
          doc.rect(0, 0, 210, 36, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('QR-CRAFT STUDIO • PROFESSIONAL SMART GENERATOR', 105, 18, { align: 'center' });
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('Sistem QR-Code Generator Multifungsi & Interaktif', 105, 26, { align: 'center' });

          // Center QR Code
          doc.addImage(imgData, 'PNG', 45, 55, 120, 120);

          // Card Border around QR
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.roundedRect(35, 48, 140, 155, 6, 6, 'S');

          // Info box
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Tipe Konten: ${state.activeType.toUpperCase()}`, 105, 185, { align: 'center' });

          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          const printableData = state.currentData.length > 70 ? state.currentData.substring(0, 68) + '...' : state.currentData;
          doc.text(`Isi: ${printableData}`, 105, 192, { align: 'center' });

          // Scan Instruction
          doc.setTextColor(37, 99, 235);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('ARAHKAN KAMERA HP ANDA UNTUK MEMINDAI', 105, 225, { align: 'center' });

          // Footer
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text('Dicetak secara otomatis melalui portal resmi QR-Craft Studio.', 105, 280, { align: 'center' });

          doc.save(`QR-Craft-Print-${Date.now()}.pdf`);
          showToast('Dokumen PDF siap cetak berhasil diunduh!', 'success');
        } catch (e) {
          console.error(e);
          window.print();
        }
      } else {
        window.print();
      }
    });
  }

  // ==========================================
  // 12. QUICK ACTION BUTTONS
  // ==========================================
  // Copy Link / Data
  const btnCopyData = document.getElementById('btnCopyData');
  if (btnCopyData) {
    btnCopyData.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(state.currentData);
        showToast('Link / Data QR berhasil disalin ke clipboard!', 'success');
      } catch (e) {
        showToast('Gagal menyalin teks ke clipboard.', 'warning');
      }
    });
  }

  // Reset Button
  const btnResetQr = document.getElementById('btnResetQr');
  if (btnResetQr) {
    btnResetQr.addEventListener('click', () => {
      state.fgColor1 = '#000000';
      state.fgColor2 = '#334155';
      state.colorType = 'single';
      state.bgColor = '#ffffff';
      state.bgTransparent = false;
      state.dotsType = 'rounded';
      state.cornerSquareType = 'extra-rounded';
      state.cornerDotType = 'dot';
      state.logoType = 'qrcraft';
      state.logoUrl = '/assets/qrcraft_logo.svg';

      if (fgColor1Input) fgColor1Input.value = '#000000';
      if (fgColor1Text) fgColor1Text.textContent = '#000000';
      if (bgColorInput) bgColorInput.value = '#ffffff';
      if (bgColorText) bgColorText.textContent = '#ffffff';
      if (bgTransparentCheckbox) bgTransparentCheckbox.checked = false;

      document.querySelectorAll('.dots-style-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.dots-style-btn[data-style="rounded"]')?.classList.add('active');

      document.querySelectorAll('.logo-preset-item').forEach(b => b.classList.remove('active'));
      document.querySelector('.logo-preset-item[data-logo="qrcraft"]')?.classList.add('active');

      updateQRCode();
      showToast('Kustomisasi QR direset ke default.');
    });
  }

  // ==========================================
  // 13. SCAN SIMULATOR MODAL (SMARTPHONE MOCKUP)
  // ==========================================
  const btnSimulateScan = document.getElementById('btnSimulateScan');
  const scanModalOverlay = document.getElementById('scanModalOverlay');
  const btnCloseScanModal = document.getElementById('btnCloseScanModal');
  const simDetectedType = document.getElementById('simDetectedType');
  const simDetectedTitle = document.getElementById('simDetectedTitle');
  const simDetectedContent = document.getElementById('simDetectedContent');
  const simPhoneActionBtn = document.getElementById('simPhoneActionBtn');

  if (btnSimulateScan && scanModalOverlay) {
    btnSimulateScan.addEventListener('click', () => {
      const data = state.currentData;
      let typeLabel = 'Tautan Web';
      let title = data;
      let content = data;
      let btnText = 'Buka Tautan Web';
      let btnIcon = 'bi-box-arrow-up-right';
      let actionHandler = () => window.open(data, '_blank');

      if (/^WIFI:/i.test(data)) {
        typeLabel = 'Jaringan Wi-Fi Terdeteksi';
        const ssidMatch = data.match(/S:([^;]+)/);
        const passMatch = data.match(/P:([^;]+)/);
        const ssid = ssidMatch ? ssidMatch[1] : 'Wi-Fi';
        const pass = passMatch ? passMatch[1] : '';

        title = `SSID: ${ssid}`;
        content = `Kata Sandi: ${pass || '(Tanpa Password)'}\nTipe Keamanan: WPA/WPA2\nStatus: Siap terhubung secara otomatis.`;
        btnText = 'Hubungkan ke Wi-Fi Ini';
        btnIcon = 'bi-wifi';
        actionHandler = () => {
          if (pass) navigator.clipboard.writeText(pass);
          alert(`Berhasil disimulasikan! Tersambung ke Wi-Fi "${ssid}". Password disalin ke clipboard.`);
        };
      } else if (/^BEGIN:VCARD/i.test(data)) {
        typeLabel = 'Kontak Digital (vCard)';
        const fnMatch = data.match(/FN:([^\n\r]+)/);
        const telMatch = data.match(/TEL;TYPE=CELL:([^\n\r]+)/);
        const emailMatch = data.match(/EMAIL:([^\n\r]+)/);

        title = fnMatch ? fnMatch[1] : 'Kontak Baru';
        content = `No. Telepon: ${telMatch ? telMatch[1] : '-'}\nEmail: ${emailMatch ? emailMatch[1] : '-'}\nFormat vCard 3.0 kompatibel dengan iOS & Android.`;
        btnText = 'Simpan ke Buku Kontak';
        btnIcon = 'bi-person-plus-fill';
        actionHandler = () => {
          const blob = new Blob([data], { type: 'text/vcard;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('File Kontak (.vcf) berhasil diunduh ke ponsel Anda!', 'success');
        };
      } else if (state.activeType === 'file' || /\/f\//.test(data)) {
        typeLabel = 'Dokumen Publik Tersedia';
        title = fileResultName?.textContent || 'Unduhan Berkas';
        content = `File terverifikasi di server QR-Craft.\nURL: ${data}`;
        btnText = 'Buka & Unduh Dokumen';
        btnIcon = 'bi-file-earmark-arrow-down-fill';
        actionHandler = () => window.open(data, '_blank');
      } else if (state.activeType === 'image' || /\/img\//.test(data)) {
        typeLabel = 'Galeri Foto HD';
        title = imageResultName?.textContent || 'Tampilan Gambar';
        content = `Viewer Gambar Responsif.\nURL: ${data}`;
        btnText = 'Lihat Galeri Foto';
        btnIcon = 'bi-images';
        actionHandler = () => window.open(data, '_blank');
      } else if (state.activeType === 'text') {
        typeLabel = 'Catatan / Pesan Teks';
        title = 'Teks Memo';
        content = data;
        btnText = 'Salin Teks Memo';
        btnIcon = 'bi-clipboard-check';
        actionHandler = () => {
          navigator.clipboard.writeText(data);
          alert('Teks berhasil disalin ke clipboard!');
        };
      }

      if (simDetectedType) simDetectedType.innerHTML = `<i class="bi bi-broadcast"></i> ${typeLabel}`;
      if (simDetectedTitle) simDetectedTitle.textContent = title;
      if (simDetectedContent) simDetectedContent.textContent = content;
      if (simPhoneActionBtn) {
        simPhoneActionBtn.innerHTML = `<i class="bi ${btnIcon}"></i> ${btnText}`;
        simPhoneActionBtn.onclick = actionHandler;
      }

      scanModalOverlay.classList.add('active');
    });
  }

  if (btnCloseScanModal && scanModalOverlay) {
    btnCloseScanModal.addEventListener('click', () => {
      scanModalOverlay.classList.remove('active');
    });

    scanModalOverlay.addEventListener('click', (e) => {
      if (e.target === scanModalOverlay) {
        scanModalOverlay.classList.remove('active');
      }
    });
  }

  // ==========================================
  // 14. TOAST NOTIFICATION UTILITY
  // ==========================================
  let toastTimeout;
  function showToast(message, type = 'info') {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastMsg';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }

    const iconMap = {
      info: 'bi-info-circle-fill',
      success: 'bi-check-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      danger: 'bi-x-circle-fill',
    };

    toast.innerHTML = `<i class="bi ${iconMap[type] || 'bi-info-circle-fill'}"></i> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  window.showToast = showToast;
});
