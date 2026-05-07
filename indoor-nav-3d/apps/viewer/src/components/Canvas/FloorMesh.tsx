import { Floor, NavigationNode } from '@indoor-nav/shared';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  floor: Floor;
  yOffset: number;
  onNodeClick?: (node: NavigationNode) => void;
  selectedNodeId?: string | null;
}

const NODE_COLORS: Record<string, string> = {
  walkable: 'var(--color-node-walkable)',
  entrance: 'var(--color-node-entrance)',
  exit: 'var(--color-node-exit)',
  elevator: 'var(--color-node-elevator)',
  stair: 'var(--color-node-stair)',
};

export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }: Props) {
  const { width, depth } = floor.geometry || { width: 100, depth: 100 };

  const floorGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, 0.2, depth);
  }, [width, depth]);

  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={floorGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="var(--color-border)" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[floorGeometry]} />
        <lineBasicMaterial color="var(--color-text-muted)" />
      </lineSegments>
      {floor.brands?.map(brand => (
        <mesh
          key={brand.id}
          position={[brand.position.x, brand.position.y + 1, brand.position.z]}
        >
          <boxGeometry args={[brand.size.width, brand.size.height, brand.size.depth]} />
          <meshStandardMaterial color="var(--color-primary)" />
        </mesh>
      ))}
      {/* Navigation nodes */}
      {floor.navigationMesh?.map(node => (
        <mesh
          key={node.id}
          position={[node.position.x, node.position.y, node.position.z]}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick?.(node);
          }}
        >
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color={selectedNodeId === node.id ? 'var(--color-node-exit)' : (NODE_COLORS[node.type] || 'var(--color-text-muted)')}
          />
        </mesh>
      ))}
    </group>
  );
}