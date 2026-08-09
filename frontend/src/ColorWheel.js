import React, { useState } from 'react';
import axios from 'axios';

const COLORS = [
  { name: 'red',    hex: '#E74C3C', label: 'RED' },
  { name: 'blue',   hex: '#2980B9', label: 'BLUE' },
  { name: 'green',  hex: '#27AE60', label: 'GREEN' },
  { name: 'yellow', hex: '#F1C40F', label: 'YELLOW' },
  { name: 'black',  hex: '#2C2C2C', label: 'BLACK', border: '#888888' },
  { name: 'white',  hex: '#FFFFFF', label: 'WHITE', border: '#555555' },
  { name: 'gold',   hex: '#C9A84C', label: 'GOLD', locked: true },
];

function ColorWheel({ videoId, userId, onColorSelected }) {
  const [selected, setSelected] = useState(null);
  const [hovering, setHovering] = useState(null);

  const handleColorClick = async (color) => {
    if (color.locked) return;
    setSelected(color.name);
    try {
      await axios.post('http://10.159.241.236:8000/color/assign', {
        user_id: userId,
        video_id: videoId,
        color: color.name
      });
      setTimeout(() => {
        if (onColorSelected) onColorSelected(color);
      }, 600);
    } catch (err) {
      console.log('Color assign error:', err);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '8px', padding: '10px 0', flexWrap: 'wrap'
    }}>
      {COLORS.map(color => (
        <div key={color.name} style={{ position: 'relative', textAlign: 'center' }}>
          <div
            onClick={() => handleColorClick(color)}
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