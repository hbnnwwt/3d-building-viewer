import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Floor, Shop, NavigationNode, SHOP_DEFAULTS, ENTRANCE_COLORS, rectangleToPolygon, nearestEdgePoint } from '@indoor-nav/shared';
import type { ThreeEvent } from '@react-three/fiber';
import ShopPropertyPanel from './ShopPropertyPanel';

interface Props {
  floor: Floor;
  shops: Shop[];
  selectedShopId: string | null;
  onSelectShop: (id: string | null) => void;
  onUpdateShops: (shops: Shop[]) => void;
  navNodes: NavigationNode[];
}

let shopCounter = 0;
function generateShopId(): string {
  return `shop-${Date.now()}-${++shopCounter}`;
}
function generateEntranceId(): string {
  return `ent-${Date.now()}-${++shopCounter}`;
}

function ShopMesh3D({ shop, selected, onClick }: { shop: Shop; selected: boolean; onClick: () => void }) {
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

  return (
    <group position={[center.x, shop.baseHeight + shop.height / 2, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <meshStandardMaterial
          color={shop.color || SHOP_DEFAULTS.color}
          transparent opacity={0.75}
        />
      </mesh>
      {selected && (
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color="#fbbf24" linewidth={2} />
        </lineSegments>
      )}
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

export default function ShopEditor({ floor, shops, selectedShopId, onSelectShop, onUpdateShops, navNodes }: Props) {
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [corner1, setCorner1] = useState<{ x: number; z: number } | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; z: number } | null>(null);
  const [isEntranceMode, setIsEntranceMode] = useState(false);

  const selectedShop = shops.find(s => s.id === selectedShopId) || null;

  const handleFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isDrawMode) return;
    const pt = { x: e.point.x, z: e.point.z };

    if (!corner1) {
      setCorner1(pt);
    } else {
      const polygon = rectangleToPolygon(corner1.x, corner1.z, pt.x, pt.z);
      const minW = Math.abs(pt.x - corner1.x);
      const minD = Math.abs(pt.z - corner1.z);
      if (minW < 2 || minD < 2) return;

      const newShop: Shop = {
        id: generateShopId(),
        floorId: floor.id,
        name: `店铺 ${shops.length + 1}`,
        polygon,
        height: SHOP_DEFAULTS.height,
        baseHeight: SHOP_DEFAULTS.baseHeight,
        color: SHOP_DEFAULTS.color,
        entrances: [],
      };
      onUpdateShops([...shops, newShop]);
      onSelectShop(newShop.id);
      setCorner1(null);
      setIsDrawMode(false);
    }
  };

  const handleFloorPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDrawMode && corner1) {
      setPointerPos({ x: e.point.x, z: e.point.z });
    }
  };

  const handleUpdateShop = (updated: Shop) => {
    onUpdateShops(shops.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteShop = (id: string) => {
    onUpdateShops(shops.filter(s => s.id !== id));
    if (selectedShopId === id) onSelectShop(null);
  };

  const handleAddEntrance = () => {
    if (!selectedShop) return;
    setIsEntranceMode(true);
  };

  const handleEntrancePlace = (e: ThreeEvent<MouseEvent>) => {
    if (!isEntranceMode || !selectedShop) return;
    e.stopPropagation();
    const pt = { x: e.point.x, z: e.point.z };
    const { point: snapPt } = nearestEdgePoint(pt, selectedShop.polygon);
    const newEntrance = {
      id: generateEntranceId(),
      shopId: selectedShop.id,
      position: snapPt,
      width: 2,
      type: 'main' as const,
    };
    handleUpdateShop({ ...selectedShop, entrances: [...selectedShop.entrances, newEntrance] });
    setIsEntranceMode(false);
  };

  const { width = 100, depth = 100 } = floor.geometry || {};

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '8px 12px', background: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => { setIsDrawMode(!isDrawMode); setCorner1(null); setIsEntranceMode(false); }}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer',
              background: isDrawMode ? '#28a745' : '#007bff', color: 'white', fontWeight: 600
            }}
          >
            {isDrawMode ? '取消绘制' : '绘制店铺'}
          </button>
          {selectedShop && (
            <button
              onClick={() => { setIsEntranceMode(!isEntranceMode); }}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer',
                background: isEntranceMode ? '#28a745' : '#17a2b8', color: 'white'
              }}
            >
              {isEntranceMode ? '取消添加入口' : '添加入口'}
            </button>
          )}
          <span style={{ fontSize: 12, color: '#666' }}>
            {isDrawMode && !corner1 && '点击地板放置第一个角'}
            {isDrawMode && corner1 && '点击放置对角'}
            {isEntranceMode && '点击店铺边缘放置入口'}
          </span>
        </div>
        <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={isEntranceMode ? handleEntrancePlace : handleFloorClick}
            onPointerMove={handleFloorPointerMove}
          >
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>

          {/* Existing nav nodes for reference */}
          {navNodes.map(node => (
            <mesh key={node.id} position={[node.position.x, node.position.y + 0.3, node.position.z]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#aaa" transparent opacity={0.5} />
            </mesh>
          ))}

          {/* Shops */}
          {shops.map(shop => (
            <ShopMesh3D
              key={shop.id}
              shop={shop}
              selected={selectedShopId === shop.id}
              onClick={() => onSelectShop(shop.id)}
            />
          ))}

          {/* Drawing preview */}
          {isDrawMode && corner1 && pointerPos && (
            <mesh position={[
              (corner1.x + pointerPos.x) / 2,
              0.05,
              (corner1.z + pointerPos.z) / 2
            ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[
                Math.abs(pointerPos.x - corner1.x) || 0.1,
                Math.abs(pointerPos.z - corner1.z) || 0.1
              ]} />
              <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
            </mesh>
          )}

          <OrbitControls />
        </Canvas>
      </div>

      <ShopPropertyPanel
        shop={selectedShop}
        navNodes={navNodes}
        onUpdate={handleUpdateShop}
        onDelete={() => selectedShopId && handleDeleteShop(selectedShopId)}
        onAddEntrance={handleAddEntrance}
      />
    </div>
  );
}
