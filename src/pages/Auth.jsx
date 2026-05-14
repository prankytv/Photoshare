import React, { useState } from 'react';
import { auth } from '../lib/supabase';

export default function AuthPage({ message }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await auth.signInGoogle();
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleEmail = async () => {
    if (!email || !password) { setError('Enter email and password'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'signin') {
        const { error } = await auth.signInEmail(email, password);
        if (error) throw error;
      } else {
        const { error } = await auth.signUpEmail(email, password);
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="hero-glow" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--gold),var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28 }}>FrameVault</h1>
          <p className="mt-2" style={{ fontSize: 14 }}>
            {message || 'Professional photography sharing platform'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Mode tabs */}
          <div className="tabs mb-6">
            <button className={`tab${mode === 'signin' ? ' active' : ''}`} onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}>Sign In</button>
            <button className={`tab${mode === 'signup' ? ' active' : ''}`} onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Create Account</button>
          </div>

          {/* Google */}
          <button className="btn btn-google btn-full btn-lg mb-4" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />
          </div>

          {error && <div className="alert alert-error mb-4"><span>✕</span>{error}</div>}
          {success && <div className="alert alert-success mb-4"><span>✓</span>{success}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleEmail} disabled={loading || !email || !password}>
            {loading ? <><span className="spin" style={{ width: 16, height: 16 }} /> Please wait…</> : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p className="text-center mt-4" style={{ fontSize: 12 }}>
          By signing in you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
