import { Monitor } from '@indoor-nav/shared';

interface Props {
  monitors: Monitor[];
  onClose: () => void;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  temperature: { label: '温度', icon: '🌡️', color: '#ef4444' },
  humidity: { label: '湿度', icon: '💧', color: '#3b82f6' },
  airQuality: { label: '空气质量', icon: '🌬️', color: '#22c55e' },
  noise: { label: '噪音', icon: '🔊', color: '#f59e0b' }
};

export default function MonitorPanel({ monitors, onClose }: Props) {
  return (
    <section
      className="panel"
      role="dialog"
      aria-labelledby="monitor-panel-title"
      aria-modal="true"
      style={{
        position: 'absolute', left: 16, top: 80, width: 280,
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 id="monitor-panel-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
          📊 环境监测
        </h2>
        <button
          onClick={onClose}
          aria-label="关闭监测面板"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: 'none', background: 'var(--color-surface-elevated)',
            color: 'var(--color-text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'all var(--transition-fast)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Empty state */}
      {monitors.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 'var(--spacing-xl) 0',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14 }}>暂无监测数据</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>请在Editor中添加监测设备</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {monitors.map(m => {
            const config = typeConfig[m.type] || { label: m.type, icon: '📊', color: 'var(--color-primary)' };
            return (
              <div
                key={m.id}
                style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${config.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{config.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                    {config.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: config.color }}>
                    {m.value}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                    {m.unit}
                  </span>
                </div>
                {m.lastUpdate && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
                    更新: {new Date(m.lastUpdate).toLocaleString('zh-CN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}