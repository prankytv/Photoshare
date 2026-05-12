import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function CreateEventModal({onClose}){
  const {createEvent,navigateTo,setSelectedEvent}=useApp();
  const [form,setForm]=useState({name:'',date:'',description:'',category:'wedding'});
  const [step,setStep]=useState(1);

  const handleSubmit=()=>{
    if(!form.name||!form.date)return;
    const evt=createEvent(form);
    setSelectedEvent(evt);
    navigateTo('gallery');
    onClose();
  };

  return(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{padding:32}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <div className="accent-line" style={{marginBottom:8}}/>
            <h3>Create New Event</h3>
          </div>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{display:'flex',gap:8,marginBottom:28}}>
          {[1,2].map(s=>(
            <div key={s} style={{flex:1,height:3,borderRadius:99,background:step>=s?'var(--accent)':'var(--border)',transition:'background 0.3s'}}/>
          ))}
        </div>

        {step===1&&(
          <div className="animate-in">
            <div style={{marginBottom:16}}>
              <label className="input-label">Event Name *</label>
              <input className="input" placeholder="e.g. Sharma Wedding 2024" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
            </div>
            <div style={{marginBottom:16}}>
              <label className="input-label">Event Date *</label>
              <input type="date" className="input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/>
            </div>
            <div style={{marginBottom:16}}>
              <label className="input-label">Category</label>
              <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {['wedding','birthday','corporate','engagement','maternity','portrait','other'].map(c=>(
                  <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{marginBottom:24}}>
              <label className="input-label">Description</label>
              <textarea className="input" rows={3} placeholder="Brief description of the event..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{resize:'vertical'}}/>
            </div>
            <button className="btn btn-primary w-full" onClick={()=>setStep(2)} disabled={!form.name||!form.date}>Continue →</button>
          </div>
        )}

        {step===2&&(
          <div className="animate-in">
            <div style={{background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:20,marginBottom:20}}>
              <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:500}}>Event Summary</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[['Name',form.name],['Date',form.date],['Category',form.category],['Description',form.description||'—']].map(([k,v])=>(
                  <div key={k} style={{display:'flex',gap:12}}>
                    <span style={{fontSize:13,color:'var(--text-muted)',width:80,flexShrink:0}}>{k}</span>
                    <span style={{fontSize:13,color:'var(--text-primary)'}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:'var(--accent-light)',border:'1px solid var(--border-accent)',borderRadius:'var(--radius-sm)',padding:14,marginBottom:24}}>
              <div style={{fontSize:13,color:'var(--accent)'}}>✦ After creating, you can upload photos, generate QR codes, and share your gallery link instantly.</div>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button className="btn btn-secondary flex-1" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary flex-1" onClick={handleSubmit}>Create Event 🎉</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({event}){
  const {deleteEvent,navigateTo,setSelectedEvent,updateEvent}=useApp();
  const [showMenu,setShowMenu]=useState(false);
  const [deleting,setDeleting]=useState(false);

  const handleDelete=()=>{
    setDeleting(true);
    setTimeout(()=>deleteEvent(event.id),300);
  };

  return(
    <div className="card animate-in" style={{padding:0,overflow:'hidden',cursor:'pointer',opacity:deleting?0:1,transform:deleting?'scale(0.95)':'',transition:'all 0.3s'}}>
      <div style={{position:'relative',height:180}} onClick={()=>{setSelectedEvent(event);navigateTo('gallery')}}>
        <img src={event.cover} alt={event.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)'}}/>
        <div style={{position:'absolute',bottom:12,left:16}}>
          <span className={`badge badge-${event.guestDownload?'green':'blue'}`} style={{fontSize:10}}>{event.guestDownload?'Downloads ON':'Downloads OFF'}</span>
        </div>
        <div style={{position:'absolute',top:12,right:12,display:'flex',gap:6}}>
          {event.watermark&&<span className="badge badge-gold" style={{fontSize:10}}>Watermarked</span>}
        </div>
      </div>

      <div style={{padding:16}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
          <div style={{flex:1,minWidth:0,marginRight:8}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{event.name}</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{event.date}</div>
          </div>
          <div style={{position:'relative'}}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={e=>{e.stopPropagation();setShowMenu(!showMenu)}}>⋯</button>
            {showMenu&&(
              <div className="dropdown-menu" onClick={e=>e.stopPropagation()}>
                <button className="dropdown-item" onClick={()=>{setSelectedEvent(event);navigateTo('gallery');setShowMenu(false)}}>📷 Open Gallery</button>
                <button className="dropdown-item" onClick={()=>{navigator.clipboard.writeText(event.shareLink);setShowMenu(false)}}>🔗 Copy Link</button>
                <button className="dropdown-item" onClick={()=>{updateEvent(event.id,{watermark:!event.watermark});setShowMenu(false)}}>{event.watermark?'Remove':'Add'} Watermark</button>
                <button className="dropdown-item" onClick={()=>{updateEvent(event.id,{guestDownload:!event.guestDownload});setShowMenu(false)}}>{event.guestDownload?'Disable':'Enable'} Downloads</button>
                <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
                <button className="dropdown-item danger" onClick={()=>{handleDelete();setShowMenu(false)}}>🗑 Delete Event</button>
              </div>
            )}
          </div>
        </div>

        <div style={{display:'flex',gap:16,marginBottom:12}}>
          {[
            {v:event.photos.length,l:'Photos'},
            {v:event.guests.length,l:'Guests'},
            {v:event.views,l:'Views'},
            {v:event.downloads,l:'DLs'},
          ].map(({v,l})=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-display)'}}>{v}</div>
              <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.04em'}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>{setSelectedEvent(event);navigateTo('gallery')}}>Open Gallery</button>
          <button className="btn btn-secondary btn-sm btn-icon" title="Copy share link" onClick={()=>navigator.clipboard.writeText(event.shareLink)}>🔗</button>
        </div>
      </div>
    </div>
  );
}

export default function Events(){
  const {events,photographer}=useApp();
  const [showCreate,setShowCreate]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');

  const filtered=events.filter(e=>{
    const matchSearch=e.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter=filter==='all'||e.category===filter;
    return matchSearch&&matchFilter;
  });

  return(
    <div className="animate-in">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <div className="accent-line"/>
          <h2>My Events</h2>
          <p style={{marginTop:4,fontSize:14}}>{events.length} events · {events.reduce((a,e)=>a+e.photos.length,0)} photos total</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={()=>setShowCreate(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <input className="input" placeholder="Search events..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:280}}/>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['all','wedding','birthday','corporate','engagement','portrait'].map(f=>(
            <button key={f} className={`chip${filter===f?' selected':''}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'80px 20px',color:'var(--text-muted)'}}>
          <div style={{fontSize:48,marginBottom:16}}>📭</div>
          <div style={{fontSize:16,color:'var(--text-secondary)',marginBottom:8}}>No events found</div>
          <div style={{fontSize:14}}>Create your first event to get started</div>
          <button className="btn btn-primary mt-6" onClick={()=>setShowCreate(true)}>Create First Event</button>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
          {filtered.map((evt,i)=>(
            <div key={evt.id} style={{animationDelay:`${i*0.05}s`}}>
              <EventCard event={evt}/>
            </div>
          ))}
        </div>
      )}

      {showCreate&&<CreateEventModal onClose={()=>setShowCreate(false)}/>}
    </div>
  );
}
