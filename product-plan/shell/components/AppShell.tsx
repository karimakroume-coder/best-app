import React, { createContext, useContext, useState, useCallback } from 'react'

type ShellState = 'hidden' | 'bloom' | 'retreat'

interface ShellContextType {
  state: ShellState
  bloom: () => void
  retreat: () => void
  activeMap: string
  setActiveMap: (map: string) => void
  activeCategory: string
  setActiveCategory: (category: string) => void
}

const ShellContext = createContext<ShellContextType | null>(null)

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within AppShell')
  return ctx
}

interface AppShellProps {
  children: React.ReactNode
  maps?: Array<{ id: string; label: string; letter: string }>
  categories?: Array<{ id: string; label: string }>
}

export default function AppShell({
  children,
  maps = [
    { id: 'world-best', label: 'World Best', letter: 'W' },
    { id: 'best-map', label: 'Best Map', letter: 'M' },
    { id: 'my-best', label: 'My Best', letter: 'Y' },
    { id: 'crew-best', label: 'Crew Best', letter: 'C' },
    { id: 'crown', label: 'Crown', letter: 'K' },
  ],
  categories = [
    { id: 'global', label: 'GLOBAL' },
    { id: 'music', label: 'MUSIC' },
    { id: 'gaming', label: 'GAMING' },
    { id: 'sports', label: 'SPORTS' },
    { id: 'science', label: 'SCIENCE' },
    { id: 'art', label: 'ART' },
    { id: 'comedy', label: 'COMEDY' },
  ],
}: AppShellProps) {
  const [state, setState] = useState<ShellState>('hidden')
  const [activeMap, setActiveMap] = useState('world-best')
  const [activeCategory, setActiveCategory] = useState('global')

  const bloom = useCallback(() => setState('bloom'), [])
  const retreat = useCallback(() => {
    setState('retreat')
    setTimeout(() => setState('hidden'), 600)
  }, [])

  return (
    <ShellContext.Provider
      value={{ state, bloom, retreat, activeMap, setActiveMap, activeCategory, setActiveCategory }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0D0800',
          overflow: 'hidden',
          fontFamily: "'Bebas Neue', Impact, sans-serif",
        }}
      >
        {/* Content — always 100% */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {children}
        </div>

        {/* Category Strip — slides down from top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            transform: state === 'bloom' ? 'translateY(0)' : 'translateY(-100%)',
            opacity: state === 'bloom' ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: state === 'bloom' ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '16px 24px',
              background: 'linear-gradient(180deg, rgba(13,8,0,0.95) 0%, rgba(13,8,0,0) 100%)',
            }}
          >
            <span
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#F0C040',
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}
            >
              BEST
            </span>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '16px',
                  letterSpacing: '2px',
                  color: activeCategory === cat.id ? '#F0C040' : '#F5E6C8',
                  opacity: activeCategory === cat.id ? 1 : 0.6,
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderBottom: activeCategory === cat.id ? '2px solid #F0C040' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vault — top right */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '24px',
            zIndex: 10,
            transform: state === 'bloom' ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
            opacity: state === 'bloom' ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
            pointerEvents: state === 'bloom' ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #F0C040',
              background: '#5C1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(240,192,64,0.3)',
            }}
          >
            <span style={{ color: '#F5E6C8', fontSize: '14px', fontFamily: "'Bebas Neue'" }}>
              VAULT
            </span>
          </div>
        </div>

        {/* B Navigation — left edge */}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: state === 'bloom'
              ? 'translateY(-50%) translateX(0)'
              : 'translateY(-50%) translateX(-60px)',
            opacity: state === 'bloom' ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s',
            pointerEvents: state === 'bloom' ? 'auto' : 'none',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {maps.map((map) => (
              <button
                key={map.id}
                onClick={() => setActiveMap(map.id)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: activeMap === map.id ? '2px solid #F0C040' : '2px solid rgba(245,230,200,0.2)',
                  background: activeMap === map.id
                    ? 'linear-gradient(135deg, #D4A017 0%, #B8860B 50%, #8B4513 100%)'
                    : 'rgba(92,26,26,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: activeMap === map.id
                    ? '0 0 16px rgba(240,192,64,0.4), inset 0 1px 2px rgba(255,255,255,0.2)'
                    : 'none',
                  transition: 'all 0.2s ease',
                }}
                title={map.label}
              >
                <span
                  style={{
                    fontFamily: "'Times New Roman', Georgia, serif",
                    fontWeight: 'bold',
                    fontSize: '20px',
                    color: activeMap === map.id ? '#0D0800' : '#F5E6C8',
                  }}
                >
                  {map.letter}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar — bottom center */}
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: state === 'bloom'
              ? 'translateX(-50%) translateY(0)'
              : 'translateX(-50%) translateY(60px)',
            opacity: state === 'bloom' ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
            pointerEvents: state === 'bloom' ? 'auto' : 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '12px 24px',
              background: 'rgba(13,8,0,0.8)',
              borderRadius: '40px',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(240,192,64,0.15)',
            }}
          >
            {['MARK', 'FLEX', 'MY 100', 'RADAR'].map((action) => (
              <button
                key={action}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2px solid #F0C040',
                  background: 'linear-gradient(145deg, #D4A017 0%, #B8860B 40%, #8B4513 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.15), 0 0 20px rgba(240,192,64,0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                title={action}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: '10px',
                    letterSpacing: '1px',
                    color: '#0D0800',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: 1.1,
                  }}
                >
                  {action}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mandala — always visible, bottom right */}
        <div
          onClick={state === 'hidden' ? bloom : undefined}
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
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              border: '1.5px solid #D4A017',
              animation: 'spin 12s linear infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '16px',
              borderRadius: '50%',
              border: '1px solid #B8860B',
              animation: 'spin 6s linear infinite',
            }}
          />
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
    </ShellContext.Provider>
  )
}
