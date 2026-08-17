import os

os.makedirs("frontend/src", exist_ok=True)

with open("frontend/src/Crown.js", "w", encoding="utf-8") as f:
    f.write(r'''import React, { useState, useEffect, useMemo } from 'react';

// CROWN - competition map (Bible Ch. 6). Frontend only for now - no CROWN
// backend exists, so this renders mock data. Pass isActive={false} for the
// inactive state (recommended default until a real CROWN backend exists).

const GOLD = '#C9A84C';
const GOLD_DARK = '#C8A951';
const CREAM = '#F5E6C8';
const BG = '#050505';
const YES = '#27AE60';
const NO = '#E74C3C';

function CrownIcon({ size = 18, color = GOLD, dim = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ display: 'block', opacity: dim ? 0.35 : 1, filter: dim ? 'none' : 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }}>
      <path
        d="M2.5 8 L5.8 3 L9.2 6.6 L12 3.4 L14.8 6.6 L18.2 3 L21.5 8 L19.8 18.5 L4.2 18.5 Z"
        fill={color} stroke={GOLD_DARK} strokeWidth="0.6" strokeLinejoin="round" />
      <rect x="4.2" y="15.5" width="15.6" height="3" fill={color} opacity="0.5" />
    </svg>
  );
}

const MILESTONES = [[100, 'EXPLORER', 2], [200, 'SCOUT', 3], [500, 'GOLD', 5], [750, 'LEGEND', 10], [1000, 'ORACLE', 20]];

function getVoteWeight(score) {
  let weight = 1;
  for (const [threshold, , w] of MILESTONES) {
    if (score >= threshold) weight = w;
  }
  return weight;
}

function getVoteTier(score) {
  let tier = 'VOTER';
  for (const [threshold, label] of MILESTONES) {
    if (score >= threshold) tier = label;
  }
  return tier;
}

const MOCK_CROWN = {
  theme: 'NEON DANCE',
  subtitle: 'The First Movement',
  description: 'Choreograph a 30-second performance to the official CROWN track. One take. No edits.',
  audio_track: '"Midnight Arcade" - NOVA',
  audio_label: 'OFFICIAL CROWN TRACK',
  entry_fee: 15,
  prize_pool: 12400,
  total_entries: 42,
};

const MOCK_ENTRIES = [
  { id: 'e1', performer: 'Mira Voss', city: 'Tokyo', country: 'JP', thumbnail_url: '', yes: 1284, no: 96 },
  { id: 'e2', performer: 'The Kept', city: 'London', country: 'GB', thumbnail_url: '', yes: 987, no: 112 },
  { id: 'e3', performer: 'Dani Reyes', city: 'Bogota', country: 'CO', thumbnail_url: '', yes: 843, no: 71 },
  { id: 'e4', performer: 'Yusuf Ade', city: 'Lagos', country: 'NG', thumbnail_url: '', yes: 766, no: 55 },
  { id: 'e5', performer: 'Lin Okafor', city: 'Paris', country: 'FR', thumbnail_url: '', yes: 610, no: 90 },
];

const NEXT_CROWN_THEME = 'VOICE - ACAPELLA';

const MOCK_CLOSES_AT = Date.now() + (4 * 86400 + 13 * 3600 + 42 * 60) * 1000;

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

function TimeBlock({ value, label, dim }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '56px' }}>
      <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: dim ? '#3A3A3A' : CREAM,
                     fontSize: '30px', letterSpacing: '2px', lineHeight: 1,
                     fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: dim ? '#333' : GOLD_DARK,
                     fontSize: '9px', letterSpacing: '2px', marginTop: '4px' }}>
        {label}
      </span>
    </div>
  );
}

function InactiveCrown({ transitionPhase, setCurrentMap }) {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: BG,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center',
                  animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
                  opacity: transitionPhase === 'exit' ? 0 : 1,
                  transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <CrownIcon size={34} dim />
        <span style={{ fontFamily: 'Pacifico, cursive', color: '#3A3A3A',
                       fontSize: '64px', lineHeight: 1, marginTop: '2px' }}>B</span>
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#444',
                    fontSize: '20px', letterSpacing: '8px', marginBottom: '10px' }}>
        NO ACTIVE CROWN
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#333',
                    fontSize: '11px', letterSpacing: '3px', textAlign: 'center', padding: '0 24px' }}>
        NEXT CROWN &middot; {NEXT_CROWN_THEME} &middot; OPENS SEPTEMBER 2027
      </div>
      <div style={{ fontFamily: 'Pacifico, cursive', color: '#2A2A2A', fontSize: '13px',
                    marginTop: '16px' }}>
        The competition map. Coming soon.
      </div>
      <button onClick={() => setCurrentMap && setCurrentMap('world-best')}
        style={{ backgroundColor: 'transparent', border: '1px solid #2a2a2a',
                 color: '#555', padding: '8px 20px', cursor: 'pointer',
                 fontFamily: 'Bebas Neue, sans-serif', fontSize: '12px',
                 letterSpacing: '3px', marginTop: '28px' }}>
        &lsaquo; WORLD BEST
      </button>
      <style>{`@keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

function EntryCard({ entry, selected, myVote, onSelect }) {
  const total = entry.yes + entry.no || 1;
  const yesPct = Math.round((entry.yes / total) * 100);
  return (
    <div onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
        marginBottom: '10px', cursor: 'pointer',
        border: selected ? `1px solid ${GOLD}` : '1px solid #222',
        backgroundColor: selected ? 'rgba(201,168,76,0.07)' : '#000000',
        boxShadow: selected ? '0 0 14px rgba(201,168,76,0.15)' : 'none',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}>
      {entry.thumbnail_url ? (
        <img src={entry.thumbnail_url} alt=""
          style={{ width: '56px', height: '56px', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '56px', height: '56px', flexShrink: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: '#1A1408', border: '1px solid #2A2110',
                      fontFamily: 'Pacifico, cursive', color: GOLD_DARK, fontSize: '22px' }}>
          {entry.performer.charAt(0)}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '16px',
                      letterSpacing: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.performer}
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#666', fontSize: '10px',
                      letterSpacing: '2px', marginTop: '2px' }}>
          {entry.city.toUpperCase()} &middot; {entry.country}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <div style={{ flex: 1, height: '4px', backgroundColor: '#111', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${yesPct}%`, height: '100%', backgroundColor: YES }} />
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: YES, fontSize: '11px' }}>
            {entry.yes}
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: NO, fontSize: '11px' }}>
            {entry.no}
          </span>
        </div>
      </div>
      {myVote && (
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '10px', letterSpacing: '2px',
                      color: myVote === 'yes' ? YES : NO, flexShrink: 0 }}>
          {myVote === 'yes' ? 'VOTED YES' : 'VOTED NO'}
        </div>
      )}
    </div>
  );
}

function ActiveCrown({ transitionPhase, setCurrentMap, discoveryScore }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(MOCK_CLOSES_AT));
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [selectedId, setSelectedId] = useState(MOCK_ENTRIES[0].id);
  const [myVotes, setMyVotes] = useState({});

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(MOCK_CLOSES_AT)), 1000);
    return () => clearInterval(interval);
  }, []);

  const weight = getVoteWeight(discoveryScore);
  const tier = getVoteTier(discoveryScore);
  const selected = entries.find(e => e.id === selectedId);

  const castVote = (vote) => {
    if (!selected) return;
    const prev = myVotes[selectedId];
    setEntries(prev => prev.map(e => {
      if (e.id !== selectedId) return e;
      let { yes, no } = e;
      if (prev === 'yes') yes -= 1;
      if (prev === 'no') no -= 1;
      if (vote === 'yes') yes += weight;
      else no += weight;
      return { ...e, yes, no };
    }));
    setMyVotes(prev => ({ ...prev, [selectedId]: vote }));
  };

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (b.yes - b.no) - (a.yes - a.no)),
    [entries]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: BG,
                  overflowY: 'auto', overflowX: 'hidden',
                  paddingBottom: '120px',
                  animation: transitionPhase === 'enter' ? 'mapEnter 0.4s ease' : 'none',
                  opacity: transitionPhase === 'exit' ? 0 : 1,
                  transition: transitionPhase === 'exit' ? 'opacity 0.4s ease' : 'none' }}>

      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 16px',
                    backgroundColor: 'rgba(5,5,5,0.94)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setCurrentMap && setCurrentMap('world-best')}
            style={{ backgroundColor: 'transparent', border: '1px solid #2a2a2a',
                     color: GOLD, padding: '6px 14px', cursor: 'pointer',
                     fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px', letterSpacing: '3px' }}>
            &lsaquo; WORLD
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CrownIcon size={20} />
            <span style={{ fontFamily: 'Pacifico, cursive', color: GOLD, fontSize: '30px', lineHeight: 1 }}>B</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD,
                           fontSize: '20px', letterSpacing: '6px', lineHeight: 1 }}>
              CROWN
            </span>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555',
                           fontSize: '9px', letterSpacing: '4px', marginTop: '2px' }}>
              COMPETITION MAP
            </span>
          </div>
        </div>
      </div>

      <div style={{ margin: '16px 16px 0', padding: '20px 18px', textAlign: 'center',
                    border: `1px solid ${GOLD_DARK}`, backgroundColor: 'rgba(201,168,76,0.06)',
                    backgroundImage: 'radial-gradient(ellipse at top, rgba(201,168,76,0.12), transparent 70%)' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '11px',
                      letterSpacing: '5px' }}>
          THEME
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '34px',
                      letterSpacing: '4px', marginTop: '6px', lineHeight: 1 }}>
          {MOCK_CROWN.theme}
        </div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: GOLD_DARK, fontSize: '16px', marginTop: '4px' }}>
          {MOCK_CROWN.subtitle}
        </div>
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#B8A97A', fontSize: '12px',
                      marginTop: '12px', lineHeight: 1.5, padding: '0 8px' }}>
          {MOCK_CROWN.description}
        </div>

        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #2A2110' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '9px',
                        letterSpacing: '3px' }}>
            {MOCK_CROWN.audio_label}
          </div>
          <div style={{ fontFamily: 'Pacifico, cursive', color: CREAM, fontSize: '15px', marginTop: '4px' }}>
            {MOCK_CROWN.audio_track}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '16px' }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '22px' }}>
              ${MOCK_CROWN.prize_pool.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '8px', letterSpacing: '2px' }}>
              PRIZE POOL
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '22px' }}>
              ${MOCK_CROWN.entry_fee}
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '8px', letterSpacing: '2px' }}>
              ENTRY FEE
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '22px' }}>
              {MOCK_CROWN.total_entries}
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '8px', letterSpacing: '2px' }}>
              ENTRIES
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '22px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '10px',
                      letterSpacing: '3px', marginBottom: '10px' }}>
          VOTING CLOSES IN
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <TimeBlock value={pad(timeLeft.days)} label="DAYS" />
          <span style={{ color: '#333', fontSize: '22px' }}>:</span>
          <TimeBlock value={pad(timeLeft.hours)} label="HOURS" />
          <span style={{ color: '#333', fontSize: '22px' }}>:</span>
          <TimeBlock value={pad(timeLeft.minutes)} label="MINS" />
          <span style={{ color: '#333', fontSize: '22px' }}>:</span>
          <TimeBlock value={pad(timeLeft.seconds)} label="SECS" />
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '22px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '13px', letterSpacing: '3px' }}>
            SUBMITTED PERFORMANCES
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#555', fontSize: '10px', letterSpacing: '2px' }}>
            {sorted.length} SHOWN
          </span>
        </div>
        {sorted.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            selected={entry.id === selectedId}
            myVote={myVotes[entry.id]}
            onSelect={() => setSelectedId(entry.id)}
          />
        ))}
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#444', fontSize: '12px',
                      textAlign: 'center', marginTop: '8px' }}>
          Tap an entry, then cast your vote below.
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
                    backgroundColor: 'rgba(5,5,5,0.96)', backdropFilter: 'blur(8px)',
                    borderTop: '1px solid #1A1A1A', padding: '12px 16px',
                    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '10px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM, fontSize: '13px',
                         letterSpacing: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected ? selected.performer.toUpperCase() : 'SELECT AN ENTRY'}
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '10px',
                         letterSpacing: '2px', flexShrink: 0 }}>
            {tier} &middot; VOTE WEIGHT &times;{weight}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => castVote('yes')} disabled={!selected}
            style={{ flex: 1, minHeight: '48px', border: `1px solid ${YES}`, borderRadius: 0,
                     cursor: 'pointer', backgroundColor: 'rgba(39,174,96,0.12)',
                     color: YES, fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px',
                     letterSpacing: '3px' }}>
            VOTE YES
          </button>
          <button onClick={() => castVote('no')} disabled={!selected}
            style={{ flex: 1, minHeight: '48px', border: `1px solid ${NO}`, borderRadius: 0,
                     cursor: 'pointer', backgroundColor: 'rgba(231,76,60,0.12)',
                     color: NO, fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px',
                     letterSpacing: '3px' }}>
            VOTE NO
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mapEnter { from { opacity:0; transform:scale(1.05); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
}

function Crown({ isActive = false, transitionPhase = '', setCurrentMap, discoveryScore = 0 }) {
  if (!isActive) {
    return <InactiveCrown transitionPhase={transitionPhase} setCurrentMap={setCurrentMap} />;
  }
  return (
    <ActiveCrown
      transitionPhase={transitionPhase}
      setCurrentMap={setCurrentMap}
      discoveryScore={discoveryScore}
    />
  );
}

export default Crown;
''')
print("Wrote frontend/src/Crown.js (isActive defaults to false, per Karim's request)")
print("\nDONE. Now hand SpatialMap.js wiring to Claude Code, then push.")
