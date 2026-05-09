import { Shop, NavigationNode, ENTRANCE_COLORS } from '@indoor-nav/shared';

interface Props {
  shop: Shop | null;
  navNodes: NavigationNode[];
  onUpdate: (shop: Shop) => void;
  onDelete: () => void;
  onAddEntrance: () => void;
}

export default function ShopPropertyPanel({ shop, navNodes, onUpdate, onDelete, onAddEntrance }: Props) {
  if (!shop) {
    return (
      <div style={{ width: 250, padding: 16, borderLeft: '1px solid #ccc', color: '#999' }}>
        选择一个店铺进行编辑
      </div>
    );
  }

  const handleDeleteEntrance = (entId: string) => {
    onUpdate({ ...shop, entrances: shop.entrances.filter(e => e.id !== entId) });
  };

  const handleEntranceTypeChange = (entId: string, type: 'main' | 'side' | 'emergency') => {
    onUpdate({
      ...shop,
      entrances: shop.entrances.map(e => e.id === entId ? { ...e, type } : e),
    });
  };

  const handleConnectEntrance = (entId: string, nodeId: string) => {
    onUpdate({
      ...shop,
      entrances: shop.entrances.map(e => e.id === entId ? { ...e, connectedNodeId: nodeId || undefined } : e),
    });
  };

  return (
    <div style={{ width: 250, padding: 16, borderLeft: '1px solid #ccc', overflow: 'auto' }}>
      <h3 style={{ marginTop: 0 }}>店铺属性</h3>

      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>名称</label>
      <input
        value={shop.name}
        onChange={e => onUpdate({ ...shop, name: e.target.value })}
        style={{ width: '100%', padding: 6, marginBottom: 12 }}
      />

      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>高度</label>
      <input
        type="number" min={0.5} max={10} step={0.5}
        value={shop.height}
        onChange={e => onUpdate({ ...shop, height: parseFloat(e.target.value) || 3 })}
        style={{ width: '100%', padding: 6, marginBottom: 12 }}
      />

      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>颜色</label>
      <input
        type="color"
        value={shop.color || '#94a3b8'}
        onChange={e => onUpdate({ ...shop, color: e.target.value })}
        style={{ width: '100%', height: 32, marginBottom: 16, cursor: 'pointer' }}
      />

      <h4>出入口 ({shop.entrances.length})</h4>
      <button
        onClick={onAddEntrance}
        style={{ width: '100%', padding: 6, marginBottom: 12, background: '#17a2b8', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        添加入口
      </button>

      {shop.entrances.map(ent => (
        <div key={ent.id} style={{ padding: 8, marginBottom: 8, border: '1px solid #ddd', borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ENTRANCE_COLORS[ent.type]?.hex, display: 'inline-block' }} />
              {ENTRANCE_COLORS[ent.type]?.label || ent.type}
            </span>
            <button onClick={() => handleDeleteEntrance(ent.id)} style={{ padding: '2px 6px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: 10 }}>×</button>
          </div>
          <select
            value={ent.type}
            onChange={e => handleEntranceTypeChange(ent.id, e.target.value as 'main' | 'side' | 'emergency')}
            style={{ width: '100%', padding: 4, marginBottom: 6, fontSize: 12 }}
          >
            <option value="main">主入口</option>
            <option value="side">侧入口</option>
            <option value="emergency">紧急出口</option>
          </select>
          <select
            value={ent.connectedNodeId || ''}
            onChange={e => handleConnectEntrance(ent.id, e.target.value)}
            style={{ width: '100%', padding: 4, fontSize: 12 }}
          >
            <option value="">未连接节点</option>
            {navNodes.map(n => (
              <option key={n.id} value={n.id}>{n.type} ({n.position.x.toFixed(0)}, {n.position.z.toFixed(0)})</option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={onDelete}
        style={{ width: '100%', padding: 8, marginTop: 16, background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        删除店铺
      </button>
    </div>
  );
}
