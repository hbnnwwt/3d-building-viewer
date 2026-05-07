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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBuildings(data.buildings || []);
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage whenever buildings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ buildings }));
  }, [buildings]);

  const handleExport = (type: 'data' | 'download') => {
    setExportMenuOpen(false);
    const data = { buildings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (type === 'download') {
      a.download = 'buildings.json';
    } else {
      a.download = 'buildings.json';
      alert('请将 buildings.json 放置到 viewer 的 public/data/ 目录中');
    }
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.buildings) {
          setBuildings(data.buildings);
          setSelectedBuilding(null);
          setSelectedFloor(null);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    // Reset input
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

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
  };

  const handleSaveFloor = (floor: Partial<Floor>) => {
    if (!selectedBuilding) return;
    const newFloor: Floor = {
      id: `f${Date.now()}`,
      buildingId: selectedBuilding.id,
      name: floor.name || 'New Floor',
      order: floor.order ?? selectedBuilding.floors.length,
      geometry: floor.geometry || { width: 100, depth: 100, floorHeight: 3 },
      navigationMesh: [],
      brands: []
    };
    const updatedBuilding = {
      ...selectedBuilding,
      floors: [...selectedBuilding.floors, newFloor]
    };
    setSelectedBuilding(updatedBuilding);
    setBuildings(buildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    setSelectedFloor(newFloor);
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
        background: '#f5f5f5'
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
        <button onClick={() => setExportMenuOpen(!exportMenuOpen)} style={{ position: 'relative' }}>
          导出 JSON ▾
        </button>
        {exportMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            <button
              onClick={() => handleExport('data')}
              style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              导出到 data 文件夹
            </button>
            <button
              onClick={() => handleExport('download')}
              style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              下载到本地
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar - building/floor list */}
        <div style={{ width: 280, borderRight: '1px solid #ccc', padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Buildings</h3>
            <button onClick={handleCreateBuilding}>+ New</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0' }}>
            {buildings.map(b => (
              <li key={b.id}>
                <button
                  onClick={() => handleSelectBuilding(b)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: selectedBuilding?.id === b.id ? '#007bff' : 'transparent',
                    color: selectedBuilding?.id === b.id ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    marginBottom: 4
                  }}
                >
                  {b.name}
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
              {/* Tab buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setEditorTab('floor')}
                  style={{
                    padding: '8px 16px',
                    background: editorTab === 'floor' ? '#007bff' : '#e0e0e0',
                    color: editorTab === 'floor' ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
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
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Nav Point Editor
                </button>
              </div>

              {editorTab === 'floor' ? (
                <FloorEditor floor={selectedFloor} onSave={handleSaveFloor} />
              ) : (
                <div style={{ display: 'flex', height: 'calc(100vh - 220px)' }}>
                  {/* Left: NavPointList */}
                  <div style={{ width: 200, borderRight: '1px solid #ccc', paddingRight: 16 }}>
                    <h4>Navigation Nodes</h4>
                    <NavPointList
                      nodes={selectedFloor.navigationMesh || []}
                      onSelect={(id) => console.log('Selected node:', id)}
                    />
                  </div>
                  {/* Right: NavPointEditor 3D view */}
                  <div style={{ flex: 1 }}>
                    <NavPointEditor
                      floor={selectedFloor}
                      nodes={selectedFloor.navigationMesh || []}
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