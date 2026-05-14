import React, { useEffect, useState } from 'react';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function AdminSettings() {
  const { toast } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    db.getAllEvents().then(evts => { setEvents(evts); setLoading(false); });
  }, []);

  const update = async (eventId, key, value) => {
    setSaving(eventId + key);
    try {
      await db.updateEvent(eventId, { [key]: value });
      setEvents(p => p.map(e => e.id === eventId ? { ...e, [key]: value } : e));
      toast('Setting saved');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(null); }
  };

  const updateText = async (eventId, key, value) => {
    try {
      await db.updateEvent(eventId, { [key]: value });
      setEvents(p => p.map(e => e.id === eventId ? { ...e, [key]: value } : e));
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <div className="flex justify-center" style={{ paddingTop: 80 }}><span className="spin" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="animate">
      <div className="section-header">
        <div><div className="accent-bar" /><h2>Event Settings</h2><p className="mt-2" style={{ fontSize: 14 }}>Control access, downloads, and watermarks per event</p></div>
      </div>

      {events.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚙️</div>
          <h3>No events to configure</h3>
          <p className="mt-2">Create an event first from the Events page</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map(evt => (
            <div key={evt.id} className="card">
              <div className="flex items-center gap-3 mb-5" style={{ flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: 17, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{evt.name}</span>
                <span className="badge badge-blue">{evt.category}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{evt.date}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {/* Login required */}
                <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>🔒 Login Required</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Guests must sign in to view photos</div>
                    </div>
                    <button className={`toggle${evt.require_login ? ' on' : ''}`} onClick={() => update(evt.id, 'require_login', !evt.require_login)} disabled={saving === evt.id + 'require_login'} />
                  </div>
                  <span className={`badge badge-${evt.require_login ? 'gold' : 'green'}`} style={{ fontSize: 10 }}>{evt.require_login ? 'Login Gate Active' : 'Public — No Login Needed'}</span>
                </div>

                {/* Downloads */}
                <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>⬇ Guest Downloads</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Show download button to guests</div>
                    </div>
                    <button className={`toggle${evt.allow_download ? ' on' : ''}`} onClick={() => update(evt.id, 'allow_download', !evt.allow_download)} disabled={saving === evt.id + 'allow_download'} />
                  </div>
                  <span className={`badge badge-${evt.allow_download ? 'green' : 'red'}`} style={{ fontSize: 10 }}>{evt.allow_download ? 'Download Button Visible' : 'Download Button Hidden'}</span>
                </div>

                {/* Watermark */}
                <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>🏷 Watermark</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Apply watermark overlay to photos</div>
                    </div>
                    <button className={`toggle${evt.watermark ? ' on' : ''}`} onClick={() => update(evt.id, 'watermark', !evt.watermark)} disabled={saving === evt.id + 'watermark'} />
                  </div>
                  {evt.watermark && (
                    <input className="input" style={{ marginTop: 8, fontSize: 12, padding: '6px 10px' }}
                      value={evt.watermark_text || ''}
                      onChange={e => setEvents(p => p.map(ev => ev.id === evt.id ? { ...ev, watermark_text: e.target.value } : ev))}
                      onBlur={e => updateText(evt.id, 'watermark_text', e.target.value)}
                      placeholder="Watermark text e.g. © Your Name"
                    />
                  )}
                  <span className={`badge badge-${evt.watermark ? 'gold' : 'blue'}`} style={{ fontSize: 10, marginTop: 8, display: 'inline-flex' }}>{evt.watermark ? 'Watermark On' : 'No Watermark'}</span>
                </div>

                {/* Share link */}
                <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>🔗 Share Link</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', wordBreak: 'break-all', marginBottom: 8 }}>
                    {window.location.origin}/gallery/{evt.slug}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/gallery/${evt.slug}`); toast('Copied!'); }}>Copy Link</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
