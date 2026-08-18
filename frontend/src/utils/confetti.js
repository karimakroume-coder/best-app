// Lightweight gold confetti burst — plain DOM nodes animated with the
// native Web Animations API, no canvas and no npm dependency. Each call
// spawns a handful of small gold particles at a screen coordinate that
// arc outward, tumble, fade, and remove themselves from the DOM.

const GOLD_SHADES = ['#F0C040', '#F0C040', '#F5E6C8', '#E9CD7A'];
const PARTICLE_COUNT = 18;
const BASE_DURATION_MS = 1200;
const CLEANUP_SAFETY_MARGIN_MS = 300; // in case an animation's onfinish never fires

function spawnParticle(x, y) {
  const size = 4 + Math.random() * 5;
  const isCircle = Math.random() > 0.5;
  const color = GOLD_SHADES[Math.floor(Math.random() * GOLD_SHADES.length)];

  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    margin: -${size / 2}px 0 0 -${size / 2}px;
    background: ${color};
    border-radius: ${isCircle ? '50%' : '1px'};
    pointer-events: none;
    z-index: 9999;
    will-change: transform, opacity;
  `;
  document.body.appendChild(el);

  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 90;
  const dx = Math.cos(angle) * distance;
  const riseThenFall = -30 - Math.random() * 30; // brief rise before gravity pulls it down
  const rotation = (Math.random() - 0.5) * 720;
  const duration = BASE_DURATION_MS * (0.85 + Math.random() * 0.35);

  let animation;
  try {
    animation = el.animate(
      [
        { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${riseThenFall}px) rotate(${rotation * 0.6}deg) scale(1)`,
          opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${distance}px) rotate(${rotation}deg) scale(0.5)`, opacity: 0 },
      ],
      { duration, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)', fill: 'forwards' }
    );
  } catch {
    // Web Animations API unavailable — just clean up on a timer instead.
    setTimeout(() => el.remove(), duration);
    return;
  }

  const cleanup = () => el.remove();
  animation.onfinish = cleanup;
  animation.oncancel = cleanup;
  setTimeout(cleanup, duration + CLEANUP_SAFETY_MARGIN_MS);
}

// burstConfetti(x, y) — screen coordinates (e.g. a click/touch position,
// or an element's bounding-rect center) to burst the confetti from.
export function burstConfetti(x, y) {
  if (typeof document === 'undefined') return;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    spawnParticle(x, y);
  }
}
