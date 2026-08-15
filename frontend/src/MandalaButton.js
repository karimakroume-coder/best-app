import React from 'react';

// A rotating mandala — three concentric rings of gold circles rotating in
// alternating directions, used as the "tap to reveal actions" button in
// place of the plain gold dot.
const MandalaButton = ({ onClick, onTouchEnd, size = 120, style = {} }) => {
  const cx = size / 2;
  const cy = size / 2;

  // Generate circles for each ring
  const ring1 = Array.from({length: 8}, (_, i) => ({
    x: cx + 25 * Math.cos((i * 2 * Math.PI) / 8),
    y: cy + 25 * Math.sin((i * 2 * Math.PI) / 8),
    r: 3
  }));

  const ring2 = Array.from({length: 14}, (_, i) => ({
    x: cx + 42 * Math.cos((i * 2 * Math.PI) / 14),
    y: cy + 42 * Math.sin((i * 2 * Math.PI) / 14),
    r: 2.5
  }));

  const ring3 = Array.from({length: 20}, (_, i) => ({
    x: cx + 58 * Math.cos((i * 2 * Math.PI) / 20),
    y: cy + 58 * Math.sin((i * 2 * Math.PI) / 20),
    r: 2
  }));

  return (
    <svg width={size} height={size}
         onClick={onClick}
         onTouchEnd={onTouchEnd}
         style={{cursor:'pointer', overflow:'visible', ...style}}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <style>{`
          @keyframes rotateClockwise {
            from { transform-origin: ${cx}px ${cy}px; transform: rotate(0deg); }
            to { transform-origin: ${cx}px ${cy}px; transform: rotate(360deg); }
          }
          @keyframes rotateCounter {
            from { transform-origin: ${cx}px ${cy}px; transform: rotate(0deg); }
            to { transform-origin: ${cx}px ${cy}px; transform: rotate(-360deg); }
          }
          .ring1 { animation: rotateClockwise 8s linear infinite; }
          .ring2 { animation: rotateCounter 12s linear infinite; }
          .ring3 { animation: rotateClockwise 16s linear infinite; }
        `}</style>
      </defs>

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={8}
              fill="#C8A951" filter="url(#glow)"/>

      {/* Ring 1 */}
      <g className="ring1">
        {ring1.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r}
                  fill="#C8A951" opacity="1"/>
        ))}
      </g>

      {/* Ring 2 */}
      <g className="ring2">
        {ring2.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r}
                  fill="#C8A951" opacity="0.75"/>
        ))}
      </g>

      {/* Ring 3 */}
      <g className="ring3">
        {ring3.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r}
                  fill="#C8A951" opacity="0.5"/>
        ))}
      </g>
    </svg>
  );
};

export default MandalaButton;
