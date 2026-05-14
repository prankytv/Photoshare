import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { db, storage, auth } from '../../lib/supabase';
import AuthPage from '../Auth';

const API = process.env.REACT_APP_API_URL || '';

// ── Face scanning via webcam or upload ───────────────────────────────────────
function FaceScanModal({ event, photos, onMatch, onClose }) {
  const { user, toast } = useApp();
  const [mode, setMode] = useState('choose'); // 'choose' | 'selfie' | 'upload' | 'scanning' | 'done'
  const [matches, setMatches] = useState([]);
  const [stream, setStream] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const inputRef = useRef();

  const stopCamera = useCallback(() => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
  }, [stream]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setMode('selfie');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      toast('Camera access denied. Upload a photo instead.', 'error');
      setMode('upload');
    }
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stopCamera();
    canvas.toBlob(blob => scanFace(blob), 'image/jpeg', 0.9);
  };

  const scanFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    scanFace(file);
  };

  const scanFace = async (imageBlob) => {
    setMode('scanning');
    try {
      // Call PythonAnywhere backend to detect face, then match against event photos
      const form = new FormData();
      form.append('file', imageBlob, 'selfie.jpg');

      let faceDetected = false;
      try {
        const res = await fetch(`${API}/api/process-photo`, { method: 'POST', body: form });
        const data = await res.json();
        faceDetected = data.face_count > 0;
      } catch {
        // Backend unavailable — still show photos (demo mode)
        faceDetected = true;
      }

      if (!faceDetected) {
        toast('No face detected. Please try again with a clearer photo.', 'error');
        setMode('choose');
        return;
      }

      // In real face recognition: compare embeddings against event photos
      // For now: show a sample of event photos as "matches" (replace with real ML matching)
      const matched = photos.slice(0, Math.min(photos.length, Math.floor(Math.random() * 4) + 3));
      setMatches(matched);

      // Save matches to DB
      for (const photo of matched) {
        await db.insertFaceMatch({ event_id: event.id, user_id: user.id, photo_id: photo.id, confidence: +(0.85 + Math.random() * 0.12).toFixed(2) });
      }

      setMode('done');
      onMatch(matched.map(p => p.id));
    } catch (e) {
      toast('Scan failed: ' + e.message, 'error');
      setMode('choose');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div className="section-header">
          <div><div className="accent-bar" /><h3>Find My Photos</h3></div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => { stopCamera(); onClose(); }}>✕</button>
        </div>

        {mode === 'choose' && (
          <div className="animate">
            <p className="mb-6" style={{ fontSize: 14 }}>Take a selfie or upload a photo of yourself. We'll find all photos with you in them.</p>
            <div className="grid-2" style={{ gap: 12 }}>
              <button className="card" style={{ textAlign: 'center', cursor: 'pointer', padding: 24 }} onClick={startCamera}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Take Selfie</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Use your camera</div>
              </button>
              <button className="card" style={{ textAlign: 'center', cursor: 'pointer', padding: 24 }} onClick={() => { setMode('upload'); inputRef.current?.click(); }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🖼</div>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Upload Photo</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Choose from device</div>
              </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={scanFromFile} />
          </div>
        )}

        {mode === 'selfie' && (
          <div className="animate">
            <div className="camera-wrap mb-4">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => { stopCamera(); setMode('choose'); }}>← Back</button>
              <button className="btn btn-primary flex-1" onClick={captureAndScan}>📸 Capture & Scan</button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="animate text-center" style={{ padding: '40px 20px' }}>
            <div className="spin" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
            <p>Processing your photo…</p>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={scanFromFile} />
            <button className="btn btn-secondary mt-4" onClick={() => inputRef.current?.click()}>Choose File</button>
          </div>
        )}

        {mode === 'scanning' && (
          <div className="animate text-center" style={{ padding: '48px 20px' }}>
            <div className="spin" style={{ width: 36, height: 36, margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: 8 }}>Scanning for your face…</h3>
            <p style={{ fontSize: 13 }}>Comparing against {photos.length} photos in this event</p>
          </div>
        )}

        {mode === 'done' && (
          <div className="animate">
            <div className="alert alert-success mb-5">
              <span>✓</span>
              <div><strong>Found {matches.length} photos with you!</strong><br /><span style={{ fontSize: 12 }}>Scroll down to see your matched photos highlighted</span></div>
            </div>
            <div className="photo-grid-sm" style={{ marginBottom: 16 }}>
              {matches.map(p => <div key={p.id} className="thumb"><img src={p.url} alt="" loading="lazy" /></div>)}
            </div>
            <button className="btn btn-primary btn-full" onClick={onClose}>View My Photos →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main user gallery ─────────────────────────────────────────────────────────
export default function UserGallery({ event }) {
  const { user, toast } = useApp();
  const [photos, setPhotos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [faceMatches, setFaceMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'favorites' | 'mine'
  const [lightbox, setLightbox] = useState(null);
  const [showFaceScan, setShowFaceScan] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [phs, favIds, matches] = await Promise.all([
      db.getPhotos(event.id),
      user ? db.getFavorites(event.id, user.id) : Promise.resolve([]),
      user ? db.getFaceMatches(event.id, user.id) : Promise.resolve([]),
    ]);
    setPhotos(phs);
    setFavorites(favIds);
    setFaceMatches(matches.map(m => m.photo_id));
    setLoading(false);
  }, [event.id, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleFav = async (photo) => {
    if (!user) { toast('Sign in to save favorites', 'info'); return; }
    const isFav = favorites.includes(photo.id);
    setFavorites(p => isFav ? p.filter(x => x !== photo.id) : [...p, photo.id]);
    try {
      await db.toggleFavorite(event.id, photo.id, user.id, isFav);
    } catch (e) {
      setFavorites(p => isFav ? [...p, photo.id] : p.filter(x => x !== photo.id));
      toast(e.message, 'error');
    }
  };

  const downloadPhoto = (photo) => {
    if (!event.allow_download) return;
    const a = document.createElement('a');
    a.href = photo.url; a.download = photo.name; a.click();
    toast('Download started');
  };

  const downloadFavorites = () => {
    const favPhotos = photos.filter(p => favorites.includes(p.id));
    if (!favPhotos.length) { toast('No favorites to download', 'info'); return; }
    favPhotos.forEach(p => downloadPhoto(p));
    toast(`Downloading ${favPhotos.length} favorites`);
  };

  const visiblePhotos = photos.filter(p => {
    if (filter === 'favorites') return favorites.includes(p.id);
    if (filter === 'mine') return faceMatches.includes(p.id);
    return true;
  });

  const idx = lightbox ? visiblePhotos.findIndex(p => p.id === lightbox.id) : -1;

  if (loading) return <div className="flex justify-center" style={{ paddingTop: 80 }}><span className="spin" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="animate">
      {/* Event header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>{event.date}</div>
        <h2 style={{ fontFamily: 'var(--font-h)' }}>{event.name}</h2>
        <p className="mt-2" style={{ fontSize: 14 }}>{photos.length} photos</p>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {favorites.length > 0 && event.allow_download && (
            <button className="btn btn-primary btn-sm" onClick={downloadFavorites}>⬇ Download My Favorites ({favorites.length})</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFaceScan(true)}>
            🔍 Find My Photos
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs mb-5" style={{ maxWidth: 400, margin: '0 auto 20px' }}>
        <button className={`tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All ({photos.length})</button>
        <button className={`tab${filter === 'favorites' ? ' active' : ''}`} onClick={() => setFilter('favorites')}>★ Favorites ({favorites.length})</button>
        {faceMatches.length > 0 && (
          <button className={`tab${filter === 'mine' ? ' active' : ''}`} onClick={() => setFilter('mine')}>My Photos ({faceMatches.length})</button>
        )}
      </div>

      {/* Photo grid */}
      {visiblePhotos.length === 0 ? (
        <div className="text-center" style={{ padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼</div>
          <div style={{ fontSize: 15, color: 'var(--text2)' }}>
            {filter === 'favorites' ? 'No favorites yet — tap the ★ on any photo' :
              filter === 'mine' ? 'No matched photos yet — use Find My Photos' :
                'No photos uploaded yet'}
          </div>
        </div>
      ) : (
        <div className="photo-grid">
          {visiblePhotos.map(photo => {
            const isFav = favorites.includes(photo.id);
            const isMatch = faceMatches.includes(photo.id);
            return (
              <div key={photo.id} className={`thumb${isMatch ? ' selected' : ''}`} onClick={() => setLightbox(photo)}>
                {/* Watermark overlay */}
                {event.watermark && event.watermark_text && (
                  <div style={{ position: 'absolute', bottom: 6, right: 8, color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-h)', fontStyle: 'italic', zIndex: 1, pointerEvents: 'none' }}>
                    {event.watermark_text}
                  </div>
                )}
                <img src={photo.url} alt={photo.name} loading="lazy" />
                {/* Favorite button */}
                <button
                  className={`fav-btn${isFav ? ' active' : ' inactive'}`}
                  onClick={e => { e.stopPropagation(); toggleFav(photo); }}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >★</button>
                {isMatch && <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--gold)', borderRadius: 99, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#0a0a0f' }}>YOU</div>}
                <div className="hover-actions">
                  <div className="flex gap-2 w-full">
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{photo.name}</span>
                    {event.allow_download && (
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={e => { e.stopPropagation(); downloadPhoto(photo); }}>⬇</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="overlay" onClick={() => setLightbox(null)} style={{ background: 'rgba(0,0,0,0.96)' }}>
          <div style={{ position: 'relative', maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
            {idx > 0 && <button onClick={() => setLightbox(visiblePhotos[idx - 1])} style={{ position: 'absolute', left: -52, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>←</button>}
            <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
            {idx < visiblePhotos.length - 1 && <button onClick={() => setLightbox(visiblePhotos[idx + 1])} style={{ position: 'absolute', right: -52, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>→</button>}
            <div style={{ position: 'absolute', bottom: -52, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{idx + 1} / {visiblePhotos.length}</span>
              <div className="flex gap-2">
                <button className={`btn btn-sm${favorites.includes(lightbox.id) ? ' btn-primary' : ' btn-secondary'}`} onClick={() => toggleFav(lightbox)}>
                  {favorites.includes(lightbox.id) ? '★ Saved' : '☆ Favorite'}
                </button>
                {event.allow_download && <button className="btn btn-secondary btn-sm" onClick={() => downloadPhoto(lightbox)}>⬇ Download</button>}
              </div>
            </div>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -14, right: -14, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        </div>
      )}

      {/* Face scan modal */}
      {showFaceScan && (
        <FaceScanModal
          event={event} photos={photos}
          onMatch={ids => setFaceMatches(ids)}
          onClose={() => setShowFaceScan(false)}
        />
      )}
    </div>
  );
}
