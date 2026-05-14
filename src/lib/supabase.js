import { createClient } from '@supabase/supabase-js';

const URL = process.env.REACT_APP_SUPABASE_URL;
const KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(URL, KEY);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  signInGoogle: () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  }),
  signInEmail: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signUpEmail: (email, password) => supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Storage ───────────────────────────────────────────────────────────────────
export const storage = {
  upload: async (eventId, photoId, file) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${eventId}/${photoId}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type,
    });
    if (error) throw error;
    return path;
  },
  getUrl: (path) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl,
  deleteFolder: async (eventId) => {
    const { data } = await supabase.storage.from('photos').list(eventId);
    if (data?.length) await supabase.storage.from('photos').remove(data.map(f => `${eventId}/${f.name}`));
  },
  delete: async (path) => supabase.storage.from('photos').remove([path]),
};

// ── Database ──────────────────────────────────────────────────────────────────
export const db = {

  // Profiles
  getProfile: async (id) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data;
  },
  upsertProfile: async (profile) => {
    const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data;
  },
  getAllProfiles: async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  // Events
  getEvents: async (photographerId) => {
    const { data } = await supabase.from('events').select('*').eq('photographer_id', photographerId).order('created_at', { ascending: false });
    return data || [];
  },
  getEventBySlug: async (slug) => {
    const { data } = await supabase.from('events').select('*').eq('slug', slug).single();
    return data;
  },
  getAllEvents: async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  createEvent: async (evt) => {
    const { data, error } = await supabase.from('events').insert(evt).select().single();
    if (error) throw error;
    return data;
  },
  updateEvent: async (id, updates) => {
    const { data, error } = await supabase.from('events').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteEvent: async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },

  // Photos
  getPhotos: async (eventId) => {
    const { data } = await supabase.from('photos').select('*').eq('event_id', eventId).order('uploaded_at', { ascending: false });
    return data || [];
  },
  insertPhoto: async (photo) => {
    const { data, error } = await supabase.from('photos').insert(photo).select().single();
    if (error) throw error;
    return data;
  },
  updatePhoto: async (id, updates) => {
    const { data, error } = await supabase.from('photos').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deletePhoto: async (id) => {
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
  },

  // Guest favorites
  getFavorites: async (eventId, userId) => {
    const { data } = await supabase.from('favorites').select('photo_id').eq('event_id', eventId).eq('user_id', userId);
    return (data || []).map(f => f.photo_id);
  },
  getAllFavorites: async (eventId) => {
    const { data } = await supabase.from('favorites').select('*, profiles(name, email, avatar)').eq('event_id', eventId);
    return data || [];
  },
  toggleFavorite: async (eventId, photoId, userId, isFav) => {
    if (isFav) {
      await supabase.from('favorites').delete().eq('event_id', eventId).eq('photo_id', photoId).eq('user_id', userId);
    } else {
      await supabase.from('favorites').insert({ event_id: eventId, photo_id: photoId, user_id: userId });
    }
  },

  // Guests
  getGuests: async (eventId) => {
    const { data } = await supabase.from('guests').select('*, profiles(name, email, avatar)').eq('event_id', eventId);
    return data || [];
  },
  addGuest: async (guest) => {
    const { data, error } = await supabase.from('guests').insert(guest).select().single();
    if (error) throw error;
    return data;
  },
  deleteGuest: async (id) => {
    await supabase.from('guests').delete().eq('id', id);
  },

  // Face matches
  getFaceMatches: async (eventId, userId) => {
    const { data } = await supabase.from('face_matches').select('photo_id, confidence').eq('event_id', eventId).eq('user_id', userId);
    return data || [];
  },
  insertFaceMatch: async (match) => {
    await supabase.from('face_matches').upsert(match, { onConflict: 'event_id,user_id,photo_id' });
  },
};
