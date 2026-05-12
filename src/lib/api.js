// All calls to the PythonAnywhere FastAPI backend
// Base URL is set via REACT_APP_API_URL in .env

const BASE = process.env.REACT_APP_API_URL || 'https://yourusername.pythonanywhere.com';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API error');
  }
  return res.json();
}

export const api = {
  // ── Image processing (compression, watermark, thumbnail) ──────────────
  processPhoto: async (file, { quality = 85, sizePreset = 'original', watermark = false, watermarkText = '' }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('quality', quality);
    form.append('size_preset', sizePreset);
    form.append('watermark', watermark);
    form.append('watermark_text', watermarkText);
    const res = await fetch(`${BASE}/api/process-photo`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Photo processing failed');
    // Returns processed image as blob
    return res.blob();
  },

  // ── Face recognition ──────────────────────────────────────────────────
  scanFaces: async (photoUrl) => {
    return request('/api/scan-faces', {
      method: 'POST',
      body: JSON.stringify({ photo_url: photoUrl }),
    });
  },

  scanEventFaces: async (photoUrls) => {
    return request('/api/scan-event-faces', {
      method: 'POST',
      body: JSON.stringify({ photo_urls: photoUrls }),
    });
  },

  // ── QR Code generation ────────────────────────────────────────────────
  generateQR: async (url, slug) => {
    return request('/api/generate-qr', {
      method: 'POST',
      body: JSON.stringify({ url, slug }),
    });
    // Returns { qr_base64: '...' }
  },

  // ── Smart sharing (WhatsApp/SMS via backend) ──────────────────────────
  sendSmartGallery: async ({ guestName, guestPhone, personalLink, eventName }) => {
    return request('/api/send-gallery-link', {
      method: 'POST',
      body: JSON.stringify({ guest_name: guestName, guest_phone: guestPhone, personal_link: personalLink, event_name: eventName }),
    });
  },

  // ── Auto enhancement ──────────────────────────────────────────────────
  enhancePhoto: async (photoUrl) => {
    return request('/api/enhance-photo', {
      method: 'POST',
      body: JSON.stringify({ photo_url: photoUrl }),
    });
  },

  // ── Health check ──────────────────────────────────────────────────────
  health: () => request('/api/health'),
};
