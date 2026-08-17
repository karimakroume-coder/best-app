// Lightweight Web Audio API sound effects for interaction feedback.
// Every sound is synthesized via a single oscillator + gain envelope —
// no audio file assets, so no new asset dependency. Each is under 300ms
// and quiet by default (peak gain ~0.05-0.09) so it reads as a subtle
// confirmation click, not a notification chime.
//
// Mute state is backed by localStorage so it persists across sessions.
// The play* functions already no-op when muted, but components that want
// to reflect mute state in their own UI (e.g. a speaker icon) can read
// isSoundMuted() / call toggleSoundMuted() directly.

const MUTE_KEY = 'best_sound_muted';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  } catch {
    return null;
  }
}

export function isSoundMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch {
    // ignore — worst case mute preference doesn't persist this session
  }
}

export function toggleSoundMuted() {
  const next = !isSoundMuted();
  setSoundMuted(next);
  return next;
}

// freqs: either a single frequency, or a list of [offsetSeconds, frequency]
// steps describing a simple pitch glide, e.g. [[0, 440], [0.12, 880]].
function playTone({ freqs, durationMs, type = 'sine', peakGain = 0.08 }) {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;

    const now = ctx.currentTime;
    const steps = Array.isArray(freqs) ? freqs : [[0, freqs]];
    osc.frequency.setValueAtTime(Math.max(steps[0][1], 1), now);
    steps.slice(1).forEach(([t, f]) => {
      osc.frequency.exponentialRampToValueAtTime(Math.max(f, 1), now + t);
    });

    const durationSec = durationMs / 1000;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Web Audio can throw in odd embedded/webview contexts — a missed
    // sound effect should never break the interaction it's attached to.
  }
}

// MARK — color wheel confirm: a quick two-step upward chime.
export function playMarkSound() {
  playTone({ freqs: [[0, 440], [0.12, 880]], durationMs: 180, type: 'sine', peakGain: 0.09 });
}

// FLEX — camera snap: a short, snappy downward click.
export function playFlexSound() {
  playTone({ freqs: [[0, 1200], [0.06, 300]], durationMs: 90, type: 'square', peakGain: 0.05 });
}

// ADD — Personal Best 100 "+": a satisfying short pop.
export function playAddSound() {
  playTone({ freqs: [[0, 660], [0.1, 990]], durationMs: 220, type: 'triangle', peakGain: 0.08 });
}
