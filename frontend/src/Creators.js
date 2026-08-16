import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://web-production-a267.up.railway.app';
const LAUNCH_DATE = new Date('2027-03-01T00:00:00Z');

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

const CATEGORIES_LIST = [
  'Music', 'Gaming', 'Sports', 'Entertainment',
  'Education', 'Science', 'Tech', 'Comedy',
  'Food', 'Travel', 'Art', 'Other',
];

function Creators() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', youtube_url: '',
    subscriber_count: '', primary_category: '', why_best: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPreview = useCallback(async () => {
    if (!previewUrl || !previewUrl.includes('youtube.com') && !previewUrl.includes('youtu.be')) {
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/creator/score-preview`, {
        params: { youtube_url: previewUrl }
      });
      setPreview(res.data);
    } catch {
      setPreview(null);
    }
    setPreviewLoading(false);
  }, [previewUrl]);

  const handleSubmit = useCallback(async () => {
    if (submitting || applied) return;
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/creator/apply`, {
        ...form,
        subscriber_count: form.subscriber_count ? parseInt(form.subscriber_count) : null,
        why_best: form.why_best.slice(0, 200),
        ref: ref || undefined,
      });
      setApplicationId(res.data.application_id);
      setApplied(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already applied');
      } else {
        setError('Something went wrong — try again');
      }
    }
    setSubmitting(false);
  }, [form, submitting, applied, ref]);

  const inputStyle = {
    width: '100%', padding: '12px 14px', marginBottom: '10px',
    backgroundColor: '#1A1408', border: '1px solid #3A2E14',
    color: '#F5F0E6', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', borderRadius: 0,
  };

  const goldBtn = {
    width: '100%', padding: '14px', backgroundColor: '#C8A951',
    border: 'none', color: '#0D0800', fontSize: '14px',
    letterSpacing: '3px', cursor: 'pointer', fontFamily: 'Bebas Neue, sans-serif',
    minHeight: '44px',
  };

  return (
    <div style={{ backgroundColor: '#0D0800', minHeight: '100vh', height: '100vh',
                  width: '100%', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
                  overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

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

      {/* SECTION 5 — SCORE PREVIEW */}
      <div style={{ marginTop: '40px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Bebas Neue, sans-serif',
                      color: '#F5F0E6', fontSize: '22px', letterSpacing: '3px' }}>
          CHECK YOUR BEST SCORE
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', maxWidth: '480px', margin: '12px auto 0' }}>
          <input type="text" placeholder="YouTube channel URL" value={previewUrl}
            onChange={e => setPreviewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPreview()}
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
          <button onClick={fetchPreview} disabled={previewLoading}
            style={{ ...goldBtn, width: 'auto', padding: '12px 20px', flexShrink: 0 }}>
            {previewLoading ? '...' : 'CHECK'}
          </button>
        </div>
        {preview && (
          <div style={{ marginTop: '16px', textAlign: 'center', padding: '20px',
                        border: '1px solid #3A2E14', backgroundColor: 'rgba(200,169,81,0.05)',
                        maxWidth: '480px', margin: '16px auto 0' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951', fontSize: '32px' }}>
              {preview.channel_found ? `SCORE: ${preview.best_score}` : 'NOT FOUND'}
            </div>
            <div style={{ fontFamily: 'Pacifico, cursive', color: '#F5F0E6', fontSize: '13px', marginTop: '8px' }}>
              {preview.message}
            </div>
            {preview.videos_ranked > 0 && (
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#666', fontSize: '11px',
                            marginTop: '8px', letterSpacing: '2px' }}>
                {preview.videos_ranked} VIDEOS RANKED {preview.rank ? `• BEST RANK #${preview.rank}` : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 6 — APPLICATION FORM */}
      <div style={{ marginTop: '40px', textAlign: 'center', padding: '0 24px' }}>
        {!showForm && !applied ? (
          <>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F5F0E6', fontSize: '28px' }}>
              ARE YOU ONE OF THE 100?
            </div>
            <div style={{ fontFamily: 'Pacifico, cursive', color: '#C8A951', fontSize: '13px', marginTop: '8px' }}>
              We select based on independent BEST score data.
              <br />
              Not follower count.
            </div>
            <button onClick={() => setShowForm(true)}
              style={{ ...goldBtn, marginTop: '24px', maxWidth: '320px' }}>
              APPLY NOW
            </button>
          </>
        ) : applied ? (
          <div style={{ padding: '32px 24px', border: '1px solid #C8A951',
                        backgroundColor: 'rgba(200,169,81,0.05)', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951', fontSize: '28px' }}>
              APPLICATION RECEIVED
            </div>
            <div style={{ fontFamily: 'Pacifico, cursive', color: '#F5F0E6', fontSize: '13px', marginTop: '12px' }}>
              We review every application based on BEST score data.
              You will hear from us within 7 days.
            </div>
            {applicationId && (
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#666', fontSize: '11px',
                            marginTop: '16px', letterSpacing: '2px' }}>
                APPLICATION #{applicationId.slice(0, 8).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                          fontSize: '18px', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
              FOUNDING CREATOR APPLICATION
            </div>
            <input type="text" placeholder="Your name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle} />
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle} />
            <input type="text" placeholder="YouTube channel URL" value={form.youtube_url}
              onChange={e => setForm({ ...form, youtube_url: e.target.value })}
              style={inputStyle} />
            <input type="number" placeholder="Subscriber count (optional)" value={form.subscriber_count}
              onChange={e => setForm({ ...form, subscriber_count: e.target.value })}
              style={inputStyle} />
            <select value={form.primary_category}
              onChange={e => setForm({ ...form, primary_category: e.target.value })}
              style={{ ...inputStyle, color: form.primary_category ? '#F5F0E6' : '#777' }}>
              <option value="">Primary content category</option>
              {CATEGORIES_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <textarea placeholder="Why should BEST feature you? (max 200 chars)" value={form.why_best}
              onChange={e => setForm({ ...form, why_best: e.target.value.slice(0, 200) })}
              maxLength={200}
              style={{ ...inputStyle, height: '80px', resize: 'none' }} />
            <div style={{ textAlign: 'right', fontFamily: 'Bebas Neue, sans-serif',
                          color: '#666', fontSize: '11px', marginTop: '-6px', marginBottom: '12px' }}>
              {form.why_best.length}/200
            </div>
            {error && <div style={{ color: '#C0392B', fontSize: '11px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowForm(false); setError(''); }}
                style={{ ...goldBtn, flex: 1, backgroundColor: 'transparent', color: '#666', border: '1px solid #3A2E14' }}>
                BACK
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ ...goldBtn, flex: 2 }}>
                {submitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7 — FOOTER */}
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
