import React, { useEffect, useRef, useState } from 'react';

// ── MANDALA SCREEN-EDGE ANIMATION ───────────────────────────────────────────
// Tapping the mandala sends gold concentric rings out along all four screen
// edges from the bottom-right corner — two fronts (right+top, bottom+left)
// each covering two edges in the WAVE_MS window, meeting at the top-left
// corner. Once the frame completes, three circular openings appear along
// the bottom edge and their icons fade in. Holding the mandala 3s (or any
// other close path) reverses the same animation — openings close, then the
// rings converge back into the corner.
const RING_GOLD = '#C8A951';
const WAVE_MS = 800;
const RING_INSETS = [0, 6, 12];
const RING_OPACITIES = [1, 0.55, 0.3];
const RING_DELAYS_MS = [0, 60, 120];

const OPENING_ORDER = ['bottom-left', 'bottom-center', 'bottom-right'];

function EdgeRing({ inset, opacity, delayMs, reverse }) {
  const seg = (extra) => ({
    position: 'fixed', backgroundColor: RING_GOLD, opacity,
    boxShadow: `0 0 6px ${RING_GOLD}`,
    animationDuration: `${WAVE_MS / 2}ms`,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    animationDirection: reverse ? 'reverse' : 'normal',
    pointerEvents: 'none',
    ...extra,
  });

  return (
    <>
      {/* bottom edge — grows left from the bottom-right corner */}
      <div style={seg({
        right: inset, bottom: inset, left: inset, height: '2px',
        transformOrigin: 'right center', animationName: 'mandalaRingGrowX',
        animationDelay: `${delayMs}ms`,
      })} />
      {/* right edge — grows up from the bottom-right corner */}
      <div style={seg({
        right: inset, bottom: inset, top: inset, width: '2px',
        transformOrigin: 'center bottom', animationName: 'mandalaRingGrowY',
        animationDelay: `${delayMs}ms`,
      })} />
      {/* top edge — continues the right-edge front once it reaches the top */}
      <div style={seg({
        left: inset, right: inset, top: inset, height: '2px',
        transformOrigin: 'right center', animationName: 'mandalaRingGrowX',
        animationDelay: `${delayMs + WAVE_MS / 2}ms`,
      })} />
      {/* left edge — continues the bottom-edge front once it reaches the left */}
      <div style={seg({
        left: inset, top: inset, bottom: inset, width: '2px',
        transformOrigin: 'center bottom', animationName: 'mandalaRingGrowY',
        animationDelay: `${delayMs + WAVE_MS / 2}ms`,
      })} />
    </>
  );
}

// A plain flex child — no independent position/left/transform-centering of
// its own. The row container below is what places it on screen, so it can
// never end up sharing coordinates with a sibling opening (or anything
// outside the row) the way three individually left:X%-centered fixed divs
// could at some viewport widths.
function Opening({ icon, locked, onClick, onTouchEnd, revealed }) {
  return (
    <div
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      className="gold-medallion"
      style={{
        pointerEvents: revealed ? 'auto' : 'none',
        transform: `scale(${revealed ? 1 : 0})`,
        opacity: revealed ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}>
      <div style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.3s ease-out 0.15s' }}>
        {icon}
      </div>
      {locked && (
        <span style={{ position:'absolute', top:'-4px', right:'-4px', fontSize:'11px',
                       color:'#C9A84C', textShadow:'0 0 4px rgba(0,0,0,0.9)' }}>🔒</span>
      )}
    </div>
  );
}

// openings: [{ position: 'bottom-left'|'bottom-center'|'bottom-right', icon, locked, onClick, onTouchEnd }]
function MandalaFrameRings({ open, openings = [] }) {
  const [phase, setPhase] = useState(open ? 'open' : 'closed');
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (open === prevOpenRef.current) return;
    prevOpenRef.current = open;
    if (open) {
      setPhase('opening');
      const t = setTimeout(() => setPhase('open'), WAVE_MS);
      return () => clearTimeout(t);
    }
    setPhase('closing');
    const t = setTimeout(() => setPhase('closed'), WAVE_MS);
    return () => clearTimeout(t);
  }, [open]);

  if (phase === 'closed') return null;
  const revealed = phase === 'open';

  const byPosition = Object.fromEntries(openings.map((op) => [op.position, op]));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 155, pointerEvents: 'none' }}>
      {RING_INSETS.map((inset, i) => (
        <EdgeRing key={i} inset={inset} opacity={RING_OPACITIES[i]}
                  delayMs={RING_DELAYS_MS[i]} reverse={phase === 'closing'} />
      ))}

      {/* Single flex row — each opening gets its own slot via space-between,
          instead of three independently left:X%-centered fixed divs that
          could collide with each other (or with unrelated fixed-position
          siblings, like the fireflag icon) at some viewport widths. */}
      <div style={{ position:'fixed', left:0, right:0, bottom:'6%',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'0 28px' }}>
        {OPENING_ORDER.map((position) => {
          const op = byPosition[position];
          return op
            ? <Opening key={position} {...op} revealed={revealed} />
            : <div key={position} style={{ width:'56px', flexShrink:0 }} />;
        })}
      </div>

      <style>{`
        @keyframes mandalaRingGrowX {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes mandalaRingGrowY {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default MandalaFrameRings;
