import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' },
    success: { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' },
    warning: { bg: '#fffbeb', text: '#f59e0b', border: '#fef3c7' },
    danger: { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' },
    info: { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' },
    purple: { bg: '#f5f3ff', text: '#8b5cf6', border: '#ede9fe' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="stat-card">
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.2rem 0', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {subtext}
          </div>
        )}
      </div>

      {Icon && (
        <div
          className="stat-icon"
          style={{
            background: scheme.bg,
            color: scheme.text,
            border: `1px solid ${scheme.border}`,
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
