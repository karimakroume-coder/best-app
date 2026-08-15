import React, { useState, useEffect } from 'react';

const LAUNCH_DATE = new Date('2027-03-01T00:00:00Z');
const APPLICATION_FORM_URL = 'https://forms.google.com/best-founders';

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function TimeBlock({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F5F0E6',
                     fontSize: 'clamp(28px, 7vw, 48px)', letterSpacing: '2px',
                     lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                     fontSize: '10px', letterSpacing: '2px', marginTop: '6px' }}>
        {label}
      </span>
    </div>
  );
}

const CARDS = [
  {
    title: 'PERMANENT SPOT',
    text: "Your video in BEST's founding collection forever. Blockchain verified.",
  },
  {
    title: 'INDEPENDENT PROOF',
    text: 'Your BEST score is calculated independently. No platform can buy or manipulate it.',
  },
  {
    title: 'FIRST MOVER',
    text: 'Founding creators get permanent Map 2 coordinates in the Founding District.',
  },
  {
    title: 'REAL AUDIENCE',
    text: 'BEST users discover content before it goes mainstream.',
  },
];

function Creators() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0D0800', minHeight: '100vh', width: '100%',
                  fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
                  overflowX: 'hidden' }}>

      {/* SECTION 1 — HEADER */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#C8A951', fontSize: '36px' }}>
          BEST
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                      fontSize: '18px', letterSpacing: '8px', marginTop: '8px' }}>
          FOUNDING CREATORS
        </div>
      </div>

      {/* SECTION 2 — HERO */}
      <div style={{ marginTop: '40px', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F5F0E6', fontSize: '40px', lineHeight: 1.1 }}>
          100 VIDEOS.
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F5F0E6', fontSize: '40px', lineHeight: 1.1 }}>
          100 CREATORS.
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951', fontSize: '24px',
                      lineHeight: 1.2, marginTop: '8px' }}>
          THE WORLD'S FIRST
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951', fontSize: '24px', lineHeight: 1.2 }}>
          INDEPENDENT RANKING.
        </div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#C8A951', fontSize: '14px', marginTop: '16px' }}>
          We track the world's best content independently.
          <br />
          No algorithm bias. No platform agenda.
        </div>
      </div>

      {/* SECTION 3 — FOUR CARDS */}
      <div style={{ marginTop: '40px', padding: '0 16px', display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {CARDS.map(card => (
          <div key={card.title}
               style={{ border: '1px solid #C8A951', backgroundColor: 'rgba(200,169,81,0.05)',
                        padding: '16px', borderRadius: 0 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                          fontSize: '14px', letterSpacing: '3px' }}>
              {card.title}
            </div>
            <div style={{ fontFamily: 'Pacifico, cursive', color: '#F5F0E6',
                          fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>
              {card.text}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 4 — COUNTDOWN */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                      fontSize: '14px', letterSpacing: '4px' }}>
          BEST LAUNCHES IN:
        </div>
        {timeLeft.done ? (
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                        fontSize: 'clamp(28px, 6vw, 48px)', letterSpacing: '4px',
                        marginTop: '16px' }}>
            BEST IS LIVE
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 'clamp(8px, 2vw, 20px)', marginTop: '16px' }}>
            <TimeBlock value={pad(timeLeft.days)} label="DAYS" />
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#3A2E14',
                           fontSize: 'clamp(24px, 5vw, 40px)' }}>:</span>
            <TimeBlock value={pad(timeLeft.hours)} label="HOURS" />
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#3A2E14',
                           fontSize: 'clamp(24px, 5vw, 40px)' }}>:</span>
            <TimeBlock value={pad(timeLeft.minutes)} label="MINS" />
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#3A2E14',
                           fontSize: 'clamp(24px, 5vw, 40px)' }}>:</span>
            <TimeBlock value={pad(timeLeft.seconds)} label="SECS" />
          </div>
        )}
      </div>

      {/* SECTION 5 — APPLICATION */}
      <div style={{ marginTop: '40px', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F5F0E6', fontSize: '28px' }}>
          ARE YOU ONE OF THE 100?
        </div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#C8A951', fontSize: '13px', marginTop: '8px' }}>
          We select based on independent BEST score data.
          <br />
          Not follower count.
        </div>
        <a href={APPLICATION_FORM_URL} target="_blank" rel="noopener noreferrer"
           style={{ display: 'inline-block', backgroundColor: '#C8A951', color: '#0D0800',
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '6px',
                    padding: '16px 48px', borderRadius: 0, border: 'none', marginTop: '24px',
                    minHeight: '44px', textDecoration: 'none', boxSizing: 'border-box' }}>
          APPLY NOW
        </a>
      </div>

      {/* SECTION 6 — FOOTER */}
      <div style={{ marginTop: '40px', marginBottom: '60px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                       fontSize: '12px', letterSpacing: '3px' }}>
          founding@bestapp.com
        </span>
      </div>
    </div>
  );
}

export default Creators;
