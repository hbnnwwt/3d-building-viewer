import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building, NavigationNode, NavigationStep } from '@indoor-nav/shared';
import FloorMesh from './FloorMesh';
import NavigationPath from '../Navigation/NavigationPath';

interface Props {
  building: Building | null;
  navigationPath?: NavigationStep[];
  showPath?: boolean;
  onNodeClick?: (node: NavigationNode) => void;
  selectedNodeId?: string | null;
  activeFloorId?: string | null;
}

const FLOOR_SPACING_SCALE = 0.5;

function floorSpacing(width: number, depth: number, floorHeight: number): number {
  return Math.max(floorHeight, Math.sqrt(width * depth) * FLOOR_SPACING_SCALE);
}

export default function BuildingCanvas({ building, navigationPath, showPath, onNodeClick, selectedNodeId, activeFloorId }: Props) {
  const floorYOffsets = useMemo(() => {
    if (!building) return new Map<string, number>();
    let y = 0;
    const map = new Map<string, number>();
    const sorted = [...building.floors].sort((a, b) => a.order - b.order);
    for (const floor of sorted) {
      map.set(floor.id, y);
      const { width = 100, depth = 100, floorHeight = 3 } = floor.geometry || {};
      y += floorSpacing(width, depth, floorHeight);
    }
    return map;
  }, [building]);

  const visibleFloors = useMemo(() => {
    if (!building) return [];
    const sorted = [...building.floors].sort((a, b) => a.order - b.order);
    if (!activeFloorId) return sorted;
    return sorted.filter(f => f.id === activeFloorId);
  }, [building, activeFloorId]);

  const visiblePath = useMemo(() => {
    if (!navigationPath || navigationPath.length === 0) return [];
    return navigationPath;
  }, [navigationPath]);

  if (!building) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        请选择一个建筑
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {visibleFloors.map((floor) => (
        <FloorMesh
          key={floor.id}
          floor={floor}
          yOffset={floorYOffsets.get(floor.id) || 0}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
        />
      ))}
      <NavigationPath path={visiblePath} visible={showPath || false} floorYOffsets={floorYOffsets} />
      <OrbitControls enableDamping />
    </Canvas>
  );
}
