import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Floor, Shop, NavigationNode, Vertex2D, SHOP_DEFAULTS, ENTRANCE_COLORS, rectangleToPolygon, nearestEdgePoint, ensureCCW, isPointNearVertex } from '@indoor-nav/shared';
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

const CLOSE_THRESHOLD = 2;

type DrawMode = 'idle' | 'polygon' | 'rectangle';

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

function DrawingVertexMarkers({ vertices, pointerPos }: { vertices: Vertex2D[]; pointerPos: Vertex2D | null }) {
  return (
    <>
      {vertices.map((v, i) => {
        const isNear = i === 0 && vertices.length >= 3 && pointerPos
          ? isPointNearVertex(pointerPos, v, CLOSE_THRESHOLD) : false;
        return (
          <mesh key={i} position={[v.x, 0.3, v.z]}>
            <sphereGeometry args={[i === 0 ? (isNear ? 1.2 : 0.8) : 0.4, 12, 12]} />
            <meshStandardMaterial color={i === 0 ? 0x22c55e : 0x3b82f6} />
          </mesh>
        );
      })}
    </>
  );
}

function DrawingLines({ vertices, pointerPos }: { vertices: Vertex2D[]; pointerPos: Vertex2D | null }) {
  if (vertices.length === 0) return null;
  const points: THREE.Vector3[] = vertices.map(v => new THREE.Vector3(v.x, 0.2, v.z));
  if (pointerPos) points.push(new THREE.Vector3(pointerPos.x, 0.2, pointerPos.z));
  if (points.length < 2) return null;

  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
  const lineObj = new THREE.Line(geo, mat);
  return <primitive object={lineObj} />;
}

export default function ShopEditor({ floor, shops, selectedShopId, onSelectShop, onUpdateShops, navNodes }: Props) {
  const [drawMode, setDrawMode] = useState<DrawMode>('idle');
  const [corner1, setCorner1] = useState<Vertex2D | null>(null);
  const [tempVertices, setTempVertices] = useState<Vertex2D[]>([]);
  const [pointerPos, setPointerPos] = useState<Vertex2D | null>(null);
  const [isEntranceMode, setIsEntranceMode] = useState(false);

  const selectedShop = shops.find(s => s.id === selectedShopId) || null;

  const handleFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (isEntranceMode) {
      handleEntrancePlace(e);
      return;
    }

    const pt: Vertex2D = { x: e.point.x, z: e.point.z };

    if (drawMode === 'rectangle') {
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
        setDrawMode('idle');
      }
      return;
    }

    if (drawMode === 'polygon') {
      if (tempVertices.length >= 3 && isPointNearVertex(pt, tempVertices[0], CLOSE_THRESHOLD)) {
        completePolygon(tempVertices);
        return;
      }
      setTempVertices([...tempVertices, pt]);
    }
  };

  const completePolygon = (verts: Vertex2D[]) => {
    if (verts.length < 3) return;
    const ccwVerts = ensureCCW(verts);
    const newShop: Shop = {
      id: generateShopId(),
      floorId: floor.id,
      name: `店铺 ${shops.length + 1}`,
      polygon: { vertices: ccwVerts },
      height: SHOP_DEFAULTS.height,
      baseHeight: SHOP_DEFAULTS.baseHeight,
      color: SHOP_DEFAULTS.color,
      entrances: [],
    };
    onUpdateShops([...shops, newShop]);
    onSelectShop(newShop.id);
    setTempVertices([]);
    setDrawMode('idle');
    setPointerPos(null);
  };

  const handleFloorPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (drawMode === 'idle' && !isEntranceMode) return;
    setPointerPos({ x: e.point.x, z: e.point.z });
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

  const cancelDrawing = () => {
    setDrawMode('idle');
    setCorner1(null);
    setTempVertices([]);
    setPointerPos(null);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '8px 12px', background: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', gap: 8, alignItems: 'center' }}>
          {drawMode === 'idle' && !isEntranceMode ? (
            <>
              <button
                onClick={() => { setDrawMode('polygon'); setTempVertices([]); }}
                style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#007bff', color: 'white', fontWeight: 600 }}
              >
                绘制多边形
              </button>
              <button
                onClick={() => { setDrawMode('rectangle'); setCorner1(null); }}
                style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#6c757d', color: 'white' }}
              >
                绘制矩形
              </button>
            </>
          ) : drawMode === 'polygon' ? (
            <>
              <button
                onClick={() => completePolygon(tempVertices)}
                disabled={tempVertices.length < 3}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 4,
                  cursor: tempVertices.length >= 3 ? 'pointer' : 'not-allowed',
                  background: tempVertices.length >= 3 ? '#28a745' : '#ccc', color: 'white'
                }}
              >
                完成 ({tempVertices.length} 点)
              </button>
              <button onClick={cancelDrawing} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#dc3545', color: 'white' }}>
                取消
              </button>
            </>
          ) : drawMode === 'rectangle' ? (
            <>
              <button onClick={cancelDrawing} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#dc3545', color: 'white' }}>
                取消
              </button>
            </>
          ) : null}

          {isEntranceMode && (
            <button onClick={() => setIsEntranceMode(false)} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#dc3545', color: 'white' }}>
              取消添加入口
            </button>
          )}

          {!isEntranceMode && drawMode === 'idle' && selectedShop && (
            <button
              onClick={() => setIsEntranceMode(true)}
              style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#17a2b8', color: 'white' }}
            >
              添加入口
            </button>
          )}

          <span style={{ fontSize: 12, color: '#666' }}>
            {drawMode === 'rectangle' && !corner1 && '点击放置矩形第一个角'}
            {drawMode === 'rectangle' && corner1 && '点击放置对角'}
            {drawMode === 'polygon' && tempVertices.length === 0 && '点击添加第一个顶点'}
            {drawMode === 'polygon' && tempVertices.length > 0 && tempVertices.length < 3 && `已添加 ${tempVertices.length} 个顶点，至少需要 3 个`}
            {drawMode === 'polygon' && tempVertices.length >= 3 && '继续添加顶点，点击首顶点或按钮完成'}
            {isEntranceMode && '点击店铺边缘放置入口'}
          </span>
        </div>
        <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          {/* Large click plane for any floor shape */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={handleFloorClick}
            onPointerMove={handleFloorPointerMove}
          >
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>

          {/* Nav nodes for reference */}
          {navNodes.map(node => (
            <mesh key={node.id} position={[node.position.x, node.position.y + 0.3, node.position.z]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#aaa" transparent opacity={0.5} />
            </mesh>
          ))}

          {/* Existing shops */}
          {shops.map(shop => (
            <ShopMesh3D
              key={shop.id}
              shop={shop}
              selected={selectedShopId === shop.id}
              onClick={() => onSelectShop(shop.id)}
            />
          ))}

          {/* Rectangle preview */}
          {drawMode === 'rectangle' && corner1 && pointerPos && (
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

          {/* Polygon drawing preview */}
          {drawMode === 'polygon' && tempVertices.length > 0 && (
            <>
              <DrawingLines vertices={tempVertices} pointerPos={pointerPos} />
              <DrawingVertexMarkers vertices={tempVertices} pointerPos={pointerPos} />
            </>
          )}

          <OrbitControls enabled={drawMode === 'idle' && !isEntranceMode} />
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
