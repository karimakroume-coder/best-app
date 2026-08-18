import React, { useState, useRef } from 'react';

const COLORS = [
  { name: 'red',    hex: '#E74C3C' },
  { name: 'blue',   hex: '#2980B9' },
  { name: 'green',  hex: '#27AE60' },
  { name: 'yellow', hex: '#F1C40F' },
  { name: 'black',  hex: '#1A1A1A' },
  { name: 'white',  hex: '#FFFFFF' },
  { name: 'gold',   hex: '#F0C040' },
];

const SLOT_H = 84;

function ColorOnboarding({ onComplete }) {
  const [order, setOrder] = useState(COLORS.map(c => c.name));
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);

  const handleTouchStart = (e, name) => {
    e.stopPropagation();
    startY.current = e.touches[0].clientY;
    setDragging(name);
    setDragOffset(0);
  };

  const handleTouchMove = (e, name) => {
    if (dragging !== name) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - startY.current;
    setDragOffset(dy);

    const fromIndex = order.indexOf(name);
    const rawTo = fromIndex + Math.round(dy / SLOT_H);
    const toIndex = Math.max(0, Math.min(order.length - 1, rawTo));
    if (toIndex !== fromIndex) {
      const next = [...order];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, name);
      setOrder(next);
      startY.current = e.touches[0].clientY - (toIndex - fromIndex) * SLOT_H;
      setDragOffset(e.touches[0].clientY - startY.current);
    }
  };

  const handleTouchEnd = (e, name) => {
    if (dragging !== name) return;
    setDragging(null);
    setDragOffset(0);
  };

  const handleConfirm = () => {
    localStorage.setItem('colorRanking', JSON.stringify(order));
    if (onComplete) onComplete();
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, backgroundColor:'#0D0800',
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', padding:'24px', boxSizing:'border-box' }}>
      <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'28px', color:'#F0C040',
                    letterSpacing:'4px', textAlign:'center' }}>
        HOW DO YOU SEE COLOR?
      </div>
      <div style={{ fontFamily:'Pacifico, cursive', fontSize:'14px', color:'#F5E6C8',
                    textAlign:'center', margin:'10px 0 24px' }}>
        Drag to rank — most to least important
      </div>

      <div style={{ width:'100%', maxWidth:'320px', height:`${order.length * SLOT_H}px`,
                    position:'relative', touchAction:'none' }}>
        {order.map((name, i) => {
          const color = COLORS.find(c => c.name === name);
          const isDragging = dragging === name;
          return (
            <div key={name}
              onTouchStart={(e) => handleTouchStart(e, name)}
              onTouchMove={(e) => handleTouchMove(e, name)}
              onTouchEnd={(e) => handleTouchEnd(e, name)}
              onTouchCancel={(e) => handleTouchEnd(e, name)}
              style={{ position:'absolute', left:0, right:0, top:i * SLOT_H,
                       display:'flex', flexDirection:'column', alignItems:'center',
                       justifyContent:'center', gap:'6px', height:SLOT_H,
                       transform: isDragging ? `translateY(${dragOffset}px)` : 'none',
                       transition: isDragging ? 'none' : 'transform 0.15s ease',
                       zIndex: isDragging ? 10 : 1 }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%',
                            backgroundColor: color.hex,
                            border:'2px solid #F0C040',
                            boxShadow: isDragging ? '0 0 24px rgba(240,192,64,0.9)' : '0 0 8px rgba(0,0,0,0.5)' }} />
              <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'11px',
                            color:'#F0C040', letterSpacing:'2px' }}>
                {name.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleConfirm}
        onTouchEnd={(e) => { e.preventDefault(); handleConfirm(); }}
        style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'16px', letterSpacing:'4px',
                 color:'#0D0800', backgroundColor:'#F0C040', border:'none', borderRadius:0,
                 padding:'14px 48px', marginTop:'28px', cursor:'pointer',
                 minWidth:'44px', minHeight:'44px' }}>
        CONFIRM
      </button>
    </div>
  );
}

export default ColorOnboarding;
