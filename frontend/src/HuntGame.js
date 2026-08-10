import React from 'react';

// Presentational only — SpatialMap owns the coordinate math (target rank,
// current position, angle, distance) since it already has the permanent
// grid data. This just renders what it's told.
function HuntGame({ targetVideo, angleDeg, withinRange, discovered, onClose }) {
  if (!targetVideo) return null;

  return (
    <div style={{ position:'absolute', inset:0, zIndex:150, pointerEvents:'none',
                  display:'flex', flexDirection:'column', alignItems:'center' }}>

      <button onClick={onClose}
        style={{ position:'absolute', top:'64px', left:'50%', transform:'translateX(-50%)',
                 pointerEvents:'auto', backgroundColor:'#0A0A0A', border:'1px solid #444',
                 color:'#AAA', padding:'4px 10px', cursor:'pointer',
                 fontSize:'9px', letterSpacing:'2px', zIndex:151 }}>
        STOP HUNT
      </button>

      <div style={{ marginTop:'104px', width:'160px', height:'160px', borderRadius:'8px',
                    overflow:'hidden', border:'1px solid #333',
                    boxShadow: discovered ? '0 0 40px #C9A84C' : 'none',
                    transition:'box-shadow 0.4s ease' }}>
        {targetVideo.thumbnail_url &&
          <img src={targetVideo.thumbnail_url} alt=""
               style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
      </div>

      <p style={{ color:'#C9A84C', fontSize:'13px', letterSpacing:'4px',
                  marginTop:'16px', fontWeight:'bold' }}>
        FIND THIS
      </p>

      {!discovered && (
        <div style={{ marginTop:'32px', width:'64px', height:'64px', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border: `2px solid ${withinRange ? '#C9A84C' : '#333'}`,
                      boxShadow: withinRange ? '0 0 24px rgba(201,168,76,0.6)' : 'none',
                      backgroundColor:'rgba(10,10,10,0.6)',
                      transition:'border 0.3s ease, box-shadow 0.3s ease' }}>
          <span style={{ display:'inline-block', fontSize:'26px', lineHeight:1,
                         color: withinRange ? '#C9A84C' : '#888',
                         transform:`rotate(${angleDeg}deg)`,
                         transition:'transform 0.4s ease, color 0.3s ease' }}>
            ▲
          </span>
        </div>
      )}

      {discovered && (
        <div style={{ marginTop:'32px', color:'#C9A84C', fontSize:'16px',
                      fontWeight:'bold', letterSpacing:'3px',
                      animation:'huntPulse 0.8s ease-in-out infinite',
                      textShadow:'0 0 20px #C9A84C' }}>
          FOUND · +50
        </div>
      )}

      <style>{`
        @keyframes huntPulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.15); opacity:0.7; }
        }
      `}</style>
    </div>
  );
}

export default HuntGame;
