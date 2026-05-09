import { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Floor, Vertex2D, Polygon2D, getFloorOutline, polygonCenter, ensureCCW, isPointNearVertex } from '@indoor-nav/shared';
import type { ThreeEvent } from '@react-three/fiber';
import EditorFloorMesh from './EditorFloorMesh';

const CLOSE_THRESHOLD = 2;

type DrawState = 'idle' | 'drawing';

interface Props {
  floor: Floor;
  outline: Polygon2D | undefined;
  onOutlineChange: (outline: Polygon2D | undefined) => void;
}

function FloorOutlineMesh({ vertices, center }: { vertices: Vertex2D[]; center: Vertex2D }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0].x - center.x, -(vertices[0].z - center.z));
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x - center.x, -(vertices[i].z - center.z));
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
  }, [vertices, center]);

  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  return (
    <group position={[center.x, 0, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={0xd1d5db} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={0x6b7280} />
      </lineSegments>
    </group>
  );
}

function VertexMarker({ position, isFirst, isNear }: { position: Vertex2D; isFirst: boolean; isNear: boolean }) {
  const size = isFirst ? (isNear ? 1.2 : 0.8) : 0.4;
  const color = isFirst ? 0x22c55e : 0x3b82f6;
  return (
    <mesh position={[position.x, 0.3, position.z]}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function DrawingLines({ vertices, pointerPos, center }: { vertices: Vertex2D[]; pointerPos: Vertex2D | null; center: Vertex2D }) {
  if (vertices.length === 0) return null;

  const points: THREE.Vector3[] = vertices.map(v => new THREE.Vector3(v.x - center.x, 0, v.z - center.z));
  if (pointerPos) points.push(new THREE.Vector3(pointerPos.x - center.x, 0, pointerPos.z - center.z));

  const lineGeo = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const lineObj = useMemo(() => {
    if (!lineGeo) return null;
    const mat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
    return new THREE.Line(lineGeo, mat);
  }, [lineGeo]);

  return (
    <group position={[center.x, 0.2, center.z]}>
      {lineObj && <primitive object={lineObj} />}
    </group>
  );
}

export default function FloorCanvasEditor({ floor, outline, onOutlineChange }: Props) {
  const [drawState, setDrawState] = useState<DrawState>('idle');
  const [tempVertices, setTempVertices] = useState<Vertex2D[]>([]);
  const [pointerPos, setPointerPos] = useState<Vertex2D | null>(null);

  const currentOutline = outline && outline.vertices.length >= 3 ? outline : undefined;
  const allVertices = currentOutline ? currentOutline.vertices : [];
  const center = useMemo(() => {
    if (allVertices.length === 0) return { x: 0, z: 0 };
    return polygonCenter(allVertices);
  }, [allVertices]);

  const handleFloorClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (drawState !== 'drawing') return;
    e.stopPropagation();
    const pt: Vertex2D = { x: e.point.x, z: e.point.z };

    if (tempVertices.length >= 3 && isPointNearVertex(pt, tempVertices[0], CLOSE_THRESHOLD)) {
      const ccwVerts = ensureCCW(tempVertices);
      onOutlineChange({ vertices: ccwVerts });
      setTempVertices([]);
      setDrawState('idle');
      setPointerPos(null);
      return;
    }

    setTempVertices([...tempVertices, pt]);
  }, [drawState, tempVertices, onOutlineChange]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (drawState !== 'drawing') return;
    setPointerPos({ x: e.point.x, z: e.point.z });
  }, [drawState]);

  const startDrawing = () => {
    setDrawState('drawing');
    setTempVertices([]);
    setPointerPos(null);
  };

  const cancelDrawing = () => {
    setDrawState('idle');
    setTempVertices([]);
    setPointerPos(null);
  };

  const completeDrawing = () => {
    if (tempVertices.length < 3) return;
    const ccwVerts = ensureCCW(tempVertices);
    onOutlineChange({ vertices: ccwVerts });
    setTempVertices([]);
    setDrawState('idle');
    setPointerPos(null);
  };

  const clearOutline = () => {
    if (confirm('确认清除当前楼层轮廓？')) {
      onOutlineChange(undefined);
    }
  };

  const defaultCenter = currentOutline ? polygonCenter(currentOutline.vertices) : { x: 0, z: 0 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', background: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', gap: 8, alignItems: 'center' }}>
        {drawState === 'idle' ? (
          <>
            <button onClick={startDrawing} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#007bff', color: 'white', fontWeight: 600 }}>
              绘制轮廓
            </button>
            {currentOutline && (
              <button onClick={clearOutline} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#dc3545', color: 'white' }}>
                清除轮廓
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={completeDrawing}
              disabled={tempVertices.length < 3}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: 4, cursor: tempVertices.length >= 3 ? 'pointer' : 'not-allowed',
                background: tempVertices.length >= 3 ? '#28a745' : '#ccc', color: 'white'
              }}
            >
              完成多边形 ({tempVertices.length} 点)
            </button>
            <button onClick={cancelDrawing} style={{ padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#6c757d', color: 'white' }}>
              取消
            </button>
          </>
        )}
        <span style={{ fontSize: 12, color: '#666' }}>
          {drawState === 'drawing' && tempVertices.length === 0 && '点击添加第一个顶点'}
          {drawState === 'drawing' && tempVertices.length === 1 && '点击添加第二个顶点'}
          {drawState === 'drawing' && tempVertices.length === 2 && '至少还需要一个顶点'}
          {drawState === 'drawing' && tempVertices.length >= 3 && '继续添加顶点，或点击首顶点/按钮完成'}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          <EditorFloorMesh floor={floor} onClick={handleFloorClick} onPointerMove={handlePointerMove} />

          {/* Current floor outline */}
          {currentOutline && (
            <FloorOutlineMesh vertices={currentOutline.vertices} center={defaultCenter} />
          )}

          {/* Drawing preview */}
          {drawState === 'drawing' && tempVertices.length > 0 && (
            <>
              <DrawingLines vertices={tempVertices} pointerPos={pointerPos} center={defaultCenter} />
              {tempVertices.map((v, i) => (
                <VertexMarker
                  key={i}
                  position={v}
                  isFirst={i === 0}
                  isNear={i === 0 && tempVertices.length >= 3 && pointerPos ? isPointNearVertex(pointerPos, v, CLOSE_THRESHOLD) : false}
                />
              ))}
            </>
          )}

          <OrbitControls enabled={drawState === 'idle'} />
        </Canvas>
      </div>
    </div>
  );
}
