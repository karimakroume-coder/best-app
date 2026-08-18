interface RisingFastBadgeProps {
  visible: boolean
}

export function RisingFastBadge({ visible }: RisingFastBadgeProps) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '50px',
        left: 'clamp(160px, 20vw, 260px)',
        zIndex: 5,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 16px',
          background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 60%, #8B4513 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(240,192,64,0.5)',
          boxShadow: '0 3px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15), 0 0 16px rgba(240,192,64,0.15)',
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: '13px',
            letterSpacing: '2px',
            color: '#0D0800',
            fontWeight: 'bold',
          }}
        >
          RISING FAST
        </span>
        <span style={{ fontSize: '12px' }}>▲</span>
      </div>
    </div>
  )
}
