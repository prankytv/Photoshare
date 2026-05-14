import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { supabase, auth, db } from '../lib/supabase';

const Ctx = createContext(null);

// Admin emails — add yours here, or manage via profiles.role in DB
const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = 'success') => {
    const id = uuid();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  // ── Load / sync profile ───────────────────────────────────────────────────
  const loadProfile = useCallback(async (u) => {
    if (!u) { setProfile(null); setRole(null); return; }
    try {
      let p = await db.getProfile(u.id);
      if (!p) {
        p = await db.upsertProfile({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          avatar: u.user_metadata?.avatar_url || '',
          role: ADMIN_EMAILS.includes(u.email?.toLowerCase()) ? 'admin' : 'user',
          plan: 'free',
        });
      }
      setProfile(p);
      setRole(p.role === 'admin' || ADMIN_EMAILS.includes(u.email?.toLowerCase()) ? 'admin' : 'user');
    } catch (e) {
      console.error('loadProfile error', e);
    }
  }, []);

  // ── Auth listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u).finally(() => setAuthLoading(false));
    });
    const { data: { subscription } } = auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await loadProfile(u);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null); setProfile(null); setRole(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const p = await db.upsertProfile({ id: user.id, ...updates });
    setProfile(p);
  }, [user]);

  return (
    <Ctx.Provider value={{ user, profile, role, authLoading, signOut, updateProfile, toast, toasts }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
