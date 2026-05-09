import { useMemo } from 'react';
import * as THREE from 'three';
import { Floor, getFloorOutline, polygonCenter, Vertex2D } from '@indoor-nav/shared';

interface FloorProps {
  onClick?: (e: any) => void;
  onPointerMove?: (e: any) => void;
}

function PolygonFloor({ vertices, onClick, onPointerMove }: FloorProps & { vertices: Vertex2D[] }) {
  const center = useMemo(() => polygonCenter(vertices), [vertices]);

  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0].x - center.x, -(vertices[0].z - center.z));
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x - center.x, -(vertices[i].z - center.z));
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  }, [vertices, center.x, center.z]);

  const bb = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.z < minZ) minZ = v.z;
      if (v.z > maxZ) maxZ = v.z;
    }
    return { minX, maxX, minZ, maxZ };
  }, [vertices]);

  const clickW = Math.max(bb.maxX - bb.minX + 20, 100);
  const clickD = Math.max(bb.maxZ - bb.minZ + 20, 100);
  const cx = (bb.minX + bb.maxX) / 2;
  const cz = (bb.minZ + bb.maxZ) / 2;

  return (
    <>
      <group position={[center.x, 0, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={floorGeo}>
          <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[floorGeo]} />
          <lineBasicMaterial color="#ccc" />
        </lineSegments>
      </group>
      <mesh
        position={[cx, -0.01, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onClick}
        onPointerMove={onPointerMove}
      >
        <planeGeometry args={[clickW, clickD]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

function RectFloor({ width, depth, onClick, onPointerMove }: FloorProps & { width: number; depth: number }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      onPointerMove={onPointerMove}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
}

export default function EditorFloorMesh({ floor, onClick, onPointerMove }: FloorProps & { floor: Floor }) {
  const outline = getFloorOutline(floor.geometry);
  const vertices = outline.vertices;

  if (vertices.length >= 3) {
    return <PolygonFloor vertices={vertices} onClick={onClick} onPointerMove={onPointerMove} />;
  }

  const { width = 100, depth = 100 } = floor.geometry || {};
  return <RectFloor width={width} depth={depth} onClick={onClick} onPointerMove={onPointerMove} />;
}
