import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Guests(){
  const {events,selectedEvent,setSelectedEvent,addGuest,addNotification}=useApp();
  const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',phone:''});

  const event=selectedEvent||events[0];
  if(!event)return<div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No events found.</div>;

  const allGuests=events.reduce((acc,e)=>[...acc,...e.guests.map(g=>({...g,eventName:e.name,eventId:e.id}))],[]);
  const filtered=allGuests.filter(g=>
    g.name.toLowerCase().includes(search.toLowerCase())||
    g.phone.includes(search)
  );

  const handleAdd=()=>{
    if(!form.name||!form.phone)return;
    addGuest(event.id,form);
    setForm({name:'',phone:''});
    setShowAdd(false);
  };

  const totalPhotosSelected=events.reduce((a,e)=>a+e.photos.filter(p=>p.favorite).length,0);

  return(
    <div className="animate-in">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <div className="accent-line"/>
          <h2>Guest Management</h2>
          <p style={{marginTop:4,fontSize:14}}>{allGuests.length} total guests across {events.length} events</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(!showAdd)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Guest
        </button>
      </div>

      {/* Add guest form */}
      {showAdd&&(
        <div className="card animate-in" style={{marginBottom:20,borderColor:'var(--border-accent)'}}>
          <h3 style={{marginBottom:16}}>Add New Guest</h3>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:180}}>
              <label className="input-label">Guest Name *</label>
              <input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
            </div>
            <div style={{flex:1,minWidth:180}}>
              <label className="input-label">Phone Number *</label>
              <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
            </div>
            <div style={{flex:1,minWidth:180}}>
              <label className="input-label">Event</label>
              <select className="input" value={event.id} onChange={e=>setSelectedEvent(events.find(ev=>ev.id===e.target.value))}>
                {events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name||!form.phone}>Add Guest</button>
            <button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-4" style={{marginBottom:24}}>
        {[
          {label:'Total Guests',value:allGuests.length,icon:'👥'},
          {label:'Events',value:events.length,icon:'📅'},
          {label:'Favorites Selected',value:totalPhotosSelected,icon:'★'},
          {label:'Active Downloads',value:events.filter(e=>e.guestDownload).length,icon:'⬇'},
        ].map((s,i)=>(
          <div key={s.label} className={`stat-card animate-in stagger-${i+1}`}>
            <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input className="input" placeholder="Search guests by name or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:400}}/>
      </div>

      {/* Guest table */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3>All Guests</h3>
          <button className="btn btn-secondary btn-sm" onClick={()=>{
            const csv=['Name,Phone,Event,Joined At',...filtered.map(g=>`${g.name},${g.phone},${g.eventName},${new Date(g.joinedAt).toLocaleDateString()}`)].join('\n');
            const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='guests.csv';a.click();
            addNotification('Guest list exported','success');
          }}>Export CSV</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Phone</th>
                <th>Event</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0?(
                <tr><td colSpan={5} style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No guests found</td></tr>
              ):filtered.map((g,i)=>(
                <tr key={g.id} style={{animationDelay:`${i*0.03}s`}}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'var(--accent-light)',border:'1px solid var(--border-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'var(--accent)',flexShrink:0}}>
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{color:'var(--text-primary)',fontWeight:500}}>{g.name}</span>
                    </div>
                  </td>
                  <td>{g.phone}</td>
                  <td>
                    <span style={{fontSize:12,background:'var(--bg-glass)',padding:'3px 8px',borderRadius:99,border:'1px solid var(--border)'}}>
                      {g.eventName.length>20?g.eventName.slice(0,20)+'…':g.eventName}
                    </span>
                  </td>
                  <td style={{fontSize:12}}>{new Date(g.joinedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-event guest breakdown */}
      <div style={{marginTop:24}}>
        <h3 style={{marginBottom:16}}>Guests by Event</h3>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {events.map(evt=>(
            <div key={evt.id} className="card" style={{padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontWeight:500,color:'var(--text-primary)',fontSize:14}}>{evt.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{evt.guests.length} guests · {evt.photos.length} photos</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <span className={`badge badge-${evt.guestDownload?'green':'blue'}`} style={{fontSize:10}}>{evt.guestDownload?'DL ON':'DL OFF'}</span>
                  <span className="badge badge-gold" style={{fontSize:10}}>{evt.views} views</span>
                </div>
              </div>
              {evt.guests.length>0&&(
                <div style={{marginTop:12,display:'flex',gap:6,flexWrap:'wrap'}}>
                  {evt.guests.map(g=>(
                    <div key={g.id} style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:99,padding:'4px 10px'}}>
                      <div style={{width:20,height:20,borderRadius:'50%',background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'var(--accent)'}}>{g.name.charAt(0)}</div>
                      <span style={{fontSize:12,color:'var(--text-secondary)'}}>{g.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
