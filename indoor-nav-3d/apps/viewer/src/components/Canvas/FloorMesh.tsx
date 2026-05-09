import { Floor, NavigationNode, NODE_COLORS, getFloorOutline, polygonCenter } from '@indoor-nav/shared';
import { useMemo } from 'react';
import * as THREE from 'three';
import ShopMesh from './ShopMesh';

interface Props {
  floor: Floor;
  yOffset: number;
  onNodeClick?: (node: NavigationNode) => void;
  selectedNodeId?: string | null;
}

const FLOOR_COLOR = 0xe5e7eb;
const EDGE_COLOR = 0x6b7280;
const SELECTED_COLOR = 0xef4444;

function brandColor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash & 0xffff) % 360);
  return new THREE.Color(`hsl(${hue}, 60%, 55%)`).getHex();
}

function buildFloorGeometry(outline: { vertices: { x: number; z: number }[] }) {
  const v = outline.vertices;
  if (v.length < 3) return null;
  const center = polygonCenter(v);
  const shape = new THREE.Shape();
  shape.moveTo(v[0].x - center.x, -(v[0].z - center.z));
  for (let i = 1; i < v.length; i++) shape.lineTo(v[i].x - center.x, -(v[i].z - center.z));
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
  return { geometry: geo, center };
}

export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }: Props) {
  const outline = getFloorOutline(floor.geometry);

  const floorGeo = useMemo(() => buildFloorGeometry(outline), [outline]);

  const edgeGeo = useMemo(() => {
    if (!floorGeo) return null;
    return new THREE.EdgesGeometry(floorGeo.geometry);
  }, [floorGeo]);

  return (
    <group position={floorGeo ? [floorGeo.center.x, yOffset, floorGeo.center.z] : [0, yOffset, 0]}>
      {floorGeo ? (
        <>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={floorGeo.geometry}>
              <meshStandardMaterial color={FLOOR_COLOR} />
            </mesh>
            {edgeGeo && (
              <lineSegments geometry={edgeGeo}>
                <lineBasicMaterial color={EDGE_COLOR} />
              </lineSegments>
            )}
          </group>
        </>
      ) : (
        (() => {
          const { width = 100, depth = 100 } = floor.geometry || {};
          const boxGeo = new THREE.BoxGeometry(width, 0.2, depth);
          return (
            <>
              <mesh geometry={boxGeo}>
                <meshStandardMaterial color={FLOOR_COLOR} />
              </mesh>
              <lineSegments>
                <edgesGeometry args={[boxGeo]} />
                <lineBasicMaterial color={EDGE_COLOR} />
              </lineSegments>
            </>
          );
        })()
      )}

      {floor.shops?.map(shop => (
        <ShopMesh key={shop.id} shop={shop} yOffset={0} />
      ))}

      {(!floor.shops || floor.shops.length === 0) && floor.brands?.map(brand => (
        <mesh
          key={brand.id}
          position={[brand.position.x, brand.position.y + brand.size.height / 2, brand.position.z]}
        >
          <boxGeometry args={[brand.size.width, brand.size.height, brand.size.depth]} />
          <meshStandardMaterial color={brandColor(brand.name || brand.id)} />
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
            color={selectedNodeId === node.id ? SELECTED_COLOR : (NODE_COLORS[node.type]?.numeric ?? EDGE_COLOR)}
          />
        </mesh>
      ))}
    </group>
  );
}
