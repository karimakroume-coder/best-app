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
                  width: '100%', padding: '4px 0' }}>
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
      padding: '7px 4px 7px',
      boxShadow: '-4px 0 18px rgba(0,0,0,0.4)',
    }}>
      <MiniMedallion />

      <div style={{ width: 1, height: 12, backgroundColor: '#2A2110', margin: '6px 0 2px' }} />

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
