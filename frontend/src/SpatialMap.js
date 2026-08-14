import YouTubePlayer from './YouTubePlayer';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag, usePinch } from '@use-gesture/react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import ColorWheel from './ColorWheel';
import StripKeyboard from './StripKeyboard';
import FireflagIcon from './FireflagIcon';
import HuntGame from './HuntGame';
import { ReactComponent as GoldDot } from './assets/icons/gold-dot.svg';
import { ReactComponent as FlexCamera } from './assets/icons/flex-camera.svg';

const RANK_STYLES = {
  1:  { color: '#C9A84C', fontSize: '72px', fontWeight: 'bold' },
  2:  { color: '#A8A9AD', fontSize: '56px', fontWeight: 'bold' },
  3:  { color: '#A8A9AD', fontSize: '56px', fontWeight: 'bold' },
  10: { color: '#FFFFFF', fontSize: '42px', fontWeight: 'bold' },
  50: { color: '#777777', fontSize: '28px', fontWeight: 'normal' },
};

function getRankStyle(rank) {
  if (rank === 1)  return RANK_STYLES[1];
  if (rank <= 3)   return RANK_STYLES[2];
  if (rank <= 10)  return RANK_STYLES[10];
  if (rank <= 50)  return RANK_STYLES[50];
  return { color: '#444444', fontSize: '20px', fontWeight: 'light' };
}

// ── VINTAGE RETRO RANK NUMBER (single card view only) ──────────────────────
const RETRO_GOLD_SHADOW =
  '3px 3px 0 #C8A951, 6px 6px 0 #B8860B, 9px 9px 0 #8B6914, 12px 12px 0 rgba(0,0,0,0.6)';
const RETRO_SILVER_SHADOW =
  '2px 2px 0 #A8A9AD, 4px 4px 0 #777777, 6px 6px 0 rgba(0,0,0,0.5)';

function getRetroRankStyle(rank) {
  const base = {
    fontFamily: 'Bebas Neue, sans-serif',
    color: '#F5E6C8',
    letterSpacing: '4px',
  };
  if (rank === 1) return { ...base, fontSize: '120px', textShadow: RETRO_GOLD_SHADOW };
  if (rank <= 3)  return { ...base, fontSize: '96px', textShadow: RETRO_SILVER_SHADOW };
  if (rank <= 10) return { ...base, fontSize: '72px',
    textShadow: '2px 2px 0 #8B6914, 4px 4px 0 rgba(0,0,0,0.5)' };
  if (rank <= 50) return { ...base, fontSize: '48px',
    textShadow: '1px 1px 0 #8B6914, 2px 2px 0 rgba(0,0,0,0.5)' };
  return { ...base, fontSize: '32px', color: '#8B7355',
    textShadow: '1px 1px 0 rgba(0,0,0,0.5)' };
}

// ── PERMANENT COORDINATE GRID ─────────────────────────────────────────────
// Diamond spiral: ring d holds every (x,y) with |x|+|y|=d. Ring 0 is rank 1.
// Each ring is emitted axis points first (E,W,N,S) then the remaining
// points quadrant by quadrant, so ranks 2-5 land exactly on (1,0),(-1,0),
// (0,1),(0,-1) as specified.
function buildSpiralCoords(count) {
  const rankToCoord = {};
  const coordToRank = {};
  if (count <= 0) return { rankToCoord, coordToRank };
  rankToCoord[1] = { x: 0, y: 0 };
  coordToRank['0,0'] = 1;
  let rank = 2;
  let d = 1;
  while (rank <= count) {
    const ring = [
      { x: d, y: 0 }, { x: -d, y: 0 }, { x: 0, y: d }, { x: 0, y: -d },
    ];
    for (const qx of [1, -1]) {
      for (const qy of [1, -1]) {
        for (let k = 1; k < d; k++) {
          ring.push({ x: qx * (d - k), y: qy * k });
        }
      }
    }
    for (const pt of ring) {
      if (rank > count) break;
      const key = `${pt.x},${pt.y}`;
      if (coordToRank[key] !== undefined) continue;
      coordToRank[key] = rank;
      rankToCoord[rank] = pt;
      rank++;
    }
    d++;
  }
  return { rankToCoord, coordToRank };
}

// ── WORLD BEST LETTER FORMATION ───────────────────────────────────────────
// Minimal 3x5 block font. Cells are flattened in reading order (row-major
// across both words) so the first N cells are handed to the top N ranked
// videos — with only 50 thumbnails available, "WORLD" fills completely and
// "BEST" fills as far as the remaining cards allow.
const FONT = {
  W: ['1.1', '1.1', '1.1', '.1.', '.1.'],
  O: ['.1.', '1.1', '1.1', '1.1', '.1.'],
  R: ['11.', '1.1', '11.', '1.1', '1..'],
  L: ['1..', '1..', '1..', '1..', '111'],
  D: ['11.', '1.1', '1.1', '1.1', '11.'],
  B: ['11.', '1.1', '11.', '1.1', '11.'],
  E: ['111', '1..', '11.', '1..', '111'],
  S: ['.11', '1..', '.1.', '..1', '11.'],
  T: ['111', '.1.', '.1.', '.1.', '.1.'],
};
const GLYPH_W = 3, GLYPH_H = 5, GLYPH_GAP = 1, ROW_GAP = 1;

function buildLetterCells() {
  const words = ['WORLD', 'BEST'];
  const widths = words.map(w => w.length * (GLYPH_W + GLYPH_GAP) - GLYPH_GAP);
  const maxWidth = Math.max(...widths);
  const totalRows = words.length * GLYPH_H + (words.length - 1) * ROW_GAP;
  const cells = [];
  words.forEach((word, wIdx) => {
    const startCol = Math.floor((maxWidth - widths[wIdx]) / 2);
    const startRow = wIdx * (GLYPH_H + ROW_GAP);
    [...word].forEach((letter, lIdx) => {
      const glyph = FONT[letter];
      if (!glyph) return;
      const colOffset = startCol + lIdx * (GLYPH_W + GLYPH_GAP);
      glyph.forEach((rowStr, r) => {
        [...rowStr].forEach((ch, c) => {
          if (ch === '1') cells.push({ col: colOffset + c, row: startRow + r });
        });
      });
    });
  });
  cells.sort((a, b) => a.row - b.row || a.col - b.col);
  return { cells, maxWidth, totalRows };
}

const LETTER_LAYOUT = buildLetterCells();

function letterPositionForIndex(i) {
  const { cells, maxWidth, totalRows } = LETTER_LAYOUT;
  const cell = cells[i];
  if (!cell) return null;
  return {
    x: 12 + ((cell.col + 0.5) / maxWidth) * 76,
    y: 30 + ((cell.row + 0.5) / totalRows) * 55,
  };
}

const zoomButtonStyle = {
  position: 'absolute', top: '64px', right: '16px',
  backgroundColor: '#0A0A0A', border: '1px solid #444',
  color: '#AAA', padding: '10px 10px', cursor: 'pointer',
  fontSize: '9px', letterSpacing: '2px', zIndex: 110,
};

// ── THE MARK: paint-drip shapes ─────────────────────────────────────────────
// Poured from the top of the screen, like paint dripping down a wall: wide
// at the pour mouth, bulging into an organic belly, tapering to a point.
const DRIP_X_PERCENTS = [0.05, 0.18, 0.32, 0.50, 0.68, 0.82, 0.95];

function generateDrips(width, height) {
  const paths = DRIP_X_PERCENTS.map((xPct, i) => {
    const x = xPct * width;
    const dripWidth = 30 + Math.random() * 50;       // 30-80px
    const dripHeight = height * (0.55 + Math.random() * 0.40); // 55-95% of screen
    const belly = dripHeight * 0.8;
    return {
      id: i,
      x,
      d: `M ${x - 20} 0 Q ${x} 10 ${x + 20} 0 `
       + `L ${x + dripWidth / 2} ${belly} `
       + `Q ${x} ${dripHeight} ${x - dripWidth / 2} ${belly} Z`,
      duration: 0.6 + Math.random() * 0.4,   // 0.6-1.0s
      delay: Math.random() * 200,            // 0-200ms stagger
    };
  });
  return { width, height, paths };
}

function SpatialMap({ rankings, userId, onColorAssigned, onPersonalBestAdded, darkMode, huntActive, onHuntComplete, onHuntStop }) {
  console.log('SpatialMap rankings prop:', rankings?.length);

  const [currentX, setCurrentX]               = useState(0);
  const [currentY, setCurrentY]                = useState(0);
  const [zoomLevel, setZoomLevel]              = useState(1);
  const [dotState, setDotState]                = useState('single');
  const [showColorWheel, setShowColorWheel]    = useState(false);
  const [assignedColors, setAssignedColors]    = useState({});
  const [isDropping, setIsDropping]            = useState(true);
  const [dropTargetRank, setDropTargetRank]    = useState(null);
  const [assignedWords, setAssignedWords]      = useState({});
  const [fireflaggedVideos, setFireflaggedVideos] = useState({});
  const [fireflagAnimating, setFireflagAnimating] = useState(null);
  const [fireflagError, setFireflagError] = useState(null);
  const [personalBestVideos, setPersonalBestVideos] = useState({});
  const [personalBestAnimating, setPersonalBestAnimating] = useState(null);
  const [personalBestError, setPersonalBestError] = useState(null);
  const [personalBestPointsFlash, setPersonalBestPointsFlash] = useState(false);
  const [huntTargetRank, setHuntTargetRank] = useState(null);
  const [huntDiscovered, setHuntDiscovered] = useState(false);
  const [colorDistributions, setColorDistributions] = useState({});

  // ── THE MARK ─────────────────────────────────────────────────────────────
  // idle -> spreading -> keyboard -> confirmed -> sharing -> receding -> idle
  const [markStage, setMarkStage]   = useState('idle');
  const [markColor, setMarkColor]   = useState(null);
  const [markDrips, setMarkDrips]   = useState({ width: 0, height: 0, paths: [] });
  const [markVideo, setMarkVideo]   = useState(null);
  const [markWord, setMarkWord]     = useState('');
  const [markSnapshotUrl, setMarkSnapshotUrl] = useState(null);
  const [spreadOn, setSpreadOn]     = useState(false);
  const [shareFallback, setShareFallback] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const markCaptureRef = useRef(null);

  const totalRanks = rankings.length;

  const { rankToCoord, coordToRank } = useMemo(
    () => buildSpiralCoords(totalRanks),
    [totalRanks]
  );

  const currentRank  = coordToRank[`${currentX},${currentY}`];
  const currentVideo = currentRank ? rankings[currentRank - 1] : null;

  // ── HUNT GAME ─────────────────────────────────────────────────────────────
  const huntTargetVideo = huntTargetRank ? rankings[huntTargetRank - 1] : null;
  const huntTargetCoord = huntTargetRank ? rankToCoord[huntTargetRank] : null;
  const huntAngle = huntTargetCoord
    ? Math.atan2(huntTargetCoord.x - currentX, huntTargetCoord.y - currentY) * (180 / Math.PI)
    : 0;
  const huntWithinRange = !!(huntTargetRank && currentRank && Math.abs(currentRank - huntTargetRank) <= 5);

  useEffect(() => {
    if (huntActive && totalRanks > 0) {
      setHuntTargetRank(Math.floor(Math.random() * totalRanks) + 1);
      setHuntDiscovered(false);
    } else if (!huntActive) {
      setHuntTargetRank(null);
      setHuntDiscovered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huntActive]);

  useEffect(() => {
    if (huntActive && huntTargetRank && currentRank === huntTargetRank && !huntDiscovered) {
      setHuntDiscovered(true);
      const t = setTimeout(() => { if (onHuntComplete) onHuntComplete(); }, 1400);
      return () => clearTimeout(t);
    }
  }, [huntActive, huntTargetRank, currentRank, huntDiscovered, onHuntComplete]);

  // ── COLOR DISTRIBUTION BAR (single card view) ───────────────────────────
  // Fetched once per video and cached so navigating back to a card is instant.
  useEffect(() => {
    if (zoomLevel !== 1 || !currentVideo) return;
    const vid = currentVideo.video_id;
    if (colorDistributions[vid]) return;
    let cancelled = false;
    axios.get(`https://web-production-a267.up.railway.app/color/distribution/${vid}`)
      .then(res => {
        if (!cancelled) setColorDistributions(prev => ({ ...prev, [vid]: res.data }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [zoomLevel, currentVideo, colorDistributions]);

  // Top-50 cards with both their permanent grid position and their target
  // letter position, normalized into the same 0-100% screen space.
  const gridLetterData = useMemo(() => {
    const top = rankings.slice(0, 50);
    if (top.length === 0) return [];
    let maxAbs = 1;
    top.forEach(v => {
      const c = rankToCoord[v.rank];
      if (c) maxAbs = Math.max(maxAbs, Math.abs(c.x), Math.abs(c.y));
    });
    const cellPct = 38 / maxAbs;
    return top.map((v, i) => {
      const c = rankToCoord[v.rank] || { x: 0, y: 0 };
      const grid = { x: 50 + c.x * cellPct, y: 50 - c.y * cellPct };
      const letter = letterPositionForIndex(i);
      return { video: v, grid, letter: letter || grid };
    });
  }, [rankings, rankToCoord]);

  // ── DOT FADE TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (dotState === 'single') {
      const t = setTimeout(() => setDotState('hidden'), 3000);
      return () => clearTimeout(t);
    }
  }, [dotState, currentRank]);

  // ── SLIDE ANIMATION ─────────────────────────────────────────────────────
  const [springs, api] = useSpring(() => ({ x: 0, y: 0, opacity: 1 }));

  const navigateToCoord = useCallback((nx, ny) => {
    const rank = coordToRank[`${nx},${ny}`];
    if (!rank) return;
    const dx = nx - currentX, dy = ny - currentY;
    const outX = dx !== 0 ? (dx > 0 ? -60 : 60) : 0;
    const outY = dy !== 0 ? (dy > 0 ? -60 : 60) : 0;
    api.start({ x: outX, y: outY, opacity: 0, immediate: false,
      config: { tension: 300, friction: 30 },
      onRest: () => {
        setCurrentX(nx);
        setCurrentY(ny);
        setDotState('single');
        setShowColorWheel(false);
        api.set({ x: -outX, y: -outY, opacity: 0 });
        api.start({ x: 0, y: 0, opacity: 1, config: { tension: 300, friction: 30 } });
      }
    });
  }, [currentX, currentY, coordToRank, api]);

  // ── DROP ANIMATION (cinematic camera fall onto a rank) ──────────────────
  const [dropSpring, dropApi] = useSpring(() => ({ p: 0 }));
  const dropLandedRef = useRef(false);

  const playDropAnimation = useCallback((targetRank) => {
    if (!targetRank || totalRanks === 0) return;
    dropLandedRef.current = false;
    setDropTargetRank(targetRank);
    setShowColorWheel(false);
    setIsDropping(true);
    dropApi.set({ p: 0 });

    const land = () => {
      if (dropLandedRef.current) return;
      dropLandedRef.current = true;
      const coord = rankToCoord[targetRank];
      if (coord) { setCurrentX(coord.x); setCurrentY(coord.y); }
      setZoomLevel(1);
      setDotState('single');
      setIsDropping(false);
    };

    // Failsafe: if react-spring's onRest chain never fires for any reason
    // (backgrounded tab, an interrupted/replaced animation, etc.), still
    // land on the target rather than leaving the user stuck on the
    // WORLD BEST intro forever.
    const failsafe = setTimeout(land, 4000);

    dropApi.start({
      p: 0.7,
      config: { tension: 40, friction: 8 },
      onRest: () => {
        dropApi.start({
          p: 1,
          config: { tension: 400, friction: 20 },
          onRest: () => {
            clearTimeout(failsafe);
            land();
          }
        });
      }
    });
  }, [dropApi, rankToCoord, totalRanks]);

  // ── THE MARK: paint drips → strip keyboard → snapshot → recede ──────────
  const startMark = useCallback((color) => {
    if (!currentVideo) return;
    setMarkVideo(currentVideo);
    setMarkColor(color);
    setMarkDrips(generateDrips(window.innerWidth, window.innerHeight));
    setMarkWord('');
    setShowColorWheel(false);
    setDotState('hidden');
    setSpreadOn(false);
    setShareFallback(false);
    setLinkCopied(false);
    setMarkStage('spreading');
  }, [currentVideo]);

  const confirmWord = useCallback((word) => {
    setMarkWord(word);
    setMarkStage('confirmed');
  }, []);

  const handleShare = useCallback(async (snapshotUrl) => {
    if (!snapshotUrl) return;
    try {
      const res = await fetch(snapshotUrl);
      const blob = await res.blob();
      const file = new File([blob], `best-mark-${Date.now()}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'BEST', text: markWord });
      } else if (navigator.share) {
        await navigator.share({ title: 'BEST', text: markWord });
      } else {
        setShareFallback(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Share error:', err);
        setShareFallback(true);
      }
    }
  }, [markWord]);

  const handleSaveToGallery = useCallback((snapshotUrl, video) => {
    if (!snapshotUrl) return;
    const link = document.createElement('a');
    link.href = snapshotUrl;
    link.download = `best-mark-${video ? video.video_id : Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleCopyLink = useCallback(async (video) => {
    if (!video) return;
    try {
      await navigator.clipboard.writeText(`https://youtube.com/watch?v=${video.video_id}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.log('Copy link error:', err);
    }
  }, []);

  const dismissShareFallback = useCallback(() => {
    setShareFallback(false);
    setMarkStage('receding');
  }, []);

  // spreading: 0% -> 150% over 1.2s ease-out, then hand off to the keyboard
  useEffect(() => {
    if (markStage !== 'spreading') return;
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setSpreadOn(true));
    });
    const t = setTimeout(() => setMarkStage('keyboard'), 1200);
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t); };
  }, [markStage]);

  // confirmed: word locked in, capture the snapshot once the keyboard is gone
  useEffect(() => {
    if (markStage !== 'confirmed') return;
    let cancelled = false;
    (async () => {
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled || !markCaptureRef.current) return;
      try {
        const canvas = await html2canvas(markCaptureRef.current, { backgroundColor: null, useCORS: true });
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#C9A84C';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText('BEST', canvas.width - 20, canvas.height - 20);
        const dataUrl = canvas.toDataURL('image/png');
        if (cancelled) return;
        setMarkSnapshotUrl(dataUrl);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `best-mark-${markVideo ? markVideo.video_id : Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.log('Snapshot error:', err);
      }
      if (!cancelled) setMarkStage('sharing');
    })();
    return () => { cancelled = true; };
  }, [markStage, markVideo]);

  // sharing: show the share button for 3 seconds, then recede
  // (paused while the share-fallback overlay is open — user needs time to tap SAVE/COPY)
  useEffect(() => {
    if (markStage !== 'sharing' || shareFallback) return;
    const t = setTimeout(() => setMarkStage('receding'), 3000);
    return () => clearTimeout(t);
  }, [markStage, shareFallback]);

  // receding: 150% -> 0% over 0.8s, word fades, then leave the permanent mark
  useEffect(() => {
    if (markStage !== 'receding') return;
    setSpreadOn(false);
    const t = setTimeout(() => {
      if (markVideo && markColor) {
        setAssignedColors(prev => ({ ...prev, [markVideo.video_id]: markColor.name }));
        setAssignedWords(prev => ({ ...prev, [markVideo.video_id]: markWord }));
        if (onColorAssigned) onColorAssigned(markVideo.video_id, markColor.name);
      }
      setMarkStage('idle');
      setMarkColor(null);
      setMarkSnapshotUrl(null);
      setMarkWord('');
      setDotState('single');
    }, 800);
    return () => clearTimeout(t);
  }, [markStage, markVideo, markColor, markWord, onColorAssigned]);

  // ── MOUNT: initial drop onto a random rank ──────────────────────────────
  // Guards against the DROP replaying if this effect re-runs (e.g. a
  // StrictMode double-invoke in dev, or totalRanks changing after a refetch).
  const dropPlayedRef = useRef(false);
  useEffect(() => {
    if (dropPlayedRef.current || totalRanks === 0) return;
    dropPlayedRef.current = true;
    playDropAnimation(Math.floor(Math.random() * totalRanks) + 1);
  }, [totalRanks, playDropAnimation]);

  // ── SHAKE TO RANDOM DROP ────────────────────────────────────────────────
  // Deliberately conservative: normal phone handling (picking it up,
  // walking, tapping the screen) easily produces combined accelerations
  // well above what feels like a "shake" to the person holding it. A low
  // threshold here fires unwanted drops on real devices even though it
  // never triggers on desktop (no devicemotion events), which is why this
  // only ever showed up on the deployed mobile build.
  useEffect(() => {
    let lastTime = 0;
    const onMotion = (e) => {
      if (isDropping || markStage !== 'idle') return;
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x === undefined || x === null) return;
      const acc = Math.abs(x) + Math.abs(y) + Math.abs(z);
      const now = Date.now();
      if (acc > 35 && now - lastTime > 2500) {
        lastTime = now;
        playDropAnimation(Math.floor(Math.random() * totalRanks) + 1);
      }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [totalRanks, playDropAnimation, isDropping, markStage]);

  // ── DRAG GESTURE (moves position on the coordinate grid) ────────────────
  // pointerNavRef marks when this pointer-based path just handled a swipe,
  // so the raw-touch fallback below (needed because @use-gesture's
  // pointer-event handling doesn't reliably fire on some Android/Chrome
  // builds) knows not to double-navigate for the same gesture.
  const pointerNavRef = useRef(0);
  const bind = useDrag(({ last, direction: [dx, dy], distance: [distX, distY] }) => {
    if (!last || markStage !== 'idle') return;
    if (Math.abs(distX) > Math.abs(distY) && distX > 50) {
      pointerNavRef.current = Date.now();
      navigateToCoord(currentX + (dx < 0 ? 1 : -1), currentY);
    } else if (Math.abs(distY) > Math.abs(distX) && distY > 50) {
      pointerNavRef.current = Date.now();
      navigateToCoord(currentX, currentY + (dy < 0 ? 1 : -1));
    }
  }, { filterTaps: true, threshold: 10 });

  // ── PINCH GESTURE (zoom level only) ─────────────────────────────────────
  const pinchBind = usePinch(({ offset: [scale], last }) => {
    if (!last || markStage !== 'idle') return;
    if (scale < 0.7 && zoomLevel === 1) setZoomLevel(3);
    else if (scale < 0.7 && zoomLevel === 3) setZoomLevel(5);
    else if (scale > 1.3 && zoomLevel === 5) setZoomLevel(3);
    else if (scale > 1.3 && zoomLevel === 3) setZoomLevel(1);
  });

  // ── RAW TOUCH FALLBACK (swipe navigate + reveal the dot on tap) ─────────
  // Plain touchstart/touchend, independent of @use-gesture, for real Android
  // browsers where the pointer-event path above doesn't reliably fire.
  // Skips itself if pointerNavRef shows useDrag just handled this gesture.
  const touchStartRef = useRef(null);

  const onTouchStartNav = useCallback((e) => {
    if (e.touches.length !== 1) { touchStartRef.current = null; return; }
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  // Guard against vertical scrolls / pull-to-refresh hijacking the swipe:
  // cancel the browser's default touch handling while the gesture is active
  // so touchend always lands here. Attached as a NATIVE non-passive listener
  // because React attaches touchmove as passive (preventDefault is a no-op
  // there and would only log a console warning on Android Chrome).
  const singleCardRef = useRef(null);
  useEffect(() => {
    if (zoomLevel !== 1) return;
    const el = singleCardRef.current;
    if (!el) return;
    const guardScroll = (e) => { if (e.cancelable) e.preventDefault(); };
    el.addEventListener('touchmove', guardScroll, { passive: false });
    return () => el.removeEventListener('touchmove', guardScroll);
  }, [zoomLevel]);

  const onTouchCancelNav = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const onTouchEndNav = useCallback((e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || markStage !== 'idle') return;
    // useDrag may have handled this gesture through its pointer path.
    if (Date.now() - pointerNavRef.current < 250) return;
    if (e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - start.x;
    const deltaY = t.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX > 50 && absX > absY) {
      // Horizontal swipe — next rank to the left, previous rank to the right.
      navigateToCoord(currentX + (deltaX < 0 ? 1 : -1), currentY);
    } else if (absY > 50 && absY > absX) {
      navigateToCoord(currentX, currentY + (deltaY < 0 ? 1 : -1));
    } else if (absX < 10 && absY < 10 && dotState === 'hidden') {
      // Tap — reveal the dot UI without pausing the video.
      setDotState('single');
    }
  }, [markStage, currentX, currentY, navigateToCoord, dotState]);

  const cycleZoom = useCallback(() => {
    setZoomLevel(prev => prev === 1 ? 3 : prev === 3 ? 5 : prev === 5 ? 99 : 1);
  }, []);

  const getColorHex = (name) => ({
    red:'#E74C3C', blue:'#2980B9', green:'#27AE60',
    yellow:'#F1C40F', black:'#2C2C2C', white:'#FFFFFF', gold:'#C9A84C'
  }[name] || '#555555');

  // ── FIREFLAGS ─────────────────────────────────────────────────────────────
  const placeFireflag = useCallback(async (e, video) => {
    e.stopPropagation();
    if (!video || fireflaggedVideos[video.video_id]) return;
    try {
      await axios.post('https://web-production-a267.up.railway.app/fireflag/place', {
        user_id: userId,
        video_id: video.video_id,
      });
      setFireflaggedVideos(prev => ({ ...prev, [video.video_id]: true }));
      setFireflagAnimating(video.video_id);
      setTimeout(() => setFireflagAnimating(v => v === video.video_id ? null : v), 400);
    } catch (err) {
      const message = err.response?.status === 429
        ? err.response.data?.detail || 'Fireflag limit reached'
        : 'Could not place fireflag';
      setFireflagError(message);
      setTimeout(() => setFireflagError(m => m === message ? null : m), 3000);
      console.log('Fireflag place error:', err);
    }
  }, [fireflaggedVideos, userId]);

  // ── PERSONAL BEST 100 ────────────────────────────────────────────────────
  const addToPersonalBest = useCallback(async (e, video) => {
    e.stopPropagation();
    if (!video || personalBestVideos[video.video_id]) return;
    try {
      await axios.post('https://web-production-a267.up.railway.app/personal-best/add', {
        user_id: userId,
        video_id: video.video_id,
        rank: video.rank,
        score: video.total_score,
      });
      setPersonalBestVideos(prev => ({ ...prev, [video.video_id]: true }));
      setPersonalBestAnimating(video.video_id);
      setTimeout(() => setPersonalBestAnimating(v => v === video.video_id ? null : v), 500);
      setPersonalBestPointsFlash(true);
      setTimeout(() => setPersonalBestPointsFlash(false), 1500);
      if (onPersonalBestAdded) onPersonalBestAdded(video.video_id);
    } catch (err) {
      const message = err.response?.data?.detail || 'Could not add to Personal Best 100';
      setPersonalBestError(message);
      setTimeout(() => setPersonalBestError(m => m === message ? null : m), 3000);
      console.log('Personal Best add error:', err);
    }
  }, [personalBestVideos, userId, onPersonalBestAdded]);

  // ── FLEX CAMERA ───────────────────────────────────────────────────────────
  const flexCameraInputRef = useRef(null);
  const openFlexCamera = useCallback((e) => {
    e.stopPropagation();
    flexCameraInputRef.current?.click();
  }, []);
  const handleFlexCameraFile = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    console.log('Flex camera photo captured:', file.name, file.type, file.size);
    setDotState('single');
  }, []);

  const bgColor = darkMode ? '#000000' : '#0A0A0A';

  // ── SHARED FORMATION RENDERER (zoomLevel 5 blend + zoomLevel 99 lock) ───
  const renderFormation = (blend, onCardClick, hintText) => (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:bgColor,
                  position:'relative', overflow:'hidden', touchAction:'none' }}
         {...pinchBind()}>
      <button onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); cycleZoom(); }}
              style={zoomButtonStyle}>
        ZOOM {zoomLevel}×
      </button>

      <div style={{ position:'absolute', top:'64px', left:'50%', transform:'translateX(-50%)',
                    color:'#C9A84C', fontSize:'clamp(24px,6vw,56px)', fontWeight:'bold',
                    letterSpacing:'12px', textAlign:'center', lineHeight:1.2,
                    opacity: blend, transition:'opacity 0.6s ease',
                    animation: blend >= 1 ? 'goldPulse 3s ease-in-out infinite' : 'none' }}>
        WORLD<br/>BEST
      </div>

      {gridLetterData.map(({ video, grid, letter }) => {
        const x = grid.x + (letter.x - grid.x) * blend;
        const y = grid.y + (letter.y - grid.y) * blend;
        const flagged = !!fireflaggedVideos[video.video_id];
        if (darkMode && !flagged) {
          return (
            <div key={video.video_id}
                 style={{ position:'absolute', left:`${x}%`, top:`${y}%`,
                          transform:'translate(-50%,-50%)', width:'32px', height:'18px',
                          backgroundColor:'#000000', transition:'left 0.7s ease, top 0.7s ease' }} />
          );
        }
        return (
          <div key={video.video_id}
               onClick={(e) => { e.stopPropagation(); onCardClick(video); }}
               style={{ position:'absolute', left:`${x}%`, top:`${y}%`,
                        transform:'translate(-50%,-50%)', width:'32px', height:'18px',
                        overflow:'hidden', cursor:'pointer', borderRadius:'1px',
                        border: video.rank === currentRank ? '1px solid #C9A84C' : '1px solid #222',
                        boxShadow: darkMode && flagged ? '0 0 20px rgba(243,156,18,0.4)' : 'none',
                        transition:'left 0.7s ease, top 0.7s ease', zIndex:5 }}>
            {video.thumbnail_url &&
              <img src={video.thumbnail_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
          </div>
        );
      })}

      <p style={{ position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)',
                  color:'#333', fontSize:'11px', letterSpacing:'3px' }}>
        {hintText}
      </p>

      <style>{`
        @keyframes goldPulse {
          0%,100% { text-shadow: 0 0 40px #C9A84C; }
          50%      { text-shadow: 0 0 80px #C9A84C, 0 0 120px #C9A84C; }
        }
      `}</style>
    </div>
  );

  if (!rankings || rankings.length === 0) {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'#C9A84C', fontSize:'14px', letterSpacing:'4px' }}>
          LOADING...
        </div>
      </div>
    );
  }

  // ── DROP ANIMATION OVERLAY ───────────────────────────────────────────────
  if (isDropping) {
    const dropVideo = dropTargetRank ? rankings[dropTargetRank - 1] : null;
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:bgColor, position:'relative', overflow:'hidden' }}>
        <animated.div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          opacity: dropSpring.p.to(p => Math.max(0, 1 - p * 1.3)),
          transform: dropSpring.p.to(p => `scale(${0.25 + p * p * 1.6}) translateY(${(1 - p) * -15}%)`),
        }}>
          <div style={{ color:'#C9A84C', fontSize:'clamp(28px,7vw,64px)', fontWeight:'bold',
                        letterSpacing:'14px', textAlign:'center', lineHeight:1.2,
                        textShadow:'0 0 40px #C9A84C' }}>
            WORLD<br/>BEST
          </div>
        </animated.div>

        {dropVideo && (
          <animated.div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            opacity: dropSpring.p.to(p => p < 0.6 ? 0 : (p - 0.6) / 0.4),
            transform: dropSpring.p.to(p => `scale(${0.9 + Math.min(p, 1) * 0.1})`),
          }}>
            <div style={{ ...getRankStyle(dropVideo.rank), textAlign:'center' }}>
              #{dropVideo.rank}
            </div>
            <div style={{ color:'#FFFFFF', fontSize:'16px', fontWeight:'bold', marginTop:'8px',
                          maxWidth:'320px', textAlign:'center', padding:'0 16px' }}>
              {dropVideo.title}
            </div>
          </animated.div>
        )}
      </div>
    );
  }

  if (!currentVideo) return null;

  // ── WORLD BEST FORMATION (zoomLevel 99, locked) ─────────────────────────
  if (zoomLevel === 99) {
    return renderFormation(1, (v) => playDropAnimation(v.rank), 'TAP ANY VIDEO TO EXPLORE');
  }

  // ── FORMATION FORMING (zoomLevel 5, 50/50 blend) ────────────────────────
  if (zoomLevel === 5) {
    return renderFormation(0.5, (v) => {
      const c = rankToCoord[v.rank];
      if (c) { setCurrentX(c.x); setCurrentY(c.y); setZoomLevel(1); }
    }, 'PINCH IN TO FOCUS · TAP CARD TO SELECT');
  }

  // ── 3x3 MAP (true spatial neighbors on the permanent grid) ──────────────
  if (zoomLevel === 3) {
    const cells = [];
    for (let dy = 1; dy >= -1; dy--) {
      for (let dx = -1; dx <= 1; dx++) cells.push({ dx, dy });
    }
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:bgColor,
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                    gridTemplateRows:'repeat(3,1fr)', gap:'3px', padding:'3px',
                    touchAction:'none', position:'relative' }}
           {...pinchBind()}>
        <button onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); cycleZoom(); }}
                style={zoomButtonStyle}>
          ZOOM {zoomLevel}×
        </button>
        {cells.map(({ dx, dy }) => {
          const isCenter = dx === 0 && dy === 0;
          const rank = coordToRank[`${currentX + dx},${currentY + dy}`];
          const v = rank ? rankings[rank - 1] : null;
          const flagged = v && !!fireflaggedVideos[v.video_id];
          if (darkMode && v && !flagged) {
            return (
              <div key={`${dx},${dy}`}
                   onClick={() => navigateToCoord(currentX + dx, currentY + dy)}
                   style={{ position:'relative', cursor:'pointer', backgroundColor:'#000000',
                            border: isCenter ? '2px solid #111' : 'none' }} />
            );
          }
          return (
            <div key={`${dx},${dy}`}
                 onClick={() => { if (v) navigateToCoord(currentX + dx, currentY + dy); }}
                 style={{ position:'relative', overflow:'hidden', cursor: v ? 'pointer' : 'default',
                          backgroundColor: darkMode ? '#000000' : '#111',
                          border: isCenter ? '2px solid #C9A84C' : '1px solid #222',
                          boxShadow: darkMode && flagged ? '0 0 20px rgba(243,156,18,0.4)' : 'none',
                          transform: isCenter ? 'scale(1.04)' : 'scale(1)',
                          transition:'transform 0.2s', zIndex: isCenter ? 2 : 1 }}>
              {v?.thumbnail_url &&
                <img src={v.thumbnail_url} alt=""
                     style={{ width:'100%', height:'100%', objectFit:'cover',
                              opacity: isCenter ? 0.85 : 0.4 }} />}
              {v && (
                <div style={{ position:'absolute', top:'50%', left:'50%',
                              transform:'translate(-50%,-50%)',
                              ...getRankStyle(v.rank),
                              fontSize: isCenter ? '28px' : '14px',
                              textShadow:'0 0 8px rgba(0,0,0,0.8)' }}>
                  #{v.rank}
                </div>
              )}
              {flagged && (
                <div style={{ position:'absolute', bottom:'2px', right:'2px' }}>
                  <FireflagIcon size={12} />
                </div>
              )}
            </div>
          );
        })}
        <div style={{ position:'fixed', bottom:'16px', left:'50%',
                      transform:'translateX(-50%)', color:'#333',
                      fontSize:'10px', letterSpacing:'2px' }}>
          PINCH IN TO FOCUS · TAP CARD TO SELECT
        </div>
      </div>
    );
  }

  // ── SINGLE CARD VIEW ────────────────────────────────────────────────────
  const isFlagged = !!fireflaggedVideos[currentVideo.video_id];
  const dimmedByDarkMode = darkMode && !isFlagged;
  const retroBg = darkMode ? '#000000' : '#0D0800';
  return (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:retroBg,
                  position:'relative', overflow:'hidden', touchAction:'none',
                  userSelect:'none' }}
         ref={singleCardRef}
         {...bind()} {...pinchBind()}
         onTouchStart={onTouchStartNav}
         onTouchEnd={onTouchEndNav} onTouchCancel={onTouchCancelNav}
         onDoubleClick={() => { if (markStage === 'idle') navigateToCoord(0, 0); }}
         onClick={() => { if (markStage === 'idle' && dotState === 'hidden') setDotState('single'); }}>

      {/* VIGNETTE */}
      <div style={{ position:'fixed', inset:0, zIndex:5, pointerEvents:'none',
                    background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />

      {/* GRAIN TEXTURE */}
      <div style={{ position:'fixed', inset:0, zIndex:6, pointerEvents:'none', opacity:0.06,
                    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* VIDEO CARD */}
      <animated.div style={{ ...springs, width:'100%', height:'100%',
                              display:'flex', flexDirection:'column',
                              alignItems:'center', justifyContent:'center',
                              opacity: dimmedByDarkMode ? 0 : 1,
                              pointerEvents: dimmedByDarkMode ? 'none' : 'auto',
                              transition:'opacity 0.4s ease' }}>

        {/* THUMBNAIL */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
  <YouTubePlayer
    videoId={currentVideo.video_id}
    startSeconds={currentVideo.peak_moment_seconds || 0}
    volume={zoomLevel === 1 ? 20 : 0}
    playing={!showColorWheel && zoomLevel === 1}
    thumbnailUrl={currentVideo.thumbnail_url}
  />
  <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(to bottom, rgba(10,10,10,0.1), rgba(10,10,10,0.7))',
                pointerEvents:'none' }} />
</div>

        {/* BEST LOGO */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center',
                      fontFamily:'Pacifico, cursive', fontSize:'48px', color:'#F5E6C8',
                      textShadow:'2px 2px 0 #C8A951, 4px 4px 0 #B8860B, 6px 6px 0 #8B6914, 8px 8px 0 rgba(0,0,0,0.5)',
                      marginBottom:'8px' }}>
          BEST
        </div>

        {/* RANK NUMBER */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ ...getRetroRankStyle(currentVideo.rank),
                        animation: currentVideo.rank === 1 ? 'pulse 3s infinite' : 'none' }}>
            #{currentVideo.rank}
          </div>

          {/* CURVED SWOOSH */}
          <svg width="200" height="40" viewBox="0 0 200 40" style={{ display:'block', margin:'0 auto' }}>
            <path d="M 20 10 Q 100 40 180 10"
                  stroke="#C8A951" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 175 5 Q 185 10 180 20"
                  stroke="#C8A951" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          <div style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'22px', color:'#F5E6C8',
                        letterSpacing:'3px', textAlign:'center',
                        marginTop:'4px', maxWidth:'320px', padding:'0 16px' }}>
            {currentVideo.title}
          </div>
          <div style={{ fontFamily:'Arial, sans-serif', fontSize:'12px', color:'#C8A951',
                        letterSpacing:'4px', textTransform:'uppercase',
                        textAlign:'center', marginTop:'6px' }}>
            {currentVideo.channel_name}
          </div>

          {/* COLOR DISTRIBUTION BAR — 4px, segments proportional to community mood */}
          {(() => {
            const dist = colorDistributions[currentVideo.video_id];
            const segments = dist && dist.total > 0 ? Object.entries(dist.distribution) : [];
            return (
              <div style={{ display:'flex', width:'240px', height:'4px', margin:'12px auto 0',
                            borderRadius:'2px', overflow:'hidden',
                            backgroundColor:'#1a1206', boxShadow:'inset 0 0 2px rgba(0,0,0,0.8)' }}>
                {segments.length === 0 ? (
                  <div style={{ flex:1, backgroundColor:'#333333' }} />
                ) : (
                  segments.map(([name, pct]) => (
                    <div key={name} title={`${name} ${pct}%`}
                         style={{ width:`${pct}%`, flexShrink:0, backgroundColor:getColorHex(name) }} />
                  ))
                )}
              </div>
            );
          })()}

          {/* SCORE BAR */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                        gap:'10px', marginTop:'14px' }}>
            <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'20px',
                          color:'#F5E6C8', letterSpacing:'1px' }}>
              {currentVideo.total_score}
            </span>
            <div style={{ width:'56px', height:'2px',
                          background:'linear-gradient(to right, transparent, #C8A951, #C8A951, transparent)' }} />
            <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14px',
                          color:'#8B6914', letterSpacing:'1px' }}>
              100
            </span>
          </div>
          <div style={{ textAlign:'center', color:'#C8A951', fontSize:'14px', marginTop:'6px' }}>
            ★
          </div>
          <div style={{ textAlign:'center', color:'#C8A951', fontSize:'8px',
                        letterSpacing:'3px', marginTop:'4px' }}>
            GLOBAL COMMUNITY VOTES
          </div>
        </div>

        {/* YOUTUBE LINK */}
        <div style={{ position:'absolute', bottom:'80px', left:'50%',
                      transform:'translateX(-50%)', zIndex:2 }}>
          <button
            onClick={(e) => { e.stopPropagation();
              window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
            style={{ backgroundColor:'transparent', border:'1px solid #333',
                     color:'#555', padding:'6px 16px', cursor:'pointer',
                     fontSize:'10px', letterSpacing:'2px' }}>
            WATCH ON YOUTUBE
          </button>
        </div>
      </animated.div>

      {/* NAVIGATION HINT */}
      <div style={{ position:'absolute', left:'16px', top:'50%',
                    transform:'translateY(-50%)', color:'#222',
                    fontSize:'24px', zIndex:3, pointerEvents:'none' }}>
        {coordToRank[`${currentX - 1},${currentY}`] ? '‹' : ''}
      </div>
      <div style={{ position:'absolute', right:'16px', top:'50%',
                    transform:'translateY(-50%)', color:'#222',
                    fontSize:'24px', zIndex:3, pointerEvents:'none' }}>
        {coordToRank[`${currentX + 1},${currentY}`] ? '›' : ''}
      </div>

      {/* PERMANENT MARK — dot + word left behind in the card's corner forever */}
      {assignedColors[currentVideo.video_id] && !dimmedByDarkMode && (
        <div style={{ position:'absolute', bottom:'16px', left:'16px', zIndex:8,
                      display:'flex', alignItems:'center', gap:'6px' }}>
          <div style={{ width:'10px', height:'10px', borderRadius:'50%',
                        backgroundColor: getColorHex(assignedColors[currentVideo.video_id]),
                        boxShadow:`0 0 6px ${getColorHex(assignedColors[currentVideo.video_id])}` }} />
          {assignedWords[currentVideo.video_id] && (
            <span style={{ color:'#666', fontSize:'9px', letterSpacing:'1px' }}>
              {assignedWords[currentVideo.video_id]}
            </span>
          )}
        </div>
      )}

      {/* FIREFLAG — tappable prompt while the three dots are open */}
      {dotState === 'three' && !isFlagged && (
        <div style={{ position:'absolute', bottom:'16px', right:'16px', zIndex:9,
                      display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
          {fireflagError && (
            <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                           maxWidth:'140px', textAlign:'right' }}>
              {fireflagError.toUpperCase()}
            </span>
          )}
          <FireflagIcon size={28} onClick={(e) => placeFireflag(e, currentVideo)} alt="Place fireflag" />
        </div>
      )}

      {/* FIREFLAG — permanent mark once placed */}
      {isFlagged && (
        <div style={{ position:'absolute', bottom:'16px', right:'16px', zIndex:9 }}>
          <FireflagIcon
            size={20}
            glow={darkMode}
            animatePop={fireflagAnimating === currentVideo.video_id}
            alt="Fireflag placed"
          />
        </div>
      )}

      {/* ZOOM HINT */}
      <div style={{ position:'absolute', bottom:'20px', left:'50%',
                    transform:'translateX(-50%)', color:'#222',
                    fontSize:'9px', letterSpacing:'2px', zIndex:3 }}>
        PINCH TO ZOOM · SWIPE TO NAVIGATE · DOUBLE TAP FOR #1
      </div>

      {/* RANDOM BUTTON — triggers a new drop animation */}
      <button
        onClick={(e) => { e.stopPropagation();
          playDropAnimation(Math.floor(Math.random() * totalRanks) + 1); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
          playDropAnimation(Math.floor(Math.random() * totalRanks) + 1); }}
        style={{ position:'absolute', top:'64px', left:'16px',
                 backgroundColor:'#0A0A0A', border:'1px solid #444',
                 color:'#AAA', padding:'10px 10px', cursor:'pointer',
                 fontSize:'9px', letterSpacing:'2px', zIndex:110 }}>
        RANDOM
      </button>

      {/* ZOOM BUTTON (pinch fallback) */}
      <button
        onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); cycleZoom(); }}
        style={zoomButtonStyle}>
        ZOOM {zoomLevel}×
      </button>

      {/* DOT UI */}
      {dotState !== 'hidden' && !showColorWheel && (
        <div style={{ position:'absolute', bottom:'120px', right:'24px', zIndex:10 }}>

          {dotState === 'single' && (
            <div onClick={(e) => { e.stopPropagation(); setDotState('three'); }}
                 onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setDotState('three'); }}
                 style={{ width:'44px', height:'44px', display:'flex',
                          alignItems:'center', justifyContent:'center',
                          cursor:'pointer' }}>
              <GoldDot style={{ animation:'fadeIn 0.3s ease', pointerEvents:'none' }} />
            </div>
          )}

          {dotState === 'three' && (
            <div style={{ position:'relative', width:'80px', height:'80px' }}>
              {/* CENTER DOT */}
              <div style={{ position:'absolute', bottom:'0', right:'0',
                            width:'12px', height:'12px', borderRadius:'50%',
                            backgroundColor:'#FFFFFF',
                            boxShadow:'0 0 8px rgba(255,255,255,0.5)' }} />
              {/* LEFT DOT — COLOR */}
              <div
                onClick={(e) => { e.stopPropagation(); setShowColorWheel(true); setDotState('hidden'); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
                  setShowColorWheel(true); setDotState('hidden'); }}
                style={{ position:'absolute', bottom:'32px', right:'40px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor:'#C9A84C', cursor:'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         fontSize:'14px', boxShadow:'0 0 12px rgba(201,168,76,0.6)',
                         animation:'popIn 0.3s ease' }}>
                🎨
              </div>
              {/* RIGHT DOT — WATCH */}
              <div
                onClick={(e) => { e.stopPropagation();
                  window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
                  window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
                style={{ position:'absolute', bottom:'40px', right:'-16px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor:'#E74C3C', cursor:'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         fontSize:'14px', boxShadow:'0 0 12px rgba(231,76,60,0.6)',
                         animation:'popIn 0.3s ease' }}>
                ▶
              </div>
              {/* TOP DOT — PERSONAL BEST 100 */}
              <div
                onClick={(e) => addToPersonalBest(e, currentVideo)}
                onTouchEnd={(e) => { e.preventDefault(); addToPersonalBest(e, currentVideo); }}
                style={{ position:'absolute', bottom:'64px', right:'8px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor: personalBestAnimating === currentVideo.video_id
                           || personalBestVideos[currentVideo.video_id] ? '#C9A84C' : '#FFFFFF',
                         cursor: personalBestVideos[currentVideo.video_id] ? 'default' : 'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         fontSize:'16px', fontWeight:'bold', color:'#0A0A0A',
                         boxShadow: personalBestAnimating === currentVideo.video_id
                           ? '0 0 16px rgba(201,168,76,0.9)' : '0 0 8px rgba(255,255,255,0.5)',
                         transition:'background-color 0.3s ease, box-shadow 0.3s ease',
                         animation:'popIn 0.3s ease' }}>
                {personalBestVideos[currentVideo.video_id] ? '✓' : '+'}
              </div>
              {/* FLEX CAMERA — capture a photo, above the color/watch dots */}
              <div
                onClick={openFlexCamera}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); openFlexCamera(e); }}
                style={{ position:'absolute', bottom:'96px', right:'8px',
                         width:'28px', height:'28px', borderRadius:'50%',
                         backgroundColor:'#1A1A1A', border:'1px solid #C8A951', cursor:'pointer',
                         display:'flex', alignItems:'center', justifyContent:'center',
                         boxShadow:'0 0 12px rgba(200,169,81,0.5)',
                         animation:'popIn 0.3s ease' }}>
                <FlexCamera style={{ width:'16px', height:'16px' }} />
              </div>
              <input ref={flexCameraInputRef} type="file" accept="image/*" capture="environment"
                     onChange={handleFlexCameraFile} style={{ display:'none' }} />
              {/* DISMISS */}
              <div onClick={(e) => { e.stopPropagation(); setDotState('single'); }}
                   onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setDotState('single'); }}
                   style={{ position:'absolute', top:'-16px', right:'-16px',
                            color:'#333', fontSize:'10px', cursor:'pointer',
                            padding:'12px' }}>✕</div>
            </div>
          )}

          {/* PERSONAL BEST — feedback (error / +50 flash) */}
          {dotState === 'three' && (personalBestError || personalBestPointsFlash) && (
            <div style={{ position:'absolute', bottom:'204px', right:'0',
                          display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
              {personalBestPointsFlash && (
                <span style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'bold',
                               letterSpacing:'1px', animation:'fadeIn 0.2s ease',
                               textShadow:'0 0 8px rgba(201,168,76,0.6)' }}>
                  +50 DISCOVERY
                </span>
              )}
              {personalBestError && (
                <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                               maxWidth:'140px', textAlign:'right' }}>
                  {personalBestError.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* COLOR WHEEL OVERLAY */}
      {showColorWheel && (
        <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.85)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:20 }}
             onClick={() => { setShowColorWheel(false); setDotState('single'); }}>
          <div onClick={e => e.stopPropagation()}
               style={{ backgroundColor:'#111', borderRadius:'8px',
                        padding:'24px', border:'1px solid #333' }}>
            <p style={{ color:'#555', fontSize:'11px', letterSpacing:'3px',
                        textAlign:'center', marginBottom:'16px' }}>
              HOW DOES THIS VIDEO MAKE YOU FEEL
            </p>
            <ColorWheel
              videoId={currentVideo.video_id}
              userId={userId}
              onColorSelected={(color) => startMark(color)}
            />
          </div>
        </div>
      )}

      {/* HUNT GAME */}
      {huntActive && (
        <HuntGame
          targetVideo={huntTargetVideo}
          angleDeg={huntAngle}
          withinRange={huntWithinRange}
          discovered={huntDiscovered}
          onClose={() => { if (onHuntStop) onHuntStop(); }}
        />
      )}

      {/* THE MARK — liquid spread → strip keyboard → snapshot → recede */}
      {markStage !== 'idle' && markColor && (
        <div style={{ position:'absolute', inset:0, zIndex:200, overflow:'hidden' }}>
          <div ref={markCaptureRef} style={{ position:'absolute', inset:0, overflow:'hidden' }}>
            {markVideo?.thumbnail_url && (
              <img src={markVideo.thumbnail_url} alt=""
                   style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.25 }} />
            )}
            {markDrips.width > 0 && (
              <svg width="100%" height="100%" preserveAspectRatio="none"
                   viewBox={`0 0 ${markDrips.width} ${markDrips.height}`}
                   style={{ position:'absolute', inset:0, display:'block' }}>
                {markDrips.paths.map(drip => (
                  <path key={drip.id} d={drip.d} fill={markColor.hex} opacity={0.85}
                        style={{
                          transformOrigin: `${drip.x}px 0px`,
                          transform: spreadOn ? 'scaleY(1)' : 'scaleY(0)',
                          transition: markStage === 'receding'
                            ? 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)'
                            : `transform ${drip.duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${drip.delay}ms`,
                        }} />
                ))}
              </svg>
            )}
            {(markStage === 'confirmed' || markStage === 'sharing' || markStage === 'receding') && (
              <div style={{
                position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                color:'#FFFFFF', fontSize:'48px', fontWeight:'bold', letterSpacing:'4px',
                textAlign:'center', maxWidth:'90%', wordBreak:'break-word',
                textShadow:'0 0 30px rgba(0,0,0,0.5)',
                opacity: markStage === 'receding' ? 0 : 1,
                transition:'opacity 0.8s ease',
              }}>
                {markWord}
              </div>
            )}
          </div>

          {markStage === 'keyboard' && (
            <StripKeyboard color={markColor.hex} onConfirm={confirmWord} />
          )}

          {markStage === 'sharing' && !shareFallback && (
            <button
              onClick={() => handleShare(markSnapshotUrl)}
              style={{ position:'absolute', bottom:'60px', left:'50%', transform:'translateX(-50%)',
                       backgroundColor: markColor.hex, color:'#0A0A0A', border:'none',
                       padding:'10px 24px', borderRadius:'20px', fontSize:'11px',
                       fontWeight:'bold', letterSpacing:'2px', cursor:'pointer', zIndex:210 }}>
              SHARE
            </button>
          )}
        </div>
      )}

      {/* SHARE FALLBACK — full-screen overlay when navigator.share fails or is unavailable */}
      {shareFallback && markSnapshotUrl && (
        <div style={{ position:'fixed', inset:0, zIndex:300, backgroundColor:'#000000',
                      display:'flex', flexDirection:'column', alignItems:'center',
                      justifyContent:'center' }}>
          <button onClick={dismissShareFallback}
            style={{ position:'absolute', top:'20px', right:'20px', backgroundColor:'transparent',
                     border:'1px solid #333', color:'#777', width:'32px', height:'32px',
                     borderRadius:'50%', fontSize:'16px', cursor:'pointer', zIndex:301 }}>
            ×
          </button>
          <img src={markSnapshotUrl} alt="Your BEST mark"
               style={{ maxWidth:'92%', maxHeight:'70%', objectFit:'contain',
                        borderRadius:'4px', boxShadow:'0 0 40px rgba(0,0,0,0.6)' }} />
          <div style={{ display:'flex', gap:'12px', marginTop:'32px' }}>
            <button onClick={() => handleSaveToGallery(markSnapshotUrl, markVideo)}
              style={{ backgroundColor:'#C9A84C', color:'#0A0A0A', border:'none',
                       padding:'12px 20px', borderRadius:'20px', fontSize:'11px',
                       fontWeight:'bold', letterSpacing:'2px', cursor:'pointer' }}>
              SAVE TO GALLERY
            </button>
            <button onClick={() => handleCopyLink(markVideo)}
              style={{ backgroundColor:'transparent', color:'#FFFFFF', border:'1px solid #444',
                       padding:'12px 20px', borderRadius:'20px', fontSize:'11px',
                       fontWeight:'bold', letterSpacing:'2px', cursor:'pointer' }}>
              {linkCopied ? 'LINK COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 40px #C9A84C; }
          50%      { text-shadow: 0 0 80px #C9A84C, 0 0 120px #C9A84C; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
}

export default SpatialMap;
