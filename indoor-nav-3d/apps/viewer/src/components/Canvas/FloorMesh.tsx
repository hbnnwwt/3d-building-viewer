import { Floor } from '@indoor-nav/shared';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  floor: Floor;
  yOffset: number;
}

export default function FloorMesh({ floor, yOffset }: Props) {
  const { width, depth } = floor.geometry || { width: 100, depth: 100 };

  const floorGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, 0.2, depth);
  }, [width, depth]);

  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={floorGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[floorGeometry]} />
        <lineBasicMaterial color="#999" />
      </lineSegments>
      {floor.brands?.map(brand => (
        <mesh
          key={brand.id}
          position={[brand.position.x, brand.position.y + 1, brand.position.z]}
        >
          <boxGeometry args={[brand.size.width, brand.size.height, brand.size.depth]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      ))}
    </group>
  );
}