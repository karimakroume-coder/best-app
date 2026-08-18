import type { SpatialMapProps } from '@/../product/sections/spatial-map-world-best/types'
import { RankNumber } from './RankNumber'
import { MetricStack } from './MetricStack'
import { RisingFastBadge } from './RisingFastBadge'

export function SingleCardView({
  currentVideo,
  onTogglePlayPause,
  onMandalaTap,
}: SpatialMapProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0D0800',
        cursor: 'pointer',
      }}
      onClick={onTogglePlayPause}
    >
      {/* ===== VIDEO FRAME — slightly rounded, gold border ===== */}
      <div
        style={{
          position: 'absolute',
          inset: '8px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1.5px solid rgba(240,192,64,0.2)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Video thumbnail / background */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${currentVideo.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.65) contrast(1.1) saturate(1.15)',
          }}
        />

        {/* ===== FILM GRAIN OVERLAY ===== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
            pointerEvents: 'none',
          }}
        />

        {/* ===== DARK VIGNETTE ===== */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(13,8,0,0.4) 60%, rgba(13,8,0,0.85) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ===== BOTTOM GRADIENT — text readability ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(13,8,0,0.92) 0%, rgba(13,8,0,0.6) 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ===== RANK NUMBER — embossed ===== */}
        <RankNumber rank={currentVideo.rank} />

        {/* ===== RISING FAST BADGE ===== */}
        <RisingFastBadge visible={currentVideo.isRisingFast} />

        {/* ===== METRIC STACK — right edge ===== */}
        <MetricStack
          fireflagCount={currentVideo.fireflagCount}
          flexCount={currentVideo.flexCount}
          shareCount={currentVideo.shareCount}
        />

        {/* ===== TEXT CONTENT — lower third ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '40px',
            right: '80px',
            zIndex: 5,
          }}
        >
          {/* Video title */}
          <h1
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '3px',
              color: '#F5E6C8',
              lineHeight: 1.1,
              margin: 0,
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            {currentVideo.title}
          </h1>

          {/* Creator name */}
          <p
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              letterSpacing: '2px',
              color: '#F0C040',
              marginTop: '6px',
              opacity: 0.9,
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            {currentVideo.creator}
          </p>

          {/* Fireflag count */}
          <p
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '12px',
              letterSpacing: '1.5px',
              color: '#F5E6C8',
              marginTop: '10px',
              opacity: 0.5,
            }}
          >
            FIREFLAG BY {currentVideo.fireflagCount.toLocaleString()} CURATORS
          </p>

          {/* AI poetic description */}
          <p
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: 'clamp(13px, 1.5vw, 17px)',
              fontStyle: 'italic',
              color: '#F5E6C8',
              marginTop: '12px',
              opacity: 0.7,
              maxWidth: '500px',
              lineHeight: 1.4,
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            }}
          >
            {currentVideo.aiDescription}
          </p>
        </div>
      </div>

      {/* ===== MANDALA — always visible, bottom right ===== */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          onMandalaTap?.()
        }}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          zIndex: 20,
          cursor: 'pointer',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid #F0C040',
            animation: 'spin 8s linear infinite',
            boxShadow: '0 0 20px rgba(240,192,64,0.3)',
          }}
        />
        {/* Middle ring */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '1.5px solid #D4A017',
            animation: 'spin 12s linear infinite reverse',
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            position: 'absolute',
            inset: '16px',
            borderRadius: '50%',
            border: '1px solid #B8860B',
            animation: 'spin 6s linear infinite',
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #F0C040 0%, #D4A017 100%)',
            boxShadow: '0 0 8px rgba(240,192,64,0.5)',
          }}
        />

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
