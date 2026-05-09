import type { FloorGeometry, Polygon2D, Vertex2D } from './types';

export function getFloorOutline(geometry: FloorGeometry): Polygon2D {
  if (geometry.outline && geometry.outline.vertices.length >= 3) {
    return geometry.outline;
  }
  const hw = geometry.width / 2, hd = geometry.depth / 2;
  return {
    vertices: [
      { x: -hw, z: -hd },
      { x: hw, z: -hd },
      { x: hw, z: hd },
      { x: -hw, z: hd },
    ],
  };
}

export function polygonCenter(vertices: Vertex2D[]): Vertex2D {
  const n = vertices.length;
  return {
    x: vertices.reduce((s, p) => s + p.x, 0) / n,
    z: vertices.reduce((s, p) => s + p.z, 0) / n,
  };
}

export function polygonBoundingBox(vertices: Vertex2D[]) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  }
  return { minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
}

export function isPointNearVertex(p: Vertex2D, v: Vertex2D, threshold: number): boolean {
  return Math.sqrt((p.x - v.x) ** 2 + (p.z - v.z) ** 2) < threshold;
}

export function polygonArea(vertices: Vertex2D[]): number {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].z;
    area -= vertices[j].x * vertices[i].z;
  }
  return Math.abs(area) / 2;
}

export function ensureCCW(vertices: Vertex2D[]): Vertex2D[] {
  let sum = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += (vertices[j].x - vertices[i].x) * (vertices[j].z + vertices[i].z);
  }
  if (sum > 0) return [...vertices].reverse();
  return vertices;
}
