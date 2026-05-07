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
    if (fromFloor && toFloor && fromFloor !== toFloor) {
      onNavigate(fromFloor, toFloor);
    }
  };

  const isValid = fromFloor && toFloor && fromFloor !== toFloor;

  return (
    <section
      className="panel"
      role="dialog"
      aria-labelledby="nav-panel-title"
      aria-modal="true"
      style={{
        position: 'absolute', right: 16, top: 80, width: 300,
        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 id="nav-panel-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
          🧭 室内导航
        </h2>
        <button
          onClick={onClose}
          aria-label="关闭导航面板"
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

      {/* Floor selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            起始楼层
          </label>
          <select
            value={fromFloor}
            onChange={e => setFromFloor(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              fontSize: 14, border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-elevated)',
              cursor: 'pointer'
            }}
          >
            {building.floors.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 20, color: 'var(--color-text-muted)', paddingTop: 20 }}>
          →
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            目标楼层
          </label>
          <select
            value={toFloor}
            onChange={e => setToFloor(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              fontSize: 14, border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-elevated)',
              cursor: 'pointer'
            }}
          >
            {building.floors.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation button */}
      <button
        onClick={handleNavigate}
        disabled={!isValid}
        style={{
          width: '100%', padding: '14px',
          background: isValid ? 'var(--color-primary)' : 'var(--color-border)',
          color: isValid ? 'white' : 'var(--color-text-muted)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: 15, fontWeight: 600,
          cursor: isValid ? 'pointer' : 'not-allowed',
          transition: 'all var(--transition-fast)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}
      >
        {isValid ? '🔍 查询路线' : '请选择起始和目标楼层'}
      </button>

      {/* Legend */}
      <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          节点类型
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-walkable)' }}></span>
            <span>可通行</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-entrance)' }}></span>
            <span>入口</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-exit)' }}></span>
            <span>出口</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-elevator)' }}></span>
            <span>电梯</span>
          </div>
        </div>
      </div>
    </section>
  );
}