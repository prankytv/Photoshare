import React from 'react';
import { useApp } from '../context/AppContext';

export default function Notifications(){
  const {notifications}=useApp();
  if(!notifications.length)return null;
  return(
    <div style={{position:'fixed',top:20,right:20,zIndex:999,display:'flex',flexDirection:'column',gap:8}}>
      {notifications.map(n=>(
        <div key={n.id} className="animate-in" style={{
          padding:'12px 16px',
          borderRadius:'var(--radius-sm)',
          background:n.type==='error'?'rgba(248,113,113,0.15)':n.type==='info'?'rgba(96,165,250,0.15)':'rgba(74,222,128,0.15)',
          border:`1px solid ${n.type==='error'?'rgba(248,113,113,0.3)':n.type==='info'?'rgba(96,165,250,0.3)':'rgba(74,222,128,0.3)'}`,
          color:n.type==='error'?'var(--danger)':n.type==='info'?'var(--info)':'var(--success)',
          fontSize:13,fontWeight:500,
          maxWidth:320,
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter:'blur(8px)',
        }}>
          {n.type==='error'?'✕ ':n.type==='info'?'ℹ ':''}{n.msg}
        </div>
      ))}
    </div>
  );
}
