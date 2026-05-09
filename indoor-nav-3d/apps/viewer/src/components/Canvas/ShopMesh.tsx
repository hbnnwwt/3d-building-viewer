import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Shop, ENTRANCE_COLORS } from '@indoor-nav/shared';

interface Props {
  shop: Shop;
  yOffset: number;
}

export default function ShopMesh({ shop, yOffset }: Props) {
  const v = shop.polygon.vertices;
  const center = useMemo(() => ({
    x: v.reduce((s, p) => s + p.x, 0) / v.length,
    z: v.reduce((s, p) => s + p.z, 0) / v.length,
  }), [v]);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(v[0].x - center.x, -(v[0].z - center.z));
    for (let i = 1; i < v.length; i++) shape.lineTo(v[i].x - center.x, -(v[i].z - center.z));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: shop.height, bevelEnabled: false });
  }, [v, center.x, center.z, shop.height]);

  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <group position={[center.x, yOffset + shop.baseHeight, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={shop.color || '#94a3b8'} transparent opacity={0.85} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#374151" />
      </lineSegments>

      {/* Name label */}
      <Html
        position={[0, -(shop.height + 0.5), 0]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.75)', color: 'white',
          padding: '2px 8px', borderRadius: 4, fontSize: 12,
          whiteSpace: 'nowrap', transform: 'translateY(-100%)',
        }}>
          {shop.name}
        </div>
      </Html>

      {/* Entrance markers */}
      {shop.entrances.map(ent => (
        <mesh
          key={ent.id}
          position={[ent.position.x - center.x, -(ent.position.z - center.z), shop.height + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[ent.width, 0.3]} />
          <meshStandardMaterial color={ENTRANCE_COLORS[ent.type]?.hex || '#22c55e'} />
        </mesh>
      ))}
    </group>
  );
}
