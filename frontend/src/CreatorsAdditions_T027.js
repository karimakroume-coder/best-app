
// ─── T027: LIVE STATS SECTION ────────────────────────────────────────────────
// Add this component before the main Creators component

function LiveStats() {
  const [stats, setStats] = React.useState(null);
  const API = 'https://web-production-a267.up.railway.app';

  React.useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const boxes = [
    { value: stats?.videos_ranked || '—', label: 'VIDEOS RANKED' },
    { value: stats?.total_marks || '—', label: 'MARKS PLACED' },
    { value: '20', label: 'COUNTRIES' },
    { value: stats ? 
      Math.max(0, 100 - (stats.creator_applications || 0)) : '—', 
      label: 'SPOTS LEFT' },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
      gap: 8, padding: '0 16px', marginTop: 32, marginBottom: 32
    }}>
      {boxes.map((box, i) => (
        <div key={i} style={{
          border: '1px solid #C8A951',
          backgroundColor: 'rgba(200,169,81,0.05)',
          padding: '12px 8px', textAlign: 'center'
        }}>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 28, color: '#C8A951', lineHeight: 1
          }}>{box.value}</div>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 9, color: '#F5E6C8',
            letterSpacing: 2, marginTop: 4
          }}>{box.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── T027: APPLICATION MODAL ─────────────────────────────────────────────────

function ApplicationModal({ onClose }) {
  const API = 'https://web-production-a267.up.railway.app';
  const [form, setForm] = React.useState({
    name:'', email:'', youtube_url:'',
    subscriber_count:'', primary_category:'Music', why_best:''
  });
  const [scorePreview, setScorePreview] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [appId, setAppId] = React.useState(null);

  const checkScore = (url) => {
    if (!url) return;
    fetch(`${API}/creator/score-preview?youtube_url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => setScorePreview(data))
      .catch(() => {});
  };

  const handleSubmit = () => {
    fetch(`${API}/creator/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subscriber_count: parseInt(form.subscriber_count) || 0
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAppId(data.application_id);
          setSubmitted(true);
        }
      })
      .catch(() => {});
  };

  const inputStyle = {
    width: '100%', backgroundColor: 'transparent',
    border: '1px solid #333', borderRadius: 0,
    color: '#F5E6C8', padding: '8px 12px',
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 14, letterSpacing: 2,
    boxSizing: 'border-box', marginBottom: 12,
    outline: 'none'
  };
  const labelStyle = {
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 10, letterSpacing: 3,
    color: '#C8A951', marginBottom: 4,
    display: 'block'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'flex-end'
    }} onClick={onClose}>
      <div style={{
        width: '100%', backgroundColor: '#0D0800',
        border: '1px solid #C8A951',
        borderRadius: '8px 8px 0 0',
        padding: 24, maxHeight: '85vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }} onClick={e => e.stopPropagation()}>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{
              fontFamily: 'Pacifico, cursive',
              fontSize: 24, color: '#C8A951', marginBottom: 16
            }}>Application Received</div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 13, color: '#F5E6C8', letterSpacing: 3
            }}>WE WILL BE IN TOUCH BEFORE LAUNCH</div>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: 'Pacifico, cursive',
              fontSize: 24, color: '#C8A951',
              textAlign: 'center', marginBottom: 24
            }}>Join The Founding 100</div>

            <label style={labelStyle}>YOUR NAME</label>
            <input style={inputStyle} value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Your name" />

            <label style={labelStyle}>EMAIL</label>
            <input style={inputStyle} type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="your@email.com" />

            <label style={labelStyle}>YOUTUBE CHANNEL URL</label>
            <input style={inputStyle} value={form.youtube_url}
              onChange={e => {
                setForm({...form, youtube_url: e.target.value});
                if (e.target.value.includes('youtube.com'))
                  checkScore(e.target.value);
              }}
              placeholder="youtube.com/c/yourchannel" />
            {scorePreview && (
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 11, color: '#C8A951',
                letterSpacing: 2, marginTop: -8, marginBottom: 12
              }}>
                {scorePreview.channel_found
                  ? `YOUR BEST SCORE: ${scorePreview.best_score?.toFixed(2)} · RANK #${scorePreview.rank}`
                  : 'NOT YET RANKED — YOU WILL BE AMONG THE FIRST'}
              </div>
            )}

            <label style={labelStyle}>SUBSCRIBERS</label>
            <input style={inputStyle} type="number" value={form.subscriber_count}
              onChange={e => setForm({...form, subscriber_count: e.target.value})}
              placeholder="0" />

            <label style={labelStyle}>PRIMARY CATEGORY</label>
            <select style={{...inputStyle, appearance: 'none'}}
              value={form.primary_category}
              onChange={e => setForm({...form, primary_category: e.target.value})}>
              {['Music','Gaming','Sports','Entertainment',
                'Education','Culture','Comedy'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label style={labelStyle}>WHY BEST? (200 CHARS MAX)</label>
            <textarea style={{...inputStyle, height: 80, resize: 'none'}}
              value={form.why_best} maxLength={200}
              onChange={e => setForm({...form, why_best: e.target.value})}
              placeholder="Why do you want to be a founding creator?" />

            <button
              onClick={handleSubmit}
              onTouchEnd={e => { e.preventDefault(); handleSubmit(); }}
              style={{
                width: '100%', fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 16, letterSpacing: 4, color: '#0D0800',
                backgroundColor: '#C8A951', border: 'none',
                borderRadius: 0, padding: '14px 0',
                cursor: 'pointer', minHeight: 44, marginTop: 8
              }}>
              SUBMIT APPLICATION
            </button>
          </>
        )}
      </div>
    </div>
  );
}
