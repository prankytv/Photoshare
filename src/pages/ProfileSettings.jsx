import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export function Profile(){
  const {photographer,setPhotographer,addNotification}=useApp();
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState(photographer);

  const save=()=>{
    setPhotographer(form);
    setEditing(false);
    addNotification('Profile updated!','success');
  };

  return(
    <div className="animate-in">
      <div style={{marginBottom:28}}>
        <div className="accent-line"/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <h2>Photographer Profile</h2>
            <p style={{marginTop:4,fontSize:14}}>Your public-facing branding and contact details</p>
          </div>
          <button className="btn btn-primary" onClick={()=>editing?save():setEditing(true)}>
            {editing?'Save Changes':'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:24,flexWrap:'wrap'}}>
          <div style={{position:'relative'}}>
            <img src={photographer.avatar} alt="Profile" className="avatar" style={{width:96,height:96}}/>
            {editing&&(
              <button style={{position:'absolute',bottom:0,right:0,width:28,height:28,borderRadius:'50%',background:'var(--accent)',border:'none',color:'#0a0a0f',fontSize:13,cursor:'pointer'}}>✎</button>
            )}
          </div>
          <div style={{flex:1,minWidth:200}}>
            {editing?(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Full Name"/>
                <input className="input" value={form.studio} onChange={e=>setForm(p=>({...p,studio:e.target.value}))} placeholder="Studio Name"/>
                <input className="input" value={form.tagline} onChange={e=>setForm(p=>({...p,tagline:e.target.value}))} placeholder="Tagline"/>
              </div>
            ):(
              <>
                <h2 style={{fontFamily:'var(--font-display)',marginBottom:4}}>{photographer.name}</h2>
                <div style={{fontSize:15,color:'var(--accent)',marginBottom:4,fontStyle:'italic'}}>{photographer.studio}</div>
                <div style={{fontSize:14,color:'var(--text-muted)'}}>{photographer.tagline}</div>
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <span className="badge badge-gold">PRO Plan</span>
                  <span className="badge badge-green">Active</span>
                </div>
              </>
            )}
          </div>
          <div style={{display:'flex',gap:16}}>
            {[
              {label:'Events',value:photographer.totalEvents},
              {label:'Photos',value:photographer.totalPhotos.toLocaleString()},
              {label:'Clients',value:photographer.totalClients},
            ].map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:24,fontWeight:600,fontFamily:'var(--font-display)',color:'var(--text-primary)'}}>{s.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{gap:20}}>
        {/* Contact details */}
        <div className="card">
          <h3 style={{marginBottom:16}}>Contact Details</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {key:'email',label:'Email',icon:'✉',placeholder:'your@email.com'},
              {key:'phone',label:'Phone',icon:'📞',placeholder:'+91 98765 43210'},
              {key:'website',label:'Website',icon:'🌐',placeholder:'www.yoursite.com'},
              {key:'location',label:'Location',icon:'📍',placeholder:'City, Country'},
            ].map(f=>(
              <div key={f.key}>
                <label className="input-label">{f.label}</label>
                {editing?(
                  <input className="input" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}/>
                ):(
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}>
                    <span>{f.icon}</span>
                    <span style={{fontSize:14,color:'var(--text-secondary)'}}>{photographer[f.key]||'—'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social media */}
        <div className="card">
          <h3 style={{marginBottom:16}}>Social Media</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {key:'instagram',label:'Instagram',icon:'📸',placeholder:'@yourhandle'},
              {key:'facebook',label:'Facebook',icon:'👍',placeholder:'Page name or URL'},
              {key:'youtube',label:'YouTube',icon:'▶',placeholder:'@yourchannel'},
            ].map(f=>(
              <div key={f.key}>
                <label className="input-label">{f.label}</label>
                {editing?(
                  <input className="input" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}/>
                ):(
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}>
                    <span>{f.icon}</span>
                    <span style={{fontSize:14,color:'var(--text-secondary)'}}>{photographer[f.key]||'Not set'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Portfolio preview */}
          <div style={{marginTop:20,padding:16,background:'var(--bg-glass)',border:'1px dashed var(--border-accent)',borderRadius:'var(--radius-sm)',textAlign:'center'}}>
            <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:6}}>Your public profile</div>
            <div style={{fontSize:14,color:'var(--accent)',fontFamily:'var(--font-display)',fontStyle:'italic'}}>framevault.app/{photographer.name.toLowerCase().replace(/\s+/g,'-')}</div>
          </div>
        </div>
      </div>

      {editing&&(
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button className="btn btn-primary btn-lg" onClick={save}>Save Changes</button>
          <button className="btn btn-secondary btn-lg" onClick={()=>{setForm(photographer);setEditing(false)}}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export function Settings(){
  const {photographer,addNotification}=useApp();
  const [wm,setWm]=useState(true);
  const [wmText,setWmText]=useState(`© ${photographer.name}`);
  const [wmPosition,setWmPosition]=useState('bottom-right');
  const [wmOpacity,setWmOpacity]=useState(40);
  const [notifs,setNotifs]=useState({email:true,sms:false,download:true,view:false});

  return(
    <div className="animate-in">
      <div style={{marginBottom:28}}>
        <div className="accent-line"/>
        <h2>Settings</h2>
        <p style={{marginTop:4,fontSize:14}}>Global settings for your FrameVault account</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        {/* Watermark settings */}
        <div className="card">
          <h3 style={{marginBottom:16}}>Watermark Settings</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>Enable Watermark by Default</div>
                <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>New events will have watermark enabled</div>
              </div>
              <button className={`toggle${wm?' on':''}`} onClick={()=>setWm(!wm)}/>
            </div>
            {wm&&(
              <>
                <div>
                  <label className="input-label">Watermark Text</label>
                  <input className="input" value={wmText} onChange={e=>setWmText(e.target.value)} placeholder={`© ${photographer.name}`}/>
                </div>
                <div>
                  <label className="input-label">Position</label>
                  <select className="input" value={wmPosition} onChange={e=>setWmPosition(e.target.value)}>
                    {['top-left','top-right','bottom-left','bottom-right','center','tile'].map(p=><option key={p} value={p}>{p.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Opacity: {wmOpacity}%</label>
                  <input type="range" min={10} max={80} step={5} value={wmOpacity} onChange={e=>setWmOpacity(+e.target.value)}/>
                </div>
                {/* Watermark preview */}
                <div>
                  <label className="input-label">Preview</label>
                  <div className="watermark-preview" style={{height:120,background:'linear-gradient(135deg,var(--bg-card),var(--bg-card-hover))'}}>
                    <div className="watermark-text" style={{
                      opacity:wmOpacity/100,fontSize:14,fontWeight:600,
                      ...(wmPosition==='center'?{top:'50%',left:'50%',transform:'translate(-50%,-50%) rotate(-20deg)'}:{}),
                      ...(wmPosition==='bottom-right'?{bottom:8,right:10}:{}),
                      ...(wmPosition==='bottom-left'?{bottom:8,left:10}:{}),
                      ...(wmPosition==='top-right'?{top:8,right:10}:{}),
                      ...(wmPosition==='top-left'?{top:8,left:10}:{}),
                    }}>{wmText}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notification settings */}
        <div className="card">
          <h3 style={{marginBottom:16}}>Notifications</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[
              {key:'email',label:'Email Notifications',desc:'Receive activity summaries via email'},
              {key:'sms',label:'SMS Alerts',desc:'Text notifications for important events'},
              {key:'download',label:'Download Alerts',desc:'Notify when guests download photos'},
              {key:'view',label:'View Tracking',desc:'Alert when galleries are viewed'},
            ].map(n=>(
              <div key={n.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{n.label}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{n.desc}</div>
                </div>
                <button className={`toggle${notifs[n.key]?' on':''}`} onClick={()=>setNotifs(p=>({...p,[n.key]:!p[n.key]}))}/>
              </div>
            ))}
          </div>
        </div>

        {/* Plan & Billing */}
        <div className="card" style={{borderColor:'var(--border-accent)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3>Plan & Billing</h3>
            <span className="badge badge-gold">PRO</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:16}}>
            {[
              {label:'Storage',val:'50 GB'},
              {label:'Events',val:'Unlimited'},
              {label:'Guests',val:'Unlimited'},
              {label:'AI Features',val:'Included'},
            ].map(f=>(
              <div key={f.label} style={{padding:12,background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',textAlign:'center'}}>
                <div style={{fontSize:15,fontWeight:600,color:'var(--accent)',fontFamily:'var(--font-display)'}}>{f.val}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3,textTransform:'uppercase',letterSpacing:'0.04em'}}>{f.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm">Manage Subscription</button>
        </div>

        <button className="btn btn-primary btn-lg" onClick={()=>addNotification('Settings saved!','success')}>Save All Settings</button>
      </div>
    </div>
  );
}
