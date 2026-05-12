import React from 'react';
import { useApp } from '../context/AppContext';

function StatCard({value,label,icon,accent}){
  return(
    <div className="stat-card animate-in" style={{position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:16,right:16,width:40,height:40,borderRadius:10,background:accent||'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.8}}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard(){
  const {events,photographer,navigateTo,setSelectedEvent}=useApp();
  const totalPhotos=events.reduce((a,e)=>a+e.photos.length,0);
  const totalGuests=events.reduce((a,e)=>a+e.guests.length,0);
  const totalViews=events.reduce((a,e)=>a+e.views,0);
  const totalDownloads=events.reduce((a,e)=>a+e.downloads,0);
  const recent=events.slice(0,4);

  return(
    <div className="animate-in">
      {/* Header */}
      <div style={{marginBottom:32}}>
        <div className="accent-line"/>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <h1>Good morning, {photographer.name.split(' ')[0]} <span style={{fontStyle:'italic',color:'var(--accent)'}}>✦</span></h1>
            <p style={{marginTop:6,fontSize:15}}>Here's what's happening with your photography business</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={()=>navigateTo('events')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{marginBottom:32}}>
        <StatCard value={events.length} label="Total Events" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}/>
        <StatCard value={totalPhotos.toLocaleString()} label="Photos Uploaded" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>} accent="rgba(96,165,250,0.15)"/>
        <StatCard value={totalGuests} label="Total Guests" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} accent="rgba(74,222,128,0.15)"/>
        <StatCard value={totalViews.toLocaleString()} label="Gallery Views" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dim)" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>} accent="rgba(212,168,83,0.08)"/>
      </div>

      {/* Activity row */}
      <div className="grid-2" style={{marginBottom:32,gap:24}}>
        {/* Recent events */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <h3>Recent Events</h3>
            <button className="btn btn-secondary btn-sm" onClick={()=>navigateTo('events')}>View all</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {recent.map((evt,i)=>(
              <div key={evt.id} className={`animate-in stagger-${i+1}`} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}} onClick={()=>{setSelectedEvent(evt);navigateTo('gallery')}}>
                <img src={evt.cover} alt={evt.name} style={{width:48,height:48,borderRadius:8,objectFit:'cover',flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{evt.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{evt.photos.length} photos · {evt.guests.length} guests</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:12,color:'var(--accent)',fontWeight:500}}>{evt.views} views</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{evt.downloads} dl</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + storage */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <h3 style={{marginBottom:16}}>Quick Actions</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'New Event',icon:'📅',action:()=>navigateTo('events')},
                {label:'Upload Photos',icon:'📸',action:()=>navigateTo('gallery')},
                {label:'Guest List',icon:'👥',action:()=>navigateTo('guests')},
                {label:'AI Sharing',icon:'✨',action:()=>navigateTo('ai')},
              ].map(a=>(
                <button key={a.label} onClick={a.action} style={{padding:'12px',borderRadius:'var(--radius-sm)',background:'var(--bg-glass)',border:'1px solid var(--border)',cursor:'pointer',textAlign:'center',color:'var(--text-secondary)',fontSize:13,fontFamily:'var(--font-body)',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-accent)';e.currentTarget.style.color='var(--accent)';e.currentTarget.style.background='var(--accent-light)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';e.currentTarget.style.background='var(--bg-glass)'}}>
                  <div style={{fontSize:22,marginBottom:4}}>{a.icon}</div>
                  <div>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <h3>Performance</h3>
              <span className="badge badge-green">This month</span>
            </div>
            {[
              {label:'Total Downloads',val:totalDownloads,max:200},
              {label:'Gallery Views',val:totalViews,max:1000},
              {label:'Storage Used',val:Math.round(photographer.storageUsed/photographer.storageTotal*100),max:100,suffix:'%'},
            ].map(m=>(
              <div key={m.label} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:13,color:'var(--text-secondary)'}}>{m.label}</span>
                  <span style={{fontSize:13,color:'var(--text-primary)',fontWeight:500}}>{m.val}{m.suffix||''}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${Math.min(100,m.val/m.max*100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {Object.keys(useApp().uploadProgress).length>0&&(
        <div className="card animate-in" style={{borderColor:'var(--border-accent)'}}>
          <h3 style={{marginBottom:16}}>Uploading Photos</h3>
          {Object.entries(useApp().uploadProgress).map(([id,{name,progress}])=>(
            <div key={id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:13,color:'var(--text-secondary)',truncate:true}}>{name}</span>
                <span style={{fontSize:13,color:'var(--accent)',fontWeight:500}}>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${progress}%`}}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
