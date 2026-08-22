import React from 'react';

// Flat Brand Device treatment (design pivot 2026-08-22): compact 28px
// rounded-rect badges instead of oversized script glyphs — the old version
// rendered "B" up to 52px tall per item, which spanned far enough down the
// left edge to overlap the centered rank/title stack. Hugs the very left
// edge and stays narrow so it can't collide with centered content.
const MAPS = [
  { id: 'world-best', label: 'WORLD BEST' },
  { id: 'best-map', label: 'BEST MAP' },
  { id: 'my-best', label: 'MY BEST' },
  { id: 'crew-best', label: 'CREW BEST' },
  { id: 'crown', label: 'CROWN', hasCrown: true },
];

function BNavigation({ currentMap, setCurrentMap, uiOpen }) {
  if (!uiOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      left: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
    }}>
      {MAPS.map((map) => {
        const active = currentMap === map.id;
        return (
          <button
            key={map.id}
            onClick={() => setCurrentMap(map.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              width: '38px',
              opacity: active ? 1 : 0.55,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              backgroundColor: active ? '#F0C040' : '#5C1A1A',
              border: '1.5px solid #F0C040',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: '13px',
                color: active ? '#5C1A1A' : '#F0C040', lineHeight: 1,
              }}>
                B
              </span>
              {map.hasCrown && (
                <span style={{ position: 'absolute', top: '-7px', right: '-4px', fontSize: '9px', lineHeight: 1 }}>
                  👑
                </span>
              )}
            </div>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '6px',
              color: '#F0C040', letterSpacing: '0.06em', lineHeight: 1.1, textAlign: 'center',
            }}>
              {map.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BNavigation;
