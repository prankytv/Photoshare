import React from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Notifications from './components/Notifications';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Guests from './pages/Guests';
import AIFeatures from './pages/AIFeatures';
import { Profile, Settings } from './pages/ProfileSettings';
import AuthPage from './pages/Auth';

const pages = {
  dashboard: Dashboard,
  events: Events,
  gallery: Gallery,
  guests: Guests,
  ai: AIFeatures,
  profile: Profile,
  settings: Settings,
};

function AppContent() {
  const { page, authLoading, loading } = useApp();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading FrameVault…</div>
        </div>
      </div>
    );
  }

  const PageComponent = pages[page] || Dashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <Header />
        <div style={{ padding: '28px 0 60px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading your data…</div>
              </div>
            </div>
          ) : (
            <PageComponent />
          )}
        </div>
      </div>
      <Notifications />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
