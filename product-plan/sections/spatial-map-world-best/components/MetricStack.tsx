interface MetricStackProps {
  fireflagCount: number
  flexCount: number
  shareCount: number
}

function MetricItem({ icon, value }: { icon: string; value: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {/* Icon — small gold medallion */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #D4A017 0%, #B8860B 50%, #8B4513 100%)',
          border: '1.5px solid rgba(240,192,64,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)',
          fontSize: '14px',
        }}
      >
        {icon}
      </div>
      {/* Value */}
      <span
        style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: '16px',
          letterSpacing: '1px',
          color: '#F5E6C8',
          lineHeight: 1,
        }}
      >
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </span>
    </div>
  )
}

export function MetricStack({ fireflagCount, flexCount, shareCount }: MetricStackProps) {
  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <MetricItem icon="🔥" value={fireflagCount} />
      <MetricItem icon="⚡" value={flexCount} />
      <MetricItem icon="↗" value={shareCount} />
    </div>
  )
}
