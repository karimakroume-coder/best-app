import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// ── PERMANENT COORDINATE GRID ─────────────────────────────────────────────
// Diamond spiral: ring d holds every (x,y) with |x|+|y|=d. Ring 0 is rank 1.
// Each ring is emitted axis points first (E,W,N,S) then the remaining
// points quadrant by quadrant, so ranks 2-5 land exactly on (1,0),(-1,0),
// (0,1),(0,-1) as specified.
function buildSpiralCoords(count) {
  const rankToCoord = {};
  const coordToRank = {};
  if (count <= 0) return { rankToCoord, coordToRank };
  rankToCoord[1] = { x: 0, y: 0 };
  coordToRank['0,0'] = 1;
  let rank = 2;
  let d = 1;
  while (rank <= count) {
    const ring = [
      { x: d, y: 0 }, { x: -d, y: 0 }, { x: 0, y: d }, { x: 0, y: -d },
    ];
    for (const qx of [1, -1]) {
      for (const qy of [1, -1]) {
        for (let k = 1; k < d; k++) {
          ring.push({ x: qx * (d - k), y: qy * k });
        }
      }
    }
    for (const pt of ring) {
      if (rank > count) break;
      const key = `${pt.x},${pt.y}`;
      if (coordToRank[key] !== undefined) continue;
      coordToRank[key] = rank;
      rankToCoord[rank] = pt;
      rank++;
    }
    d++;
  }
  return { rankToCoord, coordToRank };
}

// ── WORLD BEST LETTER FORMATION ───────────────────────────────────────────
// Minimal 3x5 block font. Cells are flattened in reading order (row-major
// across both words) so the first N cells are handed to the top N ranked
// videos — with only 50 thumbnails available, "WORLD" fills completely and
// "BEST" fills as far as the remaining cards allow.
const FONT = {
  W: ['1.1', '1.1', '1.1', '.1.', '.1.'],
  O: ['.1.', '1.1', '1.1', '1.1', '.1.'],
  R: ['11.', '1.1', '11.', '1.1', '1..'],
  L: ['1..', '1..', '1..', '1..', '111'],
  D: ['11.', '1.1', '1.1', '1.1', '11.'],
  B: ['11.', '1.1', '11.', '1.1', '11.'],
  E: ['111', '1..', '11.', '1..', '111'],
  S: ['.11', '1..', '.1.', '..1', '11.'],
  T: ['111', '.1.', '.1.', '.1.', '.1.'],
};
const GLYPH_W = 3, GLYPH_H = 5, GLYPH_GAP = 1, ROW_GAP = 1;

function buildLetterCells() {
  const words = ['WORLD', 'BEST'];
  const widths = words.map(w => w.length * (GLYPH_W + GLYPH_GAP) - GLYPH_GAP);
  const maxWidth = Math.max(...widths);
  const totalRows = words.length * GLYPH_H + (words.length - 1) * ROW_GAP;
  const cells = [];
  words.forEach((word, wIdx) => {
    const startCol = Math.floor((maxWidth - widths[wIdx]) / 2);
    const startRow = wIdx * (GLYPH_H + ROW_GAP);
    [...word].forEach((letter, lIdx) => {
      const glyph = FONT[letter];
      if (!glyph) return;
      const colOffset = startCol + lIdx * (GLYPH_W + GLYPH_GAP);
      glyph.forEach((rowStr, r) => {
        [...rowStr].forEach((ch, c) => {
          if (ch === '1') cells.push({ col: colOffset + c, row: startRow + r });
        });
      });
    });
  });
  cells.sort((a, b) => a.row - b.row || a.col - b.col);
  return { cells, maxWidth, totalRows };
}

const LETTER_LAYOUT = buildLetterCells();

function letterPositionForIndex(i) {
  const { cells, maxWidth, totalRows } = LETTER_LAYOUT;
  const cell = cells[i];
  if (!cell) return null;
  return {
    x: 12 + ((cell.col + 0.5) / maxWidth) * 76,
    y: 30 + ((cell.row + 0.5) / totalRows) * 55,
  };
}

const zoomButtonStyle = {
  position: 'absolute', top: '64px', right: '16px',
  backgroundColor: '#0A0A0A', border: '1px solid #444',
  color: '#AAA', padding: '4px 10px', cursor: 'pointer',
  fontSize: '9px', letterSpacing: '2px', zIndex: 110,
};

function SpatialMap({ rankings, userId, onColorAssigned }) {
  const [currentX, setCurrentX]               = useState(0);
  const [currentY, setCurrentY]                = useState(0);
  const [zoomLevel, setZoomLevel]              = useState(1);
  const [dotState, setDotState]                = useState('single');
  const [showColorWheel, setShowColorWheel]    = useState(false);
  const [assignedColors, setAssignedColors]    = useState({});
  const [isDropping, setIsDropping]            = useState(true);
  const [dropTargetRank, setDropTargetRank]    = useState(null);

  const totalRanks = rankings.length;

  const { rankToCoord, coordToRank } = useMemo(
    () => buildSpiralCoords(totalRanks),
    [totalRanks]
  );

  const currentRank  = coordToRank[`${currentX},${currentY}`];
  const currentVideo = currentRank ? rankings[currentRank - 1] : null;

  // Top-50 cards with both their permanent grid position and their target
  // letter position, normalized into the same 0-100% screen space.
  const gridLetterData = useMemo(() => {
    const top = rankings.slice(0, 50);
    if (top.length === 0) return [];
    let maxAbs = 1;
    top.forEach(v => {
      const c = rankToCoord[v.rank];
      if (c) maxAbs = Math.max(maxAbs, Math.abs(c.x), Math.abs(c.y));
    });
    const cellPct = 38 / maxAbs;
    return top.map((v, i) => {
      const c = rankToCoord[v.rank] || { x: 0, y: 0 };
      const grid = { x: 50 + c.x * cellPct, y: 50 - c.y * cellPct };
      const letter = letterPositionForIndex(i);
      return { video: v, grid, letter: letter || grid };
    });
  }, [rankings, rankToCoord]);

  // ── DOT FADE TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (dotState === 'single') {
      const t = setTimeout(() => setDotState('hidden'), 3000);
      return () => clearTimeout(t);
    }
  }, [dotState, currentRank]);

  // ── SLIDE ANIMATION ─────────────────────────────────────────────────────
  const [springs, api] = useSpring(() => ({ x: 0, y: 0, opacity: 1 }));

  const navigateToCoord = useCallback((nx, ny) => {
    const rank = coordToRank[`${nx},${ny}`];
    if (!rank) return;
    const dx = nx - currentX, dy = ny - currentY;
    const outX = dx !== 0 ? (dx > 0 ? -60 : 60) : 0;
    const outY = dy !== 0 ? (dy > 0 ? -60 : 60) : 0;
    api.start({ x: outX, y: outY, opacity: 0, immediate: false,
      config: { tension: 300, friction: 30 },
      onRest: () => {
        setCurrentX(nx);
        setCurrentY(ny);
        setDotState('single');
        setShowColorWheel(false);
        api.set({ x: -outX, y: -outY, opacity: 0 });
        api.start({ x: 0, y: 0, opacity: 1, config: { tension: 300, friction: 30 } });
      }
    });
  }, [currentX, currentY, coordToRank, api]);

  // ── DROP ANIMATION (cinematic camera fall onto a rank) ──────────────────
  const [dropSpring, dropApi] = useSpring(() => ({ p: 0 }));

  const playDropAnimation = useCallback((targetRank) => {
    if (!targetRank) return;
    setDropTargetRank(targetRank);
    setShowColorWheel(false);
    setIsDropping(true);
    dropApi.set({ p: 0 });
    dropApi.start({
      p: 0.7,
      config: { tension: 40, friction: 8 },
      onRest: () => {
        dropApi.start({
          p: 1,
          config: { tension: 400, friction: 20 },
          onRest: () => {
            const coord = rankToCoord[targetRank];
            if (coord) { setCurrentX(coord.x); setCurrentY(coord.y); }
            setZoomLevel(1);
            setDotState('single');
            setIsDropping(false);
          }
        });
      }
    });
  }, [dropApi, rankToCoord]);

  // ── MOUNT: initial drop onto a random rank ──────────────────────────────
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStartedRef.current && totalRanks > 0) {
      hasStartedRef.current = true;
      playDropAnimation(Math.floor(Math.random() * totalRanks) + 1);
    }
  }, [totalRanks, playDropAnimation]);

  // ── SHAKE TO RANDOM DROP ────────────────────────────────────────────────
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
        playDropAnimation(Math.floor(Math.random() * totalRanks) + 1);
      }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [totalRanks, playDropAnimation]);

  // ── DRAG GESTURE (moves position on the coordinate grid) ────────────────
  const bind = useDrag(({ last, direction: [dx, dy], distance: [distX, distY] }) => {
    if (!last) return;
    if (Math.abs(distX) > Math.abs(distY) && distX > 50) {
      navigateToCoord(currentX + (dx < 0 ? 1 : -1), currentY);
    } else if (Math.abs(distY) > Math.abs(distX) && distY > 50) {
      navigateToCoord(currentX, currentY + (dy < 0 ? 1 : -1));
    }
  }, { filterTaps: true, threshold: 10 });

  // ── PINCH GESTURE (zoom level only) ─────────────────────────────────────
  const pinchBind = usePinch(({ offset: [scale], last }) => {
    if (!last) return;
    if (scale < 0.7 && zoomLevel === 1) setZoomLevel(3);
    else if (scale < 0.7 && zoomLevel === 3) setZoomLevel(5);
    else if (scale > 1.3 && zoomLevel === 5) setZoomLevel(3);
    else if (scale > 1.3 && zoomLevel === 3) setZoomLevel(1);
  });

  const cycleZoom = useCallback(() => {
    setZoomLevel(prev => prev === 1 ? 3 : prev === 3 ? 5 : prev === 5 ? 99 : 1);
  }, []);

  const getColorHex = (name) => ({
    red:'#E74C3C', blue:'#2980B9', green:'#27AE60',
    yellow:'#F1C40F', black:'#2C2C2C', white:'#FFFFFF', gold:'#C9A84C'
  }[name] || '#555555');

  // ── SHARED FORMATION RENDERER (zoomLevel 5 blend + zoomLevel 99 lock) ───
  const renderFormation = (blend, onCardClick, hintText) => (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                  position:'relative', overflow:'hidden', touchAction:'none' }}
         {...pinchBind()}>
      <button onClick={(e) => { e.stopPropagation(); cycleZoom(); }} style={zoomButtonStyle}>
        ZOOM {zoomLevel}×
      </button>

      <div style={{ position:'absolute', top:'64px', left:'50%', transform:'translateX(-50%)',
                    color:'#C9A84C', fontSize:'clamp(24px,6vw,56px)', fontWeight:'bold',
                    letterSpacing:'12px', textAlign:'center', lineHeight:1.2,
                    opacity: blend, transition:'opacity 0.6s ease',
                    animation: blend >= 1 ? 'goldPulse 3s ease-in-out infinite' : 'none' }}>
        WORLD<br/>BEST
      </div>

      {gridLetterData.map(({ video, grid, letter }) => {
        const x = grid.x + (letter.x - grid.x) * blend;
        const y = grid.y + (letter.y - grid.y) * blend;
        return (
          <div key={video.video_id}
               onClick={(e) => { e.stopPropagation(); onCardClick(video); }}
               style={{ position:'absolute', left:`${x}%`, top:`${y}%`,
                        transform:'translate(-50%,-50%)', width:'32px', height:'18px',
                        overflow:'hidden', cursor:'pointer', borderRadius:'1px',
                        border: video.rank === currentRank ? '1px solid #C9A84C' : '1px solid #222',
                        transition:'left 0.7s ease, top 0.7s ease', zIndex:5 }}>
            {video.thumbnail_url &&
              <img src={video.thumbnail_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
          </div>
        );
      })}

      <p style={{ position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)',
                  color:'#333', fontSize:'11px', letterSpacing:'3px' }}>
        {hintText}
      </p>

      <style>{`
        @keyframes goldPulse {
          0%,100% { text-shadow: 0 0 40px #C9A84C; }
          50%      { text-shadow: 0 0 80px #C9A84C, 0 0 120px #C9A84C; }
        }
      `}</style>
    </div>
  );

  if (totalRanks === 0) return null;

  // ── DROP ANIMATION OVERLAY ───────────────────────────────────────────────
  if (isDropping) {
    const dropVideo = dropTargetRank ? rankings[dropTargetRank - 1] : null;
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A', position:'relative', overflow:'hidden' }}>
        <animated.div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          opacity: dropSpring.p.to(p => Math.max(0, 1 - p * 1.3)),
          transform: dropSpring.p.to(p => `scale(${0.25 + p * p * 1.6}) translateY(${(1 - p) * -15}%)`),
        }}>
          <div style={{ color:'#C9A84C', fontSize:'clamp(28px,7vw,64px)', fontWeight:'bold',
                        letterSpacing:'14px', textAlign:'center', lineHeight:1.2,
                        textShadow:'0 0 40px #C9A84C' }}>
            WORLD<br/>BEST
          </div>
        </animated.div>

        {dropVideo && (
          <animated.div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            opacity: dropSpring.p.to(p => p < 0.6 ? 0 : (p - 0.6) / 0.4),
            transform: dropSpring.p.to(p => `scale(${0.9 + Math.min(p, 1) * 0.1})`),
          }}>
            <div style={{ ...getRankStyle(dropVideo.rank), textAlign:'center' }}>
              #{dropVideo.rank}
            </div>
            <div style={{ color:'#FFFFFF', fontSize:'16px', fontWeight:'bold', marginTop:'8px',
                          maxWidth:'320px', textAlign:'center', padding:'0 16px' }}>
              {dropVideo.title}
            </div>
          </animated.div>
        )}
      </div>
    );
  }

  if (!currentVideo) return null;

  // ── WORLD BEST FORMATION (zoomLevel 99, locked) ─────────────────────────
  if (zoomLevel === 99) {
    return renderFormation(1, (v) => playDropAnimation(v.rank), 'TAP ANY VIDEO TO EXPLORE');
  }

  // ── FORMATION FORMING (zoomLevel 5, 50/50 blend) ────────────────────────
  if (zoomLevel === 5) {
    return renderFormation(0.5, (v) => {
      const c = rankToCoord[v.rank];
      if (c) { setCurrentX(c.x); setCurrentY(c.y); setZoomLevel(1); }
    }, 'PINCH IN TO FOCUS · TAP CARD TO SELECT');
  }

  // ── 3x3 MAP (true spatial neighbors on the permanent grid) ──────────────
  if (zoomLevel === 3) {
    const cells = [];
    for (let dy = 1; dy >= -1; dy--) {
      for (let dx = -1; dx <= 1; dx++) cells.push({ dx, dy });
    }
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                    gridTemplateRows:'repeat(3,1fr)', gap:'3px', padding:'3px',
                    touchAction:'none', position:'relative' }}
           {...pinchBind()}>
        <button onClick={(e) => { e.stopPropagation(); cycleZoom(); }} style={zoomButtonStyle}>
          ZOOM {zoomLevel}×
        </button>
        {cells.map(({ dx, dy }) => {
          const isCenter = dx === 0 && dy === 0;
          const rank = coordToRank[`${currentX + dx},${currentY + dy}`];
          const v = rank ? rankings[rank - 1] : null;
          return (
            <div key={`${dx},${dy}`}
                 onClick={() => { if (v) navigateToCoord(currentX + dx, currentY + dy); }}
                 style={{ position:'relative', overflow:'hidden', cursor: v ? 'pointer' : 'default',
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
         onDoubleClick={() => navigateToCoord(0, 0)}
         onClick={() => { if (dotState === 'hidden') setDotState('single'); }}>

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
        {coordToRank[`${currentX - 1},${currentY}`] ? '‹' : ''}
      </div>
      <div style={{ position:'absolute', right:'16px', top:'50%',
                    transform:'translateY(-50%)', color:'#222',
                    fontSize:'24px', zIndex:3, pointerEvents:'none' }}>
        {coordToRank[`${currentX + 1},${currentY}`] ? '›' : ''}
      </div>

      {/* ZOOM HINT */}
      <div style={{ position:'absolute', bottom:'20px', left:'50%',
                    transform:'translateX(-50%)', color:'#222',
                    fontSize:'9px', letterSpacing:'2px', zIndex:3 }}>
        PINCH TO ZOOM · SWIPE TO NAVIGATE · DOUBLE TAP FOR #1
      </div>

      {/* RANDOM BUTTON (desktop) — triggers a new drop animation */}
      <button
        onClick={(e) => { e.stopPropagation();
          playDropAnimation(Math.floor(Math.random() * totalRanks) + 1); }}
        style={{ position:'absolute', top:'64px', left:'16px',
                 backgroundColor:'#0A0A0A', border:'1px solid #444',
                 color:'#AAA', padding:'4px 10px', cursor:'pointer',
                 fontSize:'9px', letterSpacing:'2px', zIndex:110 }}>
        RANDOM
      </button>

      {/* ZOOM BUTTON (desktop pinch fallback) */}
      <button
        onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
        style={zoomButtonStyle}>
        ZOOM {zoomLevel}×
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
