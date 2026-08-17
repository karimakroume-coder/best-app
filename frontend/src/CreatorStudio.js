import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// ────────────────────────────────────────────────────────────────────────────
// CREATOR STUDIO - six layers of control over a creator's card presentation
// (Bible Ch. 7). Paid feature: Creator Studio Pro - $9.99/month. Founding
// creators get Pro free for Year 1. No payment integration yet - the UI is
// shown "as if unlocked" for now.
//
// ── SAVE ENDPOINT DESIGN (backend NOT built yet) ──────────────────────────
// POST /creator/studio-settings
// Content-Type: application/json
// Authorization: Bearer <supabase_jwt>
//
// Request payload (exactly what this UI sends on SAVE):
// {
//   "video_id": "string",               // video being styled (rankings.video_id)
//   "card_style": "cinematic",          // cinematic|editorial|bold|vintage|noir|gold
//   "display_title": "string | null",   // override title; null = use original
//   "font": "bebas",                    // bebas|pacifico|serif|typewriter|clean
//   "peak_moment_seconds": 42,          // integer seconds (>= 0)
//   "creator_note": "string",           // max 50 words, shown on the card
//   "report_style": "documentary"       // documentary|performance|raw|vlog
// }
//
// Expected response: { "success": true, "settings": { ...same fields... } }
//
// Suggested schema (migrations/creator_studio_settings_migration.sql):
//   CREATE TABLE IF NOT EXISTS creator_studio_settings (
//     id bigint generated always as identity primary key,
//     video_id text unique not null,
//     card_style text not null default 'cinematic',
//     display_title text,
//     font text not null default 'bebas',
//     peak_moment_seconds integer not null default 0,
//     creator_note text,
//     report_style text not null default 'documentary',
//     updated_at timestamptz not null default now()
//   );
//   ALTER TABLE videos   ADD COLUMN IF NOT EXISTS card_style text;
//   ALTER TABLE rankings ADD COLUMN IF NOT EXISTS card_style text;
//   ALTER TABLE rankings ADD COLUMN IF NOT EXISTS creator_note text;
// ────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://web-production-a267.up.railway.app';

const GOLD = '#C8A951';
const GOLD_BRIGHT = '#C9A84C';
const CREAM = '#F5E6C8';
const CREAM_WARM = '#F5F0E6';
const DARK = '#0D0800';
const BORDER = '#3A2E14';
const SILVER = '#A8A9AD';

const CARD_STYLES = [
  { id: 'cinematic', label: 'CINEMATIC', desc: 'Blurred thumbnail, dark, cinematic default' },
  { id: 'editorial', label: 'EDITORIAL', desc: 'Cream background, text-dominant, magazine feel' },
  { id: 'bold',      label: 'BOLD',      desc: 'Solid color block, maximum impact' },
  { id: 'vintage',   label: 'VINTAGE',   desc: 'Sepia tone, film grain, gold frame' },
  { id: 'noir',      label: 'NOIR',      desc: 'Black & white, high contrast, dramatic' },
  { id: 'gold',      label: 'GOLD',      desc: 'Metallic gold frame, luxurious' },
];

const FONT_OPTIONS = [
  { id: 'bebas',      label: 'BEBAS',      css: "'Bebas Neue', sans-serif" },
  { id: 'pacifico',   label: 'PACIFICO',   css: "'Pacifico', cursive" },
  { id: 'serif',      label: 'SERIF',      css: "Georgia, 'Times New Roman', serif" },
  { id: 'typewriter', label: 'TYPEWRITER', css: "'Courier New', Courier, monospace" },
  { id: 'clean',      label: 'CLEAN',      css: "Arial, Helvetica, sans-serif" },
];

const REPORT_STYLES = [
  { id: 'documentary', label: 'DOCUMENTARY' },
  { id: 'performance', label: 'PERFORMANCE' },
  { id: 'raw',         label: 'RAW' },
  { id: 'vlog',        label: 'VLOG' },
];

const MAX_NOTE_WORDS = 50;

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function countWords(str) {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

function CardPreview({ style, font, title, channel, rank, note, peakSeconds, thumbnailUrl }) {
  const fontFamily = FONT_OPTIONS.find(f => f.id === font)?.css || FONT_OPTIONS[0].css;

  const thumbStyle = {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  };

  const peakChip = peakSeconds > 0 ? (
    <div style={{
      position: 'absolute', top: '10px', right: '10px', zIndex: 3,
      display: 'flex', alignItems: 'center', gap: '5px',
      backgroundColor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(200,169,81,0.7)',
      borderRadius: '4px', padding: '3px 8px',
      fontFamily: "'Bebas Neue', sans-serif", color: GOLD_BRIGHT,
      fontSize: '11px', letterSpacing: '2px',
    }}>
      &#9654; {formatTime(peakSeconds)}
    </div>
  ) : null;

  const rankBadge = (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1,
      fontSize: '64px', color: GOLD_BRIGHT,
      textShadow: '3px 3px 0 #B8860B, 6px 6px 0 rgba(0,0,0,0.5)',
    }}>
      #{rank}
    </div>
  );

  switch (style) {
    case 'editorial':
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: CREAM, color: '#1A1A1A',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          border: '1px solid #1A1A1A',
        }}>
          <div style={{ height: '34%', overflow: 'hidden', position: 'relative' }}>
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" style={{ ...thumbStyle, filter: 'grayscale(0.2) contrast(1.05)' }} />
            ) : (
              <div style={{ ...thumbStyle, background: 'linear-gradient(135deg, #D8C9A3, #8B7355)' }} />
            )}
          </div>
          <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px',
                          letterSpacing: '4px', color: '#8B6914' }}>
              N&ordm; {rank} &middot; BEST MAP
            </div>
            <div style={{ fontFamily, fontSize: '26px', lineHeight: 1.1, marginTop: '10px',
                          fontWeight: 700, letterSpacing: '1px' }}>
              {title}
            </div>
            <div style={{ width: '48px', height: '3px', backgroundColor: GOLD, marginTop: '12px' }} />
            {note ? (
              <div style={{ fontFamily: "'Georgia', serif", fontSize: '13px', lineHeight: 1.5,
                            color: '#333', marginTop: '12px', fontStyle: 'italic' }}>
                &ldquo;{note}&rdquo;
              </div>
            ) : null}
            <div style={{ marginTop: 'auto', fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: '10px', letterSpacing: '3px', color: '#666' }}>
              {channel.toUpperCase()}
            </div>
          </div>
          {peakChip}
        </div>
      );

    case 'bold':
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: GOLD, color: DARK,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '20px',
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '80px',
                        lineHeight: 1, color: DARK }}>
            #{rank}
          </div>
          <div style={{ fontFamily, fontSize: '24px', lineHeight: 1.15, marginTop: '10px',
                        fontWeight: 700, letterSpacing: '2px' }}>
            {title}
          </div>
          {note ? (
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '12px',
                          letterSpacing: '1px', marginTop: '14px', opacity: 0.75 }}>
              {note}
            </div>
          ) : null}
          <div style={{ position: 'absolute', bottom: '14px', fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '10px', letterSpacing: '4px' }}>
            {channel.toUpperCase()}
          </div>
          {peakChip}
        </div>
      );

    case 'vintage':
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: '#1A1408', color: CREAM_WARM,
          overflow: 'hidden', border: '4px double #C8A951',
        }}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt=""
                 style={{ ...thumbStyle, filter: 'sepia(0.7) contrast(1.1) brightness(0.9)' }} />
          ) : (
            <div style={{ ...thumbStyle, background: 'linear-gradient(160deg, #5A4632, #2A1E0E)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(20,10,0,0.75) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1,
                        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
                        mixBlendMode: 'overlay' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center', padding: '20px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px',
                          letterSpacing: '5px', color: '#C8A951' }}>
              EST. MMXXVII
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '64px',
                          lineHeight: 1, color: CREAM_WARM, marginTop: '6px',
                          textShadow: '2px 2px 0 #8B6914' }}>
              #{rank}
            </div>
            <div style={{ fontFamily, fontSize: '22px', marginTop: '10px',
                          letterSpacing: '2px', color: CREAM_WARM }}>
              {title}
            </div>
            {note ? (
              <div style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: '12px',
                            marginTop: '12px', color: '#D8C9A3' }}>
                {note}
              </div>
            ) : null}
          </div>
          {peakChip}
        </div>
      );

    case 'noir':
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: '#000000', color: '#FFFFFF',
          overflow: 'hidden',
        }}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt=""
                 style={{ ...thumbStyle, filter: 'grayscale(1) contrast(1.4) brightness(0.7)' }} />
          ) : (
            <div style={{ ...thumbStyle, background: 'linear-gradient(180deg, #222, #000)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.92) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                        textAlign: 'center', padding: '20px 20px 26px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '60px',
                          lineHeight: 1, color: '#FFFFFF', textShadow: '0 0 18px rgba(255,255,255,0.5)' }}>
              #{rank}
            </div>
            <div style={{ fontFamily, fontSize: '20px', letterSpacing: '2px',
                          marginTop: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
              {title}
            </div>
            {note ? (
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px',
                            letterSpacing: '1px', color: '#999', marginTop: '10px' }}>
                {note}
              </div>
            ) : null}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px',
                          letterSpacing: '4px', color: '#AAA', marginTop: '10px' }}>
              {channel.toUpperCase()}
            </div>
          </div>
          {peakChip}
        </div>
      );

    case 'gold':
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: '#0A0803', color: GOLD_BRIGHT,
          overflow: 'hidden', padding: '8px',
        }}>
          <div style={{
            position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
            border: '2px solid #C8A951',
            boxShadow: 'inset 0 0 0 1px #8B6914, inset 0 0 24px rgba(200,169,81,0.25)',
          }}>
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" style={{ ...thumbStyle, filter: 'brightness(0.55) saturate(1.1)' }} />
            ) : (
              <div style={{ ...thumbStyle, background: 'radial-gradient(circle at 50% 30%, #3a2e14, #0a0803)' }} />
            )}
            <div style={{ position: 'absolute', inset: 0,
                          background: 'linear-gradient(to bottom, rgba(10,8,3,0.2), rgba(10,8,3,0.85))' }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex',
                          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          textAlign: 'center', padding: '20px' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '12px',
                            letterSpacing: '6px', color: '#C8A951' }}>
                &#9733; BEST &#9733;
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '70px', lineHeight: 1,
                marginTop: '4px',
                background: 'linear-gradient(180deg, #F5E6C8 0%, #C8A951 55%, #8B6914 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(200,169,81,0.6))',
              }}>
                #{rank}
              </div>
              <div style={{ fontFamily, fontSize: '22px', letterSpacing: '2px',
                            marginTop: '10px', color: CREAM }}>
                {title}
              </div>
              {note ? (
                <div style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', fontSize: '12px',
                              marginTop: '12px', color: '#D8C9A3' }}>
                  {note}
                </div>
              ) : null}
            </div>
            {peakChip}
          </div>
        </div>
      );

    case 'cinematic':
    default:
      return (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          backgroundColor: '#0A0A0A', color: CREAM,
          overflow: 'hidden',
        }}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt=""
                 style={{ ...thumbStyle, filter: 'blur(6px) brightness(0.7)', transform: 'scale(1.15)' }} />
          ) : (
            <div style={{ ...thumbStyle, background: 'linear-gradient(180deg, #1a1206, #050302)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(10,10,10,0.1), rgba(10,10,10,0.8))' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center', padding: '20px' }}>
            <div style={{ fontFamily: "'Pacifico', cursive", fontSize: '20px', color: CREAM,
                          textShadow: '2px 2px 0 #C8A951' }}>
              BEST
            </div>
            {rankBadge}
            <div style={{ fontFamily, fontSize: '20px', letterSpacing: '2px',
                          marginTop: '8px', color: CREAM, maxWidth: '90%' }}>
              {title}
            </div>
            {note ? (
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px',
                            letterSpacing: '1px', color: '#B8A97A', marginTop: '10px',
                            fontStyle: 'italic' }}>
                &ldquo;{note}&rdquo;
              </div>
            ) : null}
            <div style={{ fontFamily: "'Arial', sans-serif", fontSize: '10px',
                          letterSpacing: '4px', textTransform: 'uppercase',
                          color: GOLD_BRIGHT, marginTop: '12px' }}>
              {channel}
            </div>
          </div>
          {peakChip}
        </div>
      );
  }
}

function CreatorStudio() {
  const [cardStyle, setCardStyle] = useState('cinematic');
  const [displayTitle, setDisplayTitle] = useState('');
  const [font, setFont] = useState('bebas');
  const [peakMoment, setPeakMoment] = useState(0);
  const [creatorNote, setCreatorNote] = useState('');
  const [reportStyle, setReportStyle] = useState('documentary');
  const [saved, setSaved] = useState(false);

  const [video, setVideo] = useState({
    video_id: 'demo_video_1',
    title: 'The Quiet Universe',
    channel_name: 'Atlas Studio',
    rank: 12,
    thumbnail_url: '',
  });

  useEffect(() => {
    axios.get(`${API_BASE}/ranking/global`)
      .then(res => {
        const top = (res.data || [])[0];
        if (top && top.video_id) {
          setVideo({
            video_id: top.video_id,
            title: top.title || 'Untitled',
            channel_name: top.channel_name || 'Creator',
            rank: top.rank || 1,
            thumbnail_url: top.thumbnail_url || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const previewTitle = displayTitle.trim() || video.title;

  const noteWords = useMemo(() => countWords(creatorNote), [creatorNote]);

  const handleNoteChange = (val) => {
    const words = val.split(/\s+/).filter(Boolean);
    if (words.length > MAX_NOTE_WORDS) {
      setCreatorNote(words.slice(0, MAX_NOTE_WORDS).join(' '));
    } else {
      setCreatorNote(val);
    }
  };

  const buildPayload = () => ({
    video_id: video.video_id,
    card_style: cardStyle,
    display_title: displayTitle.trim() ? displayTitle.trim() : null,
    font: font,
    peak_moment_seconds: Math.max(0, Math.floor(peakMoment || 0)),
    creator_note: creatorNote.trim(),
    report_style: reportStyle,
  });

  const handleSave = () => {
    setSaved(true);
    console.log('POST /creator/studio-settings', buildPayload());
    setTimeout(() => setSaved(false), 2200);
  };

  const sectionStyle = {
    border: '1px solid #2A2110',
    backgroundColor: 'rgba(200,169,81,0.04)',
    padding: '16px',
    marginBottom: '14px',
  };
  const sectionLabel = {
    fontFamily: "'Bebas Neue', sans-serif", color: GOLD,
    fontSize: '12px', letterSpacing: '3px', marginBottom: '12px',
  };
  const inputStyle = {
    width: '100%', backgroundColor: '#1A1408', border: '1px solid #3A2E14',
    color: CREAM_WARM, padding: '11px 12px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', borderRadius: 0,
  };

  return (
    <div style={{
      backgroundColor: DARK, minHeight: '100vh', width: '100%',
      fontFamily: 'Arial, sans-serif', color: CREAM_WARM,
      overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch',
    }}>

      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        padding: '16px 20px',
        backgroundColor: 'rgba(13,8,0,0.94)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #2A2110',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: "'Pacifico', cursive", color: GOLD, fontSize: '24px' }}>
            BEST
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: CREAM_WARM,
                        fontSize: '14px', letterSpacing: '5px', marginTop: '2px' }}>
            CREATOR STUDIO
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '3px',
            color: DARK, backgroundColor: GOLD, padding: '4px 12px',
            boxShadow: '0 0 12px rgba(200,169,81,0.5)',
          }}>
            PRO
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '9px',
                        letterSpacing: '2px', color: SILVER }}>
            $9.99/MO &middot; UNLOCKED (PREVIEW)
          </div>
        </div>
      </div>

      <div style={{
        margin: '16px 16px 0', padding: '10px 14px',
        border: '1px solid #C8A951', backgroundColor: 'rgba(200,169,81,0.08)',
        textAlign: 'center',
      }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px',
                       letterSpacing: '2px', color: GOLD }}>
          CREATOR STUDIO PRO &mdash; FULL CARD CONTROL OVER WORLD BEST &amp; BEST MAP
        </span>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px',
        padding: '16px', maxWidth: '960px', margin: '0 auto',
      }}>

        <div style={{ flex: '1 1 360px', minWidth: '280px' }}>

          <div style={sectionStyle}>
            <div style={sectionLabel}>1 &middot; CARD STYLE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {CARD_STYLES.map(s => (
                <button key={s.id}
                  onClick={() => setCardStyle(s.id)}
                  style={{
                    textAlign: 'left', cursor: 'pointer', padding: '10px 12px',
                    backgroundColor: cardStyle === s.id ? 'rgba(200,169,81,0.18)' : 'transparent',
                    border: cardStyle === s.id ? '1px solid #C8A951' : '1px solid #3A2E14',
                    color: cardStyle === s.id ? GOLD : CREAM_WARM,
                  }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px',
                                letterSpacing: '2px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8B7355', marginTop: '4px', lineHeight: 1.3 }}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionLabel}>2 &middot; DISPLAY TITLE</div>
            <input style={inputStyle} value={displayTitle}
              placeholder={video.title}
              onChange={e => setDisplayTitle(e.target.value)} />
            <div style={{ fontSize: '10px', color: '#8B7355', marginTop: '6px' }}>
              LEAVE EMPTY TO USE ORIGINAL TITLE
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionLabel}>3 &middot; FONT</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FONT_OPTIONS.map(f => (
                <button key={f.id}
                  onClick={() => setFont(f.id)}
                  style={{
                    cursor: 'pointer', padding: '8px 12px',
                    backgroundColor: font === f.id ? 'rgba(200,169,81,0.18)' : 'transparent',
                    border: font === f.id ? '1px solid #C8A951' : '1px solid #3A2E14',
                    color: font === f.id ? GOLD : CREAM_WARM,
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '2px',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between' }}>
              <span>4 &middot; PEAK MOMENT</span>
              <span style={{ color: GOLD_BRIGHT, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(peakMoment)}
              </span>
            </div>
            <input
              type="range" min="0" max="600" step="1"
              value={peakMoment}
              onChange={e => setPeakMoment(parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', accentColor: GOLD }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#8B7355' }}>0:00</span>
              <span style={{ fontSize: '10px', color: '#8B7355' }}>10:00</span>
            </div>
            <div style={{ fontSize: '10px', color: '#8B7355', marginTop: '8px' }}>
              TIES TO peak_moment_seconds &middot; VIEWERS OPEN YOUR VIDEO AT THIS KEY MOMENT
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between' }}>
              <span>5 &middot; CREATOR NOTE</span>
              <span style={{ color: noteWords >= MAX_NOTE_WORDS ? '#E74C3C' : '#8B7355' }}>
                {noteWords}/{MAX_NOTE_WORDS} WORDS
              </span>
            </div>
            <textarea
              value={creatorNote}
              onChange={e => handleNoteChange(e.target.value)}
              placeholder="A note to the people who add you to their Personal Best 100..."
              style={{ ...inputStyle, height: '80px', resize: 'none', lineHeight: 1.4 }} />
            <div style={{ fontSize: '10px', color: '#8B7355', marginTop: '6px' }}>
              SHOWN ON YOUR CARD &middot; MAX 50 WORDS
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionLabel}>6 &middot; REPORT STYLE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {REPORT_STYLES.map(r => (
                <button key={r.id}
                  onClick={() => setReportStyle(r.id)}
                  style={{
                    cursor: 'pointer', padding: '8px 14px',
                    backgroundColor: reportStyle === r.id ? 'rgba(200,169,81,0.18)' : 'transparent',
                    border: reportStyle === r.id ? '1px solid #C8A951' : '1px solid #3A2E14',
                    color: reportStyle === r.id ? GOLD : CREAM_WARM,
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '2px',
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave}
            style={{
              width: '100%', padding: '15px', cursor: 'pointer',
              backgroundColor: saved ? '#3A2E14' : GOLD,
              border: 'none', borderRadius: 0,
              color: DARK, fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '16px', letterSpacing: '4px',
              minHeight: '48px', transition: 'background-color 0.3s ease',
            }}>
            {saved ? 'SETTINGS SAVED' : 'SAVE SETTINGS'}
          </button>
          <div style={{ fontSize: '9px', color: '#555', textAlign: 'center',
                        letterSpacing: '1px', marginTop: '8px' }}>
            POST /creator/studio-settings &middot; BACKEND NOT CONNECTED YET
          </div>
        </div>

        <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
          <div style={{ position: 'sticky', top: '86px' }}>
            <div style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif",
                          color: GOLD, fontSize: '12px', letterSpacing: '3px', marginBottom: '12px' }}>
              LIVE PREVIEW &mdash; WORLD BEST / BEST MAP
            </div>
            <div style={{
              width: '100%', maxWidth: '360px', margin: '0 auto',
              aspectRatio: '3 / 4',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              <CardPreview
                style={cardStyle}
                font={font}
                title={previewTitle}
                channel={video.channel_name}
                rank={video.rank}
                note={creatorNote.trim()}
                peakSeconds={peakMoment}
                thumbnailUrl={video.thumbnail_url}
              />
            </div>
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#8B7355',
                          marginTop: '10px', letterSpacing: '1px' }}>
              {CARD_STYLES.find(s => s.id === cardStyle)?.label} &middot; {FONT_OPTIONS.find(f => f.id === font)?.label}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes proShine { from { background-position: -200% 0; } to { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}

export default CreatorStudio;
