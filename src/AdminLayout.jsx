import React, { useState } from 'react';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFavorites from './pages/admin/AdminFavorites';
import AdminSettings from './pages/admin/AdminSettings';
import { useApp } from './context/AppContext';

const pages = {
  dashboard: AdminDashboard,
  events: AdminEvents,
  photos: AdminPhotos,
  users: AdminUsers,
  favorites: AdminFavorites,
  settings: AdminSettings,
};

const pageLabels = {
  dashboard: 'Dashboard',
  events: 'Events',
  photos: 'Manage Photos',
  users: 'Users & Guests',
  favorites: 'Guest Favorites',
  settings: 'Event Settings',
};

export default function AdminLayout() {
  const { profile, signOut } = useApp();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = pages[page] || AdminDashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar page={page} setPage={setPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main" style={{ flex: 1 }}>
        {/* Top header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 90,
          background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 20, padding: 4 }}
              className="mobile-hamburger">☰</button>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>
              Admin <span style={{ margin: '0 6px', color: 'var(--border)' }}>›</span>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{pageLabels[page]}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>ADMIN</span>
            {profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="" className="avatar" style={{ width: 28, height: 28 }} />
                  : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 12 }}>{(profile.name || 'A')[0].toUpperCase()}</div>
                }
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{(profile.name || '').split(' ')[0]}</span>
              </div>
            )}
            <button className="btn btn-secondary btn-sm" onClick={signOut}>Sign Out</button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '28px 28px 60px', maxWidth: 1100 }}>
          <PageComponent setPage={setPage} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <style>{`
        @media(max-width:600px){
          .mobile-hamburger{display:block!important}
        }
      `}</style>
    </div>
  );
}
