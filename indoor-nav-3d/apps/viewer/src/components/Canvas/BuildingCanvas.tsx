import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building, NavigationStep, NavigationNode, findPath } from '@indoor-nav/shared';
import FloorMesh from './FloorMesh';
import NavigationPath from '../Navigation/NavigationPath';

interface Props {
  building: Building | null;
  navigationPath?: NavigationStep[];
  showPath?: boolean;
}

export default function BuildingCanvas({ building, navigationPath, showPath }: Props) {
  const [navMode, setNavMode] = useState(false);
  const [fromNode, setFromNode] = useState<NavigationNode | null>(null);
  const [toNode, setToNode] = useState<NavigationNode | null>(null);
  const [path, setPath] = useState<NavigationStep[]>([]);

  const handleNodeClick = (node: NavigationNode) => {
    if (!navMode || !building) return;

    if (!fromNode) {
      setFromNode(node);
    } else if (!toNode && node.id !== fromNode.id) {
      setToNode(node);
      // Calculate path
      const allNodes = building.floors.flatMap(f => f.navigationMesh || []);
      const edges: { from: string; to: string; weight: number }[] = [];
      for (const n of allNodes) {
        for (const connId of n.connections) {
          edges.push({ from: n.id, to: connId, weight: 1 });
        }
      }
      const navGraph = { buildingId: building.id, nodes: allNodes, edges };
      const result = findPath(navGraph, fromNode.id, node.id);
      setPath(result);
    }
  };

  const resetNav = () => {
    setFromNode(null);
    setToNode(null);
    setPath([]);
  };

  const getSelectedNodeId = () => {
    if (fromNode && toNode) return toNode.id;
    if (fromNode) return fromNode.id;
    return null;
  };

  if (!building) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        请选择一个建筑
      </div>
    );
  }

  const displayPath = navMode ? path : (navigationPath || []);
  const pathVisible = navMode ? path.length > 0 : (showPath || false);

  return (
    <>
      {/* Navigation mode toggle */}
      <div className="nav-mode-toggle" style={{
        position: 'absolute', top: 80, left: 16, zIndex: 100,
        display: 'flex', gap: 8
      }}>
        <button
          onClick={() => { setNavMode(!navMode); resetNav(); }}
          aria-label={navMode ? '退出导航模式' : '进入导航模式'}
          aria-pressed={navMode}
          style={{
            padding: '12px 20px',
            background: navMode ? 'var(--color-success)' : 'var(--color-secondary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          {navMode ? '退出导航' : '导航模式'}
        </button>
        {navMode && (
          <div style={{ background: 'white', padding: '8px 12px', borderRadius: 4, fontSize: 12 }}>
            {fromNode ? `起点: ${fromNode.id}` : '点击选择起点'} → {toNode ? `终点: ${toNode.id}` : '点击选择终点'}
          </div>
        )}
      </div>

      <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {building.floors.map((floor, i) => (
          <FloorMesh
            key={floor.id}
            floor={floor}
            yOffset={i * (floor.geometry?.floorHeight || 3)}
            onNodeClick={navMode ? handleNodeClick : undefined}
            selectedNodeId={navMode ? getSelectedNodeId() : null}
          />
        ))}
        <NavigationPath path={displayPath} visible={pathVisible} />
        <OrbitControls enableDamping />
      </Canvas>
    </>
  );
}