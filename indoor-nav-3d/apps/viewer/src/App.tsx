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

    const fromNodeInFloor = fromFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'entrance');
    const toNodeInFloor = toFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'exit');
    if (!fromNodeInFloor || !toNodeInFloor) return;

    const result = findPath(navigationGraph, fromNodeInFloor.id, toNodeInFloor.id);
    setNavigationPath(result);
    setShowPath(true);
    setShowNavPanel(false);
  };

  const resetNavMode = () => {
    setNavMode(false);
    setFromNode(null);
    setToNode(null);
    setPath([]);
  };

  const handleNodeClick = (node: NavigationNode) => {
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
  };

  if (loading) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-3d)', color: 'white', gap: 'var(--spacing-md)'
      }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
        <span style={{ fontSize: 16 }}>加载建筑数据...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--color-bg-3d)' }}>
      <a href="#main-content" className="skip-link">跳转到主要内容</a>

      {/* 3D Canvas - full screen */}
      <BuildingCanvas
        building={selectedBuilding}
        navigationPath={navMode ? path : navigationPath}
        showPath={navMode ? path.length > 0 : showPath}
        onNodeClick={navMode ? handleNodeClick : undefined}
        selectedNodeId={navMode ? (fromNode && toNode ? toNode.id : fromNode ? fromNode.id : null) : null}
      />

      {/* Building selector - floating top left */}
      <div
        id="main-content"
        className="building-selector"
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 100,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: 200,
          maxWidth: 280
        }}
      >
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
          选择建筑
        </label>
        <select
          value={selectedBuilding?.id || ''}
          onChange={e => {
            const b = buildings.find(b => b.id === e.target.value);
            setSelectedBuilding(b || null);
            setShowPath(false);
            resetNavMode();
          }}
          style={{
            width: '100%', padding: '10px 12px',
            fontSize: 15, border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface-elevated)',
            cursor: 'pointer'
          }}
          aria-label="选择建筑"
        >
          <option value="">-- 请选择建筑 --</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Bottom navigation bar - floating bottom */}
      {selectedBuilding && (
        <nav className="nav-bottom-bar" style={{
          position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 100,
          display: 'flex', gap: 8, justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowNavPanel(!showNavPanel)}
            aria-label="打开导航面板"
            aria-pressed={showNavPanel}
            style={{
              flex: 1, maxWidth: 120, padding: '14px 20px',
              background: showNavPanel ? 'var(--color-primary-dark)' : 'var(--color-surface)',
              color: showNavPanel ? 'white' : 'var(--color-text)',
              border: 'none', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)'
            }}
          >
            🧭 导航
          </button>
          <button
            onClick={() => setShowMonitorPanel(!showMonitorPanel)}
            aria-label="打开监测面板"
            aria-pressed={showMonitorPanel}
            style={{
              flex: 1, maxWidth: 120, padding: '14px 20px',
              background: showMonitorPanel ? 'var(--color-primary-dark)' : 'var(--color-surface)',
              color: showMonitorPanel ? 'white' : 'var(--color-text)',
              border: 'none', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)'
            }}
          >
            📊 监测
          </button>
          <button
            onClick={() => { setNavMode(!navMode); resetNavMode(); }}
            aria-label={navMode ? '退出导航模式' : '进入导航模式'}
            aria-pressed={navMode}
            style={{
              flex: 1, maxWidth: 120, padding: '14px 20px',
              background: navMode ? 'var(--color-success)' : 'var(--color-surface)',
              color: navMode ? 'white' : 'var(--color-text)',
              border: 'none', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--transition-fast)'
            }}
          >
            {navMode ? '✓ 完成导航' : '🖱 点击导航'}
          </button>
        </nav>
      )}

      {/* Navigation hint when in nav mode */}
      {navMode && (
        <div className="nav-hint" style={{
          position: 'absolute', top: 80, left: 16, zIndex: 100,
          background: 'var(--color-surface)',
          padding: '10px 16px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            background: fromNode ? 'var(--color-success)' : 'var(--color-border)',
            color: 'white', fontSize: 12
          }}>1</span>
          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            background: toNode ? 'var(--color-success)' : 'var(--color-border)',
            color: 'white', fontSize: 12
          }}>2</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
            {fromNode ? `已选: ${fromNode.type}` : '点击选择起点'} {toNode ? `→ ${toNode.type}` : ' → 点击选择终点'}
          </span>
        </div>
      )}

      {/* Panels */}
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

      {/* No building selected hint */}
      {!selectedBuilding && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-surface)', padding: '12px 24px', borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)', fontSize: 14, color: 'var(--color-text-muted)'
        }}>
          👆 从上方选择建筑开始导航
        </div>
      )}
    </div>
  );
}