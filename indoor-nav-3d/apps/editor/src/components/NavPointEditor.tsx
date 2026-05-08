import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NavigationNode, Floor, Position3D } from '@indoor-nav/shared';
import type { ThreeEvent } from '@react-three/fiber';

interface Props {
  floor: Floor;
  nodes: NavigationNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodes: (nodes: NavigationNode[]) => void;
}

const NODE_TYPES: NavigationNode['type'][] = ['walkable', 'elevator', 'stair', 'entrance', 'exit'];

const nodeColors: Record<string, string> = {
  walkable: '#3b82f6',
  elevator: '#f59e0b',
  stair: '#8b5cf6',
  entrance: '#22c55e',
  exit: '#ef4444'
};

const AUTO_CONNECT_MAX_DIST = 28;

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${Date.now()}-${++nodeIdCounter}`;
}

function dist2D(a: Position3D, b: Position3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

function isValidNodeType(value: string): value is NavigationNode['type'] {
  return NODE_TYPES.includes(value as NavigationNode['type']);
}

function NavPointMesh({ node, selected, source, onClick }: { node: NavigationNode; selected: boolean; source: boolean; onClick: () => void }) {
  return (
    <mesh position={[node.position.x, node.position.y, node.position.z]} onClick={onClick}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color={source ? '#00ff00' : (selected ? '#ff00ff' : nodeColors[node.type] || '#007bff')}
      />
    </mesh>
  );
}

function NavPointConnections({ nodes }: { nodes: NavigationNode[] }) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const lines: JSX.Element[] = [];

  nodes.forEach(node => {
    node.connections.forEach(connId => {
      const target = nodeMap.get(connId);
      if (target) {
        lines.push(
          <line key={`${node.id}-${connId}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  node.position.x, node.position.y, node.position.z,
                  target.position.x, target.position.y, target.position.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#666" />
          </line>
        );
      }
    });
  });

  return <group>{lines}</group>;
}

export default function NavPointEditor({ floor, nodes, selectedNodeId, onSelectNode, onUpdateNodes }: Props) {
  const [selectedType, setSelectedType] = useState<NavigationNode['type']>('walkable');
  const [connectMode, setConnectMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (connectMode) {
      if (!sourceNodeId) {
        setSourceNodeId(nodeId);
      } else if (sourceNodeId !== nodeId) {
        onUpdateNodes(nodes.map(n => {
          if (n.id === sourceNodeId && !n.connections.includes(nodeId)) {
            return { ...n, connections: [...n.connections, nodeId] };
          }
          if (n.id === nodeId && !n.connections.includes(sourceNodeId)) {
            return { ...n, connections: [...n.connections, sourceNodeId] };
          }
          return n;
        }));
        setSourceNodeId(null);
      }
    } else {
      onSelectNode(nodeId);
    }
  };

  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    if (connectMode) return;
    if (e.point) {
      const newNode: NavigationNode = {
        id: generateNodeId(),
        floorId: floor.id,
        position: { x: e.point.x, y: e.point.y, z: e.point.z },
        type: selectedType,
        connections: []
      };
      onUpdateNodes([...nodes, newNode]);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    const filtered = nodes.filter(n => n.id !== selectedNodeId);
    const cleaned = filtered.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== selectedNodeId)
    }));
    onUpdateNodes(cleaned);
    onSelectNode(null);
  };

  const handleTypeChange = (type: NavigationNode['type']) => {
    if (!selectedNodeId) return;
    onUpdateNodes(nodes.map(n =>
      n.id === selectedNodeId ? { ...n, type } : n
    ));
  };

  const handleAutoConnect = () => {
    if (!confirm(`自动连接距离 ${AUTO_CONNECT_MAX_DIST} 以内的节点对？`)) return;
    const updated = nodes.map(n => ({ ...n, connections: [...n.connections] }));
    for (let i = 0; i < updated.length; i++) {
      for (let j = i + 1; j < updated.length; j++) {
        const d = dist2D(updated[i].position, updated[j].position);
        if (d <= AUTO_CONNECT_MAX_DIST) {
          if (!updated[i].connections.includes(updated[j].id)) updated[i].connections.push(updated[j].id);
          if (!updated[j].connections.includes(updated[i].id)) updated[j].connections.push(updated[i].id);
        }
      }
    }
    onUpdateNodes(updated);
  };

  const handleDisconnectAll = () => {
    if (!confirm('断开所有连接？')) return;
    onUpdateNodes(nodes.map(n => ({ ...n, connections: [] })));
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleCanvasClick}>
            <planeGeometry args={[floor.geometry?.width || 100, floor.geometry?.depth || 100]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          {nodes.map(node => (
            <NavPointMesh
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              source={sourceNodeId === node.id}
              onClick={() => handleNodeClick(node.id)}
            />
          ))}
          <NavPointConnections nodes={nodes} />
          <OrbitControls />
        </Canvas>
      </div>

      <div style={{ width: 250, padding: 16, borderLeft: '1px solid #ccc', overflow: 'auto' }}>
        <h3>Navigation Points</h3>
        <p>{nodes.length} nodes on this floor</p>

        <div style={{ marginTop: 16 }}>
          <h4>Add Node Type</h4>
          <select
            value={selectedType}
            onChange={e => { if (isValidNodeType(e.target.value)) setSelectedType(e.target.value); }}
            style={{ width: '100%', padding: 8 }}
          >
            {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Click on the floor to add a node
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Connect Nodes</h4>
          <button
            onClick={() => { setConnectMode(!connectMode); setSourceNodeId(null); }}
            style={{
              width: '100%', padding: 8,
              background: connectMode ? '#28a745' : '#007bff',
              color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'
            }}
          >
            {connectMode ? 'Exit Connect Mode' : 'Connect Mode'}
          </button>
          {connectMode && (
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {sourceNodeId ? 'Click target node to connect' : 'Click first node'}
            </p>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Batch Operations</h4>
          <button
            onClick={handleAutoConnect}
            style={{ width: '100%', padding: 8, marginBottom: 4, background: '#17a2b8', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Auto Connect Nearby
          </button>
          <button
            onClick={handleDisconnectAll}
            style={{ width: '100%', padding: 8, background: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Disconnect All
          </button>
        </div>

        {selectedNodeId && (() => {
          const selectedNode = nodes.find(n => n.id === selectedNodeId);
          if (!selectedNode) return null;
          return (
            <div style={{ marginTop: 16 }}>
              <h4>Selected Node</h4>
              <button onClick={handleDeleteSelected}
                style={{ width: '100%', padding: 8, background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Delete Node
              </button>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Node Type</label>
                <select
                  value={selectedNode.type}
                  onChange={e => { if (isValidNodeType(e.target.value)) handleTypeChange(e.target.value); }}
                  style={{ width: '100%', padding: 8 }}
                >
                  {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {selectedNode.connections.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Connections ({selectedNode.connections.length})</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedNode.connections.map(connId => {
                      const connNode = nodes.find(n => n.id === connId);
                      return (
                        <div key={connId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12 }}>{connNode?.type || '?'} #{connId.slice(-4)}</span>
                          <button
                            onClick={() => {
                              onUpdateNodes(nodes.map(n => {
                                if (n.id === selectedNodeId) return { ...n, connections: n.connections.filter(c => c !== connId) };
                                if (n.id === connId) return { ...n, connections: n.connections.filter(c => c !== selectedNodeId) };
                                return n;
                              }));
                            }}
                            style={{ padding: '2px 6px', fontSize: 10, background: '#dc3545', color: 'white', border: 'none', borderRadius: 2, cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ marginTop: 16 }}>
          <h4>Legend</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 12 }}>
            {NODE_TYPES.map(t => (
              <li key={t}><span style={{ color: nodeColors[t] || '#007bff' }}>●</span> {t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
