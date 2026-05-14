import React from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import Toasts from './components/shared/Toasts';
import AuthPage from './pages/Auth';
import AdminLayout from './AdminLayout';
import GalleryRoute from './pages/user/GalleryRoute';

function AppRouter() {
  const { user, role, authLoading } = useApp();
  const path = window.location.pathname;

  // Full-page loading spinner
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </div>
        <span className="spin" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 14, color: 'var(--text3)' }}>Loading FrameVault…</span>
      </div>
    );
  }

  // ── /gallery/<slug> → public or login-gated gallery ──────────────────────
  if (path.startsWith('/gallery/')) {
    return <GalleryRoute />;
  }

  // ── / root ────────────────────────────────────────────────────────────────
  // Not signed in → show auth
  if (!user) {
    return <AuthPage />;
  }

  // Signed in as admin → admin dashboard
  if (role === 'admin') {
    return <AdminLayout />;
  }

  // Signed in as regular user with no gallery path → friendly landing
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div className="hero-glow" />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </div>
        <h1 style={{ marginBottom: 10 }}>FrameVault</h1>
        <p style={{ fontSize: 15, marginBottom: 28 }}>
          You're signed in as a guest. Use the link shared by your photographer to view your event gallery.
        </p>
        <div className="card" style={{ padding: 20, textAlign: 'left', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>How to access your photos</div>
          {[
            'Ask your photographer for the gallery link',
            'Open the link — it looks like framevault.app/gallery/event-name',
            'If required, you may need to sign in (already done ✓)',
            'Use "Find My Photos" to scan your face and see only your photos',
            'Mark favorites and download if the photographer has enabled it',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold-light)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => import('./lib/supabase').then(m => m.auth.signOut()).then(() => window.location.reload())}>Sign Out</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toasts />
    </AppProvider>
  );
}
