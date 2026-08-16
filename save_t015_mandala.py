import os

BASE = r"C:\Users\karim\Documents\BEST APP"

# Save MandalaButton.js
mandala = """import React, { useRef } from 'react';

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

function MandalaButton({ onClick, onHold, holdDuration = 3000, size = 60 }) {
  const holdTimer = useRef(null);
  const held = useRef(false);
  const lastTap = useRef(0);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const fireTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) return;
    lastTap.current = now;
    if (onClick) onClick();
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (held.current) { held.current = false; return; }
        fireTap();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        held.current = false;
        clearHold();
        holdTimer.current = setTimeout(() => {
          held.current = true;
          if (onHold) onHold();
        }, holdDuration);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        e.preventDefault();
        clearHold();
        if (!held.current) fireTap();
      }}
      onTouchCancel={() => { clearHold(); held.current = false; }}
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
      <style>{\`
        @keyframes mandalaSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      \`}</style>
    </button>
  );
}

export default MandalaButton;
"""

path = os.path.join(BASE, "frontend", "src", "MandalaButton.js")
with open(path, 'w', encoding='utf-8') as f:
    f.write(mandala)
print(f"Saved MandalaButton.js")
print(f"\nNOTE: SpatialMap.js and App.js changes are large.")
print("Give Claude Code this instruction when limit resets:")
print("""
Read CLAUDE.md. The Mandala Control Center (T015)
has been built by MonkeyCode. The new sections are:

1. uiOpen state and toggleUI/openUI/closeUI callbacks
2. chromeHidden gate variable
3. actionButtonStyle and microNavStyle shared styles
4. Mandala Control Center JSX block (fixed position elements)
5. New keyframes: slideUp, slideDown, fadeInLeft
6. App.js: removed header, passes new props to SpatialMap

Check if these changes are already in the files.
If not, apply them from the T015 spec in CLAUDE.md.
Push to GitHub and run vercel --prod.
Commit: T015 — Mandala Control Center verify and deploy
""")
