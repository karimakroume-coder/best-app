import React, { useState } from 'react';

const COLORS = [
  { name:'red',    hex:'#E74C3C' },
  { name:'blue',   hex:'#2980B9' },
  { name:'green',  hex:'#27AE60' },
  { name:'yellow', hex:'#F1C40F' },
  { name:'black',  hex:'#1A1A1A' },
  { name:'white',  hex:'#FFFFFF' },
  { name:'gold',   hex:'#C8A951' }
];

export default function ColorOnboarding({ onComplete }) {
  const [order, setOrder] = useState(COLORS);
  const [dragging, setDragging] = useState(null);

  const handleTouchStart = (e, idx) => {
    setDragging({ idx, startY: e.touches[0].clientY });
  };

  const handleTouchEnd = (e, idx) => {
    if (!dragging) return;
    const deltaY = e.changedTouches[0].clientY - dragging.startY;
    const steps = Math.round(deltaY / 70);
    if (steps !== 0) {
      const newOrder = [...order];
      const item = newOrder.splice(dragging.idx, 1)[0];
      const newIdx = Math.max(0, Math.min(6, dragging.idx + steps));
      newOrder.splice(newIdx, 0, item);
      setOrder(newOrder);
    }
    setDragging(null);
  };

  const handleConfirm = () => {
    localStorage.setItem('colorRanking',
      JSON.stringify(order.map(c => c.name)));
    onComplete();
  };

  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'#0D0800',
                  zIndex:500, display:'flex', flexDirection:'column',
                  alignItems:'center', overflowY:'auto', paddingBottom:40 }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28,
                    color:'#C8A951', letterSpacing:4, marginTop:60,
                    textAlign:'center' }}>
        HOW DO YOU SEE COLOR?
      </div>
      <div style={{ fontFamily:'Pacifico,cursive', fontSize:14,
                    color:'#F5E6C8', marginTop:12, textAlign:'center',
                    padding:'0 24px' }}>
        Drag to rank — most to least important
      </div>
      <div style={{ marginTop:32, width:'100%', maxWidth:300 }}>
        {order.map((color, idx) => (
          <div key={color.name}
               onTouchStart={(e) => handleTouchStart(e, idx)}
               onTouchEnd={(e) => handleTouchEnd(e, idx)}
               style={{ display:'flex', alignItems:'center', gap:16,
                        padding:'10px 24px', cursor:'grab',
                        opacity: dragging?.idx === idx ? 0.5 : 1,
                        transition:'opacity 0.2s' }}>
            <div style={{ width:52, height:52, borderRadius:'50%',
                          backgroundColor: color.hex, flexShrink:0,
                          border: color.name==='black' ? '1px solid #333' :
                                  color.name==='white' ? '1px solid #555' : 'none',
                          boxShadow: color.name==='gold' ?
                            '0 0 8px rgba(200,169,81,0.5)' : 'none' }} />
            <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13,
                           color:'#C8A951', letterSpacing:3 }}>
              {color.name.toUpperCase()}
            </span>
            <span style={{ marginLeft:'auto', color:'#333', fontSize:12 }}>☰</span>
          </div>
        ))}
      </div>
      <button onClick={handleConfirm}
              onTouchEnd={(e) => { e.preventDefault(); handleConfirm(); }}
              style={{ marginTop:32, fontFamily:'Bebas Neue,sans-serif',
                       fontSize:16, letterSpacing:4, color:'#0D0800',
                       backgroundColor:'#C8A951', border:'none',
                       borderRadius:0, padding:'14px 48px',
                       minHeight:44, cursor:'pointer' }}>
        CONFIRM MY RANKING
      </button>
    </div>
  );
}
