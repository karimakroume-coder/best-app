import React from 'react';
import fireflagPng from './assets/icons/FIREFLAG.png';

// Three nested layers so the wave (rotate/skew), flicker (scaleX/scaleY) and
// one-off placement pop (scale) can all animate `transform` at once without
// stomping on each other.
function FireflagIcon({ size = 20, animatePop = false, glow = false, onClick, onTouchEnd, alt = 'Fireflag' }) {
  return (
    <span
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      style={{
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '50%',
        boxShadow: glow ? '0 0 20px rgba(243,156,18,0.4)' : 'none',
        animation: animatePop ? 'fireflagPop 0.4s ease-out' : 'none',
      }}
    >
      <span style={{ display: 'inline-block', animation: 'flagWave 3s ease-in-out infinite' }}>
        <img
          src={fireflagPng}
          alt={alt}
          style={{
            display: 'block', height: `${size}px`, width: 'auto',
            animation: 'flameFlicker 0.9s ease-in-out infinite',
          }}
        />
      </span>
    </span>
  );
}

export default FireflagIcon;
