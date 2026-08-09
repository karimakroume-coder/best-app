import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag, usePinch } from '@use-gesture/react';
import ColorWheel from './ColorWheel';

const RANK_STYLES = {
  1:  { color: '#C9A84C', fontSize: '72px', fontWeight: 'bold' },
  2:  { color: '#A8A9AD', fontSize: '56px', fontWeight: 'bold' },
  3:  { color: '#A8A9AD', fontSize: '56px', fontWeight: 'bold' },
  10: { color: '#FFFFFF', fontSize: '42px', fontWeight: 'bold' },
  50: { color: '#777777', fontSize: '28px', fontWeight: 'normal' },
};

function getRankStyle(rank) {
  if (rank === 1)  return RANK_STYLES[1];
  if (rank <= 3)   return RANK_STYLES[2];
  if (rank <= 10)  return RANK_STYLES[10];
  if (rank <= 50)  return RANK_STYLES[50];
  return { color: '#444444', fontSize: '20px', fontWeight: 'light' };
}

function SpatialMap({ rankings, userId, onColorAssigned }) {
  const [currentRank, setCurrentRank]         = useState(1);
  const [zoomLevel, setZoomLevel]             = useState(1);
  const [dotState, setDotState]               = useState('single');
  const [showColorWheel, setShowColorWheel]   = useState(false);
  const [assignedColors, setAssignedColors]   = useState({});
  const [isRandomJump, setIsRandomJump]       = useState(false);
  const [randomRankDisplay, setRandomRankDisplay] = useState(null);
  const [slideDir, setSlideDir]               = useState(0);

  const currentVideo = rankings[currentRank - 1];
  const totalRanks   = rankings.length;

  // ── DOT FADE TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (dotState === 'single') {
      const t = setTimeout(() => setDotState('hidden'), 3000);
      return () => clearTimeout(t);
    }
  }, [dotState, currentRank]);

  // ── SHAKE TO RANDOM RANK ────────────────────────────────────────────────
  useEffect(() => {
    let lastTime = 0;
    let lastAcc  = 0;
    const onMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (!x) return;
      const acc = Math.abs(x) + Math.abs(y) + Math.abs(z);
      const now = Date.now();
      if (acc > 15 && acc !== lastAcc && now - lastTime > 1000) {
        lastTime = now; lastAcc = acc;
        triggerRandomJump();
      }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [totalRanks]);

  const triggerRandomJump = useCallback(() => {
    const target = Math.floor(Math.random() * totalRanks) + 1;
    setIsRandomJump(true);
    let count = 0;
    const interval = setInterval(() => {
      setRandomRankDisplay(Math.floor(Math.random() * totalRanks) + 1);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setRandomRankDisplay(null);
        setCurrentRank(target);
        setIsRandomJump(false);
        setDotState('single');
      }
    }, 80);
  }, [totalRanks]);

  // ── SLIDE ANIMATION ─────────────────────────────────────────────────────
  const [springs, api] = useSpring(() => ({ x: 0, opacity: 1 }));

  const navigateTo = useCallback((newRank) => {
    if (newRank < 1 || newRank > totalRanks) return;
    const dir = newRank > currentRank ? -1 : 1;
    api.start({ x: dir * 60, opacity: 0, immediate: false,
      config: { tension: 300, friction: 30 },
      onRest: () => {
        setCurrentRank(newRank);
        setDotState('single');
        setShowColorWheel(false);
        api.set({ x: -dir * 60, opacity: 0 });
        api.start({ x: 0, opacity: 1, config: { tension: 300, friction: 30 } });
      }
    });
  }, [currentRank, totalRanks, api]);

  // ── DRAG GESTURE ────────────────────────────────────────────────────────
  const bind = useDrag(({ last, direction: [dx, dy], distance: [distX, distY] }) => {
    if (!last) return;
    if (Math.abs(distX) > Math.abs(distY) && distX > 50) {
      if (dx < 0) navigateTo(currentRank + 1);
      else        navigateTo(currentRank - 1);
    }
  }, { filterTaps: true, threshold: 10 });

  // ── PINCH GESTURE ───────────────────────────────────────────────────────
  const pinchBind = usePinch(({ offset: [scale], last }) => {
    if (!last) return;
    if (scale < 0.7 && zoomLevel === 1) setZoomLevel(3);
    else if (scale < 0.7 && zoomLevel === 3) setZoomLevel(5);
    else if (scale > 1.3 && zoomLevel === 5) setZoomLevel(3);
    else if (scale > 1.3 && zoomLevel === 3) setZoomLevel(1);
  });

  const getColorHex = (name) => ({
    red:'#E74C3C', blue:'#2980B9', green:'#27AE60',
    yellow:'#F1C40F', black:'#2C2C2C', white:'#FFFFFF', gold:'#C9A84C'
  }[name] || '#555555');

  if (!currentVideo) return null;

  // ── WORLD BEST FORMATION ────────────────────────────────────────────────
  if (zoomLevel === 99) {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center' }}
           onClick={() => setZoomLevel(5)}>
        <div style={{ color:'#C9A84C', fontSize:'clamp(32px,8vw,80px)',
                      fontWeight:'bold', letterSpacing:'16px',
                      textShadow:'0 0 40px #C9A84C', textAlign:'center',
                      lineHeight:1.2 }}>
          WORLD<br/>BEST
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', maxWidth:'600px',
                      gap:'2px', marginTop:'32px', justifyContent:'center' }}>
          {rankings.slice(0, 50).map(v => (
            <div key={v.video_id}
                 onClick={(e) => { e.stopPropagation(); setCurrentRank(v.rank); setZoomLevel(1); }}
                 style={{ width:'32px', height:'18px', overflow:'hidden',
                          cursor:'pointer', borderRadius:'1px',
                          border:'1px solid #222' }}>
              {v.thumbnail_url &&
                <img src={v.thumbnail_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
            </div>
          ))}
        </div>
        <p style={{ color:'#333', fontSize:'11px', marginTop:'24px', letterSpacing:'3px' }}>
          TAP ANY VIDEO OR TAP BACKGROUND TO ZOOM IN
        </p>
      </div>
    );
  }

  // ── 5x5 LANDSCAPE ───────────────────────────────────────────────────────
  if (zoomLevel === 5) {
    const visible = rankings.slice(
      Math.max(0, currentRank - 13),
      Math.min(totalRanks, currentRank + 12)
    ).slice(0, 25);
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'grid', gridTemplateColumns:'repeat(5,1fr)',
                    gridTemplateRows:'repeat(5,1fr)', gap:'2px', padding:'2px' }}
           {...pinchBind()}>
        {visible.map(v => (
          <div key={v.video_id}
               onClick={() => { setCurrentRank(v.rank); setZoomLevel(1); }}
               style={{ position:'relative', overflow:'hidden', cursor:'pointer',
                        backgroundColor:'#111',
                        border: v.rank === currentRank ? '2px solid #C9A84C' : '1px solid #222' }}>
            {v.thumbnail_url &&
              <img src={v.thumbnail_url} alt=""
                   style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }} />}
            <div style={{ position:'absolute', top:'50%', left:'50%',
                          transform:'translate(-50%,-50%)', ...getRankStyle(v.rank),
                          fontSize: v.rank === currentRank ? '24px' : '14px' }}>
              #{v.rank}
            </div>
          </div>
        ))}
        <div style={{ position:'fixed', bottom:'20px', left:'50%',
                      transform:'translateX(-50%)', color:'#333',
                      fontSize:'10px', letterSpacing:'2px' }}>
          PINCH IN TO ZOOM · TAP TO SELECT
        </div>
      </div>
    );
  }

  // ── 3x3 MAP ─────────────────────────────────────────────────────────────
  if (zoomLevel === 3) {
    const center = currentRank - 1;
    const indices = [
      center-4, center-3, center-2,
      center-1, center,   center+1,
      center+2, center+3, center+4,
    ];
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                    gridTemplateRows:'repeat(3,1fr)', gap:'3px', padding:'3px',
                    touchAction:'none' }}
           {...pinchBind()}>
        {indices.map((idx, pos) => {
          const v = rankings[idx];
          const isCenter = pos === 4;
          const vol = isCenter ? 100 : [1,3,5,7].includes(pos) ? 30 : 10;
          return (
            <div key={idx} onClick={() => { if(v){ setCurrentRank(v.rank); setZoomLevel(1); }}}
                 style={{ position:'relative', overflow:'hidden', cursor:'pointer',
                          backgroundColor:'#111',
                          border: isCenter ? '2px solid #C9A84C' : '1px solid #222',
                          transform: isCenter ? 'scale(1.04)' : 'scale(1)',
                          transition:'transform 0.2s', zIndex: isCenter ? 2 : 1 }}>
              {v?.thumbnail_url &&
                <img src={v.thumbnail_url} alt=""
                     style={{ width:'100%', height:'100%', objectFit:'cover',
                              opacity: isCenter ? 0.85 : 0.4 }} />}
              {v && (
                <div style={{ position:'absolute', top:'50%', left:'50%',
                              transform:'translate(-50%,-50%)',
                              ...getRankStyle(v.rank),
                              fontSize: isCenter ? '28px' : '14px',
                              textShadow:'0 0 8px rgba(0,0,0,0.8)' }}>
                  #{v.rank}
                </div>
              )}
              {isCenter && (
                <div style={{ position:'absolute', bottom:'4px', right:'4px',
                              color:'#555', fontSize:'7px', letterSpacing:'1px' }}>
                  {vol}%
                </div>
              )}
            </div>
          );
        })}
        <div style={{ position:'fixed', bottom:'16px', left:'50%',
                      transform:'translateX(-50%)', color:'#333',
                      fontSize:'10px', letterSpacing:'2px' }}>
          PINCH IN TO FOCUS · TAP CARD TO SELECT
        </div>
      </div>
    );
  }

  // ── SINGLE CARD VIEW ────────────────────────────────────────────────────
  return (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                  position:'relative', overflow:'hidden', touchAction:'none',
                  userSelect:'none' }}
         {...bind()} {...pinchBind()}
         onDoubleClick={() => navigateTo(1)}
         onClick={() => { if(dotState === 'hidden') setDotState('single'); }}>

      {/* RANDOM JUMP DISPLAY */}
      {isRandomJump && (
        <div style={{ position:'absolute', inset:0, backgroundColor:'#0A0A0A',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:50 }}>
          <div style={{ color:'#C9A84C', fontSize:'120px', fontWeight:'bold',
                        fontFamily:'monospace', textShadow:'0 0 60px #C9A84C' }}>
            #{randomRankDisplay}
          </div>
        </div>
      )}

      {/* VIDEO CARD */}
      <animated.div style={{ ...springs, width:'100%', height:'100%',
                              display:'flex', flexDirection:'column',
                              alignItems:'center', justifyContent:'center' }}>

        {/* THUMBNAIL */}
        {currentVideo.thumbnail_url && (
          <div style={{ position:'absolute', inset:0 }}>
            <img src={currentVideo.thumbnail_url} alt=""
                 style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.25 }} />
            <div style={{ position:'absolute', inset:0,
                          background:'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)' }} />
          </div>
        )}

        {/* RANK NUMBER */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ ...getRankStyle(currentVideo.rank),
                        textShadow: currentVideo.rank === 1 ? '0 0 40px #C9A84C' : 'none',
                        animation: currentVideo.rank === 1 ? 'pulse 3s infinite' : 'none' }}>
            #{currentVideo.rank}
          </div>
          <div style={{ color:'#FFFFFF', fontSize:'16px', fontWeight:'bold',
                        marginTop:'8px', maxWidth:'320px', textAlign:'center',
                        textShadow:'0 0 20px rgba(0,0,0,0.8)', padding:'0 16px' }}>
            {currentVideo.title}
          </div>
          <div style={{ color:'#777', fontSize:'12px', marginTop:'4px',
                        letterSpacing:'1px' }}>
            {currentVideo.channel_name}
          </div>
          <div style={{ color:'#C9A84C', fontSize:'11px', marginTop:'8px',
                        letterSpacing:'2px' }}>
            BEST {currentVideo.total_score}
          </div>

          {/* ASSIGNED COLOR DOT */}
          {assignedColors[currentVideo.video_id] && (
            <div style={{ marginTop:'12px', display:'flex',
                          alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%',
                            backgroundColor: getColorHex(assignedColors[currentVideo.video_id]),
                            boxShadow:`0 0 8px ${getColorHex(assignedColors[currentVideo.video_id])}` }} />
              <span style={{ color:'#555', fontSize:'9px', letterSpacing:'2px' }}>
                {assignedColors[currentVideo.video_id].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* YOUTUBE LINK */}
        <div style={{ position:'absolute', bottom:'80px', left:'50%',
                      transform:'translateX(-50%)', zIndex:2 }}>
          <button
            onClick={(e) => { e.stopPropagation();
              window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
            style={{ backgroundColor:'transparent', border:'1px solid #333',
                     color:'#555', padding:'6px 16px', cursor:'pointer',
                     fontSize:'10px', letterSpacing:'2px' }}>
            WATCH ON YOUTUBE
          </button>
        </div>
      </animated.div>

      {/* NAVIGATION HINT */}
      <div style={{ position:'absolute', left:'16px', top:'50%',
                    transform:'translateY(-50%)', color:'#222',
                    fontSize:'24px', zIndex:3, pointerEvents:'none' }}>
        {currentRank > 1 ? '‹' : ''}
      </div>
      <div style={{ position:'absolute', right:'16px', top:'50%',
                    transform:'translateY(-50%)', color:'#222',
                    fontSize:'24px', zIndex:3, pointerEvents:'none' }}>
        {currentRank < totalRanks ? '›' : ''}
      </div>

      {/* ZOOM HINT */}
      <div style={{ position:'absolute', bottom:'20px', left:'50%',
                    transform:'translateX(-50%)', color:'#222',
                    fontSize:'9px', letterSpacing:'2px', zIndex:3 }}>
        PINCH TO ZOOM · SWIPE TO NAVIGATE · DOUBLE TAP FOR #1
      </div>

      {/* SHAKE BUTTON (desktop) */}
      <button
        onClick={(e) => { e.stopPropagation(); triggerRandomJump(); }}
        style={{ position:'absolute', top:'16px', left:'16px',
                 backgroundColor:'transparent', border:'1px solid #222',
                 color:'#333', padding:'4px 10px', cursor:'pointer',
                 fontSize:'9px', letterSpacing:'2px', zIndex:10 }}>
        RANDOM
      </button>

      {/* DOT UI */}
      {dotState !== 'hidden' && !showColorWheel && (
        <div style={{ position:'absolute', bottom:'120px', right:'24px', zIndex:10 }}>

          {dotState === 'single' && (
            <div onClick={(e) => { e.stopPropagation(); setDotState('three'); }}
                 style={{ width:'12px', height:'12px', borderRadius:'50%',
                          backgroundColor:'#FFFFFF', cursor:'pointer',
                          boxShadow:'0 0 8px rgba(255,255,255,0.5)',
                          animation:'fadeIn 0.3s ease' }} />
          )}

          {dotState === 'three' && (
            <div style={{ position:'relative', width:'80px', height:'80px' }}>
              {/* CENTER DOT */}
              <div style={{ position:'absolute', bottom:'0', right:'0',
                            width:'12px', height:'12px', borderRadius:'50%',
                            backgroundColor:'#FFFFFF',
                            boxShadow:'0 0 8px rgba(255,255,255,0.5)' }} />
              {/* LEFT DOT — COLOR */}
              <div
                onClick={(e) => { e.stopPropagation(); setShowColorWheel(true); setDotState('hidden'); }}
                style={{ position:'absolute', bottom:'32px', right:'40px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor:'#C9A84C', cursor:'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         fontSize:'14px', boxShadow:'0 0 12px rgba(201,168,76,0.6)',
                         animation:'popIn 0.3s ease' }}>
                🎨
              </div>
              {/* RIGHT DOT — WATCH */}
              <div
                onClick={(e) => { e.stopPropagation();
                  window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
                style={{ position:'absolute', bottom:'40px', right:'-16px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor:'#E74C3C', cursor:'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         fontSize:'14px', boxShadow:'0 0 12px rgba(231,76,60,0.6)',
                         animation:'popIn 0.3s ease' }}>
                ▶
              </div>
              {/* DISMISS */}
              <div onClick={(e) => { e.stopPropagation(); setDotState('single'); }}
                   style={{ position:'absolute', top:'-8px', right:'-8px',
                            color:'#333', fontSize:'10px', cursor:'pointer',
                            padding:'4px' }}>✕</div>
            </div>
          )}
        </div>
      )}

      {/* COLOR WHEEL OVERLAY */}
      {showColorWheel && (
        <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.85)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:20 }}
             onClick={() => { setShowColorWheel(false); setDotState('single'); }}>
          <div onClick={e => e.stopPropagation()}
               style={{ backgroundColor:'#111', borderRadius:'8px',
                        padding:'24px', border:'1px solid #333' }}>
            <p style={{ color:'#555', fontSize:'11px', letterSpacing:'3px',
                        textAlign:'center', marginBottom:'16px' }}>
              HOW DOES THIS VIDEO MAKE YOU FEEL
            </p>
            <ColorWheel
              videoId={currentVideo.video_id}
              userId={userId}
              onColorSelected={(color) => {
                setAssignedColors(prev => ({...prev, [currentVideo.video_id]: color.name}));
                if (onColorAssigned) onColorAssigned(currentVideo.video_id, color.name);
                setShowColorWheel(false);
                setDotState('single');
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 40px #C9A84C; }
          50%      { text-shadow: 0 0 80px #C9A84C, 0 0 120px #C9A84C; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
}

export default SpatialMap;