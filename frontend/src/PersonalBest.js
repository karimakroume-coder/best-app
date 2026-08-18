import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getColorHex } from './colors';

const API_BASE = 'https://web-production-a267.up.railway.app';
const DEFAULT_USER_ID = 'a307cc62-3afd-47b0-9911-9300a934d788';

// Slow, seamless marquee: the line is duplicated and the span scrolls by
// exactly half its own width, so the loop has no visible jump.
const MARQUEE_KEYFRAMES = `
  @keyframes bestMarquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

function dominantColor(dist) {
  if (!dist || dist.total === 0) return null;
  let best = null;
  let bestPct = 0;
  Object.entries(dist.distribution || {}).forEach(([name, pct]) => {
    if (pct > bestPct) { best = name; bestPct = pct; }
  });
  return best ? getColorHex(best) : null;
}

function PersonalBest({ userId }) {
  const navigate = useNavigate();
  const effectiveUserId = (typeof localStorage !== 'undefined' && localStorage.getItem('best_user_id')) || userId || DEFAULT_USER_ID;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [colorMood, setColorMood] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      axios.get(`${API_BASE}/personal-best/${effectiveUserId}`),
      axios.get(`${API_BASE}/ranking/global`),
    ])
      .then(([pbRes, globalRes]) => {
        if (cancelled) return;
        const details = {};
        (globalRes.data || []).forEach(v => { details[v.video_id] = v; });
        const merged = (pbRes.data || [])
          .map(row => ({ ...row, ...(details[row.video_id] || {}) }))
          .reverse(); // newest save first
        setItems(merged);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Could not load your Personal Best.');
        setItems([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [effectiveUserId]);

  // Dominant color mood per video — the small dot in the card corner.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    Promise.all(
      items.map(row =>
        axios.get(`${API_BASE}/color/distribution/${row.video_id}`)
          .then(r => [row.video_id, r.data])
          .catch(() => [row.video_id, null])
      )
    ).then(pairs => {
      if (cancelled) return;
      const map = {};
      pairs.forEach(([id, data]) => { map[id] = data; });
      setColorMood(map);
    });
    return () => { cancelled = true; };
  }, [items]);

  const scrollLine = useMemo(() => {
    const lines = {};
    items.forEach(it => {
      const desc = it.ai_description && String(it.ai_description).trim()
        ? it.ai_description
        : 'A moment worth keeping.';
      lines[it.video_id] = desc;
    });
    return lines;
  }, [items]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0D0800',
                  overflowY: 'auto', overflowX: 'hidden',
                  fontFamily: 'Arial, sans-serif', color: '#F5E6C8' }}>

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', backgroundColor: 'rgba(13,8,0,0.92)',
                    backdropFilter: 'blur(8px)', borderBottom: '1px solid #1A1206' }}>
        <button onClick={() => navigate('/')}
          style={{ backgroundColor: 'transparent', border: '1px solid #3a2f14',
                   color: '#F0C040', padding: '6px 14px', cursor: 'pointer',
                   fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px',
                   letterSpacing: '3px' }}>
          ‹ BACK
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'Pacifico, cursive', color: '#F0C040',
                         fontSize: '22px', lineHeight: 1 }}>BEST</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#F0C040',
                         fontSize: '10px', letterSpacing: '6px' }}>PERSONAL BEST 100</span>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '60vh', color: '#8B7A52', letterSpacing: '4px', fontSize: '12px' }}>
          LOADING...
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px',
                        letterSpacing: '4px', color: '#8B7A52' }}>{error}</div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontFamily: 'Pacifico, cursive', fontSize: '26px',
                        color: '#F0C040' }}>Nothing yet.</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px',
                        letterSpacing: '4px', color: '#8B7A52', marginTop: '16px' }}>
            SAVE VIDEOS FROM THE MAP — THEY WAIT HERE FOREVER.
          </div>
        </div>
      )}

      {items.map((it) => {
        const rank = it.rank || it.rank_at_add;
        const title = it.title || 'Untitled video';
        const channel = it.channel_name || 'Unknown channel';
        const line = scrollLine[it.video_id];
        const dotColor = dominantColor(colorMood[it.video_id]) || '#555555';
        return (
          <div key={it.id || it.video_id}
               style={{ position: 'relative', width: '100%', height: '200px',
                        overflow: 'hidden', borderBottom: '1px solid #1A1206',
                        backgroundColor: '#0D0800' }}>

            {/* BLURRED THUMBNAIL BACKGROUND */}
            {it.thumbnail_url && (
              <img src={it.thumbnail_url} alt=""
                   style={{ position: 'absolute', left: '-20px', top: '-20px',
                            width: 'calc(100% + 40px)', height: 'calc(100% + 40px)',
                            objectFit: 'cover', filter: 'blur(14px)',
                            opacity: 0.3, pointerEvents: 'none' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                          background: 'linear-gradient(to right, rgba(13,8,0,0.94) 0%, rgba(13,8,0,0.55) 55%, rgba(13,8,0,0.82) 100%)' }} />

            {/* RANK NUMBER — gold layered shadow */}
            <div style={{ position: 'absolute', left: '16px', top: '50%',
                          transform: 'translateY(-50%)',
                          fontFamily: 'Bebas Neue, sans-serif', color: '#F5E6C8',
                          fontSize: '64px', letterSpacing: '2px',
                          textShadow: '2px 2px 0 #F0C040, 4px 4px 0 #B8860B, 6px 6px 0 rgba(0,0,0,0.5)' }}>
              {rank ? `#${rank}` : '—'}
            </div>

            {/* TITLE + CHANNEL + SLOW SCROLLING LINE */}
            <div style={{ position: 'absolute', left: '104px', right: '16px',
                          top: '50%', transform: 'translateY(-64%)' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px',
                            color: '#F5E6C8', letterSpacing: '2px',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis' }}>
                {title}
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px',
                            color: '#F0C040', letterSpacing: '4px',
                            textTransform: 'uppercase', marginTop: '6px' }}>
                {channel}
              </div>
            </div>

            {/* SLOWLY SCROLLING LINE — Pacifico italic */}
            <div style={{ position: 'absolute', left: '104px', right: '16px',
                          bottom: '30px', overflow: 'hidden' }}>
              <div style={{ display: 'inline-block', whiteSpace: 'nowrap',
                            fontFamily: 'Pacifico, cursive', fontStyle: 'italic',
                            color: '#A08A5A', fontSize: '14px',
                            animation: 'bestMarquee 20s linear infinite' }}>
                {line}&nbsp;&nbsp;&nbsp;&nbsp;{line}
              </div>
            </div>

            {/* SMALL COLORED DOT — bottom left corner */}
            <div style={{ position: 'absolute', bottom: '12px', left: '16px',
                          width: '8px', height: '8px', borderRadius: '50%',
                          backgroundColor: dotColor,
                          boxShadow: `0 0 6px ${dotColor}` }} />
          </div>
        );
      })}

      {items.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px 8px' }}>
          <button
            onClick={() => {
              const ids = items.map(v => v.video_id).join(',');
              window.open('https://www.youtube.com/watch_videos?video_ids=' + ids, '_blank');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              const ids = items.map(v => v.video_id).join(',');
              window.open('https://www.youtube.com/watch_videos?video_ids=' + ids, '_blank');
            }}
            style={{
              fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px',
              letterSpacing: '4px', color: '#F0C040',
              backgroundColor: 'transparent',
              border: '1px solid #F0C040',
              borderRadius: 0, padding: '10px 28px',
              cursor: 'pointer',
              minWidth: '44px', minHeight: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            ▶ WATCH ALL ON YOUTUBE
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ textAlign: 'center', padding: '16px 16px 24px',
                      color: '#3a2f14', fontFamily: 'Bebas Neue, sans-serif',
                      fontSize: '12px', letterSpacing: '4px' }}>
          {items.length} / 100 SAVED
        </div>
      )}

      <style>{MARQUEE_KEYFRAMES}</style>
    </div>
  );
}

export default PersonalBest;
