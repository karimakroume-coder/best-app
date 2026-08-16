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
import { ReactComponent as FlexCamera } from './assets/icons/flex-camera.svg';
import MandalaButton from './MandalaButton';
import MandalaFrameRings from './MandalaFrameRings';

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

// ── VINTAGE BUTTON — shared base for RANDOM / ZOOM ─────────────────────────
// Text-label styling (no fill, square corners) with a guaranteed 44x44
// touch target regardless of how small the visible padding reads.
const vintageButtonBase = {
  fontFamily: 'Bebas Neue, sans-serif',
  fontSize: '11px',
  letterSpacing: '4px',
  color: '#C8A951',
  backgroundColor: 'transparent',
  border: '1px solid #C8A951',
  borderRadius: 0,
  padding: '8px 16px',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const zoomButtonStyle = {
  ...vintageButtonBase,
  position: 'absolute', top: '64px', right: '16px', zIndex: 110,
};

// ── DOT ACTION PANEL — shared circle style for color/watch/best/camera ────
const dotCircleStyle = {
  width: '36px', height: '36px', borderRadius: '50%',
  border: '1px solid #C8A951', backgroundColor: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

const microNavStyle = {
  width: '30px', height: '30px', borderRadius: '50%',
  border: '1px solid #C8A951', backgroundColor: 'rgba(13,8,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
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

// ── MAP TRANSITION SOUND (Web Audio API) ─────────────────────────────────
let _audioCtx = null;
function playMapTransitionSound() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

function LockBadge() {
  return (
    <span style={{ position:'absolute', top:'-4px', right:'-4px',
                   fontSize:'11px', color:'#C9A84C',
                   textShadow:'0 0 4px rgba(0,0,0,0.9)',
                   pointerEvents:'none', zIndex:2 }}>🔒</span>
  );
}

// ── WHISPER SYSTEM (Map 2 empty coordinates) ───────────────────────────────
// Empty cards on the permanent grid breathe and whisper in the visitor's
// language, coaxing a creator to claim the spot. Visits are counted per
// coordinate in localStorage; after 5 visits the whisper goes silent and a
// gold "claimable" dot takes its place.
const WHISPERS = {
  ar: ["أعطها", "هذا المكان ينتظرك"],
  pt: ["alimente isso", "este lugar é seu"],
  ko: ["채워줘", "여기 무언가 살아야 해"],
  fr: ["nourris-le", "cet endroit t'attend"],
  default: ["feed it", "this place is waiting", "something should live here"],
};

function getWhisperPhrases() {
  const lang = (navigator.language || 'en').slice(0, 2);
  return WHISPERS[lang] || WHISPERS.default;
}

const WHISPER_VISIT_LIMIT = 5;

function WhisperCard({ coordKey }) {
  const [visits, setVisits] = useState(0);
  const [showWhisper, setShowWhisper] = useState(false);
  const phraseRef = useRef(null);
  if (phraseRef.current === null) {
    const phrases = getWhisperPhrases();
    phraseRef.current = phrases[Math.floor(Math.random() * phrases.length)];
  }

  useEffect(() => {
    const key = `best_whisper_visits_${coordKey}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const next = prev + 1;
    localStorage.setItem(key, String(next));
    setVisits(next);
    setShowWhisper(false);
  }, [coordKey]);

  useEffect(() => {
    if (visits >= WHISPER_VISIT_LIMIT) return;
    const t = setTimeout(() => setShowWhisper(true), 2000);
    return () => clearTimeout(t);
  }, [visits]);

  const silent = visits >= WHISPER_VISIT_LIMIT;

  return (
    <div style={{ position:'relative', width:'100%', height:'100%',
                  backgroundColor:'#000000', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  animation: silent ? 'none' : 'cardBreathe 4s ease-in-out infinite' }}>
      {silent ? (
        <div style={{ width:'8px', height:'8px', borderRadius:'50%',
                      backgroundColor:'#C9A84C', boxShadow:'0 0 12px #C9A84C' }} />
      ) : showWhisper ? (
        <div style={{ color:'#3A3A3A', fontSize:'10px', letterSpacing:'1px',
                      textAlign:'center', padding:'0 8px',
                      animation:'whisperFadeIn 1.5s ease' }}>
          {phraseRef.current}
        </div>
      ) : null}
    </div>
  );
}

function SpatialMap({ rankings, userId, onColorAssigned, onPersonalBestAdded, onFlexPlaced, onBeforeColor, darkMode, huntActive, onHuntComplete, onHuntStop, discoveryScore = 0, currentMap, setCurrentMap, onUIStateChange, categories = [], selectedCategory, onSelectCategory, userEmail, onLogout, onToggleDarkMode, onToggleHunt }) {
  const [currentX, setCurrentX]               = useState(0);
  const [currentY, setCurrentY]                = useState(0);
  const [zoomLevel, setZoomLevel]              = useState(1);
  const [dotState, setDotState]                = useState('single');
  const [focusMode, setFocusMode]               = useState(false);
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
  const [flexError, setFlexError] = useState(null);
  const [flexPointsFlash, setFlexPointsFlash] = useState(false);
  const [flexOpen, setFlexOpen] = useState(false);
  const [flexSnapped, setFlexSnapped] = useState(false);
  const [flexSnapshotUrl, setFlexSnapshotUrl] = useState(null);
  const [flexOverlay, setFlexOverlay] = useState('none');
  const [flexStickerDrop, setFlexStickerDrop] = useState(false);
  const [flexList, setFlexList] = useState([]);
  const [flexWallOpen, setFlexWallOpen] = useState(false);
  const [regSheetOpen, setRegSheetOpen] = useState(false);
  const [huntTargetRank, setHuntTargetRank] = useState(null);
  const [huntDiscovered, setHuntDiscovered] = useState(false);
  const [huntDate, setHuntDate] = useState(null);
  const [huntTargetVid, setHuntTargetVid] = useState(null);
  const [colorDistributions, setColorDistributions] = useState({});
  const [uiOpen, setUiOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('');
  const [fireflagRemaining, setFireflagRemaining] = useState(null);
  const [risingVideos, setRisingVideos] = useState([]);

  const MAP_LABELS = {
    'world-best': 'WORLD BEST',
    'best-map': 'BEST MAP',
    'my-best': 'MY BEST',
    'crew-best': 'CREW BEST',
    'crown': 'CROWN',
  };
  const [pbRankings, setPbRankings] = useState([]);

  // ── PROGRESSIVE REGISTRATION GATE ────────────────────────────────────────
  const isLoggedIn = !!(userId || localStorage.getItem('best_token'));

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
  const flexVideoRef = useRef(null);
  const flexCanvasRef = useRef(null);
  const flexStreamRef = useRef(null);
  const categoryPillRefs = useRef({});

  // ── ACTIVE RANKINGS — depends on which map is selected ─────────────────
  const activeRankings = currentMap === 'my-best' ? pbRankings : rankings;
  const totalRanks = activeRankings.length;

  const { rankToCoord, coordToRank } = useMemo(
    () => buildSpiralCoords(totalRanks),
    [totalRanks]
  );

  const currentRank  = coordToRank[`${currentX},${currentY}`];
  const currentVideo = currentRank ? activeRankings[currentRank - 1] : null;

  // ── HUNT GAME ─────────────────────────────────────────────────────────────
  const huntTargetVideo = huntTargetRank ? activeRankings[huntTargetRank - 1] : null;
  const huntTargetCoord = huntTargetRank ? rankToCoord[huntTargetRank] : null;
  const huntAngle = huntTargetCoord
    ? Math.atan2(huntTargetCoord.x - currentX, huntTargetCoord.y - currentY) * (180 / Math.PI)
    : 0;
  const huntWithinRange = !!(huntTargetRank && currentRank && Math.abs(currentRank - huntTargetRank) <= 5);

  useEffect(() => {
    if (huntActive && totalRanks > 0) {
      setHuntDiscovered(false);
      axios.get('https://web-production-a267.up.railway.app/hunt/daily')
        .then(res => {
          const targetVid = res.data.video_id;
          const targetDate = res.data.date;
          setHuntTargetVid(targetVid);
          setHuntDate(targetDate);
          const idx = activeRankings.findIndex(r => r.video_id === targetVid);
          setHuntTargetRank(idx >= 0 ? idx + 1 : Math.floor(Math.random() * totalRanks) + 1);
        })
        .catch(() => {
          setHuntTargetRank(Math.floor(Math.random() * totalRanks) + 1);
          setHuntTargetVid(null);
          setHuntDate(null);
        });
    } else if (!huntActive) {
      setHuntTargetRank(null);
      setHuntDiscovered(false);
      setHuntTargetVid(null);
      setHuntDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huntActive]);

  useEffect(() => {
    if (huntActive && huntTargetRank && currentRank === huntTargetRank && !huntDiscovered) {
      setHuntDiscovered(true);
      if (huntTargetVid && huntDate && userId) {
        axios.post('https://web-production-a267.up.railway.app/hunt/found', {
          user_id: userId, video_id: huntTargetVid, date: huntDate
        }).catch(() => {});
      }
      const t = setTimeout(() => { if (onHuntComplete) onHuntComplete(); }, 1400);
      return () => clearTimeout(t);
    }
  }, [huntActive, huntTargetRank, currentRank, huntDiscovered, onHuntComplete, huntTargetVid, huntDate, userId]);

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
    const top = activeRankings.slice(0, 50);
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
  }, [activeRankings, rankToCoord]);

  // ── MANDALA CONTROL CENTER — open/close the bloomed UI. Reports uiOpen to
  // App.js (for BNavigation visibility) via an effect rather than calling
  // onUIStateChange inline here, since calling a parent's setState from
  // inside a child event handler that also touches sibling state is easy to
  // get right but calling it from inside a *functional updater* (as an
  // earlier version of toggleUI did) isn't — React flags that as updating
  // a different component while rendering.
  const closeUI = useCallback(() => {
    setUiOpen(false);
    setDotState('single');
    setFlexWallOpen(false);
  }, []);

  const toggleUI = useCallback(() => {
    const next = !uiOpen;
    setUiOpen(next);
    setDotState(next ? 'three' : 'single');
    if (!next) setFlexWallOpen(false);
  }, [uiOpen]);

  useEffect(() => {
    if (onUIStateChange) onUIStateChange(uiOpen);
  }, [uiOpen, onUIStateChange]);

  // Hides peripheral single-card chrome (RANDOM/ZOOM/hint) while the
  // Mandala Control Center is bloomed open, so it doesn't compete with the
  // category strip / action row / profile row.
  const chromeHidden = uiOpen;

  // Auto-scroll category strip so active pill is centered when UI opens or category changes
  useEffect(() => {
    if (!uiOpen) return;
    const el = categoryPillRefs.current[selectedCategory];
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [uiOpen, selectedCategory]);

  // ── PERSONAL BEST DATA — fetch when my-best map is active ─────────────
  useEffect(() => {
    if (currentMap !== 'my-best' || !userId) { setPbRankings([]); return; }
    let cancelled = false;
    const API = 'https://web-production-a267.up.railway.app';
    Promise.all([
      axios.get(`${API}/personal-best/${userId}`),
      axios.get(`${API}/ranking/global`),
    ]).then(([pbRes, globalRes]) => {
      if (cancelled) return;
      const details = {};
      (globalRes.data || []).forEach(v => { details[v.video_id] = v; });
      const merged = (pbRes.data || [])
        .map((row, i) => {
          const video = details[row.video_id] || {};
          return {
            ...video,
            ...row,
            rank: row.rank_at_add || (i + 1),
            total_score: row.score_at_add || video.total_score || 0,
          };
        });
      setPbRankings(merged);
    }).catch(() => { if (!cancelled) setPbRankings([]); });
    return () => { cancelled = true; };
  }, [currentMap, userId]);

  // ── FIREFLAG REMAINING COUNT ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    axios.get(`https://web-production-a267.up.railway.app/fireflag/remaining/${userId}`)
      .then(res => { if (!cancelled) setFireflagRemaining(res.data.remaining); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  // ── RISING FAST VIDEOS ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    axios.get('https://web-production-a267.up.railway.app/ranking/rising')
      .then(res => { if (!cancelled) setRisingVideos(res.data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // ── DOT FADE TIMER ──────────────────────────────────────────────────────
  useEffect(() => {
    if (dotState === 'single') {
      const t = setTimeout(() => setDotState('hidden'), 3000);
      return () => clearTimeout(t);
    }
  }, [dotState, currentRank]);

  // ── CINEMATIC FOCUS MODE ─────────────────────────────────────────────────
  // After a few seconds dwelling on the same video, let the chrome recede so
  // the video can breathe: rank pushed aside, title/logo dimmed, score bar
  // and swoosh hidden. resetFocusTimer is imperative (ref-based) rather than
  // purely effect-driven so any tap on the card can restart the countdown,
  // not just landing on a new rank.
  const focusTimerRef = useRef(null);

  const resetFocusTimer = useCallback(() => {
    setFocusMode(false);
    clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      setFocusMode(true);
    }, 6000);
  }, []);

  useEffect(() => {
    resetFocusTimer();
    return () => clearTimeout(focusTimerRef.current);
  }, [currentRank, resetFocusTimer]);

  useEffect(() => {
    console.log('focus mode:', focusMode);
  }, [focusMode]);

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

  // ── CINEMATIC MAP TRANSITION ──────────────────────────────────────────
  // Detects currentMap changes from outside and triggers the transition sequence.
  const prevMapRef = useRef(currentMap);
  useEffect(() => {
    if (prevMapRef.current !== currentMap && !transitioning) {
      setTransitioning(true);
      setTransitionPhase('exit');
    }
    prevMapRef.current = currentMap;
  }, [currentMap, transitioning]);

  useEffect(() => {
    if (!transitioning) return;
    playMapTransitionSound();
    const exitTimer = setTimeout(() => setTransitionPhase('logo'), 300);
    const logoTimer = setTimeout(() => setTransitionPhase('enter'), 600);
    const enterTimer = setTimeout(() => {
      setTransitionPhase('');
      setTransitioning(false);
      playDropAnimation(Math.floor(Math.random() * Math.max(activeRankings.length, 1)) + 1);
    }, 900);
    return () => { clearTimeout(exitTimer); clearTimeout(logoTimer); clearTimeout(enterTimer); };
  }, [transitioning, playDropAnimation, activeRankings.length]);

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
        axios.post('https://web-production-a267.up.railway.app/color/assign', {
          user_id: userId,
          video_id: markVideo.video_id,
          color: markColor.name,
          word: markWord || null,
          snapshot_url: markSnapshotUrl || null,
        }).catch(err => console.log('Color assign error:', err));
        if (onColorAssigned) onColorAssigned(markVideo.video_id, markColor.name);
      }
      setMarkStage('idle');
      setMarkColor(null);
      setMarkSnapshotUrl(null);
      setMarkWord('');
      setDotState('single');
    }, 800);
    return () => clearTimeout(t);
  }, [markStage, markVideo, markColor, markWord, markSnapshotUrl, onColorAssigned, userId]);

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
    resetFocusTimer();
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
    } else if (absX < 10 && absY < 10) {
      // Tap — reveal the dot UI, or collapse the open panel back to the dot.
      if (dotState === 'hidden') setDotState('single');
      else if (dotState === 'three') {
        setDotState('single'); setUiOpen(false); setFlexWallOpen(false);
        if (onUIStateChange) onUIStateChange(false);
      }
    }
  }, [markStage, currentX, currentY, navigateToCoord, dotState, resetFocusTimer, onUIStateChange]);

  // ── 3x3 GRID SWIPE NAV ───────────────────────────────────────────────────
  // The grid view has no useDrag binding of its own (only pinchBind for
  // zoom), so it never picked up swipes — separate from onTouchStartNav/
  // onTouchEndNav above since those also drive the single-card dot UI and
  // focus timer, neither of which apply here.
  const gridTouchStartRef = useRef(null);

  const onGridTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) { gridTouchStartRef.current = null; return; }
    const t = e.touches[0];
    gridTouchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onGridTouchEnd = useCallback((e) => {
    const start = gridTouchStartRef.current;
    gridTouchStartRef.current = null;
    if (!start || e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - start.x;
    const deltaY = t.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX > 50 && absX > absY) {
      navigateToCoord(currentX + (deltaX < 0 ? 1 : -1), currentY);
    } else if (absY > 50 && absY > absX) {
      navigateToCoord(currentX, currentY + (deltaY < 0 ? 1 : -1));
    }
  }, [currentX, currentY, navigateToCoord]);

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
    if (!isLoggedIn) { setRegSheetOpen(true); return; }
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
  }, [fireflaggedVideos, userId, isLoggedIn]);

  // ── PERSONAL BEST 100 ────────────────────────────────────────────────────
  const addToPersonalBest = useCallback(async (e, video) => {
    e.stopPropagation();
    if (!isLoggedIn) { setRegSheetOpen(true); return; }
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
  }, [personalBestVideos, userId, onPersonalBestAdded, isLoggedIn]);

  // ── FLEX WALL ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentVideo) return;
    let cancelled = false;
    axios.get(`https://web-production-a267.up.railway.app/flex/list/${currentVideo.video_id}`)
      .then(res => { if (!cancelled) setFlexList(res.data.flexes || []); })
      .catch(() => { if (!cancelled) setFlexList([]); });
    return () => { cancelled = true; };
  }, [currentVideo]);

  // The backend doesn't store a wall position per flex, so scatter them
  // deterministically by index (stable across re-renders, avoids the
  // header caption band at the top).
  const flexWallPosition = (i) => {
    const h1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const h2 = Math.abs(Math.sin(i * 78.233) * 12543.789) % 1;
    return { x: 12 + h1 * 76, y: 22 + h2 * 66 };
  };

  // ── FLEX CAMERA PANEL ─────────────────────────────────────────────────────
  // A fixed panel slides in from the right edge with a live selfie feed.
  // SNAP freezes a frame, the overlay strip picks a sticker, and FLEX IT
  // uploads the snapshot. ✕ closes the panel and stops the camera.
  const FLEX_OVERLAYS = ['none', '😎', '🔥', '💀', '👑', '⚡', '🌊', '🎭', '✨'];

  const stopFlexStream = useCallback(() => {
    if (flexStreamRef.current) {
      flexStreamRef.current.getTracks().forEach(track => track.stop());
      flexStreamRef.current = null;
    }
    if (flexVideoRef.current) {
      flexVideoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!flexOpen || flexSnapped) return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        flexStreamRef.current = stream;
        if (flexVideoRef.current) {
          flexVideoRef.current.srcObject = stream;
          flexVideoRef.current.play().catch(() => {});
        }
      })
      .catch(() => setFlexError('Camera unavailable'));
    return () => { cancelled = true; };
  }, [flexOpen, flexSnapped]);

  const openFlexPanel = useCallback((e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!isLoggedIn) { setRegSheetOpen(true); return; }
    setFlexError(null);
    setFlexSnapped(false);
    setFlexSnapshotUrl(null);
    setFlexOverlay('none');
    setFlexStickerDrop(false);
    setFlexOpen(true);
  }, [isLoggedIn]);

  const closeFlexPanel = useCallback(() => {
    stopFlexStream();
    setFlexOpen(false);
    setFlexSnapped(false);
    setFlexSnapshotUrl(null);
    setFlexStickerDrop(false);
    setDotState('single');
  }, [stopFlexStream]);

  const snapFlexPhoto = useCallback(() => {
    const video = flexVideoRef.current;
    const canvas = flexCanvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    canvas.width = 120;
    canvas.height = 120;
    canvas.getContext('2d').drawImage(video, 0, 0, 120, 120);
    setFlexSnapshotUrl(canvas.toDataURL('image/jpeg', 0.8));
    setFlexSnapped(true);
  }, []);

  const postFlex = useCallback(async () => {
    if (!flexSnapshotUrl || !currentVideo || flexStickerDrop) return;
    setFlexStickerDrop(true);
    try {
      await axios.post('https://web-production-a267.up.railway.app/flex/place', {
        user_id: userId,
        video_id: currentVideo.video_id,
        photo_base64: flexSnapshotUrl,
        overlay_type: flexOverlay,
      });
      setTimeout(() => setFlexPointsFlash(true), 500);
      setTimeout(() => { setFlexPointsFlash(false); closeFlexPanel(); }, 1800);
      if (onFlexPlaced) onFlexPlaced(currentVideo.video_id);
    } catch (err) {
      const message = err.response?.data?.detail || 'Could not place flex photo';
      setFlexError(message);
      setFlexStickerDrop(false);
      setTimeout(() => setFlexError(m => m === message ? null : m), 3000);
      console.log('Flex place error:', err);
    }
  }, [flexSnapshotUrl, flexStickerDrop, currentVideo, userId, flexOverlay, onFlexPlaced, closeFlexPanel]);

  const openColorWheel = useCallback((e) => {
    if (onBeforeColor && onBeforeColor()) return;
    e.stopPropagation();
    if (!isLoggedIn) { setRegSheetOpen(true); return; }
    setShowColorWheel(true);
    setDotState('hidden');
  }, [isLoggedIn, onBeforeColor]);

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

  if (!activeRankings || activeRankings.length === 0) {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'#C9A84C', fontSize:'14px', letterSpacing:'4px' }}>
          LOADING...
        </div>
      </div>
    );
  }

  // ── MAP PLACEHOLDERS ──────────────────────────────────────────────────
  if (currentMap === 'best-map') {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#000000',
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
                    opacity: transitionPhase === 'exit' ? 0 : 1,
                    transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none' }}>
        <div style={{ fontFamily:'Pacifico, cursive', color:'#C8A951',
                      fontSize:'clamp(28px,7vw,56px)', marginBottom:'16px',
                      textShadow:'0 0 30px rgba(201,168,76,0.3)' }}>
          BEST MAP
        </div>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#555',
                      fontSize:'12px', letterSpacing:'3px' }}>
          Coming soon — claim your coordinate
        </div>
        <style>{`
          @keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
        `}</style>
      </div>
    );
  }
  if (currentMap === 'crew-best') {
    const crewAvatars = ['#C8A951','#A8A9AD','#F5E6C8','#CD7F32','#8B7355'];
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
                    opacity: transitionPhase === 'exit' ? 0 : 1,
                    transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none' }}>
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          {crewAvatars.map((c, i) => (
            <div key={i} style={{ width:'36px', height:'36px', borderRadius:'50%',
                                  border:`2px solid ${c}`, backgroundColor:'transparent',
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  opacity: 0.5 + (i === 0 ? 0.5 : 0) }}>
              <span style={{ color:c, fontSize:'14px', fontWeight:'bold' }}>?</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'Pacifico, cursive', color:'#CD7F32',
                      fontSize:'clamp(28px,7vw,56px)', marginBottom:'12px',
                      textShadow:'0 0 30px rgba(205,127,50,0.3)' }}>
          CREW BEST
        </div>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#555',
                      fontSize:'12px', letterSpacing:'3px', marginBottom:'20px' }}>
          Vote with your crew on the best videos
        </div>
        <button style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'13px', letterSpacing:'4px',
                         color:'#0D0800', backgroundColor:'#CD7F32', border:'none', borderRadius:0,
                         padding:'10px 28px', cursor:'pointer', opacity:0.6 }}>
          CREATE CREW
        </button>
        <style>{`
          @keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
        `}</style>
      </div>
    );
  }
  if (currentMap === 'crown') {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#0A0A0A',
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
                    opacity: transitionPhase === 'exit' ? 0 : 1,
                    transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>👑</div>
        <div style={{ fontFamily:'Pacifico, cursive', color:'#C8A951',
                      fontSize:'clamp(28px,7vw,56px)', marginBottom:'16px',
                      textShadow:'0 0 30px rgba(201,168,76,0.3)' }}>
          CROWN
        </div>
        <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#555',
                      fontSize:'12px', letterSpacing:'3px' }}>
          Next CROWN opens March 2027
        </div>
        <style>{`
          @keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
        `}</style>
      </div>
    );
  }

  // ── CINEMATIC MAP TRANSITION OVERLAY ──────────────────────────────────
  if (transitionPhase === 'logo') {
    return (
      <div style={{ width:'100vw', height:'100vh', backgroundColor:'#000000',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'fixed', inset:0, zIndex:200 }}>
        <div style={{ fontFamily:'Pacifico, cursive', color:'#C8A951',
                      fontSize:'clamp(28px,7vw,56px)',
                      textShadow:'0 0 40px #C9A84C',
                      animation:'logoFlash 0.3s ease' }}>
          BEST
        </div>
        <style>{`
          @keyframes logoFlash { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
        `}</style>
      </div>
    );
  }

  // ── DROP ANIMATION OVERLAY ───────────────────────────────────────────────
  if (isDropping) {
    const dropVideo = dropTargetRank ? activeRankings[dropTargetRank - 1] : null;
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
    return (
      <div style={{ position:'relative', width:'100vw', height:'100vh' }}>
        {renderFormation(1, (v) => playDropAnimation(v.rank), 'TAP ANY VIDEO TO EXPLORE')}
        <div style={{ position:'fixed', bottom:'40px', left:'50%', transform:'translateX(-50%)',
                      zIndex:10, pointerEvents:'none', animation:'fadeIn 0.6s ease' }}>
          <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C9A84C',
                        fontSize:'9px', letterSpacing:'6px', textAlign:'center',
                        textShadow:'0 0 12px rgba(201,168,76,0.5)' }}>
            GLOBAL RANKING · {totalRanks} VIDEOS
          </div>
        </div>
      </div>
    );
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
           {...pinchBind()}
           onTouchStart={onGridTouchStart}
           onTouchEnd={onGridTouchEnd}>
        <button onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); cycleZoom(); }}
                style={zoomButtonStyle}>
          ZOOM {zoomLevel}×
        </button>
        {cells.map(({ dx, dy }, idx) => {
          const isCenter = dx === 0 && dy === 0;
          const cellX = currentX + dx, cellY = currentY + dy;
          const rank = coordToRank[`${cellX},${cellY}`];
          const v = rank ? activeRankings[rank - 1] : null;
          const isEmpty = !v || !v.video_id;
          console.log('card', idx, 'video:', v?.video_id, 'isEmpty:', isEmpty);
          const flagged = v && !!fireflaggedVideos[v.video_id];
          if (darkMode && v && !flagged && !isEmpty) {
            return (
              <div key={`${dx},${dy}`}
                   onClick={() => navigateToCoord(cellX, cellY)}
                   style={{ position:'relative', cursor:'pointer', backgroundColor:'#000000',
                            border: isCenter ? '2px solid #111' : 'none' }} />
            );
          }
          return (
            <div key={`${dx},${dy}`}
                 onClick={() => { if (!isEmpty) navigateToCoord(cellX, cellY); }}
                 style={{ position:'relative', overflow:'hidden', cursor: !isEmpty ? 'pointer' : 'default',
                          backgroundColor: darkMode ? '#000000' : '#111',
                          border: isCenter ? '2px solid #C9A84C' : '1px solid #222',
                          boxShadow: darkMode && flagged ? '0 0 20px rgba(243,156,18,0.4)' : 'none',
                          transform: isCenter ? 'scale(1.04)' : 'scale(1)',
                          transition:'transform 0.2s', zIndex: isCenter ? 2 : 1 }}>
              {isEmpty ? (
                <WhisperCard coordKey={`${cellX},${cellY}`} />
              ) : (
                <>
                  {v?.thumbnail_url &&
                    <img src={v.thumbnail_url} alt=""
                         style={{ width:'100%', height:'100%', objectFit:'cover',
                                  opacity: isCenter ? 0.85 : 0.4 }} />}
                  <div style={{ position:'absolute', top:'50%', left:'50%',
                                transform:'translate(-50%,-50%)',
                                ...getRankStyle(v.rank),
                                fontSize: isCenter ? '28px' : '14px',
                                textShadow:'0 0 8px rgba(0,0,0,0.8)' }}>
                    #{v.rank}
                  </div>
                  {flagged && (
                    <div style={{ position:'absolute', bottom:'2px', right:'2px' }}>
                      <FireflagIcon size={12} />
                    </div>
                  )}
                  {risingVideos.some(r => r.video_id === v?.video_id) && (
                    <div style={{ position:'absolute', top:'2px', right:'2px',
                                  fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                                  fontSize:'12px', lineHeight:1, textShadow:'0 0 4px rgba(0,0,0,0.8)' }}>
                      ↗
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div style={{ position:'fixed', bottom:'16px', left:'50%',
                      transform:'translateX(-50%)', color:'#333',
                      fontSize:'10px', letterSpacing:'2px' }}>
          PINCH IN TO FOCUS · TAP CARD TO SELECT
        </div>
        <style>{`
          @keyframes cardBreathe {
            0%,100% { filter: brightness(1); }
            50%      { filter: brightness(1.35); }
          }
          @keyframes whisperFadeIn {
            from { opacity:0; }
            to   { opacity:1; }
          }
        `}</style>
      </div>
    );
  }

  // ── SINGLE CARD VIEW ────────────────────────────────────────────────────
  const isFlagged = !!fireflaggedVideos[currentVideo.video_id];
  const dimmedByDarkMode = darkMode && !isFlagged;
  const retroBg = darkMode ? '#000000' : '#0D0800';
  const rankStyle = getRetroRankStyle(currentVideo.rank);
  return (
    <div style={{ width:'100vw', height:'100vh', backgroundColor:retroBg,
                  position:'relative', overflow:'hidden', touchAction:'none',
                  userSelect:'none' }}
         ref={singleCardRef}
         {...bind()} {...pinchBind()}
         onTouchStart={(e) => { resetFocusTimer(); onTouchStartNav(e); }}
         onTouchEnd={onTouchEndNav} onTouchCancel={onTouchCancelNav}
         onDoubleClick={() => { if (markStage === 'idle') navigateToCoord(0, 0); }}
         onClick={() => {
           resetFocusTimer();
           if (markStage !== 'idle') return;
           if (dotState === 'hidden') setDotState('single');
           else if (dotState === 'three') closeUI();
         }}>

      {/* VIGNETTE */}
      <div style={{ position:'fixed', inset:0, zIndex:5, pointerEvents:'none',
                    background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />

      {/* MAP INDICATOR PILL — shows current map when UI is open */}
      {uiOpen && (
        <div style={{ position:'fixed', top:'60px', left:'50%', transform:'translateX(-50%)',
                      zIndex:160, backgroundColor:'rgba(13,8,0,0.85)',
                      border:'1px solid #C8A951', borderRadius:'16px',
                      padding:'6px 20px', pointerEvents:'none',
                      animation:'fadeInSimple 0.3s ease' }}>
          <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                         fontSize:'12px', letterSpacing:'4px' }}>
            {MAP_LABELS[currentMap] || currentMap.toUpperCase()}
          </span>
        </div>
      )}

      {/* DISCOVERY SCORE — near profile area when UI is open */}
      {uiOpen && discoveryScore > 0 && (
        <div style={{ position:'fixed', top:'60px', right:'80px', zIndex:160,
                      pointerEvents:'none', animation:'fadeInSimple 0.3s ease' }}>
          <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C9A84C',
                         fontSize:'11px', letterSpacing:'2px', opacity:0.8 }}>
            ★ {discoveryScore}
          </span>
        </div>
      )}

      {/* MANDALA CONTROL CENTER — TOP BAR: category strip (left) slides down,
          profile + utility row (right) fades in from the left */}
      {uiOpen && (
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:150,
                      padding:'10px 16px', display:'flex', alignItems:'center',
                      justifyContent:'space-between', gap:'12px',
                      backgroundColor:'rgba(13,8,0,0.85)', backdropFilter:'blur(8px)',
                      animation:'slideDown 0.3s ease-out' }}>

          {/* CATEGORY STRIP */}
          <div className="category-strip"
               style={{ display:'flex', gap:'8px', overflowX:'auto',
                        scrollBehavior:'smooth', scrollbarWidth:'none',
                        msOverflowStyle:'none', maxWidth:'58vw' }}>
            {categories.map(cat => (
              <button key={cat.value}
                ref={el => { categoryPillRefs.current[cat.value] = el; }}
                onClick={(e) => { e.stopPropagation(); if (onSelectCategory) onSelectCategory(cat.value); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
                  if (onSelectCategory) onSelectCategory(cat.value); }}
                style={{ backgroundColor: selectedCategory === cat.value ? '#C8A951' : 'transparent',
                         color: selectedCategory === cat.value ? '#0D0800' : '#C8A951',
                         border: selectedCategory === cat.value ? 'none' : '1px solid #333',
                         padding:'5px 14px', cursor:'pointer', flexShrink:0,
                         fontFamily:'Bebas Neue, sans-serif', fontSize:'11px',
                         letterSpacing:'2px', borderRadius:'2px' }}>
                {cat.label.toUpperCase()}
              </button>
            ))}
            <style>{`.category-strip::-webkit-scrollbar { display: none; }`}</style>
          </div>

          {/* PROFILE + UTILITY ROW */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px',
                        flexShrink:0, animation:'fadeInLeft 0.35s ease-out' }}>

            {/* Rotating FLEX photos — reuses the current video's flex reactions
                as a stand-in "profile" strip until a per-user flex feed exists */}
            {flexList.slice(0, 4).map((flex, i) => (
              flex.photo_url && (
                <img key={flex.id || i} src={flex.photo_url} alt=""
                     style={{ width:'22px', height:'22px', borderRadius:'50%',
                              objectFit:'cover', border:'1px solid #C8A951',
                              animation:`fadeInLeft 0.35s ease-out ${i * 0.08}s both` }} />
              )
            ))}

            {/* WATCH — moved here from the old vertical action stack now that
                MARK/MY 100/FLEX live in the frame-ring openings below */}
            <div onClick={(e) => { e.stopPropagation();
                   window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
                 onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
                   window.open(`https://youtube.com/watch?v=${currentVideo.video_id}`, '_blank'); }}
                 title="Watch on YouTube"
                 style={microNavStyle}>
              <span style={{ color:'#C8A951', fontSize:'12px', lineHeight:1 }}>▶</span>
            </div>

            <div onClick={(e) => { e.stopPropagation(); if (onToggleHunt) onToggleHunt(); }}
                 onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); if (onToggleHunt) onToggleHunt(); }}
                 title={huntActive ? 'Stop hunt' : 'Start hunt'}
                 style={{ ...microNavStyle,
                          borderColor: huntActive ? '#C9A84C' : '#555',
                          boxShadow: huntActive ? '0 0 6px rgba(201,168,76,0.7)' : 'none' }}>
              <span style={{ fontSize:'10px', color: huntActive ? '#C9A84C' : '#555' }}>▲</span>
            </div>

            <div onClick={(e) => { e.stopPropagation(); if (onToggleDarkMode) onToggleDarkMode(); }}
                 onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); if (onToggleDarkMode) onToggleDarkMode(); }}
                 title={darkMode ? 'Dark mode on' : 'Dark mode off'}
                 style={{ ...microNavStyle,
                          borderColor: darkMode ? '#C9A84C' : '#555',
                          boxShadow: darkMode ? '0 0 6px rgba(201,168,76,0.7)' : 'none' }}>
              <span style={{ fontSize:'10px' }}>{darkMode ? '●' : '○'}</span>
            </div>

            {userEmail ? (
              <>
                <span style={{ color:'#C9A84C', fontSize:'9px', letterSpacing:'1px', maxWidth:'80px',
                               overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {userEmail}
                </span>
                <button onClick={(e) => { e.stopPropagation(); if (onLogout) onLogout(); }}
                        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); if (onLogout) onLogout(); }}
                        style={{ backgroundColor:'transparent', border:'1px solid #333',
                                 color:'#555', padding:'3px 8px', cursor:'pointer',
                                 fontSize:'8px', letterSpacing:'1px' }}>
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <a href="/login" onClick={(e) => e.stopPropagation()}
                   style={{ color:'#C9A84C', fontSize:'9px', letterSpacing:'1px', textDecoration:'none' }}>
                  SIGN IN
                </a>
                <a href="/register" onClick={(e) => e.stopPropagation()}
                   style={{ color:'#555', fontSize:'9px', letterSpacing:'1px', textDecoration:'none' }}>
                  REGISTER
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* MANDALA CONTROL CENTER — RIGHT: FLEX wall slide-in tab */}
      {uiOpen && !flexWallOpen && flexList.length > 0 && (
        <div onClick={(e) => { e.stopPropagation(); setFlexWallOpen(true); }}
             onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setFlexWallOpen(true); }}
             style={{ position:'fixed', top:'50%', right:0, transform:'translateY(-50%)',
                      zIndex:150, backgroundColor:'rgba(13,8,0,0.9)',
                      border:'1px solid #C8A951', borderRight:'none',
                      borderRadius:'8px 0 0 8px', padding:'10px 6px',
                      cursor:'pointer', animation:'fadeInLeft 0.3s ease-out',
                      writingMode:'vertical-rl', textOrientation:'mixed' }}>
          <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                         fontSize:'10px', letterSpacing:'2px' }}>
            {flexList.length} FLEX WALL
          </span>
        </div>
      )}

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
                      fontFamily:'Pacifico, cursive',
                      fontSize: focusMode ? '24px' : '48px', color:'#F5E6C8',
                      textShadow:'2px 2px 0 #C8A951, 4px 4px 0 #B8860B, 6px 6px 0 #8B6914, 8px 8px 0 rgba(0,0,0,0.5)',
                      marginBottom:'8px',
                      transition:'all 0.8s ease-out',
                      transform: focusMode ?
                        'translateY(-60px) scale(0.4)' :
                        'translateY(0) scale(1)',
                      opacity: focusMode ? 0.2 : 1 }}>
          BEST
        </div>

        {/* RANK NUMBER */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ ...rankStyle,
                        animation: currentVideo.rank === 1 ? 'pulse 3s infinite' : 'none',
                        transition:'all 0.8s ease-out',
                        fontSize: focusMode ? '36px' : rankStyle.fontSize,
                        transform: focusMode ? 'translateX(40vw)' : 'translateX(0)',
                        opacity: focusMode ? 0.4 : 1 }}>
            #{currentVideo.rank}
          </div>

          {/* CURVED SWOOSH */}
          <svg width="200" height="40" viewBox="0 0 200 40"
               style={{ display:'block', margin:'0 auto',
                        transition:'opacity 0.5s ease',
                        opacity: focusMode ? 0 : 1 }}>
            <path d="M 20 10 Q 100 40 180 10"
                  stroke="#C8A951" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 175 5 Q 185 10 180 20"
                  stroke="#C8A951" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#F5E6C8',
                        textAlign:'center',
                        marginTop:'4px', maxWidth:'320px', padding:'0 16px',
                        transition:'all 0.8s ease-out',
                        fontSize: focusMode ? '13px' : '22px',
                        letterSpacing: focusMode ? '2px' : '3px',
                        transform: focusMode ? 'translateY(80px)' : 'translateY(0)',
                        opacity: focusMode ? 0.7 : 1 }}>
            {currentVideo.title}
          </div>

          {flexList.length > 0 && (
            <div onClick={() => setFlexWallOpen(true)}
                 onTouchEnd={(e) => { e.preventDefault(); setFlexWallOpen(true); }}
                 style={{ color:'#C8A951', fontFamily:'Bebas Neue,sans-serif',
                          fontSize:11, letterSpacing:3, cursor:'pointer',
                          textAlign:'center', marginTop:8 }}>
              {flexList.length} FLEXES — TAP TO SEE
            </div>
          )}

          <div style={{ fontFamily:'Arial, sans-serif', color:'#C8A951',
                        letterSpacing:'4px', textTransform:'uppercase',
                        textAlign:'center', marginTop:'6px',
                        transition:'all 0.5s ease',
                        fontSize: focusMode ? '9px' : '12px',
                        opacity: focusMode ? 0.4 : 1 }}>
            {currentVideo.channel_name}
          </div>

          {/* RISING FAST + FIREFLAG COUNT */}
          {(() => {
            const isRising = risingVideos.some(r => r.video_id === currentVideo.video_id);
            const ffCount = currentVideo.fireflag_count || 0;
            if (!isRising && ffCount === 0) return null;
            return (
              <div style={{ textAlign:'center', marginTop:'6px',
                            transition:'opacity 0.5s ease', opacity: focusMode ? 0.3 : 1 }}>
                {isRising && (
                  <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                                fontSize:'11px', letterSpacing:'2px',
                                animation:'risingPulse 2s ease-in-out infinite' }}>
                    ↗ RISING FAST
                  </div>
                )}
                {ffCount > 0 && (
                  <div style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                                fontSize:'10px', letterSpacing:'1px', marginTop:'2px' }}>
                    🔥 {ffCount} {ffCount === 1 ? 'USER' : 'USERS'}
                  </div>
                )}
              </div>
            );
          })()}

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

          {/* SCORE BAR CONTAINER */}
          <div style={{ transition:'opacity 0.5s ease', opacity: focusMode ? 0 : 1 }}>
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
        </div>

        {/* YOUTUBE LINK — circular play button */}
        <button
          onClick={(e) => { e.stopPropagation();
            window.open('https://youtube.com/watch?v=' + currentVideo.video_id, '_blank'); }}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
            window.open('https://youtube.com/watch?v=' + currentVideo.video_id, '_blank'); }}
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#FF0000',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
          <span style={{ color: 'white', fontSize: '20px', marginLeft: '3px' }}>▶</span>
        </button>
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
          {fireflagRemaining !== null && (
            <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951',
                           fontSize:'9px', letterSpacing:'2px', opacity:0.7 }}>
              {fireflagRemaining} FLAGS LEFT
            </span>
          )}
          {fireflagError && (
            <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                           maxWidth:'140px', textAlign:'right' }}>
              {fireflagError.toUpperCase()}
            </span>
          )}
          <div style={{ position:'relative' }}>
            <FireflagIcon size={28}
              onClick={(e) => placeFireflag(e, currentVideo)}
              onTouchEnd={(e) => { e.preventDefault(); placeFireflag(e, currentVideo); }}
              alt="Place fireflag" />
            {!isLoggedIn && <LockBadge />}
          </div>
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

      {/* ZOOM HINT — hidden while the Mandala Control Center is open */}
      {!chromeHidden && (
        <div style={{ position:'absolute', bottom:'20px', left:'50%',
                      transform:'translateX(-50%)', color:'#222',
                      fontSize:'9px', letterSpacing:'2px', zIndex:3 }}>
          PINCH TO ZOOM · SWIPE TO NAVIGATE · DOUBLE TAP FOR #1
        </div>
      )}

      {/* RANDOM BUTTON — triggers a new drop animation */}
      {!chromeHidden && (
        <button
          onClick={(e) => { e.stopPropagation();
            playDropAnimation(Math.floor(Math.random() * totalRanks) + 1); }}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault();
            playDropAnimation(Math.floor(Math.random() * totalRanks) + 1); }}
          style={{ ...vintageButtonBase, position:'absolute', top:'64px', left:'16px', zIndex:110 }}>
          RANDOM
        </button>
      )}

      {/* ZOOM BUTTON (pinch fallback) */}
      {!chromeHidden && (
        <button
          onClick={(e) => { e.stopPropagation(); cycleZoom(); }}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); cycleZoom(); }}
          style={zoomButtonStyle}>
          ZOOM {zoomLevel}×
        </button>
      )}

      {/* DOT UI */}
      {dotState !== 'hidden' && !showColorWheel && (
        <div style={{ position:'absolute', bottom:'120px', right:'24px', zIndex:10 }}>

          <MandalaButton onClick={toggleUI} onHold={closeUI} isOpen={uiOpen} />

          {dotState === 'single' && discoveryScore > 0 && (() => {
            const milestones = [[100,'EXPLORER'],[200,'SCOUT'],[500,'GOLD'],[750,'LEGEND'],[1000,'ORACLE']];
            const next = milestones.find(([t]) => discoveryScore < t);
            if (!next) return null;
            const [threshold, label] = next;
            const prev = [...milestones].reverse().find(([t]) => discoveryScore >= t);
            const floor = prev ? prev[0] : 0;
            const pct = Math.min(100, Math.round(((discoveryScore - floor) / (threshold - floor)) * 100));
            return (
              <div style={{ marginTop:'8px', width:'48px', textAlign:'center' }}>
                <div style={{ height:'3px', backgroundColor:'#1A1A1A', borderRadius:'2px', overflow:'hidden', marginBottom:'3px' }}>
                  <div style={{ height:'100%', width:`${pct}%`, backgroundColor:'#C8A951', transition:'width 0.5s ease' }} />
                </div>
                <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#C8A951', fontSize:'7px', letterSpacing:'1px' }}>
                  {label} {discoveryScore}/{threshold}
                </span>
              </div>
            );
          })()}

          {/* PERSONAL BEST — feedback (error / +50 flash) */}
          {dotState === 'three' && (personalBestError || personalBestPointsFlash) && (
            <div style={{ position:'fixed', bottom:'88px', left:'50%', transform:'translateX(-50%)',
                          display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', zIndex:156 }}>
              {personalBestPointsFlash && (
                <span style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'bold',
                               letterSpacing:'1px', animation:'fadeIn 0.2s ease',
                               textShadow:'0 0 8px rgba(201,168,76,0.6)' }}>
                  +50 DISCOVERY
                </span>
              )}
              {personalBestError && (
                <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                               maxWidth:'140px', textAlign:'center' }}>
                  {personalBestError.toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* FLEX CAMERA — feedback (error / +10 flash). Not gated on the
              menu being open since the menu closes as soon as a photo is
              picked, before the upload (and this feedback) resolves. */}
          {(flexError || flexPointsFlash) && (
            <div style={{ position:'fixed', bottom:'88px', left:'50%', transform:'translateX(-50%)',
                          display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', zIndex:156 }}>
              {flexPointsFlash && (
                <span style={{ color:'#C9A84C', fontSize:'12px', fontWeight:'bold',
                               letterSpacing:'1px', animation:'fadeIn 0.2s ease',
                               textShadow:'0 0 8px rgba(201,168,76,0.6)' }}>
                  +10 DISCOVERY
                </span>
              )}
              {flexError && (
                <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                               maxWidth:'140px', textAlign:'center' }}>
                  {flexError.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* MANDALA SCREEN-EDGE ANIMATION — gold rings travel the frame from the
          bottom-right corner, then MARK/MY 100/FLEX open along the bottom
          edge. WATCH lives in the top profile row now (see above). */}
      <MandalaFrameRings
        open={uiOpen}
        openings={[
          {
            position: 'bottom-left',
            locked: !isLoggedIn,
            onClick: openColorWheel,
            onTouchEnd: (e) => { e.preventDefault(); openColorWheel(e); },
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="6" stroke="#C8A951" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="10" r="2" fill="#C8A951" opacity="0.6" />
                <circle cx="7" cy="14" r="2.5" fill="#E74C3C" opacity="0.7" />
                <circle cx="17" cy="14" r="2" fill="#2980B9" opacity="0.7" />
                <circle cx="12" cy="18" r="1.5" fill="#27AE60" opacity="0.7" />
              </svg>
            ),
          },
          {
            position: 'bottom-center',
            locked: !isLoggedIn,
            onClick: (e) => addToPersonalBest(e, currentVideo),
            onTouchEnd: (e) => { e.preventDefault(); addToPersonalBest(e, currentVideo); },
            icon: (
              <span style={{ color:'#C8A951', fontSize:'24px', fontWeight:'bold', lineHeight:1 }}>
                {personalBestVideos[currentVideo.video_id] ? '✓' : '+'}
              </span>
            ),
          },
          {
            position: 'bottom-right',
            locked: !isLoggedIn,
            onClick: openFlexPanel,
            onTouchEnd: (e) => { e.stopPropagation(); e.preventDefault(); openFlexPanel(e); },
            icon: <FlexCamera style={{ width:'22px', height:'22px' }} />,
          },
        ]}
      />

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
              onColorSelected={(color) => startMark(color)}
              discoveryScore={discoveryScore}
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

      {/* FLEX CAMERA PANEL — slides in from the right edge, live selfie feed */}
      {flexOpen && (
        <div style={{ position:'fixed', right:0, top:'50%', transform:'translateY(-50%)',
                      width:'160px', minHeight:'240px', backgroundColor:'#0D0800',
                      border:'1px solid #C8A951', borderRight:'none',
                      borderRadius:'8px 0 0 8px', zIndex:300,
                      display:'flex', flexDirection:'column', alignItems:'center',
                      padding:'14px 10px', boxSizing:'border-box',
                      animation:'flexSlideIn 0.3s ease-out',
                      boxShadow:'-8px 0 30px rgba(0,0,0,0.7)' }}>

          <button onClick={closeFlexPanel}
            onTouchEnd={(e) => { e.preventDefault(); closeFlexPanel(); }}
            style={{ position:'absolute', top:'4px', right:'8px', backgroundColor:'transparent',
                     border:'none', color:'#777', fontSize:'14px', width:'44px', height:'44px',
                     cursor:'pointer', zIndex:301, display:'flex', alignItems:'center', justifyContent:'center' }}>
            ✕
          </button>

          {flexError && (
            <span style={{ color:'#E74C3C', fontSize:'8px', letterSpacing:'1px',
                           textAlign:'center', marginBottom:'4px' }}>
              {flexError.toUpperCase()}
            </span>
          )}

          <canvas ref={flexCanvasRef} style={{ display:'none' }} />

          {flexSnapped && flexSnapshotUrl ? (
            <img src={flexSnapshotUrl} alt="Flex snapshot"
                 style={{ width:'120px', height:'120px', borderRadius:'50%',
                          objectFit:'cover', border:'1px solid #C8A951',
                          margin:'24px 0 8px', transform:'scaleX(-1)' }} />
          ) : (
            <video ref={flexVideoRef} playsInline muted autoPlay
                   style={{ width:'120px', height:'120px', borderRadius:'50%',
                            objectFit:'cover', border:'1px solid #C8A951',
                            backgroundColor:'#000', margin:'24px 0 8px',
                            transform:'scaleX(-1)' }} />
          )}

          <span style={{ color:'#8B7355', fontSize:'8px', letterSpacing:'2px',
                         textAlign:'center', marginBottom:'8px' }}>
            FLEX YOUR MOMENT
          </span>

          {/* OVERLAY STRIP — single scrollable row, 32px circles */}
          <div style={{ display:'flex', gap:'4px', overflowX:'auto', width:'100%',
                        justifyContent:'center', marginBottom:'8px' }}>
            {FLEX_OVERLAYS.map(ov => (
              <button key={ov}
                onClick={(e) => { e.stopPropagation(); setFlexOverlay(ov); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setFlexOverlay(ov); }}
                style={{ flexShrink:0, width:'32px', height:'32px', borderRadius:'50%',
                         backgroundColor: flexOverlay === ov ? '#C8A951' : 'transparent',
                         border: flexOverlay === ov ? 'none' : '1px solid #3a2f14',
                         color: ov === 'none' ? '#C8A951' : '#F5E6C8',
                         fontSize:'9px', fontFamily:'Bebas Neue, sans-serif',
                         letterSpacing:'1px', cursor:'pointer', padding:0,
                         display:'flex', alignItems:'center', justifyContent:'center' }}>
                {ov === 'none' ? 'NONE' : ov}
              </button>
            ))}
          </div>

          {flexSnapped && flexSnapshotUrl ? (
            <button onClick={postFlex}
              onTouchEnd={(e) => { e.preventDefault(); postFlex(); }}
              style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14px', letterSpacing:'3px',
                       color:'#0D0800', backgroundColor:'#C8A951', border:'none', borderRadius:0,
                       padding:'10px 20px', minWidth:'44px', minHeight:'44px',
                       cursor:'pointer', opacity: flexStickerDrop ? 0.6 : 1 }}>
              {flexStickerDrop ? 'FLEXING…' : 'FLEX IT'}
            </button>
          ) : (
            <button onClick={snapFlexPhoto}
              onTouchEnd={(e) => { e.preventDefault(); snapFlexPhoto(); }}
              style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14px', letterSpacing:'3px',
                       color:'#C8A951', backgroundColor:'transparent', border:'1px solid #C8A951',
                       borderRadius:0, padding:'6px 16px', minWidth:'44px', minHeight:'44px',
                       cursor:'pointer' }}>
              SNAP
            </button>
          )}
        </div>
      )}

      {/* STICKER DROP — brief overlay after a successful flex */}
      {flexStickerDrop && flexOverlay !== 'none' && (
        <div style={{ position:'fixed', inset:0, zIndex:301, pointerEvents:'none',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'72px', animation:'flexStickerDrop 0.8s ease-out',
                         textShadow:'0 0 30px rgba(200,169,81,0.8)' }}>
            {flexOverlay}
          </span>
        </div>
      )}

      {/* PROGRESSIVE REGISTRATION SHEET — slides up on gated actions */}
      {regSheetOpen && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:'220px',
                      backgroundColor:'#0D0800', borderTop:'2px solid #C8A951',
                      zIndex:400, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', gap:'10px',
                      animation:'regSheetUp 0.3s ease-out',
                      boxShadow:'0 -10px 40px rgba(0,0,0,0.7)' }}>
          <span style={{ fontFamily:'Pacifico, cursive', color:'#C8A951',
                         fontSize:'28px', lineHeight:1 }}>BEST</span>
          <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#F5E6C8',
                         fontSize:'14px', letterSpacing:'3px' }}>
            LEAVE YOUR MARK ON THIS VIDEO
          </span>
          <span style={{ fontFamily:'Bebas Neue, sans-serif', color:'#8B7355',
                         fontSize:'12px', letterSpacing:'2px' }}>
            10 SECONDS TO JOIN
          </span>
          <div style={{ display:'flex', gap:'12px', marginTop:'4px' }}>
            <button onClick={() => { window.location.href = '/register'; }}
              onTouchEnd={(e) => { e.preventDefault(); window.location.href = '/register'; }}
              style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'13px', letterSpacing:'3px',
                       color:'#0D0800', backgroundColor:'#C8A951', border:'none', borderRadius:0,
                       padding:'8px 28px', minWidth:'44px', minHeight:'44px', cursor:'pointer' }}>
              SIGN UP
            </button>
            <button onClick={() => { window.location.href = '/login'; }}
              onTouchEnd={(e) => { e.preventDefault(); window.location.href = '/login'; }}
              style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'13px', letterSpacing:'3px',
                       color:'#C8A951', backgroundColor:'transparent', border:'1px solid #C8A951',
                       borderRadius:0, padding:'8px 28px', minWidth:'44px', minHeight:'44px',
                       cursor:'pointer' }}>
              LOG IN
            </button>
          </div>
          <button onClick={() => setRegSheetOpen(false)}
            onTouchEnd={(e) => { e.preventDefault(); setRegSheetOpen(false); }}
            style={{ backgroundColor:'transparent', border:'none', color:'#555',
                     fontSize:'9px', letterSpacing:'2px', cursor:'pointer',
                     minHeight:'44px', padding:'4px 12px' }}>
            MAYBE LATER
          </button>
        </div>
      )}

      {/* FLEX WALL — mosaic of everyone who flexed on this video, most recent 12 */}
      {flexWallOpen && (
        <div onClick={() => setFlexWallOpen(false)}
             style={{ position:'fixed', inset:0,
                      backgroundColor:'rgba(0,0,0,0.92)',
                      zIndex:250, overflow:'hidden' }}>
          <div style={{ position:'absolute', top:16, left:0, right:0,
                        textAlign:'center', fontFamily:'Bebas Neue,sans-serif',
                        color:'#C8A951', fontSize:16, letterSpacing:4 }}>
            {flexList.length} FLEXES · TAP TO CLOSE
          </div>
          {flexList.slice(0, 12).map((flex, i) => {
            const pos = flexWallPosition(i);
            return (
              <div key={flex.id} style={{
                position:'absolute',
                left: pos.x + '%',
                top: pos.y + '%',
                transform:'translate(-50%,-50%)',
                width:52, height:52
              }}>
                <img src={flex.photo_url} alt="flex"
                     style={{ width:52, height:52, borderRadius:'50%',
                              objectFit:'cover',
                              border:'2px solid #C8A951' }}/>
                {flex.overlay_type && flex.overlay_type !== 'none' && (
                  <span style={{ position:'absolute', bottom:-4, right:-4,
                                 fontSize:16 }}>
                    {flex.overlay_type}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PROGRESSIVE REGISTRATION GATE — slide-up sheet for logged-out taps
          on color / fireflag / personal best / flex */}
      {regSheetOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:400, backgroundColor:'rgba(0,0,0,0.7)',
                      display:'flex', alignItems:'flex-end', justifyContent:'center' }}
             onClick={() => setRegSheetOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
               style={{ width:'100%', maxWidth:'480px', backgroundColor:'#0D0800',
                        border:'1px solid #C8A951', borderBottom:'none',
                        borderRadius:'16px 16px 0 0', padding:'28px 24px 32px',
                        textAlign:'center', animation:'slideUpSheet 0.25s ease-out' }}>
            <div style={{ width:'36px', height:'4px', backgroundColor:'#333',
                          borderRadius:'2px', margin:'0 auto 20px' }} />
            <span style={{ fontSize:'28px' }}>🔒</span>
            <h3 style={{ fontFamily:'Bebas Neue, sans-serif', color:'#F5E6C8',
                         fontSize:'20px', letterSpacing:'3px', margin:'12px 0 6px' }}>
              JOIN BEST TO CONTINUE
            </h3>
            <p style={{ color:'#8B7355', fontSize:'12px', letterSpacing:'1px', margin:'0 0 24px' }}>
              Sign up to color, fireflag, save, and flex videos.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <button
                onClick={() => { window.location.href = '/register'; }}
                onTouchEnd={(e) => { e.preventDefault(); window.location.href = '/register'; }}
                style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14px', letterSpacing:'4px',
                         color:'#0D0800', backgroundColor:'#C8A951', border:'none', borderRadius:0,
                         padding:'14px', minHeight:'44px', cursor:'pointer' }}>
                SIGN UP
              </button>
              <button
                onClick={() => { window.location.href = '/login'; }}
                onTouchEnd={(e) => { e.preventDefault(); window.location.href = '/login'; }}
                style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14px', letterSpacing:'4px',
                         color:'#C8A951', backgroundColor:'transparent', border:'1px solid #C8A951',
                         borderRadius:0, padding:'14px', minHeight:'44px', cursor:'pointer' }}>
                LOG IN
              </button>
            </div>
            <button
              onClick={() => setRegSheetOpen(false)}
              onTouchEnd={(e) => { e.preventDefault(); setRegSheetOpen(false); }}
              style={{ marginTop:'16px', backgroundColor:'transparent', border:'none',
                       color:'#555', fontSize:'11px', letterSpacing:'2px', cursor:'pointer',
                       padding:'8px', minHeight:'44px' }}>
              NOT NOW
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { text-shadow: 0 0 40px #C9A84C; }
          50%      { text-shadow: 0 0 80px #C9A84C, 0 0 120px #C9A84C; }
        }
        @keyframes risingPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.5); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes fadeInSimple {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-100%); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideUpSheet {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        @keyframes flexSlideIn {
          from { transform:translateX(60px); opacity:0; }
          to   { transform:translateX(0); opacity:1; }
        }
        @keyframes flexStickerDrop {
          0%   { transform:translateY(-40px) scale(0.4); opacity:0; }
          50%  { transform:translateY(10px) scale(1.2); opacity:1; }
          100% { transform:translateY(0) scale(1); opacity:1; }
        }
        @keyframes regSheetUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        @keyframes mapExit {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.95); }
        }
        @keyframes mapEnter {
          from { opacity:0; transform:scale(1.05); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes logoFlash {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
}

export default SpatialMap;
