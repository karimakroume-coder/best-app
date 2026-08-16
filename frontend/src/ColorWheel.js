import React, { useState, useMemo } from 'react';

const BASE_COLORS = [
  { name: 'red',    hex: '#E74C3C', label: 'RED' },
  { name: 'blue',   hex: '#2980B9', label: 'BLUE' },
  { name: 'green',  hex: '#27AE60', label: 'GREEN' },
  { name: 'yellow', hex: '#F1C40F', label: 'YELLOW' },
  { name: 'black',  hex: '#2C2C2C', label: 'BLACK', border: '#888888' },
  { name: 'white',  hex: '#FFFFFF', label: 'WHITE', border: '#555555' },
  { name: 'gold',   hex: '#C9A84C', label: 'GOLD' },
];

function getOrderedColors() {
  try {
    const saved = JSON.parse(localStorage.getItem('colorRanking'));
    if (Array.isArray(saved) && saved.length === BASE_COLORS.length) {
      const byName = Object.fromEntries(BASE_COLORS.map(c => [c.name, c]));
      const ordered = saved.map(n => byName[n]).filter(Boolean);
      if (ordered.length === BASE_COLORS.length) return ordered;
    }
  } catch {}
  return BASE_COLORS;
}

// The actual backend assignment (with word + snapshot) happens later in
// SpatialMap's Mark flow, once the Strip keyboard word and snapshot exist —
// this only picks the color and hands it off via onColorSelected.
function ColorWheel({ onColorSelected, discoveryScore = 0 }) {
  const [selected, setSelected] = useState(null);
  const [hovering, setHovering] = useState(null);

  const COLORS = useMemo(() => getOrderedColors().map(c =>
    c.name === 'gold' ? { ...c, locked: (discoveryScore || 0) < 500 } : c
  ), [discoveryScore]);

  const handleColorClick = (e, color) => {
    if (color.locked) return;
    setSelected(color.name);
    const origin = { x: e.clientX, y: e.clientY };
    if (onColorSelected) onColorSelected(color, origin);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '8px', padding: '10px 0', flexWrap: 'wrap'
    }}>
      {COLORS.map(color => (
        <div key={color.name} style={{ position: 'relative', textAlign: 'center' }}>
          <div
            onClick={(e) => handleColorClick(e, color)}
            onMouseEnter={() => setHovering(color.name)}
            onMouseLeave={() => setHovering(null)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: color.hex,
              border: `2px solid ${selected === color.name ? '#FFFFFF' : (color.border || color.hex)}`,
              cursor: color.locked ? 'not-allowed' : 'pointer',
              transform: hovering === color.name && !color.locked ? 'scale(1.25)' : 'scale(1)',
              transition: 'transform 0.15s, border 0.15s',
              opacity: color.locked ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: selected === color.name ? `0 0 10px ${color.hex}` : 'none',
            }}
          >
            {color.locked && (
              <span style={{ fontSize: '14px' }}>🔒</span>
            )}
          </div>
          {hovering === color.name && (
            <div style={{
              position: 'absolute', bottom: '-20px', left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1A1A1A', color: color.locked ? '#888888' : color.hex,
              fontSize: '8px', letterSpacing: '1px', padding: '2px 6px',
              borderRadius: '2px', whiteSpace: 'nowrap', zIndex: 10,
            }}>
              {color.locked ? 'EARNED ONLY' : color.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ColorWheel;