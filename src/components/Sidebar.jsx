import React from 'react';
import { useApp } from '../context/AppContext';

const NavIcon={
  dashboard:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  events:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  upload:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  gallery:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  guests:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  ai:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  profile:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const navItems=[
  {key:'dashboard',label:'Dashboard',icon:'dashboard'},
  {key:'events',label:'My Events',icon:'events'},
  {key:'gallery',label:'Gallery',icon:'gallery'},
  {key:'guests',label:'Guests',icon:'guests'},
  {key:'ai',label:'AI Features',icon:'ai'},
];

export default function Sidebar(){
  const {page,navigateTo,photographer,sidebarOpen,setSidebarOpen,events,uploadProgress}=useApp();
  const uploadCount=Object.keys(uploadProgress).length;
  const storePct=Math.round(photographer.storageUsed/photographer.storageTotal*100);

  return(
    <>
      {sidebarOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} onClick={()=>setSidebarOpen(false)}/>}
      <nav className={`sidebar${sidebarOpen?' open':''}`}>
        {/* Logo */}
        <div style={{padding:'24px 20px 16px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:8,background:'linear-gradient(135deg,var(--accent),var(--accent-dim))',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:16,color:'var(--text-primary)',lineHeight:1}}>FrameVault</div>
              <div style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase'}}>Pro</div>
            </div>
          </div>
        </div>

        {/* Photographer card */}
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src={photographer.avatar} alt="Profile" className="avatar" style={{width:40,height:40}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',truncate:true}} className="truncate">{photographer.name}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>{photographer.studio}</div>
            </div>
            <span className="badge badge-gold" style={{fontSize:10}}>PRO</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{flex:1,padding:'12px 12px',overflowY:'auto'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',padding:'8px 8px 4px',fontWeight:500}}>Main</div>
          {navItems.map(item=>(
            <button key={item.key} className={`nav-item${page===item.key?' active':''}`} onClick={()=>navigateTo(item.key)}>
              {NavIcon[item.icon]}
              <span style={{flex:1}}>{item.label}</span>
              {item.key==='events'&&<span style={{fontSize:11,background:'var(--bg-glass)',padding:'2px 7px',borderRadius:99,color:'var(--text-muted)',border:'1px solid var(--border)'}}>{events.length}</span>}
              {item.key==='upload'&&uploadCount>0&&<span style={{fontSize:11,background:'var(--accent)',color:'#0a0a0f',padding:'2px 7px',borderRadius:99}}>{uploadCount}</span>}
            </button>
          ))}
          <div style={{height:1,background:'var(--border)',margin:'12px 0'}}/>
          <div style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',padding:'4px 8px',fontWeight:500}}>Account</div>
          <button className={`nav-item${page==='profile'?' active':''}`} onClick={()=>navigateTo('profile')}>
            {NavIcon.profile}<span>Profile</span>
          </button>
          <button className={`nav-item${page==='settings'?' active':''}`} onClick={()=>navigateTo('settings')}>
            {NavIcon.settings}<span>Settings</span>
          </button>
        </div>

        {/* Storage */}
        <div style={{padding:'16px 20px',borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:12,color:'var(--text-muted)'}}>Storage</span>
            <span style={{fontSize:12,color:'var(--text-secondary)'}}>{photographer.storageUsed}GB / {photographer.storageTotal}GB</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width:`${storePct}%`}}/>
          </div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{storePct}% used</div>
        </div>
      </nav>
    </>
  );
}
