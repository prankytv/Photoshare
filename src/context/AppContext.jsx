import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { auth, db, storage } from '../lib/supabase';

const AppContext = createContext(null);

const DEMO_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: uuidv4(),
  url: `https://picsum.photos/seed/${i + 20}/600/600`,
  thumb_url: `https://picsum.photos/seed/${i + 20}/300/300`,
  name: `photo_${String(i + 1).padStart(3, '0')}.jpg`,
  size_mb: +(Math.random() * 4 + 0.5).toFixed(2),
  uploaded_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  favorite: Math.random() > 0.7,
  storage_path: null,
}));

const DEMO_EVENT = {
  id: 'demo-evt-1',
  name: 'Sharma Wedding — 2024',
  date: '2024-03-15',
  cover: 'https://picsum.photos/seed/wed/800/600',
  photos: DEMO_PHOTOS,
  guests: [
    { id: 'g1', name: 'Priya Sharma', phone: '+91 98765 43210', joined_at: new Date().toISOString() },
    { id: 'g2', name: 'Ravi Kumar', phone: '+91 87654 32109', joined_at: new Date().toISOString() },
  ],
  slug: 'sharma-wedding-2024',
  watermark: true,
  watermark_text: '© Arjun Photography',
  guest_download: true,
  created_at: '2024-03-15T10:00:00Z',
  storage_mb: 1230,
  views: 342,
  downloads: 89,
  share_link: 'https://framevault.app/gallery/sharma-wedding-2024',
};

const DEMO_PHOTOGRAPHER = {
  id: 'demo',
  name: 'Arjun Kapoor',
  studio: 'Arjun Kapoor Photography',
  tagline: 'Capturing Timeless Moments',
  avatar: 'https://i.pravatar.cc/150?img=8',
  email: 'arjun@akphotography.in',
  phone: '+91 98765 43210',
  website: 'www.akphotography.in',
  instagram: '@arjunkapoor.clicks',
  facebook: 'ArjunKapoorPhotography',
  youtube: '@AKPhotography',
  location: 'Mumbai, India',
  plan: 'pro',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [events, setEvents] = useState([DEMO_EVENT]);
  const [photographer, setPhotographerState] = useState(DEMO_PHOTOGRAPHER);
  const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENT);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const addNotification = useCallback((msg, type = 'success') => {
    const id = uuidv4();
    setNotifications(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3500);
  }, []);

  const loadUserData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const profile = await db.getProfile(userId);
      if (profile) setPhotographerState(profile);

      const eventsData = await db.getEvents(userId);
      if (eventsData && eventsData.length > 0) {
        const enriched = await Promise.all(
          eventsData.map(async (evt) => {
            const [photos, guests] = await Promise.all([db.getPhotos(evt.id), db.getGuests(evt.id)]);
            return { ...evt, photos: photos || [], guests: guests || [] };
          })
        );
        setEvents(enriched);
        setSelectedEvent(enriched[0]);
      } else {
        setEvents([]);
        setSelectedEvent(null);
      }
    } catch (err) {
      addNotification('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
      setAuthLoading(false);
    });
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await auth.signIn(email, password);
    if (error) throw error;
    addNotification('Welcome back!', 'success');
  }, [addNotification]);

  const signUp = useCallback(async (email, password, profileData) => {
    const { data, error } = await auth.signUp(email, password);
    if (error) throw error;
    if (data.user) {
      await db.upsertProfile({ id: data.user.id, email, ...profileData, plan: 'free' });
    }
    addNotification('Account created! Check your email to confirm.', 'success');
  }, [addNotification]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setEvents([DEMO_EVENT]);
    setPhotographerState(DEMO_PHOTOGRAPHER);
    setSelectedEvent(DEMO_EVENT);
    setPage('dashboard');
  }, []);

  const updatePhotographer = useCallback(async (data) => {
    setPhotographerState(p => ({ ...p, ...data }));
    if (user) {
      try {
        await db.upsertProfile({ id: user.id, ...data });
        addNotification('Profile saved!', 'success');
      } catch (err) {
        addNotification('Failed to save: ' + err.message, 'error');
      }
    }
  }, [user, addNotification]);

  const createEvent = useCallback(async (data) => {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const shareLink = `${window.location.origin}/gallery/${slug}`;
    const newEvent = {
      photographer_id: user?.id || 'demo',
      name: data.name, date: data.date,
      description: data.description || '',
      category: data.category || 'wedding',
      slug, share_link: shareLink,
      watermark: false, watermark_text: `© ${photographer.name}`,
      guest_download: true, cover: null, storage_mb: 0, views: 0, downloads: 0,
    };
    if (user) {
      try {
        const created = await db.createEvent(newEvent);
        const enriched = { ...created, photos: [], guests: [] };
        setEvents(p => [enriched, ...p]);
        setSelectedEvent(enriched);
        addNotification(`"${data.name}" created!`, 'success');
        return enriched;
      } catch (err) { addNotification(err.message, 'error'); throw err; }
    } else {
      const local = { ...newEvent, id: uuidv4(), created_at: new Date().toISOString(), photos: [], guests: [] };
      setEvents(p => [local, ...p]);
      setSelectedEvent(local);
      addNotification(`"${data.name}" created! (Sign in to save)`, 'info');
      return local;
    }
  }, [user, photographer.name, addNotification]);

  const deleteEvent = useCallback(async (id) => {
    if (user) {
      try {
        await storage.deleteEventFolder(id);
        await db.deleteEvent(id);
      } catch (err) { addNotification('Delete failed: ' + err.message, 'error'); return; }
    }
    setEvents(p => p.filter(e => e.id !== id));
    if (selectedEvent?.id === id) setSelectedEvent(events.filter(e => e.id !== id)[0] || null);
    addNotification('Event deleted', 'success');
  }, [user, selectedEvent, events, addNotification]);

  const updateEvent = useCallback(async (id, data) => {
    setEvents(p => p.map(e => e.id === id ? { ...e, ...data } : e));
    if (selectedEvent?.id === id) setSelectedEvent(p => ({ ...p, ...data }));
    if (user) { try { await db.updateEvent(id, data); } catch { /* silent */ } }
  }, [user, selectedEvent]);

  const uploadPhotos = useCallback(async (eventId, files) => {
    const fileArray = Array.from(files);
    addNotification(`Uploading ${fileArray.length} photo${fileArray.length > 1 ? 's' : ''}…`, 'info');

    for (const file of fileArray) {
      const photoId = uuidv4();
      setUploadProgress(p => ({ ...p, [photoId]: { name: file.name, progress: 0 } }));
      try {
        let photo;
        if (user) {
          setUploadProgress(p => ({ ...p, [photoId]: { name: file.name, progress: 25 } }));
          const storagePath = await storage.uploadPhoto(eventId, photoId, file);
          setUploadProgress(p => ({ ...p, [photoId]: { name: file.name, progress: 65 } }));
          const url = storage.getPublicUrl(storagePath);
          photo = await db.insertPhoto({
            id: photoId, event_id: eventId, name: file.name,
            url, thumb_url: url + '?width=300', storage_path: storagePath,
            size_mb: +(file.size / 1024 / 1024).toFixed(2),
            favorite: false, uploaded_at: new Date().toISOString(),
          });
        } else {
          for (let p = 10; p <= 90; p += 20) {
            await new Promise(r => setTimeout(r, 100));
            setUploadProgress(pr => ({ ...pr, [photoId]: { name: file.name, progress: p } }));
          }
          const url = URL.createObjectURL(file);
          photo = { id: photoId, event_id: eventId, name: file.name, url, thumb_url: url, size_mb: +(file.size / 1024 / 1024).toFixed(2), favorite: false, uploaded_at: new Date().toISOString(), storage_path: null };
        }
        setUploadProgress(p => ({ ...p, [photoId]: { name: file.name, progress: 100 } }));
        setEvents(p => p.map(e => e.id === eventId ? { ...e, photos: [photo, ...(e.photos || [])], cover: e.cover || photo.url } : e));
        if (selectedEvent?.id === eventId) setSelectedEvent(p => ({ ...p, photos: [photo, ...(p?.photos || [])], cover: p?.cover || photo.url }));
        setTimeout(() => setUploadProgress(p => { const n = { ...p }; delete n[photoId]; return n; }), 700);
      } catch (err) {
        setUploadProgress(p => { const n = { ...p }; delete n[photoId]; return n; });
        addNotification(`Failed: ${file.name} — ${err.message}`, 'error');
      }
    }
    addNotification(`${fileArray.length} photo${fileArray.length > 1 ? 's' : ''} uploaded!`, 'success');
  }, [user, selectedEvent, addNotification]);

  const toggleFavorite = useCallback(async (eventId, photoId) => {
    const evt = events.find(e => e.id === eventId);
    const photo = evt?.photos?.find(p => p.id === photoId);
    if (!photo) return;
    const newFav = !photo.favorite;
    const up = photos => photos.map(p => p.id === photoId ? { ...p, favorite: newFav } : p);
    setEvents(p => p.map(e => e.id === eventId ? { ...e, photos: up(e.photos) } : e));
    if (selectedEvent?.id === eventId) setSelectedEvent(p => ({ ...p, photos: up(p?.photos || []) }));
    if (user) { try { await db.toggleFavorite(photoId, photo.favorite); } catch { /* silent */ } }
  }, [events, selectedEvent, user]);

  const addGuest = useCallback(async (eventId, guestData) => {
    if (user) {
      try {
        const saved = await db.addGuest({ event_id: eventId, ...guestData });
        setEvents(p => p.map(e => e.id === eventId ? { ...e, guests: [...(e.guests || []), saved] } : e));
        if (selectedEvent?.id === eventId) setSelectedEvent(p => ({ ...p, guests: [...(p?.guests || []), saved] }));
        addNotification('Guest added!', 'success');
        return saved;
      } catch (err) { addNotification('Failed: ' + err.message, 'error'); }
    } else {
      const guest = { id: uuidv4(), event_id: eventId, ...guestData, joined_at: new Date().toISOString() };
      setEvents(p => p.map(e => e.id === eventId ? { ...e, guests: [...(e.guests || []), guest] } : e));
      if (selectedEvent?.id === eventId) setSelectedEvent(p => ({ ...p, guests: [...(p?.guests || []), guest] }));
      addNotification('Guest added (Sign in to save)', 'info');
    }
  }, [user, selectedEvent, addNotification]);

  const toggleSelectedPhoto = useCallback((id) => {
    setSelectedPhotos(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }, []);
  const clearSelectedPhotos = useCallback(() => setSelectedPhotos([]), []);

  const navigateTo = useCallback((pg, evt = null) => {
    setPage(pg);
    if (evt) setSelectedEvent(evt);
    setSelectedPhotos([]);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppContext.Provider value={{
      user, authLoading, signIn, signUp, signOut,
      page, navigateTo,
      events, createEvent, deleteEvent, updateEvent,
      photographer, setPhotographer: updatePhotographer,
      selectedEvent, setSelectedEvent,
      selectedPhotos, toggleSelectedPhoto, clearSelectedPhotos,
      sidebarOpen, setSidebarOpen,
      uploadPhotos, uploadProgress,
      notifications, addNotification,
      toggleFavorite, addGuest,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
