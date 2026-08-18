import React, { useRef } from 'react';

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

// Holding the mandala for `holdDuration` fires onHold ("everything
// retreats") instead of onClick — held.current suppresses the tap that
// would otherwise fire when the hold gesture releases.
function MandalaButton({ onClick, onHold, holdDuration = 3000, size = 44, isOpen = false }) {
  const holdTimer = useRef(null);
  const held = useRef(false);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const startHold = () => {
    held.current = false;
    clearHold();
    if (!onHold) return;
    holdTimer.current = setTimeout(() => {
      held.current = true;
      onHold();
    }, holdDuration);
  };

  const endHold = (fireClick) => {
    clearHold();
    if (!held.current && fireClick && onClick) onClick();
    held.current = false;
  };

  return (
    <button
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => { e.stopPropagation(); startHold(); }}
      onMouseUp={(e) => { e.stopPropagation(); endHold(true); }}
      onMouseLeave={clearHold}
      onTouchStart={(e) => { e.stopPropagation(); startHold(); }}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); endHold(true); }}
      onTouchCancel={() => endHold(false)}
      aria-label="Open actions"
      style={{
        width: size, height: size, padding: 0, border: 'none', background: 'transparent',
        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', animation: isOpen ? 'fadeIn 0.3s ease' : 'mandalaPulse 3s ease-in-out infinite',
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
              <circle key={i} cx={pt.cx} cy={pt.cy} r={ring.size} fill="#F0C040" />
            ))}
          </g>
        ))}
        <circle cx={CENTER} cy={CENTER} r={8} fill="#F0C040"
                style={{ filter: 'drop-shadow(0 0 4px #F0C040)' }} />
      </svg>
      <style>{`
        @keyframes mandalaSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes mandalaPulse {
          0%, 100% { transform: scale(1.0); }
          50%      { transform: scale(1.08); }
        }
      `}</style>
    </button>
  );
}

export default MandalaButton;
