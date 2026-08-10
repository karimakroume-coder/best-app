import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

const CHARS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
const SLOT = 56;
const IDLE_MS = 5000;

function StripKeyboard({ color, onConfirm }) {
  const [word, setWord]                       = useState('');
  const [scrollLeft, setScrollLeft]            = useState(0);
  const [containerWidth, setContainerWidth]    = useState(360);
  const [useNormalKeyboard, setUseNormalKeyboard] = useState(false);

  const containerRef = useRef(null);
  const idleTimerRef  = useRef(null);
  const rafRef        = useRef(null);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const resetIdleTimer = useCallback((currentWord) => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (currentWord.length === 0) return;
    idleTimerRef.current = setTimeout(() => onConfirm(currentWord), IDLE_MS);
  }, [onConfirm]);

  useEffect(() => () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const addLetter = (ch) => {
    setWord(w => {
      const next = (w + ch).slice(0, 20);
      resetIdleTimer(next);
      return next;
    });
  };

  const deleteLast = () => {
    setWord(w => {
      const next = w.slice(0, -1);
      resetIdleTimer(next);
      return next;
    });
  };

  const confirmNow = () => {
    if (word.length === 0) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    onConfirm(word);
  };

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrollLeft(containerRef.current ? containerRef.current.scrollLeft : 0);
      rafRef.current = null;
    });
  };

  const selectedIndex = Math.max(0, Math.min(CHARS.length - 1, Math.round(scrollLeft / SLOT)));

  const wordDrag = useDrag(({ last, direction: [dx], distance: [distX] }) => {
    if (!last) return;
    if (dx < 0 && distX > 40) deleteLast();
  }, { filterTaps: true, threshold: 10 });

  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center' }}>

      {/* WORD DISPLAY */}
      <div {...wordDrag()}
           onClick={confirmNow}
           style={{ color:'#FFFFFF', fontSize:'48px', fontWeight:'bold', letterSpacing:'4px',
                    minHeight:'60px', cursor: word ? 'pointer' : 'default',
                    textShadow:'0 0 30px rgba(0,0,0,0.6)', userSelect:'none',
                    touchAction:'none', textAlign:'center' }}>
        {word || ' '}
      </div>
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'9px', letterSpacing:'2px', marginTop:'4px' }}>
        {word ? 'TAP WORD TO CONFIRM · SWIPE LEFT TO DELETE' : 'SCROLL TO FIND A LETTER'}
      </p>

      {/* STRIP OR NORMAL KEYBOARD */}
      {!useNormalKeyboard ? (
        <>
          <div style={{ position:'absolute', bottom:'80px', left:0, width:'2px', height:'70px',
                        backgroundColor: color, opacity:0.6, pointerEvents:'none' }} />
          <div ref={containerRef} onScroll={handleScroll}
               style={{ position:'absolute', bottom:'80px', left:0, right:0, height:'70px',
                        display:'flex', alignItems:'flex-end', overflowX:'auto', overflowY:'hidden',
                        scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch' }}>
            {CHARS.map((ch, i) => {
              const vx = i * SLOT + SLOT / 2 - scrollLeft;
              const size = Math.max(8, Math.min(48, 48 - (vx / containerWidth) * 40));
              const isSelected = i === selectedIndex;
              return (
                <div key={ch} onClick={() => addLetter(ch)}
                     style={{ width:`${SLOT}px`, minWidth:`${SLOT}px`, flexShrink:0,
                              scrollSnapAlign:'start', display:'flex', alignItems:'flex-end',
                              justifyContent:'center', height:'70px', cursor:'pointer' }}>
                  <span style={{ fontSize:`${size}px`, fontWeight:'bold', lineHeight:1,
                                 color: isSelected ? color : '#FFFFFF',
                                 opacity: isSelected ? 1 : 0.5,
                                 textShadow: isSelected ? `0 0 16px ${color}` : 'none' }}>
                    {ch}
                  </span>
                </div>
              );
            })}
            <div style={{ width:`${containerWidth}px`, flexShrink:0 }} />
          </div>
        </>
      ) : (
        <input
          autoFocus
          value={word}
          maxLength={20}
          onChange={(e) => {
            const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setWord(v);
            resetIdleTimer(v);
          }}
          style={{ position:'absolute', bottom:'90px', left:'50%', transform:'translateX(-50%)',
                   width:'70%', backgroundColor:'transparent', border:'none',
                   borderBottom:`2px solid ${color}`, color:'#FFFFFF', fontSize:'20px',
                   textAlign:'center', letterSpacing:'2px', outline:'none' }}
        />
      )}

      {/* ABC / STRIP TOGGLE */}
      <button
        onClick={() => setUseNormalKeyboard(v => !v)}
        style={{ position:'absolute', bottom:'16px', right:'16px',
                 backgroundColor:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.3)',
                 color:'#FFFFFF', padding:'6px 12px', cursor:'pointer',
                 fontSize:'10px', letterSpacing:'2px', borderRadius:'4px' }}>
        {useNormalKeyboard ? 'STRIP' : 'ABC'}
      </button>
    </div>
  );
}

export default StripKeyboard;
