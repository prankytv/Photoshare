import React, { useEffect, useState } from 'react';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function AdminUsers() {
  const { toast } = useApp();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [allUsers, allEvents] = await Promise.all([db.getAllProfiles(), db.getAllEvents()]);
      setUsers(allUsers.filter(u => u.role !== 'admin'));
      setEvents(allEvents);
      setLoading(false);
    };
    load();
  }, []);

  const deleteUser = async (userId) => {
    if (!window.confirm('Remove this user from the platform?')) return;
    try {
      // Delete from profiles (cascade will handle guest/favorites)
      const { error } = await import('../../lib/supabase').then(m => m.supabase.from('profiles').delete().eq('id', userId));
      if (error) throw error;
      setUsers(p => p.filter(u => u.id !== userId));
      toast('User removed');
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <div className="flex justify-center" style={{ paddingTop: 80 }}><span className="spin" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="animate">
      <div className="section-header">
        <div><div className="accent-bar" /><h2>Users & Guests</h2><p className="mt-2" style={{ fontSize: 14 }}>{users.length} registered users</p></div>
      </div>

      {users.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h3>No users yet</h3>
          <p className="mt-2">Users will appear here once they sign in to view a gallery</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-3 mb-6">
            <div className="stat">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat">
              <div className="stat-value">{users.filter(u => u.plan === 'pro').length}</div>
              <div className="stat-label">Pro Users</div>
            </div>
            <div className="stat">
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Active Events</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>All Users</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                const csv = ['Name,Email,Role,Joined\n', ...users.map(u => `${u.name},${u.email},${u.role},${new Date(u.created_at).toLocaleDateString()}`)].join('\n');
                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'users.csv'; a.click();
                toast('Exported!');
              }}>Export CSV</button>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Joined</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {u.avatar
                            ? <img src={u.avatar} alt="" className="avatar" style={{ width: 32, height: 32 }} />
                            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{(u.name || 'U')[0].toUpperCase()}</div>
                          }
                          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{u.name || '—'}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td style={{ fontSize: 12 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><span className={`badge badge-${u.role === 'admin' ? 'gold' : 'blue'}`}>{u.role || 'user'}</span></td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
