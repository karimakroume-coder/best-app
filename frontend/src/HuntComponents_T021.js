
// ─── T021: HUNT COMPASS COMPONENT ───────────────────────────────────────────

function HuntCompass({ angleDeg, onClose }) {
  const [timeUntilReset, setTimeUntilReset] = React.useState('');

  React.useEffect(() => {
    function calcReset() {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeUntilReset(`${h}h ${m}m`);
    }
    calcReset();
    const id = setInterval(calcReset, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 100, left: 20,
      zIndex: 180, display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 4
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        border: '2px solid #C8A951',
        backgroundColor: 'rgba(13,8,0,0.9)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer'
      }} onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }}>
        <svg width="40" height="40" viewBox="0 0 40 40"
             style={{ transform: `rotate(${angleDeg}deg)`,
                      transition: 'transform 0.3s ease',
                      transformOrigin: '20px 20px' }}>
          <path d="M20 4 L26 28 L20 24 L14 28 Z"
                fill="#C8A951" stroke="#C8A951" strokeWidth="1"/>
          <circle cx="20" cy="20" r="3" fill="#0D0800"/>
        </svg>
      </div>
      <span style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 9, letterSpacing: 3,
        color: '#C8A951'
      }}>HUNT</span>
      {timeUntilReset ? (
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 8, color: '#555', letterSpacing: 1
        }}>RESETS IN {timeUntilReset}</span>
      ) : null}
    </div>
  );
}

// ─── T021: HUNT FOUND OVERLAY ────────────────────────────────────────────────

function HuntFoundOverlay({ rank, leaderboard, onDismiss }) {
  const [phase, setPhase] = React.useState('flash');

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('result'), 300);
    const t2 = setTimeout(() => onDismiss(), 5300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  const isTop3 = leaderboard && leaderboard.length > 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: phase === 'flash'
        ? 'rgba(200,169,81,0.25)'
        : 'rgba(13,8,0,0.92)',
      transition: 'background-color 0.3s ease'
    }}>
      {phase === 'result' && (
        <>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 32, color: '#C8A951',
            letterSpacing: 6, marginBottom: 8
          }}>HUNT COMPLETE</div>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 20, color: '#F5E6C8',
            letterSpacing: 4, marginBottom: 16
          }}>+50 DISCOVERY SCORE</div>
          {rank && (
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 48, color: '#C8A951',
              textShadow: '3px 3px 0 #B8860B, 6px 6px 0 #8B6914',
              marginBottom: 16
            }}>#{rank}</div>
          )}
          {isTop3 && (
            <div style={{
              borderTop: '1px solid #333',
              paddingTop: 12, marginTop: 8,
              textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 11, color: '#555',
                letterSpacing: 3, marginBottom: 8
              }}>TODAY'S FASTEST</div>
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 13, color: i === 0 ? '#C8A951' : '#888',
                  letterSpacing: 2, marginBottom: 4
                }}>
                  {i + 1}. {entry.user_id?.slice(0, 8) || 'Hunter'}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
