import { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    setName(floor.name);
    setFloorHeight(floor.geometry?.floorHeight || 3);
    setOutline(floor.geometry?.outline);
    setWidth(floor.geometry?.width || 100);
    setDepth(floor.geometry?.depth || 100);
    setMode(floor.geometry?.outline ? 'polygon' : 'rectangle');
  }, [floor.id]);

  const handleSave = () => {
    if (!name.trim()) { alert('楼层名称不能为空'); return; }
    if (floorHeight <= 0) { alert('楼层高度必须大于 0'); return; }

    const geometry: FloorGeometry = {
      width: mode === 'rectangle' ? width : floor.geometry?.width || 100,
      depth: mode === 'rectangle' ? depth : floor.geometry?.depth || 100,
      floorHeight,
      outline: mode === 'polygon' ? outline : undefined,
    };

    onSave({ ...floor, name: name.trim(), geometry });
  };

  const handleOutlineChange = (newOutline: Polygon2D | undefined) => {
    setOutline(newOutline);
    if (newOutline) setMode('polygon');
  };

  const handleCopyFromFloor = (sourceId: string) => {
    const source = allFloors.find(f => f.id === sourceId);
    if (!source) return;
    const srcOutline = getFloorOutline(source.geometry);
    if (srcOutline.vertices.length < 3) { alert('源楼层没有有效轮廓'); return; }
    setOutline({ vertices: [...srcOutline.vertices] });
    setMode('polygon');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.vertices && Array.isArray(data.vertices)) {
          if (data.vertices.length < 3) { alert('至少需要 3 个顶点'); return; }
          setOutline({ vertices: data.vertices });
          setMode('polygon');
        } else if (data.outline?.vertices) {
          setOutline(data.outline);
          setMode('polygon');
          if (data.floorHeight) setFloorHeight(data.floorHeight);
          if (data.width) setWidth(data.width);
          if (data.depth) setDepth(data.depth);
        } else {
          alert('无法识别的 JSON 格式，需要 { "vertices": [...] } 或包含 "outline" 字段');
        }
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
        <h3 style={{ marginTop: 0 }}>楼层属性</h3>

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>名称</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 6, marginBottom: 12, boxSizing: 'border-box' }} />

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>楼层高度</label>
        <input type="number" min={1} value={floorHeight} onChange={e => setFloorHeight(Number(e.target.value) || 3)} style={{ width: '100%', padding: 6, marginBottom: 12, boxSizing: 'border-box' }} />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>形状模式</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setMode('rectangle')} style={{ flex: 1, padding: 6, border: '1px solid', borderColor: mode === 'rectangle' ? '#007bff' : '#ccc', background: mode === 'rectangle' ? '#007bff' : 'white', color: mode === 'rectangle' ? 'white' : 'inherit', borderRadius: 4, cursor: 'pointer' }}>
              矩形
            </button>
            <button onClick={() => setMode('polygon')} style={{ flex: 1, padding: 6, border: '1px solid', borderColor: mode === 'polygon' ? '#007bff' : '#ccc', background: mode === 'polygon' ? '#007bff' : 'white', color: mode === 'polygon' ? 'white' : 'inherit', borderRadius: 4, cursor: 'pointer' }}>
              多边形
            </button>
          </div>
        </div>

        {mode === 'rectangle' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>宽度</label>
              <input type="number" min={1} value={width} onChange={e => setWidth(Number(e.target.value) || 100)} style={{ width: '100%', padding: 6, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>深度</label>
              <input type="number" min={1} value={depth} onChange={e => setDepth(Number(e.target.value) || 100)} style={{ width: '100%', padding: 6, boxSizing: 'border-box' }} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 12, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: 12, color: '#555' }}>
            {vertexCount > 0 ? `多边形轮廓: ${vertexCount} 个顶点` : '尚未绘制轮廓'}
          </div>
        )}

        {otherFloors.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>复制楼层形状</label>
            <select
              onChange={e => { if (e.target.value) handleCopyFromFloor(e.target.value); e.target.value = ''; }}
              defaultValue=""
              style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
            >
              <option value="">选择楼层...</option>
              {otherFloors.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input type="file" ref={importRef} accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          <button onClick={() => importRef.current?.click()} style={{ flex: 1, padding: 6, border: '1px solid #17a2b8', background: 'white', color: '#17a2b8', borderRadius: 4, cursor: 'pointer' }}>
            导入 JSON
          </button>
          <button onClick={handleExport} style={{ flex: 1, padding: 6, border: '1px solid #6c757d', background: 'white', color: '#6c757d', borderRadius: 4, cursor: 'pointer' }}>
            导出楼层
          </button>
        </div>

        <button onClick={handleSave} style={{ width: '100%', padding: 8, background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
          保存修改
        </button>
      </div>
    </div>
  );
}
