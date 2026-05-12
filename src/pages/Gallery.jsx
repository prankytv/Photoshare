import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import QRCode from 'qrcode';

function QRModal({event,onClose}){
  const [qrUrl,setQrUrl]=useState('');
  const [copied,setCopied]=useState(false);
  React.useEffect(()=>{
    QRCode.toDataURL(event.shareLink,{width:200,margin:2,color:{dark:'#000000',light:'#ffffff'}}).then(setQrUrl);
  },[event.shareLink]);
  const copyLink=()=>{
    navigator.clipboard.writeText(event.shareLink);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };
  return(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{padding:32,maxWidth:380,textAlign:'center'}} onClick={e=>e.stopPropagation()}>
        <div style={{marginBottom:20}}>
          <div className="accent-line" style={{margin:'0 auto 8px'}}/>
          <h3>Share Gallery</h3>
          <p style={{fontSize:13,marginTop:4}}>Guests can scan this QR code to view photos</p>
        </div>
        {qrUrl&&(
          <div className="qr-container" style={{display:'inline-block',margin:'0 auto 20px',borderRadius:12}}>
            <img src={qrUrl} alt="QR Code" style={{width:200,height:200,display:'block'}}/>
          </div>
        )}
        <div style={{background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'10px 14px',marginBottom:16,wordBreak:'break-all',fontSize:13,color:'var(--text-secondary)'}}>{event.shareLink}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-secondary flex-1" onClick={copyLink}>{copied?'✓ Copied!':'Copy Link'}</button>
          {qrUrl&&<a href={qrUrl} download={`${event.slug}-qr.png`} className="btn btn-primary flex-1">Download QR</a>}
        </div>
        <button className="btn btn-secondary w-full mt-3" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function AddGuestModal({event,onClose}){
  const {addGuest}=useApp();
  const [form,setForm]=useState({name:'',phone:''});
  const submit=()=>{
    if(!form.name||!form.phone)return;
    addGuest(event.id,form);
    onClose();
  };
  return(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{padding:32,maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div className="accent-line"/>
        <h3 style={{marginBottom:20}}>Add Guest</h3>
        <div style={{marginBottom:14}}>
          <label className="input-label">Guest Name *</label>
          <input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
        </div>
        <div style={{marginBottom:20}}>
          <label className="input-label">Phone Number *</label>
          <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={submit} disabled={!form.name||!form.phone}>Add Guest</button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({photo,event,onClose,onFav,onNext,onPrev}){
  return(
    <div className="modal-backdrop" onClick={onClose} style={{background:'rgba(0,0,0,0.95)'}}>
      <div style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onPrev} style={{position:'absolute',left:-60,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:44,height:44,borderRadius:'50%',cursor:'pointer',fontSize:18}}>←</button>
        <img src={photo.url} alt={photo.name} style={{maxWidth:'85vw',maxHeight:'85vh',objectFit:'contain',borderRadius:12}}/>
        <button onClick={onNext} style={{position:'absolute',right:-60,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:44,height:44,borderRadius:'50%',cursor:'pointer',fontSize:18}}>→</button>
        <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.8))',padding:'20px 16px',borderRadius:'0 0 12px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13,color:'white',fontWeight:500}}>{photo.name}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>{(photo.size/1024/1024).toFixed(1)} MB</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>onFav(photo.id)} style={{background:photo.favorite?'var(--accent)':'rgba(255,255,255,0.15)',border:'none',color:photo.favorite?'#0a0a0f':'white',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13,fontFamily:'var(--font-body)'}}>
              {photo.favorite?'★ Saved':'☆ Favorite'}
            </button>
            <a href={photo.url} download={photo.name} style={{background:'rgba(255,255,255,0.15)',color:'white',padding:'6px 12px',borderRadius:6,fontSize:13,textDecoration:'none',fontFamily:'var(--font-body)'}}>⬇ Download</a>
          </div>
        </div>
        <button onClick={onClose} style={{position:'absolute',top:-12,right:-12,background:'rgba(255,255,255,0.15)',border:'none',color:'white',width:32,height:32,borderRadius:'50%',cursor:'pointer',fontSize:14}}>✕</button>
      </div>
    </div>
  );
}

export default function Gallery(){
  const {events,selectedEvent,setSelectedEvent,uploadPhotos,toggleFavorite,selectedPhotos,toggleSelectedPhoto,clearSelectedPhotos,updateEvent,uploadProgress,addNotification}=useApp();
  const [showQR,setShowQR]=useState(false);
  const [showAddGuest,setShowAddGuest]=useState(false);
  const [viewPhoto,setViewPhoto]=useState(null);
  const [filter,setFilter]=useState('all');
  const [dragOver,setDragOver]=useState(false);
  const [compressionLevel,setCompressionLevel]=useState(85);
  const [imageSize,setImageSize]=useState('original');
  const [selectMode,setSelectMode]=useState(false);
  const fileInputRef=useRef();

  const event=selectedEvent||events[0];
  if(!event) return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No events yet. Create one first.</div>;

  const photos=event.photos.filter(p=>{
    if(filter==='favorites')return p.favorite;
    if(filter==='faces')return p.faces&&p.faces.length>0;
    return true;
  });

  const handleFiles=useCallback(files=>{
    if(!files.length)return;
    uploadPhotos(event.id,Array.from(files));
  },[event.id,uploadPhotos]);

  const handleDrop=e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)};
  const handlePhotoClick=p=>{
    if(selectMode){toggleSelectedPhoto(p.id);return;}
    setViewPhoto(p);
  };
  const photoIdx=viewPhoto?photos.findIndex(p=>p.id===viewPhoto.id):-1;

  const downloadSelected=()=>{
    const sel=photos.filter(p=>selectedPhotos.includes(p.id));
    sel.forEach(p=>{
      const a=document.createElement('a');a.href=p.url;a.download=p.name;a.click();
    });
    addNotification(`Downloading ${sel.length} photos`,'success');
    clearSelectedPhotos();setSelectMode(false);
  };

  const uploadingCount=Object.keys(uploadProgress).length;

  return(
    <div className="animate-in">
      {/* Header */}
      <div style={{marginBottom:24}}>
        <div className="accent-line"/>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{event.name}</h2>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6,flexWrap:'wrap'}}>
              <span style={{fontSize:13,color:'var(--text-muted)'}}>{event.date}</span>
              <span style={{fontSize:13,color:'var(--text-muted)'}}>·</span>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>{event.photos.length} photos</span>
              <span style={{fontSize:13,color:'var(--text-muted)'}}>·</span>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>{event.guests.length} guests</span>
              {event.watermark&&<span className="badge badge-gold" style={{fontSize:10}}>Watermarked</span>}
              <span className={`badge badge-${event.guestDownload?'green':'blue'}`} style={{fontSize:10}}>{event.guestDownload?'Downloads ON':'Downloads OFF'}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowAddGuest(true)}>👥 Add Guest</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowQR(true)}>📱 QR Code</button>
            <button className="btn btn-primary btn-sm" onClick={()=>fileInputRef.current?.click()}>
              {uploadingCount>0?<><span className="spinner" style={{width:14,height:14}}/> Uploading {uploadingCount}...</>:'📸 Upload Photos'}
            </button>
          </div>
        </div>
      </div>

      {/* Event switcher */}
      {events.length>1&&(
        <div style={{marginBottom:20,display:'flex',gap:8,flexWrap:'wrap'}}>
          {events.map(e=>(
            <button key={e.id} className={`chip${event.id===e.id?' selected':''}`} onClick={()=>setSelectedEvent(e)}>
              {e.name.length>25?e.name.slice(0,25)+'…':e.name}
            </button>
          ))}
        </div>
      )}

      {/* Controls row */}
      <div className="grid-2" style={{marginBottom:20,gap:16}}>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,fontWeight:500}}>Settings</div>
          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>Watermark</span>
              <button className={`toggle${event.watermark?' on':''}`} onClick={()=>updateEvent(event.id,{watermark:!event.watermark})}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>Guest Downloads</span>
              <button className={`toggle${event.guestDownload?' on':''}`} onClick={()=>updateEvent(event.id,{guestDownload:!event.guestDownload})}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>Select Mode</span>
              <button className={`toggle${selectMode?' on':''}`} onClick={()=>{setSelectMode(!selectMode);clearSelectedPhotos()}}/>
            </div>
          </div>
        </div>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,fontWeight:500}}>Compression: {compressionLevel}%</div>
          <input type="range" min={10} max={100} step={5} value={compressionLevel} onChange={e=>setCompressionLevel(+e.target.value)}/>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            {['original','large','medium','small','thumbnail'].map(s=>(
              <button key={s} className={`chip${imageSize===s?' selected':''}`} style={{fontSize:11,padding:'3px 8px'}} onClick={()=>setImageSize(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection bar */}
      {selectMode&&selectedPhotos.length>0&&(
        <div className="animate-in" style={{background:'var(--accent-light)',border:'1px solid var(--border-accent)',borderRadius:'var(--radius-sm)',padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:13,color:'var(--accent)',fontWeight:500}}>{selectedPhotos.length} photo{selectedPhotos.length>1?'s':''} selected</span>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-primary btn-sm" onClick={downloadSelected}>⬇ Download Selected</button>
            <button className="btn btn-secondary btn-sm" onClick={clearSelectedPhotos}>Clear</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {['all','favorites','faces'].map(f=>(
          <button key={f} className={`tab-item${filter===f?' active':''}`} style={{flex:'0 0 auto'}} onClick={()=>setFilter(f)}>
            {f==='all'?`All Photos (${event.photos.length})`:f==='favorites'?`Favorites (${event.photos.filter(p=>p.favorite).length})`:'Face Tagged'}
          </button>
        ))}
      </div>

      {/* Upload drop zone */}
      <div className={`upload-zone${dragOver?' drag-over':''}`} style={{marginBottom:20}}
        onDragOver={e=>{e.preventDefault();setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={handleDrop}
        onClick={()=>fileInputRef.current?.click()}>
        <div style={{fontSize:40,marginBottom:12}}>📸</div>
        <div style={{fontSize:16,fontWeight:500,color:'var(--text-primary)',marginBottom:4}}>Drop photos here or click to upload</div>
        <div style={{fontSize:13,color:'var(--text-muted)'}}>Supports JPEG, PNG, RAW · Bulk upload supported</div>
        {uploadingCount>0&&(
          <div style={{marginTop:16}}>
            {Object.entries(uploadProgress).map(([id,{name,progress}])=>(
              <div key={id} style={{maxWidth:300,margin:'0 auto 8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{name}</span>
                  <span style={{fontSize:11,color:'var(--accent)'}}>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" multiple accept="image/*,.raw,.cr2,.nef,.arw" style={{display:'none'}} onChange={e=>handleFiles(e.target.files)}/>

      {/* Watermark banner */}
      {event.watermark&&(
        <div className="alert alert-warning" style={{marginBottom:16}}>
          <span>🏷</span>
          <div>
            <div style={{fontWeight:500}}>Watermark enabled: "{event.watermarkText}"</div>
            <div style={{fontSize:12,marginTop:2}}>All photos will be watermarked when downloaded by guests</div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length===0?(
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-muted)'}}>
          <div style={{fontSize:48,marginBottom:12}}>🖼</div>
          <div style={{fontSize:15,color:'var(--text-secondary)'}}>No photos yet</div>
          <div style={{fontSize:13,marginTop:4}}>Upload photos to get started</div>
        </div>
      ):(
        <div className="photo-grid">
          {photos.map((photo,i)=>(
            <div key={photo.id} className={`photo-thumb${selectedPhotos.includes(photo.id)?' selected':''} hover-group`}
              style={{animationDelay:`${Math.min(i*0.03,0.5)}s`}}
              onClick={()=>handlePhotoClick(photo)}>
              <img src={photo.thumb||photo.url} alt={photo.name} loading="lazy"/>
              <div className="overlay"/>
              {/* Favorite button */}
              <button className="hover-show" onClick={e=>{e.stopPropagation();toggleFavorite(event.id,photo.id)}}
                style={{position:'absolute',top:8,left:8,background:photo.favorite?'var(--accent)':'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:photo.favorite?'#0a0a0f':'white',fontSize:14}}>
                {photo.favorite?'★':'☆'}
              </button>
              {/* Watermark overlay */}
              {event.watermark&&(
                <div className="watermark-text" style={{bottom:8,right:8,fontSize:10,transform:'rotate(-15deg)'}}>
                  {event.watermarkText}
                </div>
              )}
              {/* File info on hover */}
              <div style={{position:'absolute',bottom:8,left:8,right:8}} className="hover-show">
                <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{photo.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showQR&&<QRModal event={event} onClose={()=>setShowQR(false)}/>}
      {showAddGuest&&<AddGuestModal event={event} onClose={()=>setShowAddGuest(false)}/>}
      {viewPhoto&&(
        <PhotoModal
          photo={viewPhoto} event={event}
          onClose={()=>setViewPhoto(null)}
          onFav={id=>{toggleFavorite(event.id,id);setViewPhoto(p=>p?{...p,favorite:!p.favorite}:p)}}
          onNext={()=>setViewPhoto(photos[(photoIdx+1)%photos.length])}
          onPrev={()=>setViewPhoto(photos[(photoIdx-1+photos.length)%photos.length])}
        />
      )}
    </div>
  );
}
