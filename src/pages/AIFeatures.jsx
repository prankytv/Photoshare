import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const DEMO_FACES = [
  {id:'f1',name:'Priya Sharma',count:23,avatar:'https://i.pravatar.cc/60?img=1',confidence:97},
  {id:'f2',name:'Rahul Kumar',count:18,avatar:'https://i.pravatar.cc/60?img=3',confidence:94},
  {id:'f3',name:'Anika Mehra',count:31,avatar:'https://i.pravatar.cc/60?img=5',confidence:99},
  {id:'f4',name:'Vikram Singh',count:14,avatar:'https://i.pravatar.cc/60?img=7',confidence:91},
  {id:'f5',name:'Deepa Nair',count:9,avatar:'https://i.pravatar.cc/60?img=9',confidence:88},
];

function FaceRecognitionDemo(){
  const {events,selectedEvent}=useApp();
  const event=selectedEvent||events[0];
  const [scanning,setScanning]=useState(false);
  const [scanProgress,setScanProgress]=useState(0);
  const [detected,setDetected]=useState([]);
  const [scanDone,setScanDone]=useState(false);

  const startScan=()=>{
    setScanning(true);setScanProgress(0);setDetected([]);setScanDone(false);
    let prog=0;
    const int=setInterval(()=>{
      prog+=Math.random()*8+3;
      if(prog>=100){
        prog=100;clearInterval(int);
        setDetected(DEMO_FACES);
        setScanning(false);setScanDone(true);
      }
      setScanProgress(Math.floor(prog));
    },120);
  };

  if(!event)return null;

  return(
    <div className="card" style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h3>Face Recognition</h3>
          <p style={{fontSize:13,marginTop:2}}>Automatically detect and group photos by person</p>
        </div>
        <span className="badge badge-gold">AI Feature</span>
      </div>

      {!scanDone&&!scanning&&(
        <div style={{textAlign:'center',padding:'32px 20px'}}>
          <div style={{fontSize:56,marginBottom:16}}>🔍</div>
          <div style={{fontSize:15,color:'var(--text-secondary)',marginBottom:6}}>Ready to scan {event.photos.length} photos</div>
          <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>AI will detect and group all faces automatically</div>
          <button className="btn btn-primary btn-lg" onClick={startScan}>Start Face Scan</button>
        </div>
      )}

      {scanning&&(
        <div style={{padding:'20px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <span className="spinner"/>
            <span style={{fontSize:14,color:'var(--text-secondary)'}}>Analyzing photos... {scanProgress}%</span>
          </div>
          <div className="progress-bar" style={{height:6}}>
            <div className="progress-fill" style={{width:`${scanProgress}%`,transition:'width 0.1s'}}/>
          </div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:8}}>Using AI to detect faces and match identities across photos</div>
        </div>
      )}

      {scanDone&&(
        <div className="animate-in">
          <div className="alert alert-success" style={{marginBottom:20}}>
            <span>✓</span>
            <div>Found <strong>{detected.length} people</strong> in {event.photos.length} photos. Grouped into person-specific galleries.</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {detected.map((face,i)=>(
              <div key={face.id} className={`animate-in stagger-${i+1}`} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-accent)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'}}>
                <img src={face.avatar} alt={face.name} style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--border-accent)'}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{face.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{face.count} photos · {face.confidence}% confidence</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-secondary btn-sm">View Photos</button>
                  <button className="btn btn-primary btn-sm">Send Link</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary mt-4" onClick={()=>{setScanDone(false);setDetected([])}}>Rescan</button>
        </div>
      )}
    </div>
  );
}

function SmartSharing(){
  const {events,selectedEvent,addNotification}=useApp();
  const event=selectedEvent||events[0];
  const [sending,setSending]=useState(false);
  const [sentTo,setSentTo]=useState([]);

  const sendPersonalized=(guest)=>{
    setSending(true);
    setTimeout(()=>{
      setSentTo(p=>[...p,guest.id]);
      setSending(false);
      addNotification(`Smart gallery link sent to ${guest.name}`,'success');
    },1200);
  };

  if(!event)return null;

  return(
    <div className="card" style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h3>Smart Photo Sharing</h3>
          <p style={{fontSize:13,marginTop:2}}>Send personalized galleries to each guest — only their photos</p>
        </div>
        <span className="badge badge-blue">AI Feature</span>
      </div>
      {event.guests.length===0?(
        <div style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>
          <div style={{fontSize:36,marginBottom:8}}>👥</div>
          <div>No guests added yet. Add guests to use smart sharing.</div>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {event.guests.map(guest=>(
            <div key={guest.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'var(--accent-light)',border:'1px solid var(--border-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'var(--accent)',flexShrink:0}}>{guest.name.charAt(0)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{guest.name}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{guest.phone}</div>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                {sentTo.includes(guest.id)&&<span className="badge badge-green">Sent ✓</span>}
                <button className="btn btn-primary btn-sm" onClick={()=>sendPersonalized(guest)} disabled={sending||sentTo.includes(guest.id)}>
                  {sending?<span className="spinner" style={{width:12,height:12}}/>:'📤 Send Photos'}
                </button>
              </div>
            </div>
          ))}
          {event.guests.length>0&&(
            <button className="btn btn-secondary mt-2" onClick={()=>{
              event.guests.forEach(g=>setTimeout(()=>sendPersonalized(g),Math.random()*1000));
              addNotification('Sending to all guests...','info');
            }}>📤 Send to All Guests</button>
          )}
        </div>
      )}
    </div>
  );
}

function AutoEnhancement(){
  const [enhanced,setEnhanced]=useState(false);
  const [running,setRunning]=useState(false);
  const {events}=useApp();
  const totalPhotos=events.reduce((a,e)=>a+e.photos.length,0);

  const run=()=>{
    setRunning(true);
    setTimeout(()=>{setRunning(false);setEnhanced(true)},2000);
  };

  return(
    <div className="card">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h3>Auto Enhancement</h3>
          <p style={{fontSize:13,marginTop:2}}>AI-powered color correction, noise reduction & sharpening</p>
        </div>
        <span className="badge badge-gold">AI Feature</span>
      </div>
      {!enhanced?(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:16}}>
            {[
              {icon:'🎨',label:'Color Grade'},
              {icon:'✨',label:'Denoise'},
              {icon:'🔆',label:'Exposure Fix'},
              {icon:'🎭',label:'Skin Smooth'},
              {icon:'📐',label:'Straighten'},
              {icon:'🌈',label:'HDR Tone'},
            ].map(f=>(
              <div key={f.label} style={{padding:'12px 8px',textAlign:'center',background:'var(--bg-glass)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)'}}>
                <div style={{fontSize:24,marginBottom:4}}>{f.icon}</div>
                <div style={{fontSize:12,color:'var(--text-secondary)'}}>{f.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-full" onClick={run} disabled={running}>
            {running?<><span className="spinner" style={{width:14,height:14}}/> Processing {totalPhotos} photos...</>:'✨ Auto Enhance All Photos'}
          </button>
        </div>
      ):(
        <div className="alert alert-success animate-in">
          <span>✓</span>
          <div>
            <div style={{fontWeight:500}}>Enhancement complete!</div>
            <div style={{fontSize:12,marginTop:2}}>{totalPhotos} photos enhanced with AI — color graded, denoised, and optimized.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIFeatures(){
  return(
    <div className="animate-in">
      <div style={{marginBottom:28}}>
        <div className="accent-line"/>
        <h2>AI Features</h2>
        <p style={{marginTop:4,fontSize:14}}>Smart tools powered by artificial intelligence to supercharge your workflow</p>
      </div>

      <div className="alert alert-warning" style={{marginBottom:24}}>
        <span>✦</span>
        <div>
          <div style={{fontWeight:500}}>Demo Mode</div>
          <div style={{fontSize:12,marginTop:2}}>These AI features are simulated for demonstration. In production, they connect to a Python FastAPI backend with TensorFlow face recognition.</div>
        </div>
      </div>

      <FaceRecognitionDemo/>
      <SmartSharing/>
      <AutoEnhancement/>
    </div>
  );
}
