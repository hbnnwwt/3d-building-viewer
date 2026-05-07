import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building, NavigationStep } from '@indoor-nav/shared';
import FloorMesh from './FloorMesh';
import NavigationPath from '../Navigation/NavigationPath';

interface Props {
  building: Building | null;
  navigationPath?: NavigationStep[];
  showPath?: boolean;
  onNodeClick?: (node: any) => void;
  selectedNodeId?: string | null;
}

export default function BuildingCanvas({ building, navigationPath, showPath, onNodeClick, selectedNodeId }: Props) {
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
      {building.floors.map((floor, i) => (
        <FloorMesh
          key={floor.id}
          floor={floor}
          yOffset={i * (floor.geometry?.floorHeight || 3)}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
        />
      ))}
      <NavigationPath path={navigationPath || []} visible={showPath || false} />
      <OrbitControls enableDamping />
    </Canvas>
  );
}