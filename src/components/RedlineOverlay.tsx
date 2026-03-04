import React from 'react';

interface RedlineOverlayProps {
  issues: Array<{
    type: string;
    description: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  visible: boolean;
}

export const RedlineOverlay: React.FC<RedlineOverlayProps> = ({ issues, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-lg">
      {issues.map((issue, i) => (
        <div
          key={i}
          className="absolute border-2 border-red-500 bg-red-500/10 group cursor-help pointer-events-auto"
          style={{
            left: `${issue.x}%`,
            top: `${issue.y}%`,
            width: `${issue.width}%`,
            height: `${issue.height}%`,
          }}
        >
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
            <div className="bg-red-600 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
              <span className="font-bold uppercase mr-2">问题:</span>
              {issue.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
