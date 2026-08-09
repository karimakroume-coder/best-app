code = r"""import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag, usePinch } from '@use-gesture/react';
import ColorWheel from './ColorWheel';

function getRankStyle(rank) {
  if (rank === 1)  return { color: '#C9A84C', fontSize: '72px', fontWeight: 'bold' };
  if (rank <= 3)   return { color: '#A8A9AD', fontSize: '56px', fontWeight: 'bold' };
  if (rank <= 10)  return { color: '#FFFFFF', fontSize: '42px', fontWeight: 'bold' };
  if (rank <= 50)  return { color: '#777777', fontSize: '28px', fontWeight: 'normal' };
  return { color: '#444444', fontSize: '20px', fontWeight: 'lighter' };
}

function SpatialMap({ rankings, userId, onColorAssigned }) {
  const [currentRank, setCurrentRank]       = useState(1);
  const [zoomLevel, setZoomLevel]           = useState(1);
  const [dotState, setDotState]             = useState('single');
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [assignedColors, setAssignedColors] = useState({});
  const [isRandomJump, setIsRandomJump]     = useState(false);
  const [randomDisplay, setRandomDisplay]   = useState(null);

  const currentVideo = rankings[currentRank - 1];
  const totalRanks   = rankings.length;

  useEffect(() => {
    if (dotState === 'single') {
      const t = setTimeout(() => setDotState('hidden'), 3000);
      return () => clearTimeout(t);
    }
  }, [dotState, currentRank]);

  const triggerRandomJump = useCallback(() => {
    const target = Math.floor(Math.random() * totalRanks) + 1;
    setIsRandomJump(true);
    let count = 0;
    const interval = setInterval(() => {
      setRandomDisplay(Math.floor(Math.random() * totalRanks) + 1);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setRandomDisplay(null);
        setCurrentRank(target);
        setIsRandomJump(false);
        setDotState('single');
      }
    }, 80);
  }, [totalRanks]);

  const [springs, api] = useSpring(() => ({ x: 0, opacity: 1 }));

  const navigateTo = useCallback((newRank) => {
    if (newRank < 1 || newRank > totalRanks) return;
    const dir = newRank > currentRank ? -1 : 1;
    api.start({
      x: dir * 60, opacity: 0,
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

  const bind = useDrag(({ last, direction: [dx, dy], distance: [distX] }) => {
    if (!last) return;
    if (distX > 50) {
      if (dx < 0) navigateTo(currentRank + 1);
      else navigateTo(currentRank - 1);
    }
  }, { filterTaps: true, threshold: 10 });

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

  if (zoomLevel === 5) {
    const visible = rankings.slice(Math.max(0, currentRank-13), currentRank+12).slice(0,25);
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
                        border: v.rank===currentRank ? '2px solid #C9A84C':'1px solid #222' }}>
            {v.thumbnail_url && <img src={v.thumbnail_url} alt=""
              style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />}
            <div style={{ position:'absolute', top:'50%', left:'50%',
                          transform:'translate(-50%,-50%)', ...getRankStyle(v.rank),
                          fontSize: v.rank===currentRank ? '20px':'12px' }}>
              #{v.rank}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (zoomLevel === 3) {
    const center = currentRank - 1;
    const indices = [center-4,center-3,center-2,center-1,center,center+1,center+2,center+3,center+4];
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                    gridTemplateRows:'repeat(3,1fr)', gap:'3px', padding:'3px',
                    touchAction:'none' }}
           {...pinchBind()}>
        {indices.map((idx, pos) => {
          const v = rankings[idx];
          const isCenter = pos === 4;
          return (
            <div key={idx}
                 onClick={() => { if(v){ setCurrentRank(v.rank); setZoomLevel(1); }}}
                 style={{ position:'relative', overflow:'hidden', cursor:'pointer',
                          backgroundColor:'#111',
                          border: isCenter ? '2px solid #C9A84C':'1px solid #222',
                          transform: isCenter ? 'scale(1.04)':'scale(1)',
                          transition:'transform 0.2s', zIndex: isCenter ? 2:1 }}>
              {v?.thumbnail_url && <img src={v.thumbnail_url} alt=""
                style={{ width:'100%', height:'100%', objectFit:'cover',
                         opacity: isCenter ? 0.85:0.4 }} />}
              {v && <div style={{ position:'absolute', top:'50%', left:'50%',
                                  transform:'translate(-50%,-50%)', ...getRankStyle(v.rank),
                                  fontSize: isCenter ? '28px':'14px',
                                  textShadow:'0 0 8px rgba(0,0,0,0.8)' }}>
                #{v.rank}
              </div>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                  position:'relative', overflow:'hidden',
                  touchAction:'none', userSelect:'none' }}
         {...bind()} {...pinchBind()}
         onDoubleClick={() => navigateTo(1)}
         onClick={() => { if(dotState==='hidden') setDotState('single'); }}>

      {isRandomJump && (
        <div style={{ position:'absolute', inset:0, backgroundColor:'#0A0A0A',
                      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ color:'#C9A84C', fontSize:'120px', fontWeight:'bold',
                        fontFamily:'monospace', textShadow:'0 0 60px #C9A84C' }}>
            #{randomDisplay}
          </div>
        </div>
      )}

      <animated.div style={{ ...springs, width:'100%', height:'100%',
                              display:'flex', flexDirection:'column',
                              alignItems:'center', justifyContent:'center' }}>
        {currentVideo.thumbnail_url && (
          <div style={{ position:'absolute', inset:0 }}>
            <img src={currentVideo.thumbnail_url} alt=""
                 style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.25 }} />
            <div style={{ position:'absolute', inset:0,
                          background:'linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,0.8))' }} />
          </div>
        )}

        <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ ...getRankStyle(currentVideo.rank),
                        textShadow: currentVideo.rank===1 ? '0 0 40px #C9A84C':'none' }}>
            #{currentVideo.rank}
          </div>
          <div style={{ color:'#FFFFFF', fontSize:'16px', fontWeight:'bold',
                        marginTop:'8px', maxWidth:'320px', textAlign:'center', padding:'0 16px' }}>
            {currentVideo.title}
          </div>
          <div style={{ color:'#777', fontSize:'12px', marginTop:'4px', letterSpacing:'1px' }}>
            {currentVideo.channel_name}
          </div>
          <div style={{ color:'#C9A84C', fontSize:'11px', marginTop:'8px', letterSpacing:'2px' }}>
            BEST {currentVideo.total_score}
          </div>
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

        <div style={{ position:'absolute', bottom:'80px', left:'50%',
                      transform:'translateX(-50%)', zIndex:2 }}>
          <button onClick={(e) => { e.stopPropagation();
            window.open('https://youtube.com/watch?v=' + currentVideo.video_id, '_blank'); }}
            style={{ backgroundColor:'transparent', border:'1px solid #333',
                     color:'#555', padding:'6px 16px', cursor:'pointer',
                     fontSize:'10px', letterSpacing:'2px' }}>
            WATCH ON YOUTUBE
          </button>
        </div>
      </animated.div>

      <button onClick={(e) => { e.stopPropagation(); triggerRandomJump(); }}
        style={{ position:'absolute', top:'64px', left:'16px',
                 backgroundColor:'transparent', border:'1px solid #222',
                 color:'#333', padding:'4px 10px', cursor:'pointer',
                 fontSize:'9px', letterSpacing:'2px', zIndex:10 }}>
        RANDOM
      </button>

      <div style={{ position:'absolute', bottom:'20px', left:'50%',
                    transform:'translateX(-50%)', color:'#222',
                    fontSize:'9px', letterSpacing:'2px', zIndex:3 }}>
        SWIPE TO NAVIGATE · PINCH TO ZOOM · DOUBLE TAP FOR #1
      </div>

      {dotState !== 'hidden' && !showColorWheel && (
        <div style={{ position:'absolute', bottom:'120px', right:'24px', zIndex:10 }}>
          {dotState === 'single' && (
            <div onClick={(e) => { e.stopPropagation(); setDotState('three'); }}
                 style={{ width:'12px', height:'12px', borderRadius:'50%',
                          backgroundColor:'#FFFFFF', cursor:'pointer',
                          boxShadow:'0 0 8px rgba(255,255,255,0.5)' }} />
          )}
          {dotState === 'three' && (
            <div style={{ position:'relative', width:'80px', height:'80px' }}>
              <div style={{ position:'absolute', bottom:'0', right:'0',
                            width:'12px', height:'12px', borderRadius:'50%',
                            backgroundColor:'#FFFFFF' }} />
              <div onClick={(e) => { e.stopPropagation();
                                     setShowColorWheel(true); setDotState('hidden'); }}
                   style={{ position:'absolute', bottom:'32px', right:'40px',
                            width:'28px', height:'28px', borderRadius:'50%',
                            backgroundColor:'#C9A84C', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'14px' }}>
                🎨
              </div>
              <div onClick={(e) => { e.stopPropagation();
                window.open('https://youtube.com/watch?v=' + currentVideo.video_id, '_blank'); }}
                   style={{ position:'absolute', bottom:'40px', right:'-16px',
                            width:'28px', height:'28px', borderRadius:'50%',
                            backgroundColor:'#E74C3C', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'14px' }}>
                ▶
              </div>
              <div onClick={(e) => { e.stopPropagation(); setDotState('single'); }}
                   style={{ position:'absolute', top:'-8px', right:'-8px',
                            color:'#333', fontSize:'10px', cursor:'pointer', padding:'4px' }}>
                ✕
              </div>
            </div>
          )}
        </div>
      )}

      {showColorWheel && (
        <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.85)',
                      display:'flex', alignItems:'center', justifyContent:'center', zIndex:20 }}
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
    </div>
  );
}

export default SpatialMap;
"""

with open(r'C:\Users\karim\Documents\BEST APP\frontend\src\SpatialMap.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("SpatialMap.js written:", len(code), "characters")