import React, { useState } from 'react';

export const ProgressChart = ({ data = [], height = 220 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        border: '1px dashed var(--border-subtle)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '1.4rem' }}>📈</div>
        <div>No evaluation records yet.</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Solve your first challenge to generate your learning curve.
        </div>
      </div>
    );
  }

  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Calculate coordinates
  const points = data.map((item, index) => {
    const x = data.length === 1
      ? chartWidth / 2
      : paddingX + (index / (data.length - 1)) * innerWidth;
    const clampedScore = Math.max(0, Math.min(100, item.score || 0));
    const y = paddingY + innerHeight - (clampedScore / 100) * innerHeight;
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = paddingY + innerHeight - (val / 100) * innerHeight;
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-muted)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        {areaD && <path d={areaD} fill="url(#curveGradient)" />}

        {/* Line Stroke */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data Circles */}
        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? 7 : 5}
              fill={pt.is_correct ? '#10b981' : '#f59e0b'}
              stroke="#0f172a"
              strokeWidth="2.5"
              style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
            />
            {/* Date label at bottom */}
            <text
              x={pt.x}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-muted)"
            >
              {pt.date || `#${idx + 1}`}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
            top: `${(points[hoveredIndex].y / chartHeight) * 100}%`,
            transform: 'translate(-50%, -120%)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#fff',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 700, color: points[hoveredIndex].is_correct ? '#34d399' : '#fbbf24' }}>
            Score: {points[hoveredIndex].score}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {points[hoveredIndex].is_correct ? 'Mastered' : 'Needs Practice'} • {points[hoveredIndex].date}
          </div>
        </div>
      )}
    </div>
  );
};
