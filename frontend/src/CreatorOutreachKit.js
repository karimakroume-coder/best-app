import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';

const API_BASE = 'https://web-production-a267.up.railway.app';

const GOLD_DIM = '#C8A951';
const CREAM = '#F5F0E6';
const BG = '#0D0800';
const CARD_BG = '#120C02';

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const REACH_STATS = [
  { value: '500,000', label: 'USERS IN YEAR 1' },
  { value: '100', label: 'FOUNDING CREATORS' },
  { value: '20', label: 'COUNTRIES AT LAUNCH' },
  { value: '#1', label: 'RANK SITS AT CENTER' },
];

const DISCOVERY_ACTIONS = [
  { points: '+100', label: 'Discover a video before it reaches the Top 100' },
  { points: '+50', label: 'Complete the daily Hunt game' },
  { points: '+50', label: 'Add a video to your Personal Best 100' },
  { points: '+30', label: 'Fireflag a video that rises (prediction)' },
  { points: '+20', label: 'Place a fireflag' },
  { points: '+10', label: 'Watch a video ranked below 500' },
  { points: '+5', label: 'Assign a color to a video' },
];

const BENEFITS = [
  { title: 'PERMANENT COORDINATE', text: "A permanent spot in Map 2's Founding District. Yours forever, blockchain verified." },
  { title: 'CREATOR STUDIO PRO', text: 'Six layers of control over your card - free for your first year ($9.99/mo value).' },
  { title: 'INDEPENDENT PROOF', text: 'Your BEST Score is calculated independently. No platform can buy or manipulate it.' },
  { title: 'FIRST MOVER', text: 'BEST users discover content before it goes mainstream. Be the signal, not the noise.' },
];

function PitchCard() {
  return (
    <div style={{ width: '720px', backgroundColor: CARD_BG, color: CREAM,
                  fontFamily: 'Arial, sans-serif', padding: '48px',
                  boxSizing: 'border-box', border: '1px solid #3A2E14' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid #3A2E14', paddingBottom: '24px' }}>
        <div style={{ fontFamily: 'Pacifico, cursive', color: GOLD_DIM, fontSize: '44px' }}>BEST</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                      fontSize: '20px', letterSpacing: '10px', marginTop: '4px' }}>FOUNDING CREATORS</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '46px', lineHeight: 1 }}>100 VIDEOS.</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '46px', lineHeight: 1 }}>100 CREATORS.</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM, fontSize: '24px',
                      letterSpacing: '4px', marginTop: '12px' }}>THE WORLD'S FIRST INDEPENDENT RANKING</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: GOLD_DIM, fontSize: '15px',
                      marginTop: '10px', lineHeight: 1.4 }}>
          No algorithm bias. No platform agenda.<br />
          Just what is genuinely the best content in the world right now.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '28px' }}>
        {REACH_STATS.map(s => (
          <div key={s.label} style={{ border: '1px solid #3A2E14', backgroundColor: 'rgba(200,169,81,0.04)',
                        padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM, fontSize: '30px' }}>{s.value}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                          fontSize: '11px', letterSpacing: '3px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '28px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                      fontSize: '18px', letterSpacing: '4px' }}>THE DISCOVERY SCORE - HOW YOUR AUDIENCE FINDS YOU</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: CREAM, fontSize: '13px',
                      marginTop: '6px', lineHeight: 1.5 }}>
          A 0-1000 reputation system. The higher your audience's score, the harder they push you up the ranking.
        </div>
        <div style={{ marginTop: '12px' }}>
          {DISCOVERY_ACTIONS.map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'flex-start',
                                         padding: '5px 0', borderBottom: '1px dotted #241a08' }}>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                             fontSize: '15px', minWidth: '52px' }}>{a.points}</span>
              <span style={{ fontSize: '12px', color: CREAM, lineHeight: 1.5 }}>{a.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#8a7a4a', marginTop: '10px', lineHeight: 1.6 }}>
          Annual badges: Gold top 1% - Silver top 5% - Bronze top 15%. Elite users (750+) carry 3x weight in the ranking algorithm.
        </div>
      </div>
      <div style={{ marginTop: '28px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                      fontSize: '18px', letterSpacing: '4px' }}>FOUNDING CREATOR BENEFITS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{ border: '1px solid #3A2E14', padding: '14px',
                           backgroundColor: 'rgba(200,169,81,0.04)' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                            fontSize: '13px', letterSpacing: '3px' }}>{b.title}</div>
              <div style={{ fontFamily: 'Pacifico, cursive', color: CREAM,
                            fontSize: '12px', marginTop: '6px', lineHeight: 1.5 }}>{b.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '28px',
                    borderTop: '1px solid #3A2E14', paddingTop: '20px' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                       fontSize: '12px', letterSpacing: '3px' }}>APPLY AT /CREATORS - founding@bestapp.com</span>
      </div>
    </div>
  );
}

function CreatorOutreachKit() {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState(null);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [refError, setRefError] = useState('');

  const referralSlug = slugify(creatorName);
  const referralLink = referralSlug
    ? `${window.location.origin}/creators?ref=${referralSlug}`
    : '';

  const exportCard = useCallback(async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: CARD_BG, scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'best-founding-creator-pitch.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  }, [exporting]);

  const copyLink = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      const el = document.createElement('textarea');
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const fetchReferrals = useCallback(async () => {
    setLoadingRefs(true);
    setRefError('');
    try {
      const res = await axios.get(`${API_BASE}/creator/referrals`);
      setReferrals(res.data);
    } catch (err) {
      setRefError('Could not load referral data');
      setReferrals(null);
    }
    setLoadingRefs(false);
  }, []);

  const inputStyle = {
    width: '100%', padding: '12px 14px', marginBottom: '10px',
    backgroundColor: '#1A1408', border: '1px solid #3A2E14',
    color: CREAM, fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', borderRadius: 0,
  };

  const goldBtn = {
    width: '100%', padding: '14px', backgroundColor: GOLD_DIM,
    border: 'none', color: '#0D0800', fontSize: '14px',
    letterSpacing: '3px', cursor: 'pointer', fontFamily: 'Bebas Neue, sans-serif',
    minHeight: '44px',
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', height: '100vh',
                  width: '100%', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box',
                  overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <div style={{ fontFamily: 'Pacifico, cursive', color: GOLD_DIM, fontSize: '36px' }}>BEST</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD_DIM,
                      fontSize: '18px', letterSpacing: '8px', marginTop: '8px' }}>CREATOR OUTREACH KIT</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#8a7a4a', fontSize: '12px', marginTop: '8px' }}>
          Internal tool - pitch the 100 founding creators
        </div>
      </div>

      <div style={{ marginTop: '36px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                      fontSize: '22px', letterSpacing: '3px' }}>SHAREABLE PITCH CARD</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#8a7a4a', fontSize: '12px', marginTop: '6px' }}>
          Exports as a PNG to attach to outreach emails
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '4px' }}>
          <div ref={cardRef}><PitchCard /></div>
        </div>
        <button onClick={exportCard} disabled={exporting} style={{ ...goldBtn, maxWidth: '360px', marginTop: '20px' }}>
          {exporting ? 'EXPORTING...' : 'EXPORT PNG'}
        </button>
      </div>

      <div style={{ marginTop: '44px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                      fontSize: '22px', letterSpacing: '3px' }}>REFERRAL LINK GENERATOR</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#8a7a4a', fontSize: '12px', marginTop: '6px' }}>
          Give each creator their own link so you can see who converts
        </div>
        <div style={{ maxWidth: '480px', margin: '20px auto 0' }}>
          <input type="text" placeholder="Creator name (e.g. Marques Brownlee)"
            value={creatorName} onChange={e => setCreatorName(e.target.value)} style={inputStyle} />
          {referralLink && (
            <div style={{ textAlign: 'left', padding: '14px', border: '1px solid #3A2E14',
                          backgroundColor: 'rgba(200,169,81,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#8a7a4a', letterSpacing: '2px', marginBottom: '6px' }}>REFERRAL LINK</div>
              <div style={{ fontSize: '12px', color: CREAM, wordBreak: 'break-all' }}>{referralLink}</div>
            </div>
          )}
          <button onClick={copyLink} disabled={!referralLink} style={{ ...goldBtn, marginTop: '12px' }}>
            {copied ? 'COPIED' : 'COPY LINK'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '44px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: CREAM,
                      fontSize: '22px', letterSpacing: '3px' }}>CONVERSION TRACKING</div>
        <div style={{ fontFamily: 'Pacifico, cursive', color: '#8a7a4a', fontSize: '12px', marginTop: '6px' }}>
          Applications attributed to each referral link
        </div>
        <button onClick={fetchReferrals} disabled={loadingRefs} style={{ ...goldBtn, maxWidth: '360px', marginTop: '20px' }}>
          {loadingRefs ? 'LOADING...' : 'REFRESH DATA'}
        </button>
        {refError && <div style={{ color: '#C0392B', fontSize: '12px', marginTop: '12px' }}>{refError}</div>}
        {referrals && (
          <div style={{ maxWidth: '480px', margin: '20px auto 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                          borderBottom: '1px solid #3A2E14', fontSize: '11px',
                          color: '#8a7a4a', letterSpacing: '2px' }}>
              <span>REFERRAL</span><span>APPLICATIONS</span>
            </div>
            {(referrals.referrals || []).length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12px', color: '#8a7a4a' }}>No referrals yet</div>
            ) : (
              referrals.referrals.map(r => (
                <div key={r.ref} style={{ display: 'flex', justifyContent: 'space-between',
                               padding: '10px 0', borderBottom: '1px dotted #241a08' }}>
                  <span style={{ fontSize: '13px', color: CREAM }}>{r.ref}</span>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '15px', color: GOLD_DIM }}>{r.applications}</span>
                </div>
              ))
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: CREAM }}>TOTAL REFERRED</span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '15px', color: GOLD_DIM }}>{referrals.total_referred ?? 0}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: '60px' }} />
    </div>
  );
}

export default CreatorOutreachKit;
