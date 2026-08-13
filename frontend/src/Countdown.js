import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'https://web-production-a267.up.railway.app';
const LAUNCH_DATE = new Date('2027-03-01T00:00:00Z');
const FOUNDING_CREATORS_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd8qGQvtEWIiojIGT01MEYwUiNpZ89_n7Kj5zbL0BX85YDleA/viewform?usp=header';

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
      <span style={{ color: '#C9A84C', fontSize: 'clamp(36px, 8vw, 72px)',
                     fontWeight: 'bold', letterSpacing: '2px', lineHeight: 1,
                     fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      <span style={{ color: '#555555', fontSize: '11px', letterSpacing: '3px',
                     marginTop: '8px' }}>
        {label}
      </span>
    </div>
  );
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/early-access`, { email });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setSubmitted(true);
      } else {
        setError('Something went wrong — try again');
      }
    }
    setSubmitting(false);
  }, [email, submitting, submitted]);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', width: '100%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'space-between', fontFamily: 'Arial, sans-serif',
                  padding: '32px 24px', boxSizing: 'border-box', textAlign: 'center' }}>

      {/* LOGO */}
      <div style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 'bold',
                    letterSpacing: '8px' }}>
        BEST
      </div>

      {/* TIMER */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '32px' }}>
        {timeLeft.done ? (
          <span style={{ color: '#C9A84C', fontSize: 'clamp(28px, 6vw, 48px)',
                         letterSpacing: '4px', fontWeight: 'bold' }}>
            BEST IS LIVE
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 24px)' }}>
            <TimeBlock value={timeLeft.days} label="DAYS" />
            <span style={{ color: '#333333', fontSize: 'clamp(28px, 6vw, 56px)',
                           fontWeight: 'bold' }}>:</span>
            <TimeBlock value={pad(timeLeft.hours)} label="HOURS" />
            <span style={{ color: '#333333', fontSize: 'clamp(28px, 6vw, 56px)',
                           fontWeight: 'bold' }}>:</span>
            <TimeBlock value={pad(timeLeft.minutes)} label="MINUTES" />
            <span style={{ color: '#333333', fontSize: 'clamp(28px, 6vw, 56px)',
                           fontWeight: 'bold' }}>:</span>
            <TimeBlock value={pad(timeLeft.seconds)} label="SECONDS" />
          </div>
        )}

        <p style={{ color: '#666666', fontSize: '13px', letterSpacing: '2px',
                    maxWidth: '480px', margin: 0 }}>
          THE WORLD'S FIRST INDEPENDENT VIDEO RANKING
        </p>

        {/* EMAIL CAPTURE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                      marginTop: '16px', width: '100%', maxWidth: '360px' }}>
          {submitted ? (
            <p style={{ color: '#C9A84C', fontSize: '13px', letterSpacing: '2px' }}>
              YOU ARE ON THE LIST
            </p>
          ) : (
            <>
              <input type="email" placeholder="Get early access" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '14px 16px', marginBottom: '12px',
                         backgroundColor: '#111111', border: '1px solid #333333',
                         color: '#FFFFFF', fontSize: '14px', outline: 'none',
                         boxSizing: 'border-box', textAlign: 'center' }} />
              <button onClick={handleSubmit} disabled={submitting}
                style={{ width: '100%', padding: '14px', backgroundColor: '#C9A84C',
                         border: 'none', color: '#000000', fontSize: '12px',
                         letterSpacing: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
                {submitting ? 'JOINING...' : 'JOIN THE LIST'}
              </button>
              {error && <p style={{ color: '#C0392B', fontSize: '11px',
                                    marginTop: '12px' }}>{error}</p>}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <a href={FOUNDING_CREATORS_FORM_URL} target="_blank" rel="noopener noreferrer"
         style={{ color: '#444444', fontSize: '10px', letterSpacing: '2px',
                  textDecoration: 'none' }}>
        FOUNDING CREATORS — APPLY HERE
      </a>
    </div>
  );
}

export default Countdown;
