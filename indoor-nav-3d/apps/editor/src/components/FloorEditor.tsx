import { useState, useRef, useEffect, useCallback } from 'react';
import { Floor, FloorGeometry, Polygon2D, getFloorOutline } from '@indoor-nav/shared';
import FloorCanvasEditor from './FloorCanvasEditor';

interface Props {
  floor: Floor;
  onSave: (floor: Partial<Floor>) => void;
  allFloors?: Floor[];
}

export default function FloorEditor({ floor, onSave, allFloors = [] }: Props) {
  const [name, setName] = useState(floor.name);
  const [floorHeight, setFloorHeight] = useState(floor.geometry?.floorHeight || 3);
  const [outline, setOutline] = useState<Polygon2D | undefined>(floor.geometry?.outline);
  const [width, setWidth] = useState(floor.geometry?.width || 100);
  const [depth, setDepth] = useState(floor.geometry?.depth || 100);
  const [mode, setMode] = useState<'rectangle' | 'polygon'>(floor.geometry?.outline ? 'polygon' : 'rectangle');
  const importRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Sync state when floor changes (user selects different floor)
  useEffect(() => {
    setName(floor.name);
    setFloorHeight(floor.geometry?.floorHeight || 3);
    setOutline(floor.geometry?.outline);
    setWidth(floor.geometry?.width || 100);
    setDepth(floor.geometry?.depth || 100);
    setMode(floor.geometry?.outline ? 'polygon' : 'rectangle');
    isInitialMount.current = true;
  }, [floor.id]);

  // Auto-save: skip initial mount, save on any subsequent state change
  const saveGeometry = useCallback((opts: {
    newName?: string;
    newHeight?: number;
    newOutline?: Polygon2D | undefined;
    newWidth?: number;
    newDepth?: number;
    newMode?: 'rectangle' | 'polygon';
  }) => {
    const m = opts.newMode ?? mode;
    const n = opts.newName ?? name;
    const h = opts.newHeight ?? floorHeight;
    const o = opts.newOutline !== undefined ? opts.newOutline : outline;
    const w = opts.newWidth ?? width;
    const d = opts.newDepth ?? depth;

    const geometry: FloorGeometry = {
      width: m === 'rectangle' ? w : floor.geometry?.width || 100,
      depth: m === 'rectangle' ? d : floor.geometry?.depth || 100,
      floorHeight: h,
      outline: m === 'polygon' ? o : undefined,
    };

    onSave({ ...floor, name: n.trim() || floor.name, geometry });
  }, [floor, mode, name, floorHeight, outline, width, depth, onSave]);

  // Debounced auto-save for text/number inputs
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => saveGeometry({}), 300);
    return () => clearTimeout(timer);
  }, [name, floorHeight, width, depth, mode]);

  const handleOutlineChange = (newOutline: Polygon2D | undefined) => {
    setOutline(newOutline);
    if (newOutline) {
      setMode('polygon');
      saveGeometry({ newOutline, newMode: 'polygon' });
    } else {
      saveGeometry({ newOutline: undefined, newMode: 'rectangle' });
    }
  };

  const handleModeChange = (m: 'rectangle' | 'polygon') => {
    setMode(m);
    // When switching to polygon without an outline, switch mode only (user will draw)
    // When switching to rectangle, save immediately with rectangle geometry
    if (m === 'rectangle') {
      saveGeometry({ newMode: 'rectangle' });
    }
  };

  const handleCopyFromFloor = (sourceId: string) => {
    const source = allFloors.find(f => f.id === sourceId);
    if (!source) return;
    const srcOutline = getFloorOutline(source.geometry);
    if (srcOutline.vertices.length < 3) { alert('源楼层没有有效轮廓'); return; }
    const newOutline = { vertices: [...srcOutline.vertices] };
    setOutline(newOutline);
    setMode('polygon');
    saveGeometry({ newOutline, newMode: 'polygon' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        const opts: Parameters<typeof saveGeometry>[0] = {};
        if (data.vertices && Array.isArray(data.vertices)) {
          if (data.vertices.length < 3) { alert('至少需要 3 个顶点'); return; }
          opts.newOutline = { vertices: data.vertices };
          opts.newMode = 'polygon';
        } else if (data.outline?.vertices) {
          opts.newOutline = data.outline;
          opts.newMode = 'polygon';
          if (data.floorHeight) { opts.newHeight = data.floorHeight; setFloorHeight(data.floorHeight); }
          if (data.width) { opts.newWidth = data.width; setWidth(data.width); }
          if (data.depth) { opts.newDepth = data.depth; setDepth(data.depth); }
        } else {
          alert('无法识别的 JSON 格式，需要 { "vertices": [...] } 或包含 "outline" 字段');
          return;
        }
        if (opts.newOutline) setOutline(opts.newOutline);
        if (opts.newMode) setMode(opts.newMode);
        saveGeometry(opts);
      } catch {
        alert('JSON 解析失败');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleExport = () => {
    const currentOutline = outline || getFloorOutline(floor.geometry);
    const data = {
      name: floor.name,
      geometry: {
        width: mode === 'rectangle' ? width : floor.geometry?.width,
        depth: mode === 'rectangle' ? depth : floor.geometry?.depth,
        floorHeight,
        outline: mode === 'polygon' ? currentOutline : undefined,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floor-${floor.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const otherFloors = allFloors.filter(f => f.id !== floor.id);
  const vertexCount = outline?.vertices.length ?? 0;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)' }}>
      <FloorCanvasEditor
        floor={floor}
        outline={outline}
        onOutlineChange={handleOutlineChange}
      />
      <div style={{ width: 260, padding: 16, borderLeft: '1px solid #ccc', overflow: 'auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>楼层属性</h3>

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>名称</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 6, marginBottom: 12, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }} />

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>楼层高度</label>
        <input type="number" min={1} value={floorHeight} onChange={e => setFloorHeight(Number(e.target.value) || 3)} style={{ width: '100%', padding: 6, marginBottom: 16, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }} />

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>形状模式</label>
          <div style={{ display: 'flex', gap: 0, border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' }}>
            <button onClick={() => handleModeChange('rectangle')} style={{
              flex: 1, padding: '8px 0', border: 'none',
              background: mode === 'rectangle' ? '#007bff' : 'white',
              color: mode === 'rectangle' ? 'white' : '#333',
              cursor: 'pointer', fontWeight: mode === 'rectangle' ? 600 : 400,
              borderRight: '1px solid #ccc'
            }}>
              矩形
            </button>
            <button onClick={() => handleModeChange('polygon')} style={{
              flex: 1, padding: '8px 0', border: 'none',
              background: mode === 'polygon' ? '#007bff' : 'white',
              color: mode === 'polygon' ? 'white' : '#333',
              cursor: 'pointer', fontWeight: mode === 'polygon' ? 600 : 400
            }}>
              多边形
            </button>
          </div>
        </div>

        {mode === 'rectangle' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>宽度</label>
              <input type="number" min={1} value={width} onChange={e => setWidth(Number(e.target.value) || 100)} style={{ width: '100%', padding: 6, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>深度</label>
              <input type="number" min={1} value={depth} onChange={e => setDepth(Number(e.target.value) || 100)} style={{ width: '100%', padding: 6, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16, padding: '8px 10px', background: vertexCount > 0 ? '#e8f5e9' : '#f5f5f5', borderRadius: 4, fontSize: 12, color: vertexCount > 0 ? '#2e7d32' : '#999', border: '1px solid', borderColor: vertexCount > 0 ? '#c8e6c9' : '#e0e0e0' }}>
            {vertexCount > 0 ? `${vertexCount} 个顶点已定义` : '点击「绘制轮廓」开始绘制'}
          </div>
        )}

        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 12, marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 12, color: '#666' }}>快捷操作</label>

          {otherFloors.length > 0 && (
            <select
              onChange={e => { if (e.target.value) handleCopyFromFloor(e.target.value); e.target.value = ''; }}
              defaultValue=""
              style={{ width: '100%', padding: 6, marginBottom: 8, boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: 4, color: '#333' }}
            >
              <option value="">复制楼层形状...</option>
              {otherFloors.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <input type="file" ref={importRef} accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            <button onClick={() => importRef.current?.click()} style={{ flex: 1, padding: 6, border: '1px solid #17a2b8', background: 'white', color: '#17a2b8', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              导入
            </button>
            <button onClick={handleExport} style={{ flex: 1, padding: 6, border: '1px solid #6c757d', background: 'white', color: '#6c757d', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              导出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
