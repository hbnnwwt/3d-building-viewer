import { useMemo } from 'react';
import * as THREE from 'three';
import { NavigationStep, Position3D } from '@indoor-nav/shared';

interface Props {
  path: NavigationStep[];
  visible: boolean;
}

export default function NavigationPath({ path, visible }: Props) {
  // Create line geometry from path points
  const lineGeometry = useMemo(() => {
    if (!visible || path.length === 0) return null;

    const points: THREE.Vector3[] = [];
    for (const step of path) {
      for (const point of step.points) {
        points.push(new THREE.Vector3(point.x, point.y, point.z));
      }
    }

    if (points.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [path, visible]);

  if (!visible || !lineGeometry) return null;

  return (
    <group>
      {/* Path line */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#007bff" linewidth={3} />
      </line>

      {/* Start marker - green sphere */}
      {path[0]?.points[0] && (
        <mesh position={[
          path[0].points[0].x,
          path[0].points[0].y + 0.5,
          path[0].points[0].z
        ]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      )}

      {/* End marker - red sphere */}
      {path[path.length - 1]?.points.slice(-1)[0] && (
        <mesh position={[
          path[path.length - 1].points.slice(-1)[0].x,
          path[path.length - 1].points.slice(-1)[0].y + 0.5,
          path[path.length - 1].points.slice(-1)[0].z
        ]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  );
}
