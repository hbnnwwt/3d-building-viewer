import { useState } from 'react';
import { Building } from '@indoor-nav/shared';

interface Props {
  building: Building;
  onClose: () => void;
  onNavigate: (fromFloorId: string, toFloorId: string) => void;
}

export default function NavigationPanel({ building, onClose, onNavigate }: Props) {
  const [fromFloor, setFromFloor] = useState(building.floors[0]?.id || '');
  const [toFloor, setToFloor] = useState(building.floors[1]?.id || '');

  const handleNavigate = () => {
    onNavigate(fromFloor, toFloor);
  };

  return (
    <section
      className="panel"
      role="region"
      aria-labelledby="nav-panel-title"
      style={{
        position: 'absolute', right: 16, top: 16, width: 280,
        background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-panel)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 id="nav-panel-title">室内导航</h3>
        <button onClick={onClose} aria-label="关闭导航面板">×</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>起始楼层</label>
        <select value={fromFloor} onChange={e => setFromFloor(e.target.value)} style={{ width: '100%', padding: 8 }}>
          {building.floors.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>目标楼层</label>
        <select value={toFloor} onChange={e => setToFloor(e.target.value)} style={{ width: '100%', padding: 8 }}>
          {building.floors.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleNavigate} style={{ width: '100%', padding: 12, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}>
        查询路线
      </button>
    </section>
  );
}