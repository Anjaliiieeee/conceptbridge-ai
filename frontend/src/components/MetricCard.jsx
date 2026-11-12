import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'var(--primary)', accentBg = 'rgba(99, 102, 241, 0.15)', onClick }) => {
  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '6px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: accentBg,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        boxShadow: `0 4px 12px ${color}25`,
        flexShrink: 0
      }}>
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
};
