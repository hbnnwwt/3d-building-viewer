import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { NavigationStep } from '@indoor-nav/shared';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  path: NavigationStep[];
  visible: boolean;
  floorYOffsets: Map<string, number>;
}

function PathAgent({ points }: { points: THREE.Vector3[] }) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (points.length < 2) return;
    progress.current += delta * 0.15;
    if (progress.current > 1) progress.current = 0;

    const totalLen = points.length - 1;
    const pos = progress.current * totalLen;
    const seg = Math.min(Math.floor(pos), totalLen - 1);
    const t = pos - seg;

    const from = points[seg];
    const to = points[seg + 1];
    if (!ref.current || !from || !to) return;

    ref.current.position.lerpVectors(from, to, t);

    const dir = new THREE.Vector3().subVectors(to, from);
    if (dir.length() > 0.001) {
      const angle = Math.atan2(dir.x, dir.z);
      ref.current.rotation.y = angle;
    }
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.3} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffcc80" emissive="#ffcc80" emissiveIntensity={0.2} />
      </mesh>
      {/* direction indicator */}
      <mesh position={[0, 0.5, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} />
      </mesh>
      {/* ground ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshStandardMaterial color="#ff6b35" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
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

  const vec3Points = useMemo(() => {
    return points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  }, [points]);

  if (!visible || points.length < 2) return null;

  const firstPoint = path[0]?.points[0];
  const lastStepPoints = path[path.length - 1]?.points;
  const lastPoint = lastStepPoints?.[lastStepPoints.length - 1];
  const firstY = (floorYOffsets.get(path[0]?.floorId || '') || 0) + 0.5;
  const lastY = (floorYOffsets.get(path[path.length - 1]?.floorId || '') || 0) + 0.5;

  return (
    <group>
      {/* main path line */}
      <Line
        points={points}
        color="#3b82f6"
        lineWidth={4}
      />
      {/* glow effect - wider transparent line underneath */}
      <Line
        points={points}
        color="#93c5fd"
        lineWidth={8}
        transparent
        opacity={0.3}
      />

      {/* start marker */}
      {firstPoint && (
        <group position={[firstPoint.x, firstY + 0.5, firstPoint.z]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <coneGeometry args={[0.4, 0.6, 4]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* end marker */}
      {lastPoint && (
        <group position={[lastPoint.x, lastY + 0.5, lastPoint.z]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* moving agent */}
      <PathAgent points={vec3Points} />
    </group>
  );
}
