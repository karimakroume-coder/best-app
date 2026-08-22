import React from 'react';

// HeaderCrest - B crest button (map navigation trigger) + VAULT pill label.
// Flat Brand Device treatment (design pivot 2026-08-22): rounded-rect,
// bordeaux fill, thin gold outline, flat Poppins glyph, gold sparkle accent.
//
// Usage (Claude Code wires these into the header/profile area):
//   import HeaderCrest, { CrestButton, VaultPill } from './HeaderCrest';
//   <CrestButton currentMap={currentMap} setCurrentMap={setCurrentMap} />
//   <VaultPill currentMap={currentMap} />
//   <HeaderCrest currentMap={currentMap} setCurrentMap={setCurrentMap} />

const GOLD = '#F0C040';
const GOLD_DARK = '#F0C040';
const CREAM = '#F5E6C8';
const DARK = '#0D0800';
const BORDEAUX = '#5C1A1A';
const DISPLAY = "'Poppins', sans-serif";
const META = "'Poppins', sans-serif";

const MAP_LABELS = {
  'world-best': 'WORLD BEST',
  'best-map': 'BEST MAP',
  'my-best': 'MY BEST',
  'crew-best': 'CREW BEST',
  'crown': 'CROWN',
};

function Medallion({ size = 44, glyph = 'B', glyphFont = DISPLAY, glyphSize, sparkle = true }) {
  const gs = glyphSize || Math.round(size * 0.46);
  const radius = Math.round(size * 0.28);
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: BORDEAUX, border: '1.5px solid #F0C040',
    }}>
      <span style={{
        fontFamily: glyphFont, color: GOLD, fontSize: gs, lineHeight: 1,
        fontWeight: 900,
      }}>
        {glyph}
      </span>
      {sparkle && (
        <span style={{
          position: 'absolute', top: -Math.round(size * 0.12), right: -Math.round(size * 0.12),
          fontSize: Math.round(size * 0.28), color: GOLD, lineHeight: 1,
        }}>
          ✦
        </span>
      )}
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
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, color: GOLD_DARK, fontSize: '8px',
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
      backgroundColor: '#0D0800', border: '1.5px solid #F0C040',
      borderRadius: '999px', padding: '4px 12px 4px 6px',
    }}>
      <Medallion size={24} glyphSize={11} sparkle={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: DISPLAY, color: CREAM, fontSize: '11px',
                       letterSpacing: '3px', lineHeight: 1, fontWeight: 800 }}>
          VAULT
        </span>
        <span style={{ fontFamily: META, fontWeight: 200, color: '#8B7355', fontSize: '8px',
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
