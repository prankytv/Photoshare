import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { db, storage } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

function CreateModal({ onClose, onCreated }) {
  const { profile, toast } = useApp();
  const [form, setForm] = useState({ name: '', date: '', description: '', category: 'wedding', require_login: false, allow_download: true, watermark: false, watermark_text: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target ? e.target.value : e }));

  const submit = async () => {
    if (!form.name || !form.date) { toast('Name and date are required', 'error'); return; }
    setLoading(true);
    try {
      const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const evt = await db.createEvent({
        photographer_id: profile.id,
        name: form.name, date: form.date, description: form.description,
        category: form.category, slug,
        require_login: form.require_login,
        allow_download: form.allow_download,
        watermark: form.watermark,
        watermark_text: form.watermark_text || `© ${profile.name}`,
        share_link: `${window.location.origin}/gallery/${slug}`,
      });
      toast(`Event "${form.name}" created!`);
      onCreated(evt);
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div className="section-header">
          <div><div className="accent-bar" /><h3>Create New Event</h3></div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">Event Name *</label>
            <input className="input" placeholder="e.g. Sharma Wedding" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.date} onChange={set('date')} />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {['wedding', 'birthday', 'corporate', 'engagement', 'portrait', 'maternity', 'other'].map(c =>
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea className="input" placeholder="Brief description..." value={form.description} onChange={set('description')} rows={2} />
        </div>

        {/* Access controls */}
        <div className="card" style={{ padding: 16, marginBottom: 16, background: 'var(--bg2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Access Controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'require_login', label: 'Require Login to View Photos', desc: 'Guests must sign in before accessing the gallery' },
              { key: 'allow_download', label: 'Allow Guest Downloads', desc: 'Show the download button to guests' },
              { key: 'watermark', label: 'Watermark Photos', desc: 'Apply your name to all photos' },
            ].map(ctrl => (
              <div key={ctrl.key} className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{ctrl.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{ctrl.desc}</div>
                </div>
                <button className={`toggle${form[ctrl.key] ? ' on' : ''}`} onClick={() => setForm(p => ({ ...p, [ctrl.key]: !p[ctrl.key] }))} />
              </div>
            ))}
            {form.watermark && (
              <div>
                <label className="label">Watermark Text</label>
                <input className="input" placeholder={`© ${profile?.name}`} value={form.watermark_text} onChange={set('watermark_text')} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={submit} disabled={loading}>
            {loading ? <><span className="spin" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ event, onClose, onUploaded }) {
  const { toast } = useApp();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const inputRef = useRef();

  const handleFiles = e => setFiles(Array.from(e.target.files));
  const handleDrop = e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)); };

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      const photoId = uuid();
      setProgress(p => ({ ...p, [photoId]: { name: file.name, pct: 0 } }));
      try {
        setProgress(p => ({ ...p, [photoId]: { name: file.name, pct: 40 } }));
        const path = await storage.upload(event.id, photoId, file);
        const url = storage.getUrl(path);
        setProgress(p => ({ ...p, [photoId]: { name: file.name, pct: 80 } }));
        await db.insertPhoto({
          id: photoId, event_id: event.id, name: file.name,
          url, thumb_url: url, storage_path: path,
          size_mb: +(file.size / 1024 / 1024).toFixed(2),
          uploaded_at: new Date().toISOString(),
        });
        setProgress(p => ({ ...p, [photoId]: { name: file.name, pct: 100 } }));
        uploaded++;
      } catch (err) {
        toast(`Failed: ${file.name}`, 'error');
        setProgress(p => { const n = { ...p }; delete n[photoId]; return n; });
      }
    }
    toast(`${uploaded} photo${uploaded !== 1 ? 's' : ''} uploaded!`);
    setUploading(false);
    onUploaded();
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div className="section-header">
          <h3>Upload Photos — {event.name}</h3>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="upload-zone" style={files.length ? { borderColor: 'var(--gold)', background: 'var(--gold-light)' } : {}}
          onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => inputRef.current?.click()}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
            {files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop photos here or click to browse'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>JPEG, PNG, RAW · Bulk upload supported</div>
          <input ref={inputRef} type="file" multiple accept="image/*,.raw,.cr2,.nef,.arw" style={{ display: 'none' }} onChange={handleFiles} />
        </div>

        {/* Progress */}
        {Object.entries(progress).map(([id, { name, pct }]) => (
          <div key={id} style={{ marginTop: 12 }}>
            <div className="flex justify-between mb-2"><span style={{ fontSize: 12, color: 'var(--text2)' }}>{name}</span><span style={{ fontSize: 12, color: 'var(--gold)' }}>{pct}%</span></div>
            <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          </div>
        ))}

        <div className="flex gap-3 mt-6">
          <button className="btn btn-secondary flex-1" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={upload} disabled={uploading || !files.length}>
            {uploading ? <><span className="spin" style={{ width: 14, height: 14 }} /> Uploading…</> : `Upload ${files.length || ''} Photos`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const { toast } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [uploadFor, setUploadFor] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await db.getAllEvents();
    // Enrich with photo count
    const enriched = await Promise.all(data.map(async evt => {
      const photos = await db.getPhotos(evt.id);
      return { ...evt, photoCount: photos.length };
    }));
    setEvents(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteEvent = async (evt) => {
    if (!window.confirm(`Delete "${evt.name}"? This cannot be undone.`)) return;
    try {
      await storage.deleteFolder(evt.id);
      await db.deleteEvent(evt.id);
      setEvents(p => p.filter(e => e.id !== evt.id));
      toast('Event deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggle = async (evt, key) => {
    try {
      const updated = await db.updateEvent(evt.id, { [key]: !evt[key] });
      setEvents(p => p.map(e => e.id === evt.id ? { ...e, ...updated } : e));
      toast(`${key === 'require_login' ? 'Login requirement' : key === 'allow_download' ? 'Downloads' : 'Watermark'} updated`);
    } catch (e) { toast(e.message, 'error'); }
  };

  const copyLink = (evt) => {
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${evt.slug}`);
    toast('Share link copied!');
  };

  if (loading) return <div className="flex justify-center" style={{ paddingTop: 80 }}><span className="spin" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="animate">
      <div className="section-header">
        <div><div className="accent-bar" /><h2>Events</h2><p className="mt-2" style={{ fontSize: 14 }}>{events.length} total events</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3>No events yet</h3>
          <p className="mt-2">Create your first event to get started</p>
          <button className="btn btn-primary mt-6" onClick={() => setShowCreate(true)}>Create First Event</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {events.map(evt => (
            <div key={evt.id} className="card animate" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex items-center" style={{ padding: '16px 20px', gap: 16, flexWrap: 'wrap' }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{evt.name}</span>
                    <span className="badge badge-blue">{evt.category}</span>
                  </div>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>📅 {evt.date || 'No date'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>📸 {evt.photoCount} photos</span>
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { key: 'require_login', label: 'Login Required' },
                    { key: 'allow_download', label: 'Downloads' },
                    { key: 'watermark', label: 'Watermark' },
                  ].map(ctrl => (
                    <div key={ctrl.key} className="text-center">
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{ctrl.label}</div>
                      <button className={`toggle${evt[ctrl.key] ? ' on' : ''}`} onClick={() => toggle(evt, ctrl.key)} />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => setUploadFor(evt)}>📸 Upload</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => copyLink(evt)}>🔗 Link</button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteEvent(evt)} title="Delete event">🗑</button>
                </div>
              </div>

              {/* Share link bar */}
              <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '8px 20px', fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span className="truncate">{window.location.origin}/gallery/{evt.slug}</span>
                <div className="flex gap-2">
                  <span className={`badge badge-${evt.require_login ? 'gold' : 'green'}`} style={{ fontSize: 10 }}>{evt.require_login ? '🔒 Login Required' : '🌍 Public Access'}</span>
                  <span className={`badge badge-${evt.allow_download ? 'green' : 'red'}`} style={{ fontSize: 10 }}>{evt.allow_download ? '⬇ DL On' : '⊘ DL Off'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={evt => setEvents(p => [{ ...evt, photoCount: 0 }, ...p])} />}
      {uploadFor && <UploadModal event={uploadFor} onClose={() => setUploadFor(null)} onUploaded={load} />}
    </div>
  );
}
