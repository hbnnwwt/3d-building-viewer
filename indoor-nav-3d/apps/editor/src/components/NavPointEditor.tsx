import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NavigationNode, Floor } from '@indoor-nav/shared';

interface Props {
  floor: Floor;
  nodes: NavigationNode[];
  onUpdateNodes: (nodes: NavigationNode[]) => void;
}

const nodeColors: Record<string, string> = {
  walkable: '#007bff',
  elevator: '#ff6b6b',
  stair: '#ffc107',
  entrance: '#28a745',
  exit: '#dc3545'
};

function NavPointMesh({ node, selected, source, onClick }: { node: NavigationNode; selected: boolean; source: boolean; onClick: () => void }) {
  return (
    <mesh
      position={[node.position.x, node.position.y, node.position.z]}
      onClick={onClick}
    >
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

export default function NavPointEditor({ floor, nodes, onUpdateNodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<NavigationNode['type']>('walkable');
  const [connectMode, setConnectMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (connectMode) {
      if (!sourceNodeId) {
        setSourceNodeId(nodeId);
      } else if (sourceNodeId !== nodeId) {
        // Add connection from source to target (bidirectional)
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
        setConnectMode(false);
      }
    } else {
      setSelectedId(nodeId);
    }
  };

  const handleCanvasClick = (e: any) => {
    if (connectMode) return; // Don't add nodes in connect mode
    // Add new node at click position
    if (e.point) {
      const newNode: NavigationNode = {
        id: `node-${Date.now()}`,
        floorId: floor.id,
        position: { x: e.point.x, y: e.point.y, z: e.point.z },
        type: selectedType,
        connections: []
      };
      onUpdateNodes([...nodes, newNode]);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const filtered = nodes.filter(n => n.id !== selectedId);
    // Also remove connections to this node
    const cleaned = filtered.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== selectedId)
    }));
    onUpdateNodes(cleaned);
    setSelectedId(null);
  };

  const handleTypeChange = (type: NavigationNode['type']) => {
    if (!selectedId) return;
    onUpdateNodes(nodes.map(n =>
      n.id === selectedId ? { ...n, type } : n
    ));
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          {/* Floor plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleCanvasClick}>
            <planeGeometry args={[floor.geometry?.width || 100, floor.geometry?.depth || 100]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>

          {/* Navigation nodes */}
          {nodes.map(node => (
            <NavPointMesh
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              source={sourceNodeId === node.id}
              onClick={() => handleNodeClick(node.id)}
            />
          ))}

          {/* Connection lines */}
          <NavPointConnections nodes={nodes} />

          <OrbitControls />
        </Canvas>
      </div>

      {/* Right sidebar - controls */}
      <div style={{ width: 250, padding: 16, borderLeft: '1px solid #ccc' }}>
        <h3>Navigation Points</h3>
        <p>{nodes.length} nodes on this floor</p>

        <div style={{ marginTop: 16 }}>
          <h4>Add Node Type</h4>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as NavigationNode['type'])}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="walkable">Walkable</option>
            <option value="elevator">Elevator</option>
            <option value="stair">Stair</option>
            <option value="entrance">Entrance</option>
            <option value="exit">Exit</option>
          </select>
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Click on the floor to add a node
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h4>Connect Nodes</h4>
          <button
            onClick={() => {
              setConnectMode(!connectMode);
              setSourceNodeId(null);
              setSelectedId(null);
            }}
            style={{
              width: '100%', padding: 8,
              background: connectMode ? '#28a745' : '#007bff',
              color: 'white'
            }}
          >
            {connectMode ? 'Cancel Connect' : 'Connect Mode'}
          </button>
          {connectMode && (
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {sourceNodeId ? 'Click target node to connect' : 'Click first node'}
            </p>
          )}
        </div>

        {selectedId && (
          <div style={{ marginTop: 16 }}>
            <h4>Selected Node</h4>
            <button
              onClick={handleDeleteSelected}
              style={{ width: '100%', padding: 8, background: 'red', color: 'white' }}
            >
              Delete Node
            </button>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Node Type</label>
              <select
                value={nodes.find(n => n.id === selectedId)?.type}
                onChange={e => handleTypeChange(e.target.value as NavigationNode['type'])}
                style={{ width: '100%', padding: 8 }}
              >
                <option value="walkable">Walkable</option>
                <option value="elevator">Elevator</option>
                <option value="stair">Stair</option>
                <option value="entrance">Entrance</option>
                <option value="exit">Exit</option>
              </select>
            </div>

            {(() => {
              const selectedNode = nodes.find(n => n.id === selectedId);
              if (!selectedNode || selectedNode.connections.length === 0) return null;
              return (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Connections</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedNode.connections.map(connId => {
                      const connNode = nodes.find(n => n.id === connId);
                      return (
                        <div key={connId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12 }}>{connNode?.type || '?'} #{connId.slice(-4)}</span>
                          <button
                            onClick={() => {
                              onUpdateNodes(nodes.map(n => {
                                if (n.id === selectedId) {
                                  return { ...n, connections: n.connections.filter(c => c !== connId) };
                                }
                                if (n.id === connId) {
                                  return { ...n, connections: n.connections.filter(c => c !== selectedId) };
                                }
                                return n;
                              }));
                            }}
                            style={{ padding: '2px 6px', fontSize: 10, background: '#dc3545', color: 'white' }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <h4>Legend</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 12 }}>
            <li><span style={{ color: '#007bff' }}>●</span> Walkable</li>
            <li><span style={{ color: '#ff6b6b' }}>●</span> Elevator</li>
            <li><span style={{ color: '#ffc107' }}>●</span> Stair</li>
            <li><span style={{ color: '#28a745' }}>●</span> Entrance</li>
            <li><span style={{ color: '#dc3545' }}>●</span> Exit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
