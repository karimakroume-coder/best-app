import os

os.makedirs("frontend/src", exist_ok=True)

with open("frontend/src/HeaderCrest.js", "w", encoding="utf-8") as f:
    f.write(r'''import React from 'react';

// HeaderCrest - B crest button (map navigation trigger) + VAULT pill label.
// Visual direction: gold medallion / Cinzel authoritative feel (AI Studio
// mockup), rendered with BEST's existing vintage gold/cream/dark palette.
// No dependency on any mockup code. Cinzel is referenced with serif fallbacks
// so it degrades gracefully if the host app hasn't loaded the webfont yet.
//
// Usage (Claude Code wires these into the header/profile area):
//   import HeaderCrest, { CrestButton, VaultPill } from './HeaderCrest';
//   <CrestButton currentMap={currentMap} setCurrentMap={setCurrentMap} />
//   <VaultPill currentMap={currentMap} />
//   <HeaderCrest currentMap={currentMap} setCurrentMap={setCurrentMap} />

const GOLD = '#C9A84C';
const GOLD_DARK = '#C8A951';
const CREAM = '#F5E6C8';
const DARK = '#0D0800';
const SERIF = "'Cinzel', Georgia, 'Times New Roman', serif";
const SANS = "'Bebas Neue', sans-serif";
const SCRIPT = "'Pacifico', cursive";

const MAP_LABELS = {
  'world-best': 'WORLD BEST',
  'best-map': 'BEST MAP',
  'my-best': 'MY BEST',
  'crew-best': 'CREW BEST',
  'crown': 'CROWN',
};

function Medallion({ size = 44, glyph = 'B', glyphFont = SERIF, glyphSize }) {
  const gs = glyphSize || Math.round(size * 0.46);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 32% 28%, #F5E6C8 0%, #C9A84C 40%, #8B6914 100%)',
      boxShadow: '0 0 14px rgba(201,168,76,0.45), inset 0 0 6px rgba(0,0,0,0.45)',
    }}>
      <div style={{
        position: 'absolute', inset: Math.round(size * 0.16), borderRadius: '50%',
        border: '1px solid rgba(13,8,0,0.55)',
      }} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <div key={deg} style={{
          position: 'absolute', width: '2px', height: Math.round(size * 0.07),
          backgroundColor: 'rgba(13,8,0,0.5)',
          transform: `rotate(${deg}deg) translateY(-${Math.round(size * 0.43)}px)`,
        }} />
      ))}
      <span style={{
        fontFamily: glyphFont, color: DARK, fontSize: gs, lineHeight: 1,
        fontWeight: 700, textShadow: '0 1px 0 rgba(245,230,200,0.4)',
      }}>
        {glyph}
      </span>
    </div>
  );
}

export function CrestButton({ currentMap = 'world-best', setCurrentMap, onOpenNav, size = 44 }) {
  const label = MAP_LABELS[currentMap] || 'WORLD BEST';
  const handleClick = () => {
    if (onOpenNav) { onOpenNav(); return; }
    if (setCurrentMap) {
      setCurrentMap(currentMap === 'world-best' ? 'best-map' : 'world-best');
    }
  };
  return (
    <button
      onClick={handleClick}
      title={`Navigate maps - current: ${label}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
      }}>
      <Medallion size={size} />
      <span style={{ fontFamily: SERIF, color: GOLD_DARK, fontSize: '8px',
                     letterSpacing: '3px', lineHeight: 1 }}>
        MAP
      </span>
    </button>
  );
}

export function VaultPill({ currentMap = 'world-best', displayName = '' }) {
  const label = MAP_LABELS[currentMap] || 'WORLD BEST';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      backgroundColor: 'rgba(13,8,0,0.85)', border: '1px solid #C8A951',
      borderRadius: '999px', padding: '4px 12px 4px 6px',
      boxShadow: '0 0 10px rgba(201,168,76,0.15)',
    }}>
      <Medallion size={24} glyphSize={11} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: SERIF, color: CREAM, fontSize: '11px',
                       letterSpacing: '3px', lineHeight: 1, fontWeight: 700 }}>
          VAULT
        </span>
        <span style={{ fontFamily: SANS, color: '#8B7355', fontSize: '8px',
                       letterSpacing: '2px', lineHeight: 1, marginTop: '2px' }}>
          {displayName ? displayName.toUpperCase() : label}
        </span>
      </div>
    </div>
  );
}

function HeaderCrest({ currentMap = 'world-best', setCurrentMap, onOpenNav, displayName = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <CrestButton currentMap={currentMap} setCurrentMap={setCurrentMap} onOpenNav={onOpenNav} />
      <VaultPill currentMap={currentMap} displayName={displayName} />
    </div>
  );
}

export default HeaderCrest;
''')
print("Wrote frontend/src/HeaderCrest.js")

with open("frontend/src/RightRailMetrics.js", "w", encoding="utf-8") as f:
    f.write(r'''import React from 'react';

// RightRailMetrics - always-visible thin vertical rail docked to the right
// edge, showing real live metrics from BEST's actual data props (not
// placeholders): Discovery Score, the current rank of the video being viewed
// (if any), and the user's Discovery tier badge.
//
// Positioning: docked at the top-right (below the header caption band), NOT
// at the vertical center where the FLEX wall slide-in tab and FLEX camera
// panel both live (SpatialMap.js: FLEX wall tab is top:50%, right:0, zIndex
// 150; FLEX camera panel is top:50%, right:0, zIndex 300). Top-anchoring
// this rail keeps it clear of both. pointerEvents:none so it never
// intercepts spatial-map swipe gestures.
//
// Usage (Claude Code wires this in):
//   <RightRailMetrics discoveryScore={discoveryScore}
//       currentRank={currentVideo?.rank} currentVideo={currentVideo} />

const GOLD = '#C9A84C';
const GOLD_DARK = '#C8A951';
const CREAM = '#F5E6C8';
const DARK = '#0D0800';
const SERIF = "'Cinzel', Georgia, 'Times New Roman', serif";
const SANS = "'Bebas Neue', sans-serif";

const MILESTONES = [
  [100, 'EXPLORER'],
  [200, 'SCOUT'],
  [500, 'GOLD'],
  [750, 'LEGEND'],
  [1000, 'ORACLE'],
];

function currentTier(score) {
  let tier = { threshold: 0, label: 'VOTER', next: MILESTONES[0] };
  for (let i = 0; i < MILESTONES.length; i++) {
    const [threshold, label] = MILESTONES[i];
    if (score >= threshold) {
      tier = { threshold, label, next: MILESTONES[i + 1] || null };
    } else {
      tier = { threshold: tier.threshold, label: tier.label, next: MILESTONES[i] };
      break;
    }
  }
  return tier;
}

function MiniMedallion() {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 32% 28%, #F5E6C8 0%, #C9A84C 45%, #8B6914 100%)',
      boxShadow: '0 0 10px rgba(201,168,76,0.4), inset 0 0 4px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: '1px solid rgba(13,8,0,0.55)',
      }} />
      <span style={{ fontFamily: SERIF, color: DARK, fontSize: 13, lineHeight: 1, fontWeight: 700 }}>
        B
      </span>
    </div>
  );
}

function RailItem({ label, value, sub, accent = GOLD }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  width: '100%', padding: '8px 0' }}>
      <span style={{ fontFamily: SERIF, color: '#8B7355', fontSize: '7px',
                     letterSpacing: '2px', lineHeight: 1, fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontFamily: SANS, color: accent, fontSize: '22px', lineHeight: 1,
                     letterSpacing: '1px', marginTop: '3px', fontVariantNumeric: 'tabular-nums',
                     textShadow: `0 0 8px ${accent === GOLD ? 'rgba(201,168,76,0.5)' : 'rgba(0,0,0,0.6)'}` }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily: SERIF, color: '#666', fontSize: '6px',
                       letterSpacing: '1px', lineHeight: 1, marginTop: '3px', textAlign: 'center' }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function RightRailMetrics({ discoveryScore = 0, currentRank = null, currentVideo = null }) {
  const rank = currentVideo?.rank ?? currentRank;
  const tier = currentTier(discoveryScore);

  const floor = tier.threshold || 0;
  const ceiling = tier.next ? tier.next[0] : Math.max(floor, discoveryScore) || 1;
  const pct = tier.next
    ? Math.min(100, Math.round(((discoveryScore - floor) / (ceiling - floor)) * 100))
    : 100;

  return (
    <div style={{
      position: 'fixed', right: 0, top: 88, zIndex: 110, pointerEvents: 'none',
      width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center',
      backgroundColor: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(4px)',
      border: '1px solid #2A2110', borderRight: 'none',
      borderLeft: '1px solid #C8A951',
      borderRadius: '10px 0 0 10px',
      padding: '10px 4px 12px',
      boxShadow: '-4px 0 18px rgba(0,0,0,0.4)',
    }}>
      <MiniMedallion />

      <div style={{ width: 1, height: 12, backgroundColor: '#2A2110', margin: '8px 0 2px' }} />

      <RailItem label="DISCOVERY" value={`\u2605 ${discoveryScore}`} />

      <div style={{ width: 3, height: 44, backgroundColor: '#111',
                    borderRadius: 2, overflow: 'hidden', margin: '2px 0' }}>
        <div style={{ width: '100%', height: `${pct}%`,
                      background: 'linear-gradient(to top, #8B6914, #C9A84C)',
                      transition: 'height 0.5s ease' }} />
      </div>

      {rank != null && rank > 0 && (
        <RailItem label="RANK" value={`#${rank}`} />
      )}

      <RailItem
        label="TIER"
        value={tier.label}
        sub={tier.next ? `NEXT ${tier.next[0]}` : 'MAX'}
        accent={tier.label === 'VOTER' ? '#8B7355' : GOLD}
      />
    </div>
  );
}

export default RightRailMetrics;
''')
print("Wrote frontend/src/RightRailMetrics.js")
print("\nDONE. T040 files written to best-app root. Awaiting T039 before wiring (T041).")
