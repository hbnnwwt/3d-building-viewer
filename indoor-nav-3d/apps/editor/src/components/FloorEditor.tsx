import { useState } from 'react';
import { Floor } from '@indoor-nav/shared';

interface Props {
  floor: Floor;
  onSave: (floor: Partial<Floor>) => void;
}

export default function FloorEditor({ floor, onSave }: Props) {
  const [name, setName] = useState(floor.name);
  const [width, setWidth] = useState(floor.geometry?.width || 100);
  const [depth, setDepth] = useState(floor.geometry?.depth || 100);
  const [floorHeight, setFloorHeight] = useState(floor.geometry?.floorHeight || 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert('楼层名称不能为空'); return; }
    if (width <= 0 || depth <= 0 || floorHeight <= 0) { alert('尺寸必须大于 0'); return; }
    onSave({
      ...floor,
      name: name.trim(),
      geometry: { width, depth, floorHeight }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2>Edit Floor: {floor.name}</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Width</label>
          <input
            type="number" min="1"
            value={width}
            onChange={e => setWidth(Number(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Depth</label>
          <input
            type="number" min="1"
            value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Height</label>
          <input
            type="number" min="1"
            value={floorHeight}
            onChange={e => setFloorHeight(Number(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
      </div>

      <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
        Save Changes
      </button>
    </form>
  );
}