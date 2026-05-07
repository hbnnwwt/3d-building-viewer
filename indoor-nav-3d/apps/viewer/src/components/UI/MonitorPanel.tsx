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
    <div style={{
      position: 'absolute', left: 16, top: 16, width: 260,
      background: 'white', borderRadius: 8, padding: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>环境监测</h3>
        <button onClick={onClose}>×</button>
      </div>

      {monitors.length === 0 ? (
        <p style={{ color: '#666' }}>暂无监测数据</p>
      ) : (
        <div>
          {monitors.map(m => (
            <div key={m.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold' }}>{typeLabels[m.type] || m.type}</div>
              <div style={{ fontSize: 24, color: '#007bff' }}>{m.value} {m.unit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}