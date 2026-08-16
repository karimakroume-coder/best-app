
// ─── T023: PERSONAL BEST SPATIAL MAP ────────────────────────────────────────

function PersonalBestMap({ userId, onSwitchToWorld, discoveryScore }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [zoom, setZoom] = React.useState('1x');

  const API = 'https://web-production-a267.up.railway.app';

  React.useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`${API}/personal-best/${userId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data :
                     Array.isArray(data?.items) ? data.items : [];
        setItems(list);
        // Random drop on arrival
        if (list.length > 0) {
          setCurrentIdx(Math.floor(Math.random() * list.length));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ position:'fixed', inset:0, backgroundColor:'#0D0800',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:'Pacifico,cursive', color:'#C8A951', fontSize:20 }}>
          loading your best...
        </div>
      </div>
    );
  }

  if (!items || items.length < 3) {
    return (
      <div style={{ position:'fixed', inset:0, backgroundColor:'#0D0800',
                    display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', gap:16 }}>
        <div style={{ fontFamily:'Pacifico,cursive', color:'#C8A951', fontSize:20,
                      textAlign:'center', padding:'0 32px' }}>
          YOUR BEST 100 IS EMPTY
        </div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', color:'#F5E6C8',
                      fontSize:14, letterSpacing:3, textAlign:'center' }}>
          Mark videos to add them
        </div>
        <button
          onClick={onSwitchToWorld}
          onTouchEnd={(e) => { e.preventDefault(); onSwitchToWorld(); }}
          style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13,
                   letterSpacing:3, color:'#C8A951',
                   backgroundColor:'transparent',
                   border:'1px solid #C8A951',
                   borderRadius:0, padding:'10px 28px',
                   marginTop:8, cursor:'pointer', minHeight:44 }}>
          EXPLORE WORLD BEST
        </button>
      </div>
    );
  }

  const current = items[currentIdx] || items[0];

  // Single card view
  if (zoom === '1x') {
    return (
      <div style={{ position:'fixed', inset:0, backgroundColor:'#0D0800',
                    backgroundImage: current?.thumbnail_url
                      ? `url(${current.thumbnail_url})` : 'none',
                    backgroundSize:'cover', backgroundPosition:'center' }}>
        {/* Dark overlay */}
        <div style={{ position:'absolute', inset:0,
                      background:'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' }}/>
        
        {/* MY BEST watermark */}
        <div style={{ position:'absolute', top:16, right:16,
                      fontFamily:'Bebas Neue,sans-serif', fontSize:8,
                      letterSpacing:3, color:'#C8A951', opacity:0.6, zIndex:10 }}>
          MY BEST
        </div>

        {/* Rank number */}
        <div style={{ position:'absolute', top:'35%', left:'50%',
                      transform:'translate(-50%,-50%)', textAlign:'center', zIndex:10 }}>
          <div style={{
            fontFamily:'Bebas Neue,sans-serif',
            fontSize: currentIdx === 0 ? 120 : currentIdx < 3 ? 96 : 72,
            color:'#F5E6C8',
            textShadow:'3px 3px 0 #C8A951, 6px 6px 0 #B8860B, 9px 9px 0 #8B6914',
            lineHeight:1
          }}>
            #{currentIdx + 1}
          </div>
        </div>

        {/* Title + AI description */}
        <div style={{ position:'absolute', bottom:140, left:0, right:0,
                      textAlign:'center', padding:'0 24px', zIndex:10 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20,
                        color:'#F5E6C8', letterSpacing:3, marginBottom:4 }}>
            {current?.title || ''}
          </div>
          <div style={{ fontFamily:'Pacifico,cursive', fontSize:13,
                        color:'#C8A951', fontStyle:'italic',
                        overflow:'hidden', whiteSpace:'nowrap',
                        animation:'marqueeScroll 12s linear infinite' }}>
            {current?.ai_description || 'A moment worth keeping.'}
          </div>
        </div>

        {/* Color dot */}
        {current?.color && (
          <div style={{ position:'absolute', bottom:180, left:20,
                        width:12, height:12, borderRadius:'50%',
                        backgroundColor: current.color, zIndex:10 }}/>
        )}

        {/* Navigation dots */}
        <div style={{ position:'absolute', bottom:100, left:0, right:0,
                      display:'flex', justifyContent:'center', gap:6, zIndex:10 }}>
          {items.slice(0, Math.min(items.length, 7)).map((_, i) => (
            <div key={i}
                 onClick={() => setCurrentIdx(i)}
                 style={{ width: i === currentIdx ? 8 : 4,
                          height: i === currentIdx ? 8 : 4,
                          borderRadius:'50%',
                          backgroundColor: i === currentIdx ? '#C8A951' : '#333',
                          cursor:'pointer', transition:'all 0.2s' }}/>
          ))}
        </div>

        <style>{\`
          @keyframes marqueeScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        \`}</style>
      </div>
    );
  }

  // 3x3 grid view
  const gridItems = items.slice(0, 9);
  while (gridItems.length < 9) gridItems.push(null);

  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'#0D0800',
                  display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                  gridTemplateRows:'repeat(3,1fr)', gap:2 }}>
      {gridItems.map((item, i) => (
        <div key={i}
             onClick={() => { if (item) { setCurrentIdx(items.indexOf(item)); setZoom('1x'); }}}
             style={{ position:'relative', overflow:'hidden', cursor: item ? 'pointer' : 'default',
                      backgroundImage: item?.thumbnail_url ? `url(${item.thumbnail_url})` : 'none',
                      backgroundSize:'cover', backgroundPosition:'center',
                      backgroundColor: item ? 'transparent' : '#000' }}>
          {item ? (
            <>
              <div style={{ position:'absolute', inset:0,
                            background:'rgba(0,0,0,0.4)' }}/>
              <div style={{ position:'absolute', top:'50%', left:'50%',
                            transform:'translate(-50%,-50%)',
                            fontFamily:'Bebas Neue,sans-serif',
                            fontSize:28, color:'#F5E6C8',
                            textShadow:'2px 2px 0 #C8A951' }}>
                #{items.indexOf(item) + 1}
              </div>
              {item.color && (
                <div style={{ position:'absolute', bottom:4, left:4,
                              width:8, height:8, borderRadius:'50%',
                              backgroundColor: item.color }}/>
              )}
            </>
          ) : (
            <div style={{ position:'absolute', inset:0, display:'flex',
                          alignItems:'center', justifyContent:'center',
                          animation:'cardBreathe 4s ease-in-out infinite' }}>
              <div style={{ fontFamily:'Pacifico,cursive', fontSize:10,
                            color:'#222', textAlign:'center' }}>
                add more
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
