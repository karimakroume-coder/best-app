interface RankNumberProps {
  rank: number
}

export function RankNumber({ rank }: RankNumberProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 5,
        userSelect: 'none',
      }}
    >
      {/* Deep shadow layer — furthest back */}
      <span
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 'bold',
          fontSize: 'clamp(80px, 12vw, 140px)',
          color: '#8B4513',
          lineHeight: 1,
          opacity: 0.7,
        }}
        aria-hidden="true"
      >
        #{rank}
      </span>

      {/* Mid shadow layer */}
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 'bold',
          fontSize: 'clamp(80px, 12vw, 140px)',
          color: '#B8860B',
          lineHeight: 1,
          opacity: 0.85,
        }}
        aria-hidden="true"
      >
        #{rank}
      </span>

      {/* Bright face layer — top */}
      <span
        style={{
          position: 'relative',
          fontFamily: "'Times New Roman', Georgia, serif",
          fontWeight: 'bold',
          fontSize: 'clamp(80px, 12vw, 140px)',
          background: 'linear-gradient(160deg, #F0C040 0%, #D4A017 40%, #B8860B 70%, #8B4513 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          textShadow: 'none',
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
        }}
      >
        #{rank}
      </span>
    </div>
  )
}
