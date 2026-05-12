import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AuthPage from '../pages/Auth';

const pageLabels = {
  dashboard: 'Dashboard', events: 'Events', gallery: 'Gallery',
  guests: 'Guests', ai: 'AI Features', profile: 'Profile', settings: 'Settings',
};

export default function Header() {
  const { page, photographer, setSidebarOpen, navigateTo, user, signOut } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 90,
        background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: breadcrumb + mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, display: 'none' }}
            className="mobile-menu-btn">☰</button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span>FrameVault</span>
            <span style={{ margin: '0 6px', color: 'var(--border)' }}>›</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{pageLabels[page] || page}</span>
          </div>
        </div>

        {/* Right: auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!user && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Demo Mode
            </span>
          )}

          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('settings')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => navigateTo('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                <img src={photographer.avatar || `https://i.pravatar.cc/40?u=${user.email}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(photographer.name || user.email).split(' ')[0]}</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={signOut}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>Sign In</button>
          )}
        </div>
      </div>

      {/* Auth modal overlay */}
      {showAuth && (
        <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460 }}>
            <AuthPage onDone={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </>
  );
}
