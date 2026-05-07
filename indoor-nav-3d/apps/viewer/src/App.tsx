import { useState } from 'react';
import BuildingCanvas from './components/Canvas/BuildingCanvas';
import NavigationPanel from './components/UI/NavigationPanel';
import MonitorPanel from './components/UI/MonitorPanel';
import { useBuildings } from './hooks/useBuilding';
import { Building, NavigationStep, NavigationGraph, NavigationNode, findPath } from '@indoor-nav/shared';

export default function App() {
  const { buildings, loading, source } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showMonitorPanel, setShowMonitorPanel] = useState(false);
  const [navigationPath, setNavigationPath] = useState<NavigationStep[]>([]);
  const [showPath, setShowPath] = useState(false);
  const [navMode, setNavMode] = useState(false);
  const [fromNode, setFromNode] = useState<NavigationNode | null>(null);
  const [toNode, setToNode] = useState<NavigationNode | null>(null);
  const [path, setPath] = useState<NavigationStep[]>([]);

  const handleNavigate = (fromFloorId: string, toFloorId: string) => {
    if (!selectedBuilding) return;

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
      <div
        id="main-content"
        className="building-selector"
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 100,
          background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 12,
          boxShadow: 'var(--shadow-panel)'
        }}
      >
        <h3 style={{ margin: '0 0 8px 0' }}>选择建筑</h3>
        <select
          value={selectedBuilding?.id || ''}
          onChange={e => {
            const b = buildings.find(b => b.id === e.target.value);
            setSelectedBuilding(b || null);
            setShowPath(false);
          }}
          style={{ padding: 10, minWidth: 200 }}
          aria-label="选择建筑"
        >
          <option value="">-- 请选择 --</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <BuildingCanvas
        building={selectedBuilding}
        navigationPath={navMode ? path : navigationPath}
        showPath={navMode ? path.length > 0 : showPath}
        onNodeClick={navMode ? (node: NavigationNode) => {
          if (!fromNode) {
            setFromNode(node);
          } else if (!toNode && node.id !== fromNode.id) {
            setToNode(node);
            const allNodes = selectedBuilding!.floors.flatMap(f => f.navigationMesh || []);
            const edges: { from: string; to: string; weight: number }[] = [];
            for (const n of allNodes) {
              for (const connId of n.connections) {
                edges.push({ from: n.id, to: connId, weight: 1 });
              }
            }
            const navGraph = { buildingId: selectedBuilding!.id, nodes: allNodes, edges };
            const result = findPath(navGraph, fromNode.id, node.id);
            setPath(result);
          }
        } : undefined}
        selectedNodeId={navMode ? (fromNode && toNode ? toNode.id : fromNode ? fromNode.id : null) : null}
      />

      <div className="nav-buttons" style={{
        position: 'absolute', top: 80, left: 16, zIndex: 100,
        display: 'flex', gap: 8
      }}>
        <button
          onClick={() => setShowNavPanel(!showNavPanel)}
          disabled={!selectedBuilding}
          aria-label="打开导航面板"
          style={{ padding: '12px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
        >
          导航
        </button>
        <button
          onClick={() => setShowMonitorPanel(!showMonitorPanel)}
          disabled={!selectedBuilding}
          aria-label="打开监测面板"
          style={{ padding: '12px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
        >
          监测
        </button>
        <button
          onClick={() => { setNavMode(!navMode); setFromNode(null); setToNode(null); setPath([]); }}
          disabled={!selectedBuilding}
          aria-label={navMode ? '退出导航模式' : '进入导航模式'}
          aria-pressed={navMode}
          style={{ padding: '12px 20px', background: navMode ? 'var(--color-success)' : 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
        >
          {navMode ? '退出导航' : '导航模式'}
        </button>
      </div>
      {navMode && (
        <div className="nav-hint" style={{
          position: 'absolute', top: 140, left: 16, zIndex: 100,
          background: 'white', padding: '8px 12px', borderRadius: 4, fontSize: 12,
          boxShadow: 'var(--shadow-panel)'
        }}>
          {fromNode ? `起点: ${fromNode.id}` : '点击选择起点'} → {toNode ? `终点: ${toNode.id}` : '点击选择终点'}
        </div>
      )}

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