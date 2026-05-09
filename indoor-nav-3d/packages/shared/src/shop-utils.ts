import type { Brand, Polygon2D, Shop, Vertex2D } from './types';

export function rectangleToPolygon(x1: number, z1: number, x2: number, z2: number): Polygon2D {
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);
  return {
    vertices: [
      { x: minX, z: minZ },
      { x: maxX, z: minZ },
      { x: maxX, z: maxZ },
      { x: minX, z: maxZ },
    ],
  };
}

export function nearestEdgePoint(point: Vertex2D, polygon: Polygon2D): { point: Vertex2D; edgeIndex: number } {
  const v = polygon.vertices;
  let bestDist = Infinity;
  let bestPoint: Vertex2D = { ...point };
  let bestEdge = 0;

  for (let i = 0; i < v.length; i++) {
    const a = v[i];
    const b = v[(i + 1) % v.length];
    const dx = b.x - a.x, dz = b.z - a.z;
    const lenSq = dx * dx + dz * dz;
    let t = lenSq > 0 ? ((point.x - a.x) * dx + (point.z - a.z) * dz) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, pz = a.z + t * dz;
    const d = Math.sqrt((point.x - px) ** 2 + (point.z - pz) ** 2);
    if (d < bestDist) {
      bestDist = d;
      bestPoint = { x: px, z: pz };
      bestEdge = i;
    }
  }

  return { point: bestPoint, edgeIndex: bestEdge };
}

export function legacyBrandsToShops(brands: Brand[], floorId: string): Shop[] {
  return brands.map(brand => ({
    id: `shop-${brand.id}`,
    floorId,
    name: brand.name,
    polygon: {
      vertices: [
        { x: brand.position.x - brand.size.width / 2, z: brand.position.z - brand.size.depth / 2 },
        { x: brand.position.x + brand.size.width / 2, z: brand.position.z - brand.size.depth / 2 },
        { x: brand.position.x + brand.size.width / 2, z: brand.position.z + brand.size.depth / 2 },
        { x: brand.position.x - brand.size.width / 2, z: brand.position.z + brand.size.depth / 2 },
      ],
    },
    height: brand.size.height,
    baseHeight: brand.position.y,
    color: undefined,
    entrances: [],
  }));
}
