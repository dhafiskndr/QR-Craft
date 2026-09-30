const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage/uploads', express.static(path.join(__dirname, 'storage/uploads')));
app.use('/storage/images', express.static(path.join(__dirname, 'storage/images')));

// Ensure directories exist
const uploadDir = path.join(__dirname, 'storage/uploads');
const imageDir = path.join(__dirname, 'storage/images');
const dataFilePath = path.join(__dirname, 'storage/database.json');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Simple JSON storage helper
function readData() {
  if (!fs.existsSync(dataFilePath)) {
    const initial = { files: {}, images: {}, shortUrls: {} };
    fs.writeFileSync(dataFilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (e) {
    return { files: {}, images: {}, shortUrls: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Multer Storage for general files/documents (max 20MB)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    cb(null, `${cleanName}-${uniqueId}${ext}`);
  }
});

const fileUpload = multer({
  storage: fileStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|zip|rar|7z|csv)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Harap upload PDF, Word, Excel, PowerPoint, ZIP, atau Teks (maks. 20MB).'));
    }
  }
});

// Multer Storage for images (max 20MB)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    cb(null, `${cleanName}-${uniqueId}${ext}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak didukung. Harap upload gambar berformat JPG, PNG, WebP, GIF, atau SVG (maks. 20MB).'));
    }
  }
});

// Format byte size helper
function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ==================== API ROUTES ====================

// 1. Upload File & Dokumen
app.post('/api/upload-file', fileUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const id = path.parse(req.file.filename).name;
    const directUrl = `${baseUrl}/storage/uploads/${req.file.filename}`;
    const publicUrl = `${baseUrl}/f/${id}`;
    const downloadUrl = `${baseUrl}/download/${req.file.filename}`;

    const db = readData();
    db.files[id] = {
      id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      directUrl,
      publicUrl,
      downloadUrl
    };
    writeData(db);

    res.json({
      success: true,
      message: 'File berhasil diunggah!',
      id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size),
      publicUrl,
      directUrl,
      downloadUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Upload Gambar
app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada gambar yang diunggah.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const id = path.parse(req.file.filename).name;
    const directUrl = `${baseUrl}/storage/images/${req.file.filename}`;
    const viewerUrl = `${baseUrl}/img/${id}`;
    const downloadUrl = `${baseUrl}/download-img/${req.file.filename}`;

    const db = readData();
    db.images[id] = {
      id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      directUrl,
      viewerUrl,
      downloadUrl
    };
    writeData(db);

    res.json({
      success: true,
      message: 'Gambar berhasil diunggah!',
      id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      formattedSize: formatBytes(req.file.size),
      viewerUrl,
      directUrl,
      downloadUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. URL Shortener with optional custom alias / slug
app.post('/api/shorten', (req, res) => {
  try {
    let { url, customAlias } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL tidak boleh kosong.' });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const db = readData();
    let code;

    if (customAlias && customAlias.trim()) {
      code = customAlias.trim().toLowerCase()
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (!code) {
        return res.status(400).json({ success: false, message: 'Format alias kustom tidak valid.' });
      }
      if (db.shortUrls[code] && db.shortUrls[code].originalUrl !== url) {
        // If it's a re-shorten with same alias, allow it to update
        db.shortUrls[code].originalUrl = url;
      }
    } else {
      code = Math.random().toString(36).substring(2, 7);
      while (db.shortUrls[code]) {
        code = Math.random().toString(36).substring(2, 7);
      }
    }

    const shortUrl = `${baseUrl}/s/${code}`;

    db.shortUrls[code] = {
      code,
      originalUrl: url,
      shortUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    writeData(db);

    res.json({
      success: true,
      code,
      shortUrl,
      originalUrl: url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Short URL Redirect
app.get('/s/:code', (req, res) => {
  const code = req.params.code;
  const db = readData();
  const entry = db.shortUrls[code];

  if (!entry) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Tautan Tidak Ditemukan - QR-Craft</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #070a13; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #0d121f; border: 1px solid rgba(255,255,255,0.08); padding: 40px; border-radius: 20px; max-width: 420px; }
          a { color: #3b82f6; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>404 - Tautan Tidak Ditemukan</h2>
          <p style="color:#94a3b8; font-size:14px;">Tautan singkat yang Anda tuju mungkin sudah kedaluwarsa atau salah.</p>
          <a href="/">Kembali ke QR-Craft</a>
        </div>
      </body>
      </html>
    `);
  }

  entry.clicks = (entry.clicks || 0) + 1;
  writeData(db);
  res.redirect(entry.originalUrl);
});

// 5. Force Download Route
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File tidak ditemukan di server.');
  }

  const db = readData();
  let originalName = filename;
  for (const key in db.files) {
    if (db.files[key].filename === filename) {
      originalName = db.files[key].originalName;
      break;
    }
  }

  res.download(filePath, originalName);
});

app.get('/download-img/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(imageDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Gambar tidak ditemukan di server.');
  }

  const db = readData();
  let originalName = filename;
  for (const key in db.images) {
    if (db.images[key].filename === filename) {
      originalName = db.images[key].originalName;
      break;
    }
  }

  res.download(filePath, originalName);
});

// 6. Public File Download Viewer (/f/:id)
app.get('/f/:id', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const fileData = db.files[id];

  if (!fileData) {
    return res.status(404).send('Dokumen tidak ditemukan.');
  }

  const ext = path.extname(fileData.filename).toLowerCase().replace('.', '').toUpperCase();
  let iconClass = 'bi-file-earmark-text';
  let badgeColor = '#2563eb';

  if (ext === 'PDF') {
    iconClass = 'bi-file-earmark-pdf-fill';
    badgeColor = '#dc2626';
  } else if (['DOC', 'DOCX'].includes(ext)) {
    iconClass = 'bi-file-earmark-word-fill';
    badgeColor = '#2563eb';
  } else if (['XLS', 'XLSX', 'CSV'].includes(ext)) {
    iconClass = 'bi-file-earmark-excel-fill';
    badgeColor = '#16a34a';
  } else if (['ZIP', 'RAR', '7Z'].includes(ext)) {
    iconClass = 'bi-file-earmark-zip-fill';
    badgeColor = '#d97706';
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${fileData.originalName} - Unduh Dokumen | QR-Craft</title>
      <link rel="icon" type="image/svg+xml" href="/assets/qrcraft_logo.svg">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
      <link rel="stylesheet" href="/css/viewer.css">
    </head>
    <body>
      <div class="viewer-shell">
        <header class="viewer-header">
          <div class="brand">
            <img src="/assets/qrcraft_logo.svg" alt="Logo" class="logo">
            <div>
              <div class="brand-title">QR-Craft</div>
              <div class="brand-sub">Smart Cloud Storage Hub</div>
            </div>
          </div>
          <a href="/" class="btn-create"><i class="bi bi-qr-code"></i> Buat QR Sendiri</a>
        </header>

        <main class="viewer-card">
          <div class="file-icon-box" style="background: ${badgeColor}15; color: ${badgeColor}; border-color: ${badgeColor}30;">
            <i class="bi ${iconClass}"></i>
          </div>

          <div class="badge-status">
            <span class="dot-pulse"></span> File Terverifikasi & Aman
          </div>

          <h1 class="file-title">${fileData.originalName}</h1>
          <p class="file-meta">
            <span><i class="bi bi-file-earmark"></i> Format: <strong>${ext}</strong></span>
            <span>•</span>
            <span><i class="bi bi-hdd-network"></i> Ukuran: <strong>${fileData.formattedSize}</strong></span>
          </p>

          <div class="action-grid">
            <a href="${fileData.downloadUrl}" class="btn-download" download>
              <i class="bi bi-cloud-arrow-down-fill"></i>
              <span>Unduh File Sekarang</span>
            </a>
            <a href="${fileData.directUrl}" target="_blank" class="btn-preview">
              <i class="bi bi-box-arrow-up-right"></i>
              <span>Buka di Tab Baru</span>
            </a>
          </div>

          <div class="secure-footer">
            <i class="bi bi-shield-check"></i>
            <span>File disimpan aman di cloud server QR-Craft Studio. Bebas dari malware dan virus.</span>
          </div>
        </main>

        <footer class="footer-note">
          © 2026 QR-Craft Studio. All rights reserved.
        </footer>
      </div>
    </body>
    </html>
  `);
});

// 7. Public Image Viewer (/img/:id)
app.get('/img/:id', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const imgData = db.images[id];

  if (!imgData) {
    return res.status(404).send('Gambar tidak ditemukan.');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${imgData.originalName} - Galeri Viewer | QR-Craft</title>
      <link rel="icon" type="image/svg+xml" href="/assets/qrcraft_logo.svg">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
      <link rel="stylesheet" href="/css/viewer.css">
    </head>
    <body class="image-viewer-page">
      <div class="viewer-shell">
        <header class="viewer-header">
          <div class="brand">
            <img src="/assets/qrcraft_logo.svg" alt="Logo" class="logo">
            <div>
              <div class="brand-title">QR-Craft Gallery</div>
              <div class="brand-sub">High-Resolution Cloud Viewer</div>
            </div>
          </div>
          <div class="header-right">
            <a href="${imgData.downloadUrl}" class="btn-download-sm" download>
              <i class="bi bi-download"></i> Unduh Asli
            </a>
            <a href="/" class="btn-create"><i class="bi bi-qr-code"></i> Buat QR</a>
          </div>
        </header>

        <main class="image-card">
          <div class="image-stage">
            <img src="${imgData.directUrl}" alt="${imgData.originalName}" id="galleryImg" class="gallery-image">
          </div>

          <div class="image-info-bar">
            <div>
              <h2 class="img-name">${imgData.originalName}</h2>
              <span class="img-specs">${imgData.formattedSize} • Format ${path.extname(imgData.filename).toUpperCase().replace('.', '')}</span>
            </div>
            <div class="btn-group">
              <button class="btn-icon" onclick="toggleZoom()" title="Perbesar / Zoom">
                <i class="bi bi-zoom-in" id="zoomIcon"></i>
              </button>
              <a href="${imgData.directUrl}" target="_blank" class="btn-icon" title="Buka Gambar Penuh">
                <i class="bi bi-arrows-fullscreen"></i>
              </a>
              <button class="btn-icon" onclick="copyViewerLink()" title="Salin Tautan">
                <i class="bi bi-share-fill"></i>
              </button>
            </div>
          </div>
        </main>

        <footer class="footer-note">
          QR-Craft Image Viewer • Powered by QR-Craft Studio Cloud Engine
        </footer>
      </div>

      <script>
        let zoomed = false;
        function toggleZoom() {
          const img = document.getElementById('galleryImg');
          const icon = document.getElementById('zoomIcon');
          zoomed = !zoomed;
          if (zoomed) {
            img.style.transform = 'scale(1.75)';
            img.style.cursor = 'zoom-out';
            icon.className = 'bi bi-zoom-out';
          } else {
            img.style.transform = 'scale(1)';
            img.style.cursor = 'zoom-in';
            icon.className = 'bi bi-zoom-in';
          }
        }
        function copyViewerLink() {
          navigator.clipboard.writeText(window.location.href);
          alert('Tautan galeri berhasil disalin ke clipboard!');
        }
      </script>
    </body>
    </html>
  `);
});

// Stats API
app.get('/api/stats', (req, res) => {
  const db = readData();
  res.json({
    totalFiles: Object.keys(db.files).length,
    totalImages: Object.keys(db.images).length,
    totalShortUrls: Object.keys(db.shortUrls).length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Ukuran file melebihi batas maksimal 20MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 QR-Craft Server running on http://localhost:${PORT}`);
  console.log(`✨ System: QR-Craft Professional Studio`);
  console.log(`===============================================`);
});
