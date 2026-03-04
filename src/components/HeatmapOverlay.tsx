import React from 'react';

interface HeatmapOverlayProps {
  points: Array<{ x: number; y: number; intensity: number }>;
  visible: boolean;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ points, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      <svg className="w-full h-full opacity-60">
        <defs>
          <radialGradient id="heatGradient">
            <stop offset="0%" stopColor="rgba(255, 0, 0, 0.8)" />
            <stop offset="50%" stopColor="rgba(255, 255, 0, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 255, 0, 0)" />
          </radialGradient>
        </defs>
        {points.map((p, i) => (
          <circle
            key={i}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.intensity * 80}
            fill="url(#heatGradient)"
          />
        ))}
      </svg>
    </div>
  );
};
