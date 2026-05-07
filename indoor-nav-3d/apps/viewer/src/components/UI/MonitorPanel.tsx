import { Monitor } from '@indoor-nav/shared';

interface Props {
  monitors: Monitor[];
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  temperature: '温度',
  humidity: '湿度',
  airQuality: '空气质量',
  noise: '噪音'
};

export default function MonitorPanel({ monitors, onClose }: Props) {
  return (
    <section
      className="panel"
      role="region"
      aria-labelledby="monitor-panel-title"
      style={{
        position: 'absolute', left: 16, top: 16, width: 260,
        background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-panel)', maxHeight: '80vh', overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 id="monitor-panel-title">环境监测</h3>
        <button onClick={onClose} aria-label="关闭监测面板">×</button>
      </div>

      {monitors.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>暂无监测数据</p>
      ) : (
        <div>
          {monitors.map(m => (
            <div key={m.id} style={{ padding: 8, borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 'bold' }}>{typeLabels[m.type] || m.type}</div>
              <div style={{ fontSize: 24, color: 'var(--color-primary)' }}>{m.value} {m.unit}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}