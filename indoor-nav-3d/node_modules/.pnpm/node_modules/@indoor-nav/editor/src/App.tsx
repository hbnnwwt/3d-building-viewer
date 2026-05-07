import { useState, useEffect } from 'react';
import { Building, Floor, NavigationNode } from '@indoor-nav/shared';
import FloorList from './components/FloorList';
import FloorEditor from './components/FloorEditor';
import NavPointEditor from './components/NavPointEditor';
import NavPointList from './components/NavPointList';

type EditorTab = 'floor' | 'navpoint';

export default function App() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>('floor');

  useEffect(() => {
    fetch('/api/buildings')
      .then(r => r.json())
      .then(setBuildings);
  }, []);

  const handleCreateBuilding = async () => {
    const name = prompt('Building name:');
    if (!name) return;
    const res = await fetch('/api/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const newBuilding = await res.json();
    setBuildings([...buildings, newBuilding]);
  };

  const handleSelectBuilding = async (id: string) => {
    const res = await fetch(`/api/buildings/${id}`);
    const building = await res.json();
    setSelectedBuilding(building);
    setSelectedFloor(null);
  };

  const handleSaveFloor = async (floor: Partial<Floor>) => {
    if (!selectedBuilding) return;
    const res = await fetch(`/api/buildings/${selectedBuilding.id}/floors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(floor)
    });
    const newFloor = await res.json();
    setSelectedBuilding({
      ...selectedBuilding,
      floors: [...selectedBuilding.floors, newFloor]
    });
    setSelectedFloor(newFloor);
  };

  const handleDeleteFloor = async (floorId: string) => {
    if (!confirm('Delete this floor?')) return;
    await fetch(`/api/buildings/${selectedBuilding!.id}/floors/${floorId}`, {
      method: 'DELETE'
    });
    setSelectedBuilding({
      ...selectedBuilding!,
      floors: selectedBuilding!.floors.filter(f => f.id !== floorId)
    });
    setSelectedFloor(null);
  };

  const handleUpdateNavNodes = (floorId: string, nodes: NavigationNode[]) => {
    if (!selectedBuilding) return;
    const updatedFloors = selectedBuilding.floors.map(f =>
      f.id === floorId ? { ...f, navigationMesh: nodes } : f
    );
    setSelectedBuilding({ ...selectedBuilding, floors: updatedFloors });
    // Also update selectedFloor if it matches
    if (selectedFloor?.id === floorId) {
      setSelectedFloor({ ...selectedFloor, navigationMesh: nodes });
    }
    // TODO: Persist to server
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left sidebar - building/floor list */}
      <div style={{ width: 300, borderRight: '1px solid #ccc', padding: 16 }}>
        <h2>Buildings</h2>
        <button onClick={handleCreateBuilding}>+ New Building</button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {buildings.map(b => (
            <li key={b.id}>
              <button
                onClick={() => handleSelectBuilding(b.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 8,
                  background: selectedBuilding?.id === b.id ? '#007bff' : 'transparent',
                  color: selectedBuilding?.id === b.id ? 'white' : 'inherit'
                }}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>

        {selectedBuilding && (
          <>
            <h3>Floors</h3>
            <FloorList
              floors={selectedBuilding.floors}
              selectedFloorId={selectedFloor?.id}
              onSelectFloor={setSelectedFloor}
              onDeleteFloor={handleDeleteFloor}
            />
            <button onClick={() => handleSaveFloor({ name: 'New Floor', order: selectedBuilding.floors.length } as Partial<Floor>)}>
              + Add Floor
            </button>
          </>
        )}
      </div>

      {/* Right area - floor editor */}
      <div style={{ flex: 1, padding: 16 }}>
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
              <div style={{ display: 'flex', height: 'calc(100vh - 150px)' }}>
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
          <p>Select a floor to edit</p>
        )}
      </div>
    </div>
  );
}
