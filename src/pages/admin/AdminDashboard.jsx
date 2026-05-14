import React, { useEffect, useState } from 'react';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard({ setPage }) {
  const { profile } = useApp();
  const [stats, setStats] = useState({ events: 0, photos: 0, users: 0, favorites: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [events, users] = await Promise.all([db.getAllEvents(), db.getAllProfiles()]);
        let totalPhotos = 0, totalFavs = 0;
        for (const evt of events.slice(0, 5)) {
          const photos = await db.getPhotos(evt.id);
          totalPhotos += photos.length;
          const favs = await db.getAllFavorites(evt.id);
          totalFavs += favs.length;
        }
        setStats({ events: events.length, photos: totalPhotos, users: users.filter(u => u.role !== 'admin').length, favorites: totalFavs });
        setRecentEvents(events.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center" style={{ paddingTop: 80 }}><span className="spin" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="animate">
      <div style={{ marginBottom: 28 }}>
        <div className="accent-bar" />
        <h2>Welcome back, {profile?.name?.split(' ')[0]} ✦</h2>
        <p className="mt-2" style={{ fontSize: 14 }}>Here's what's happening with your platform</p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Total Events', value: stats.events, icon: '📅', color: 'var(--gold)' },
          { label: 'Total Photos', value: stats.photos, icon: '📸', color: 'var(--blue)' },
          { label: 'Active Users', value: stats.users, icon: '👥', color: 'var(--green)' },
          { label: 'Favorites Picked', value: stats.favorites, icon: '★', color: 'var(--purple)' },
        ].map((s, i) => (
          <div key={s.label} className={`stat animate stagger-${i + 1}`}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="card">
        <div className="section-header">
          <h3>Recent Events</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage('events')}>View All</button>
        </div>
        {recentEvents.length === 0
          ? <p style={{ fontSize: 14 }}>No events yet. Create your first event.</p>
          : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Event</th><th>Date</th><th>Login Required</th><th>Downloads</th><th>Status</th></tr></thead>
                <tbody>
                  {recentEvents.map(evt => (
                    <tr key={evt.id}>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{evt.name}</td>
                      <td>{evt.date || '—'}</td>
                      <td><span className={`badge badge-${evt.require_login ? 'gold' : 'green'}`}>{evt.require_login ? 'Required' : 'Public'}</span></td>
                      <td><span className={`badge badge-${evt.allow_download ? 'green' : 'red'}`}>{evt.allow_download ? 'Enabled' : 'Disabled'}</span></td>
                      <td><span className="badge badge-green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Quick actions */}
      <div className="grid-2 mt-6">
        <div className="card card-gold" style={{ cursor: 'pointer' }} onClick={() => setPage('events')}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          <h3>Create New Event</h3>
          <p className="mt-2" style={{ fontSize: 13 }}>Set up a new photo event, configure access and download settings</p>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage('favorites')}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>★</div>
          <h3>View Guest Favorites</h3>
          <p className="mt-2" style={{ fontSize: 13 }}>See which photos guests have marked as favorites across all events</p>
        </div>
      </div>
    </div>
  );
}
