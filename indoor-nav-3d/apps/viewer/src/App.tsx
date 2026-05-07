import { useState } from 'react';
import BuildingCanvas from './components/Canvas/BuildingCanvas';
import NavigationPanel from './components/UI/NavigationPanel';
import MonitorPanel from './components/UI/MonitorPanel';
import { useBuildings } from './hooks/useBuilding';
import { Building, NavigationStep, NavigationGraph, findPath } from '@indoor-nav/shared';

export default function App() {
  const { buildings, loading } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showMonitorPanel, setShowMonitorPanel] = useState(false);
  const [navigationPath, setNavigationPath] = useState<NavigationStep[]>([]);
  const [showPath, setShowPath] = useState(false);

  const handleNavigate = (fromFloorId: string, toFloorId: string) => {
    if (!selectedBuilding) return;

    // Build navigation graph from building floors
    const allNodes = selectedBuilding.floors.flatMap(f => f.navigationMesh || []);
    const edges: { from: string; to: string; weight: number }[] = [];

    for (const node of allNodes) {
      for (const connId of node.connections) {
        edges.push({ from: node.id, to: connId, weight: 1 });
      }
    }

    const navigationGraph: NavigationGraph = {
      buildingId: selectedBuilding.id,
      nodes: allNodes,
      edges: edges.map(e => ({ from: e.from, to: e.to, weight: e.weight }))
    };

    // Find first walkable node on each floor
    const fromFloor = selectedBuilding.floors.find(f => f.id === fromFloorId);
    const toFloor = selectedBuilding.floors.find(f => f.id === toFloorId);
    if (!fromFloor || !toFloor) return;

    const fromNode = fromFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'entrance');
    const toNode = toFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'exit');
    if (!fromNode || !toNode) return;

    const path = findPath(navigationGraph, fromNode.id, toNode.id);
    setNavigationPath(path);
    setShowPath(true);
  };

  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Building selector */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 100,
        background: 'white', borderRadius: 8, padding: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>选择建筑</h3>
        <select
          value={selectedBuilding?.id || ''}
          onChange={e => {
            const b = buildings.find(b => b.id === e.target.value);
            setSelectedBuilding(b || null);
            setShowPath(false);
          }}
          style={{ padding: 8, minWidth: 150 }}
        >
          <option value="">-- 请选择 --</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <BuildingCanvas building={selectedBuilding} navigationPath={navigationPath} showPath={showPath} />

      <div style={{
        position: 'absolute', top: 16, right: 16,
        display: 'flex', gap: 8
      }}>
        <button onClick={() => setShowNavPanel(!showNavPanel)} disabled={!selectedBuilding}>
          导航
        </button>
        <button onClick={() => setShowMonitorPanel(!showMonitorPanel)} disabled={!selectedBuilding}>
          监测
        </button>
      </div>

      {showNavPanel && selectedBuilding && (
        <NavigationPanel
          building={selectedBuilding}
          onClose={() => setShowNavPanel(false)}
          onNavigate={handleNavigate}
        />
      )}

      {showMonitorPanel && selectedBuilding && (
        <MonitorPanel
          monitors={selectedBuilding.monitors || []}
          onClose={() => setShowMonitorPanel(false)}
        />
      )}
    </div>
  );
}