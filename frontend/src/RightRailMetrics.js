import React from 'react';

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

const GOLD = '#F0C040';
const DARK = '#0D0800';
const BORDEAUX = '#5C1A1A';
const DISPLAY = "'Poppins', sans-serif";
const META = "'Poppins', sans-serif";

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
      width: 30, height: 30, borderRadius: 8, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: BORDEAUX, border: '1.5px solid #F0C040',
    }}>
      <span style={{ fontFamily: DISPLAY, color: GOLD, fontSize: 13, lineHeight: 1, fontWeight: 900 }}>
        B
      </span>
    </div>
  );
}

function RailItem({ label, value, sub, accent = GOLD }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                  width: '100%', maxWidth: '100%', padding: '4px 0', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, color: '#8B7355', fontSize: '6px',
                     letterSpacing: '1px', lineHeight: 1.2, textAlign: 'center' }}>
        {label}
      </span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 900, color: accent, fontSize: '14px', lineHeight: 1.15,
                     letterSpacing: '0', marginTop: '3px', fontVariantNumeric: 'tabular-nums',
                     textAlign: 'center', wordBreak: 'break-word', maxWidth: '100%' }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontFamily: META, fontWeight: 200, color: '#666', fontSize: '6px',
                       letterSpacing: '0.5px', lineHeight: 1.2, marginTop: '3px', textAlign: 'center' }}>
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
      position: 'fixed', right: '8px', top: 88, zIndex: 110, pointerEvents: 'none',
      width: 68, maxWidth: 'calc(100vw - 16px)', boxSizing: 'border-box', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      backgroundColor: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(4px)',
      border: '1.5px solid #F0C040',
      borderRadius: '12px',
      padding: '8px 5px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      <MiniMedallion />

      <div style={{ width: 1, height: 12, backgroundColor: '#2A2110', margin: '6px 0 2px' }} />

      <RailItem label="DISCOVERY" value={`\u2605 ${discoveryScore}`} />

      <div style={{ width: 3, height: 44, backgroundColor: '#111',
                    borderRadius: 2, overflow: 'hidden', margin: '2px 0' }}>
        <div style={{ width: '100%', height: `${pct}%`,
                      background: 'linear-gradient(to top, #8B4513, #F0C040)',
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
