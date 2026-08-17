import React, { useMemo } from 'react';
import WhisperCard from './WhisperCard';

const SILVER = '#A8A9AD';
const GOLD = '#C9A84C';
const CREAM = '#F5E6C8';
const BG = '#050505';

const TOTAL_RINGS = 8;
const FOUNDING_SIZE = 61;

function buildCoordinates(rings) {
  const cells = [];
  cells.push({ x: 0, y: 0, rank: 1 });
  let rank = 2;
  for (let d = 1; d <= rings; d++) {
    const ring = [
      { x: d, y: 0 }, { x: -d, y: 0 }, { x: 0, y: d }, { x: 0, y: -d },
    ];
    for (const qx of [1, -1]) {
      for (const qy of [1, -1]) {
        for (let k = 1; k < d; k++) ring.push({ x: qx * (d - k), y: qy * k });
      }
    }
    for (const pt of ring) {
      cells.push({ x: pt.x, y: pt.y, rank });
      rank++;
    }
  }
  return cells;
}

const TILE = 68;
const GAP = 3;

function BestMap({ rankings = [], transitionPhase = '', setCurrentMap }) {
  const cells = useMemo(() => buildCoordinates(TOTAL_RINGS), []);

  const byCoord = useMemo(() => {
    const m = {};
    cells.forEach(c => { m[`${c.x},${c.y}`] = c; });
    return m;
  }, [cells]);

  const claimedCount = Math.min(rankings.length, FOUNDING_SIZE);

  const rows = useMemo(() => {
    const out = [];
    for (let y = TOTAL_RINGS; y >= -TOTAL_RINGS; y--) {
      const half = TOTAL_RINGS - Math.abs(y);
      const rowCells = [];
      for (let x = -half; x <= half; x++) {
        rowCells.push(byCoord[`${x},${y}`]);
      }
      out.push({ y, cells: rowCells });
    }
    return out;
  }, [byCoord]);

  const wrapStyle = {
    width: '100vw', height: '100vh', backgroundColor: BG,
    overflowY: 'auto', overflowX: 'hidden', fontFamily: 'Arial, sans-serif',
    color: CREAM, animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
    opacity: transitionPhase === 'exit' ? 0 : 1,
    transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none',
  };

  return (
    <div style={wrapStyle}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 16px',
                    backgroundColor: 'rgba(5,5,5,0.94)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setCurrentMap && setCurrentMap('world-best')}
            style={{ backgroundColor: 'transparent', border: '1px solid #2a2a2a',
                     color: GOLD, padding: '6px 14px', cursor: 'pointer',
                     fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px', letterSpacing: '3px' }}>
            &lsaquo; WORLD
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'Pacifico, cursive', color: SILVER,
                           fontSize: '30px', lineHeight: 1 }}>B</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: SILVER,
                             fontSize: '20px', letterSpacing: '6px', lineHeight: 1 }}>
                BEST MAP
              </span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555',
                             fontSize: '9px', letterSpacing: '4px', marginTop: '2px' }}>
                PERMANENT COORDINATES
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px',
                      marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                         fontSize: '9px', letterSpacing: '2px', color: SILVER }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: GOLD,
                           boxShadow: '0 0 6px #C9A84C' }} />
            FOUNDING DISTRICT
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                         fontSize: '9px', letterSpacing: '2px', color: SILVER }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: SILVER }} />
            OPEN COORDINATE
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                         fontSize: '9px', letterSpacing: '2px', color: SILVER }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%',
                           backgroundColor: CREAM }} />
            CLAIMED CREATOR
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '14px 16px 6px' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555',
                       fontSize: '10px', letterSpacing: '4px' }}>
          {cells.length} PERMANENT SPOTS &middot; FOUNDING COORDINATES KEEP FIREFLAG HISTORY FOREVER
        </span>
      </div>

      <div style={{ overflowX: 'auto', overflowY: 'auto', padding: '8px 16px 48px' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: GAP,
                      minWidth: (2 * TOTAL_RINGS + 1) * TILE + (2 * TOTAL_RINGS) * GAP }}>
          {rows.map(row => (
            <div key={row.y} style={{ display: 'flex', gap: GAP }}>
              {row.cells.map(cell => {
                const isFounding = cell.rank <= FOUNDING_SIZE;
                const video = cell.rank <= claimedCount ? rankings[cell.rank - 1] : null;
                return (
                  <div key={`${cell.x},${cell.y}`}
                       style={{ width: TILE, height: TILE, flexShrink: 0, position: 'relative',
                                backgroundColor: '#000000',
                                border: `1px solid ${isFounding ? GOLD : '#262626'}`,
                                boxShadow: isFounding ? '0 0 8px rgba(201,168,76,0.15)' : 'none' }}>
                    {video ? (
                      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: 'pointer' }}
                           onClick={() => window.open(`https://youtube.com/watch?v=${video.video_id}`, '_blank')}>
                        {video.thumbnail_url && (
                          <img src={video.thumbnail_url} alt=""
                               style={{ width: '100%', height: '100%', objectFit: 'cover',
                                        opacity: 0.8 }} />
                        )}
                        <div style={{ position: 'absolute', inset: 0,
                                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85))',
                                      pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: '3px', left: '4px',
                                      fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                                      fontSize: '11px', letterSpacing: '1px',
                                      textShadow: '1px 1px 0 #C8A951' }}>
                          #{video.rank}
                        </div>
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px',
                                      fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                                      fontSize: '9px', letterSpacing: '1px', lineHeight: 1.1,
                                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {video.channel_name || video.title || 'Creator'}
                        </div>
                      </div>
                    ) : (
                      <WhisperCard coordKey={`${cell.x},${cell.y}`} />
                    )}

                    {isFounding && (
                      <div style={{ position: 'absolute', top: '2px', right: '3px', zIndex: 2,
                                    fontFamily: 'Bebas Neue, sans-serif', color: GOLD,
                                    fontSize: '8px', letterSpacing: '1px',
                                    textShadow: '0 0 4px rgba(0,0,0,0.9)' }}>
                        &#9733;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
        @keyframes cardBreathe {
          0%,100% { filter: brightness(1); }
          50%      { filter: brightness(1.35); }
        }
        @keyframes whisperFadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
      `}</style>
    </div>
  );
}

export default BestMap;
