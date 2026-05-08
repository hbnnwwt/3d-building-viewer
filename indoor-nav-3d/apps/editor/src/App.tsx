import { useState, useEffect, useRef } from 'react';
import { Building, Floor, NavigationNode } from '@indoor-nav/shared';
import FloorList from './components/FloorList';
import FloorEditor from './components/FloorEditor';
import NavPointEditor from './components/NavPointEditor';
import NavPointList from './components/NavPointList';

type EditorTab = 'floor' | 'navpoint';

const STORAGE_KEY = 'indoor-nav-editor-data';

export default function App() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>('floor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = { buildings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buildings.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBuildings(data.buildings || []);
      } catch {
        // Corrupted localStorage data, ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ buildings }));
  }, [buildings]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (buildings.length > 0) {
      if (!confirm('导入将覆盖当前所有数据，是否继续？')) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.buildings) {
          setBuildings(data.buildings);
          setSelectedBuilding(null);
          setSelectedFloor(null);
        } else {
          alert('JSON 文件格式错误：缺少 buildings 字段');
        }
      } catch {
        alert('JSON 解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateBuilding = () => {
    const name = prompt('Building name:');
    if (!name) return;
    const newBuilding: Building = {
      id: `b${Date.now()}`,
      name,
      info: '',
      floors: []
    };
    setBuildings([...buildings, newBuilding]);
    setSelectedBuilding(newBuilding);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    if (!confirm('确认删除此建筑及其所有楼层？')) return;
    setBuildings(buildings.filter(b => b.id !== buildingId));
    if (selectedBuilding?.id === buildingId) {
      setSelectedBuilding(null);
      setSelectedFloor(null);
    }
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setSelectedNodeId(null);
  };

  const handleSaveFloor = (floor: Partial<Floor>) => {
    if (!selectedBuilding) return;

    const existing = floor.id ? selectedBuilding.floors.find(f => f.id === floor.id) : null;

    const savedFloor: Floor = existing
      ? { ...existing, ...floor }
      : {
          id: `f${Date.now()}`,
          buildingId: selectedBuilding.id,
          name: floor.name || 'New Floor',
          order: floor.order ?? selectedBuilding.floors.length,
          geometry: floor.geometry || { width: 100, depth: 100, floorHeight: 3 },
          navigationMesh: [],
          brands: []
        };

    const updatedFloors = existing
      ? selectedBuilding.floors.map(f => f.id === savedFloor.id ? savedFloor : f)
      : [...selectedBuilding.floors, savedFloor];

    const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
    setSelectedBuilding(updatedBuilding);
    setBuildings(buildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    setSelectedFloor(savedFloor);
  };

  const handleDeleteFloor = (floorId: string) => {
    if (!selectedBuilding || !confirm('Delete this floor?')) return;
    const updatedBuilding = {
      ...selectedBuilding,
      floors: selectedBuilding.floors.filter(f => f.id !== floorId)
    };
    setSelectedBuilding(updatedBuilding);
    setBuildings(buildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    setSelectedFloor(null);
  };

  const handleUpdateNavNodes = (floorId: string, nodes: NavigationNode[]) => {
    if (!selectedBuilding) return;
    const updatedFloors = selectedBuilding.floors.map(f =>
      f.id === floorId ? { ...f, navigationMesh: nodes } : f
    );
    const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
    setSelectedBuilding(updatedBuilding);
    setBuildings(buildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    if (selectedFloor?.id === floorId) {
      setSelectedFloor({ ...selectedFloor, navigationMesh: nodes });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderBottom: '1px solid #ccc',
        background: '#f5f5f5',
        position: 'relative'
      }}>
        <h2 style={{ margin: 0 }}>Building Editor</h2>
        <div style={{ flex: 1 }} />

        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          导入 JSON
        </button>
        <button onClick={handleExport}>
          导出 JSON
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 280, borderRight: '1px solid #ccc', padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Buildings</h3>
            <button onClick={handleCreateBuilding}>+ New</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0' }}>
            {buildings.map(b => (
              <li key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <button
                  onClick={() => handleSelectBuilding(b)}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: selectedBuilding?.id === b.id ? '#007bff' : 'transparent',
                    color: selectedBuilding?.id === b.id ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  {b.name}
                </button>
                <button
                  onClick={() => handleDeleteBuilding(b.id)}
                  style={{
                    padding: '4px 8px', border: 'none', background: 'transparent',
                    color: '#dc3545', cursor: 'pointer', fontSize: 14
                  }}
                  title="删除建筑"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {selectedBuilding && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <h4 style={{ margin: 0 }}>Floors</h4>
                <button onClick={() => handleSaveFloor({})} style={{ fontSize: 12, padding: '4px 8px' }}>
                  + Add
                </button>
              </div>
              <FloorList
                floors={selectedBuilding.floors}
                selectedFloorId={selectedFloor?.id}
                onSelectFloor={setSelectedFloor}
                onDeleteFloor={handleDeleteFloor}
              />
            </>
          )}
        </div>

        {/* Right area - editor */}
        <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
          {selectedFloor ? (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setEditorTab('floor')}
                  style={{
                    padding: '8px 16px',
                    background: editorTab === 'floor' ? '#007bff' : '#e0e0e0',
                    color: editorTab === 'floor' ? 'white' : 'inherit',
                    border: 'none', borderRadius: 4, cursor: 'pointer'
                  }}
                >
                  Floor Editor
                </button>
                <button
                  onClick={() => setEditorTab('navpoint')}
                  style={{
                    padding: '8px 16px',
                    background: editorTab === 'navpoint' ? '#007bff' : '#e0e0e0',
                    color: editorTab === 'navpoint' ? 'white' : 'inherit',
                    border: 'none', borderRadius: 4, cursor: 'pointer'
                  }}
                >
                  Nav Point Editor
                </button>
              </div>

              {editorTab === 'floor' ? (
                <FloorEditor key={selectedFloor.id} floor={selectedFloor} onSave={handleSaveFloor} />
              ) : (
                <div style={{ display: 'flex', height: 'calc(100vh - 220px)' }}>
                  <div style={{ width: 200, borderRight: '1px solid #ccc', paddingRight: 16 }}>
                    <h4>Navigation Nodes</h4>
                    <NavPointList
                      nodes={selectedFloor.navigationMesh || []}
                      selectedId={selectedNodeId ?? undefined}
                      onSelect={setSelectedNodeId}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <NavPointEditor
                      floor={selectedFloor}
                      nodes={selectedFloor.navigationMesh || []}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={setSelectedNodeId}
                      onUpdateNodes={(nodes) => handleUpdateNavNodes(selectedFloor.id, nodes)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              <p>选择一个楼层进行编辑，或创建新建筑</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
