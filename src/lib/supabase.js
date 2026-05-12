import { createClient } from '@supabase/supabase-js';

// ── Client ───────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  signUp: (email, password) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Storage helpers ───────────────────────────────────────────────────────────
// Bucket name in Supabase Storage: "photos"
// Make sure you create a bucket called "photos" in your Supabase dashboard
// and set it to PUBLIC (for guest access) or private + signed URLs

export const storage = {
  /**
   * Upload a photo file.
   * Path pattern: {event_id}/{photo_id}.jpg
   */
  uploadPhoto: async (eventId, photoId, file, onProgress) => {
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
    const path = `${eventId}/${photoId}.${ext}`;

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;
    return path;
  },

  /**
   * Get public URL for a photo.
   */
  getPublicUrl: (path) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Get a short-lived signed URL (for private buckets).
   */
  getSignedUrl: async (path, expiresInSeconds = 3600) => {
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Delete a photo from storage.
   */
  deletePhoto: async (path) => {
    const { error } = await supabase.storage.from('photos').remove([path]);
    if (error) throw error;
  },

  /**
   * Delete all photos in an event folder.
   */
  deleteEventFolder: async (eventId) => {
    const { data: files } = await supabase.storage
      .from('photos')
      .list(eventId);
    if (files && files.length > 0) {
      const paths = files.map(f => `${eventId}/${f.name}`);
      await supabase.storage.from('photos').remove(paths);
    }
  },

  /**
   * Upload QR code PNG.
   */
  uploadQR: async (eventSlug, blob) => {
    const path = `qrcodes/${eventSlug}.png`;
    const { error } = await supabase.storage
      .from('photos')
      .upload(path, blob, { contentType: 'image/png', upsert: true });
    if (error) throw error;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  },
};

// ── Database helpers ─────────────────────────────────────────────────────────

// ── Photographer / Profile ────────────────────────────────────────────────────
export const db = {

  // ── Profile ──────────────────────────────────────────────────────────────
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  upsertProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── Events ───────────────────────────────────────────────────────────────
  getEvents: async (photographerId) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        photos:photos(count),
        guests:guests(count)
      `)
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getEvent: async (eventId) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (error) throw error;
    return data;
  },

  getEventBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  createEvent: async (event) => {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateEvent: async (eventId, updates) => {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteEvent: async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    if (error) throw error;
  },

  incrementEventViews: async (eventId) => {
    await supabase.rpc('increment_event_views', { event_id: eventId });
  },

  // ── Photos ───────────────────────────────────────────────────────────────
  getPhotos: async (eventId, filter = 'all') => {
    let query = supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('uploaded_at', { ascending: false });

    if (filter === 'favorites') query = query.eq('favorite', true);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  insertPhoto: async (photo) => {
    const { data, error } = await supabase
      .from('photos')
      .insert(photo)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updatePhoto: async (photoId, updates) => {
    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('id', photoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deletePhoto: async (photoId) => {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);
    if (error) throw error;
  },

  toggleFavorite: async (photoId, currentFav) => {
    const { data, error } = await supabase
      .from('photos')
      .update({ favorite: !currentFav })
      .eq('id', photoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── Guests ───────────────────────────────────────────────────────────────
  getGuests: async (eventId) => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getAllGuests: async (photographerId) => {
    const { data, error } = await supabase
      .from('guests')
      .select(`*, events!inner(photographer_id, name)`)
      .eq('events.photographer_id', photographerId)
      .order('joined_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addGuest: async (guest) => {
    const { data, error } = await supabase
      .from('guests')
      .insert(guest)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteGuest: async (guestId) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);
    if (error) throw error;
  },

  // ── Faces ───────────────────────────────────────────────────────────────
  getFaces: async (eventId) => {
    const { data, error } = await supabase
      .from('faces')
      .select('*')
      .eq('event_id', eventId);
    if (error) throw error;
    return data;
  },

  insertFaces: async (faces) => {
    const { data, error } = await supabase
      .from('faces')
      .insert(faces)
      .select();
    if (error) throw error;
    return data;
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  getStats: async (photographerId) => {
    const { data: events } = await supabase
      .from('events')
      .select('views, downloads, storage_mb')
      .eq('photographer_id', photographerId);

    const { count: totalPhotos } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .in('event_id',
        (await supabase.from('events').select('id').eq('photographer_id', photographerId))
          .data?.map(e => e.id) || []
      );

    const { count: totalGuests } = await supabase
      .from('guests')
      .select('id', { count: 'exact', head: true })
      .in('event_id',
        (await supabase.from('events').select('id').eq('photographer_id', photographerId))
          .data?.map(e => e.id) || []
      );

    return {
      totalEvents: events?.length || 0,
      totalPhotos: totalPhotos || 0,
      totalGuests: totalGuests || 0,
      totalViews: events?.reduce((a, e) => a + (e.views || 0), 0) || 0,
      totalDownloads: events?.reduce((a, e) => a + (e.downloads || 0), 0) || 0,
      storageMb: events?.reduce((a, e) => a + (e.storage_mb || 0), 0) || 0,
    };
  },
};
