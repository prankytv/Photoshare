import React, { useEffect, useState } from 'react';
import { db } from '../../lib/supabase';

export default function AdminFavorites() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getAllEvents().then(evts => {
      setEvents(evts);
      if (evts.length) setSelectedEvent(evts[0]);
      else setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    Promise.all([db.getAllFavorites(selectedEvent.id), db.getPhotos(selectedEvent.id)]).then(([favs, phs]) => {
      setFavorites(favs);
      setPhotos(phs);
      setLoading(false);
    });
  }, [selectedEvent]);

  // Group favorites by user
  const byUser = favorites.reduce((acc, fav) => {
    const key = fav.user_id;
    if (!acc[key]) acc[key] = { profile: fav.profiles, photoIds: [] };
    acc[key].photoIds.push(fav.photo_id);
    return acc;
  }, {});

  // Photo lookup map
  const photoMap = Object.fromEntries(photos.map(p => [p.id, p]));

  const downloadUserFavs = (user, photoIds) => {
    photoIds.forEach(pid => {
      const p = photoMap[pid];
      if (p) { const a = document.createElement('a'); a.href = p.url; a.download = p.name; a.click(); }
    });
  };

  return (
    <div className="animate">
      <div className="section-header">
        <div><div className="accent-bar" /><h2>Guest Favorites</h2><p className="mt-2" style={{ fontSize: 14 }}>See which photos each guest has marked as favorite</p></div>
      </div>

      {/* Event picker */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {events.map(evt => (
          <button key={evt.id} className={`chip${selectedEvent?.id === evt.id ? ' on' : ''}`} onClick={() => setSelectedEvent(evt)}>
            {evt.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ paddingTop: 60 }}><span className="spin" style={{ width: 28, height: 28 }} /></div>
      ) : Object.keys(byUser).length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>★</div>
          <h3>No favorites yet</h3>
          <p className="mt-2">Guests haven't favorited any photos in this event yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(byUser).map(([userId, { profile, photoIds }]) => (
            <div key={userId} className="card">
              {/* User header */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {profile?.avatar
                    ? <img src={profile.avatar} alt="" className="avatar" style={{ width: 40, height: 40 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{(profile?.name || 'U')[0].toUpperCase()}</div>
                  }
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{profile?.name || 'Unknown User'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{profile?.email} · {photoIds.length} favorite{photoIds.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => downloadUserFavs({ profile }, photoIds)}>
                  ⬇ Download Their Favorites
                </button>
              </div>

              {/* Their favorite photos */}
              <div className="photo-grid-sm">
                {photoIds.map(pid => {
                  const photo = photoMap[pid];
                  if (!photo) return null;
                  return (
                    <div key={pid} className="thumb">
                      <img src={photo.url} alt={photo.name} loading="lazy" />
                      <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--gold)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>★</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
