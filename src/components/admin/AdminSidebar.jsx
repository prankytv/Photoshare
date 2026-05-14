import React from 'react';
import { useApp } from '../../context/AppContext';

const Icon = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  events: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  photos: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  favorites: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'events', label: 'Events', icon: 'events' },
  { key: 'photos', label: 'Manage Photos', icon: 'photos' },
  { key: 'users', label: 'Users & Guests', icon: 'users' },
  { key: 'favorites', label: 'Guest Favorites', icon: 'favorites' },
  { key: 'settings', label: 'Event Settings', icon: 'settings' },
];

export default function AdminSidebar({ page, setPage, sidebarOpen, setSidebarOpen }) {
  const { profile, signOut } = useApp();

  return (
    <>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}
      <nav className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-h)', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>FrameVault</div>
              <div className="badge badge-gold" style={{ fontSize: 9, padding: '1px 6px' }}>ADMIN</div>
            </div>
          </div>
        </div>

        {/* Profile */}
        {profile && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              {profile.avatar
                ? <img src={profile.avatar} alt="" className="avatar" style={{ width: 36, height: 36 }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-light)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>{(profile.name || 'A')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{profile.name}</div>
                <div className="truncate" style={{ fontSize: 11, color: 'var(--text3)' }}>{profile.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {NAV.map(item => (
            <button key={item.key} className={`nav-item${page === item.key ? ' active' : ''}`} onClick={() => { setPage(item.key); setSidebarOpen(false); }}>
              {Icon[item.icon]}{item.label}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button className="nav-item w-full" onClick={signOut} style={{ color: 'var(--red)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 17, height: 17 }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
