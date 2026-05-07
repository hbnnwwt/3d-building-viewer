import { useState, useCallback } from 'react';
import BuildingCanvas from './components/Canvas/BuildingCanvas';
import NavigationPanel from './components/UI/NavigationPanel';
import MonitorPanel from './components/UI/MonitorPanel';
import { Building, NavigationStep, NavigationGraph, findPath } from '@indoor-nav/shared';

export default function App() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showMonitorPanel, setShowMonitorPanel] = useState(false);
  const [navigationPath, setNavigationPath] = useState<NavigationStep[]>([]);
  const [showPath, setShowPath] = useState(false);

  const handleNavigate = useCallback((fromFloorId: string, toFloorId: string) => {
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
  }, [selectedBuilding]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <BuildingCanvas building={selectedBuilding} navigationPath={navigationPath} showPath={showPath} />

      <div style={{
        position: 'absolute', top: 16, left: 16,
        display: 'flex', gap: 8
      }}>
        <button onClick={() => setShowNavPanel(!showNavPanel)}>
          导航
        </button>
        <button onClick={() => setShowMonitorPanel(!showMonitorPanel)}>
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
          buildingId={selectedBuilding.id}
          onClose={() => setShowMonitorPanel(false)}
        />
      )}
    </div>
  );
}