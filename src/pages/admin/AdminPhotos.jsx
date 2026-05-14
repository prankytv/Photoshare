import React, { useEffect, useState } from 'react';
import { db, storage } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function AdminPhotos() {
  const { toast } = useApp();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    db.getAllEvents().then(evts => {
      setEvents(evts);
      if (evts.length) { setSelectedEvent(evts[0]); }
      else setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    setSelected([]);
    db.getPhotos(selectedEvent.id).then(p => { setPhotos(p); setLoading(false); });
  }, [selectedEvent]);

  const deletePhoto = async (photo) => {
    try {
      if (photo.storage_path) await storage.delete(photo.storage_path);
      await db.deletePhoto(photo.id);
      setPhotos(p => p.filter(x => x.id !== photo.id));
      toast('Photo deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} photos?`)) return;
    for (const id of selected) {
      const p = photos.find(x => x.id === id);
      if (p) await deletePhoto(p);
    }
    setSelected([]);
  };

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll = () => setSelected(photos.map(p => p.id));
  const clearSelect = () => setSelected([]);

  const idx = lightbox ? photos.findIndex(p => p.id === lightbox.id) : -1;

  return (
    <div className="animate">
      <div className="section-header">
        <div><div className="accent-bar" /><h2>Manage Photos</h2><p className="mt-2" style={{ fontSize: 14 }}>{photos.length} photos in selected event</p></div>
      </div>

      {/* Event picker */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {events.map(evt => (
          <button key={evt.id} className={`chip${selectedEvent?.id === evt.id ? ' on' : ''}`} onClick={() => setSelectedEvent(evt)}>
            {evt.name}
          </button>
        ))}
      </div>

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="alert alert-warning flex items-center justify-between mb-4" style={{ gap: 12 }}>
          <span>{selected.length} photo{selected.length > 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={deleteSelected}>🗑 Delete Selected</button>
            <button className="btn btn-secondary btn-sm" onClick={clearSelect}>Clear</button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {photos.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button className="btn btn-secondary btn-sm" onClick={selectAll}>Select All</button>
          <button className="btn btn-secondary btn-sm" onClick={clearSelect}>Clear</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center" style={{ paddingTop: 60 }}><span className="spin" style={{ width: 28, height: 28 }} /></div>
      ) : photos.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼</div>
          <h3>No photos yet</h3>
          <p className="mt-2">Upload photos from the Events page</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className={`thumb${selected.includes(photo.id) ? ' selected' : ''}`}>
              <img src={photo.url} alt={photo.name} loading="lazy" onClick={() => setLightbox(photo)} />
              <div className="check" onClick={() => toggleSelect(photo.id)}>{selected.includes(photo.id) ? '✓' : ''}</div>
              <div className="hover-actions">
                <div className="flex gap-2 w-full">
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={e => { e.stopPropagation(); setLightbox(photo); }}>View</button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); deletePhoto(photo); }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="overlay" onClick={() => setLightbox(null)} style={{ background: 'rgba(0,0,0,0.96)' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(photos[(idx - 1 + photos.length) % photos.length])} style={{ position: 'absolute', left: -56, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>←</button>
            <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, display: 'block' }} />
            <button onClick={() => setLightbox(photos[(idx + 1) % photos.length])} style={{ position: 'absolute', right: -56, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>→</button>
            <div style={{ position: 'absolute', bottom: -44, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{lightbox.name} · {lightbox.size_mb?.toFixed(1)} MB</span>
              <div className="flex gap-2">
                <a href={lightbox.url} download={lightbox.name} className="btn btn-secondary btn-sm">⬇ Download</a>
                <button className="btn btn-danger btn-sm" onClick={() => { deletePhoto(lightbox); setLightbox(null); }}>🗑 Delete</button>
              </div>
            </div>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -16, right: -16, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
