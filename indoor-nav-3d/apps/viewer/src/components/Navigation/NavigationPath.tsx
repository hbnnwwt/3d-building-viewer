import { useMemo } from 'react';
import { NavigationStep } from '@indoor-nav/shared';
import { Line } from '@react-three/drei';

interface Props {
  path: NavigationStep[];
  visible: boolean;
  floorYOffsets: Map<string, number>;
}

export default function NavigationPath({ path, visible, floorYOffsets }: Props) {
  const points = useMemo(() => {
    if (!visible || path.length === 0) return [];

    const result: [number, number, number][] = [];
    for (const step of path) {
      const yOffset = floorYOffsets.get(step.floorId) || 0;
      for (const point of step.points) {
        result.push([point.x, point.y + yOffset + 0.5, point.z]);
      }
    }
    return result;
  }, [path, visible, floorYOffsets]);

  if (!visible || points.length < 2) return null;

  const firstPoint = path[0]?.points[0];
  const lastStepPoints = path[path.length - 1]?.points;
  const lastPoint = lastStepPoints?.[lastStepPoints.length - 1];
  const firstY = (floorYOffsets.get(path[0]?.floorId || '') || 0) + 0.5;
  const lastY = (floorYOffsets.get(path[path.length - 1]?.floorId || '') || 0) + 0.5;

  return (
    <group>
      <Line
        points={points}
        color="#007bff"
        lineWidth={3}
      />

      {firstPoint && (
        <mesh position={[firstPoint.x, firstY + 0.5, firstPoint.z]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      )}

      {lastPoint && (
        <mesh position={[lastPoint.x, lastY + 0.5, lastPoint.z]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  );
}
