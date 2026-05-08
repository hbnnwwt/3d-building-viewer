import { Floor, NavigationNode } from '@indoor-nav/shared';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  floor: Floor;
  yOffset: number;
  onNodeClick?: (node: NavigationNode) => void;
  selectedNodeId?: string | null;
}

const NODE_COLORS: Record<string, number> = {
  walkable: 0x3b82f6,
  entrance: 0x22c55e,
  exit: 0xef4444,
  elevator: 0xf59e0b,
  stair: 0x8b5cf6,
};

const FLOOR_COLOR = 0xe5e7eb;
const EDGE_COLOR = 0x6b7280;
const BRAND_COLOR = 0x007bff;
const SELECTED_COLOR = 0xef4444;

export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }: Props) {
  const { width, depth } = floor.geometry || { width: 100, depth: 100 };

  const floorGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, 0.2, depth);
  }, [width, depth]);

  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={floorGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[floorGeometry]} />
        <lineBasicMaterial color={EDGE_COLOR} />
      </lineSegments>
      {floor.brands?.map(brand => (
        <mesh
          key={brand.id}
          position={[brand.position.x, brand.position.y + 1, brand.position.z]}
        >
          <boxGeometry args={[brand.size.width, brand.size.height, brand.size.depth]} />
          <meshStandardMaterial color={BRAND_COLOR} />
        </mesh>
      ))}
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
            color={selectedNodeId === node.id ? SELECTED_COLOR : (NODE_COLORS[node.type] || EDGE_COLOR)}
          />
        </mesh>
      ))}
    </group>
  );
}
