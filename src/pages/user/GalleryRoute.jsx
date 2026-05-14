import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { db, auth } from '../../lib/supabase';
import UserGallery from './UserGallery';
import AuthPage from '../Auth';

export default function GalleryRoute() {
  const { user, authLoading } = useApp();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Parse slug from URL: /gallery/<slug>
  const slug = window.location.pathname.split('/gallery/')[1]?.split('/')[0];

  const loadEvent = useCallback(async () => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    try {
      const evt = await db.getEventBySlug(slug);
      if (!evt) { setNotFound(true); } else { setEvent(evt); }
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { if (!authLoading) loadEvent(); }, [authLoading, loadEvent]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span className="spin" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16, padding: 20 }}>
        <div style={{ fontSize: 64 }}>📭</div>
        <h2 style={{ textAlign: 'center' }}>Gallery Not Found</h2>
        <p style={{ color: 'var(--text3)', textAlign: 'center' }}>This link may be invalid or the event has been deleted.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>← Go Home</button>
      </div>
    );
  }

  // If event requires login and user is not signed in → show auth
  if (event.require_login && !user) {
    return (
      <AuthPage
        message={`Sign in to view photos from "${event.name}"`}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Minimal header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" /><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-h)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>FrameVault</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>Viewing as guest</span>
              <button className="btn btn-secondary btn-sm" onClick={() => auth.signOut().then(() => window.location.reload())}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/'}>Sign In</button>
          )}
        </div>
      </div>

      {/* Gallery content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
        <UserGallery event={event} />
      </div>
    </div>
  );
}
