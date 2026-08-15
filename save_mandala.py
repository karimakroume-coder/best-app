import os

mandala = """import React from 'react';

const RINGS = [
  { count: 8,  radius: 25, size: 3,   duration: '8s',  direction: 'normal' },
  { count: 14, radius: 42, size: 2.5, duration: '12s', direction: 'reverse' },
  { count: 20, radius: 58, size: 2,   duration: '16s', direction: 'normal' },
];

const VIEW = 116;
const CENTER = VIEW / 2;

function ringCircles(ring) {
  const points = [];
  for (let i = 0; i < ring.count; i++) {
    const angle = (2 * Math.PI * i) / ring.count;
    points.push({
      cx: CENTER + ring.radius * Math.cos(angle),
      cy: CENTER + ring.radius * Math.sin(angle),
    });
  }
  return points;
}

function MandalaButton({ onClick, size = 44 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); if (onClick) onClick(); }}
      aria-label="Open actions"
      style={{
        width: size, height: size, padding: 0, border: 'none', background: 'transparent',
        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', animation: 'fadeIn 0.3s ease',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
        {RINGS.map((ring, idx) => (
          <g key={idx} style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            animation: `mandalaSpin ${ring.duration} linear infinite`,
            animationDirection: ring.direction,
          }}>
            {ringCircles(ring).map((pt, i) => (
              <circle key={i} cx={pt.cx} cy={pt.cy} r={ring.size} fill="#C8A951" />
            ))}
          </g>
        ))}
        <circle cx={CENTER} cy={CENTER} r={8} fill="#C8A951"
                style={{ filter: 'drop-shadow(0 0 4px #C8A951)' }} />
      </svg>
      <style>{`
        @keyframes mandalaSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

export default MandalaButton;
"""

path = r"C:\Users\karim\Documents\BEST APP\frontend\src\MandalaButton.js"
with open(path, 'w', encoding='utf-8') as f:
    f.write(mandala)
print(f"Saved MandalaButton.js ({len(mandala)} chars)")
