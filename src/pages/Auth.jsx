import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', name: '', studio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        if (!form.name || !form.studio) { setError('Name and studio are required'); setLoading(false); return; }
        await signUp(form.email, form.password, { name: form.name, studio: form.studio });
        setMode('signin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20,
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)', marginBottom: 4 }}>FrameVault</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Professional Photography Platform</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 24 }}>
            <button className={`tab-item${mode === 'signin' ? ' active' : ''}`} onClick={() => { setMode('signin'); setError(''); }}>Sign In</button>
            <button className={`tab-item${mode === 'signup' ? ' active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Create Account</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="input-label">Your Name *</label>
                  <input className="input" placeholder="e.g. Arjun Kapoor" value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="input-label">Studio Name *</label>
                  <input className="input" placeholder="e.g. Arjun Kapoor Photography" value={form.studio} onChange={set('studio')} />
                </div>
              </>
            )}
            <div>
              <label className="input-label">Email *</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div>
              <label className="input-label">Password *</label>
              <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {error && (
              <div className="alert" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg w-full" onClick={handleSubmit} disabled={loading || !form.email || !form.password} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing…</> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {mode === 'signin' && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Forgot password? <a href="https://supabase.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Reset via Supabase</a>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          You can also <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', padding: 0 }}
            onClick={() => window.location.reload()}>continue as demo</button> without signing in
        </div>
      </div>
    </div>
  );
}
