import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../apps/viewer/public/data/buildings.json');

const SAME_FLOOR_MAX_DIST = 28;
const CROSS_FLOOR_MAX_DIST = 30;

function dist2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function generateConnections(data) {
  for (const building of data.buildings) {
    const floors = building.floors.slice().sort((a, b) => a.order - b.order);
    const allNodesById = new Map();
    for (const floor of floors) {
      for (const node of floor.navigationMesh || []) {
        node.connections = [];
        allNodesById.set(node.id, node);
      }
    }

    // Same-floor: connect nodes within distance threshold
    for (const floor of floors) {
      const nodes = floor.navigationMesh || [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = dist2D(nodes[i].position, nodes[j].position);
          if (d <= SAME_FLOOR_MAX_DIST) {
            if (!nodes[i].connections.includes(nodes[j].id)) {
              nodes[i].connections.push(nodes[j].id);
            }
            if (!nodes[j].connections.includes(nodes[i].id)) {
              nodes[j].connections.push(nodes[i].id);
            }
          }
        }
      }
    }

    // Cross-floor: 1-to-1 matching — each transit node pairs with the closest
    // unpaired same-type node on the adjacent floor
    for (let fi = 0; fi < floors.length; fi++) {
      const floor = floors[fi];
      const adjIndices = [];
      if (fi > 0) adjIndices.push(fi - 1);
      if (fi < floors.length - 1) adjIndices.push(fi + 1);

      for (const adjIdx of adjIndices) {
        const adjFloor = floors[adjIdx];
        const transitTypes = ['elevator', 'stair'];

        for (const type of transitTypes) {
          const fromNodes = (floor.navigationMesh || []).filter(n => n.type === type);
          const toNodes = (adjFloor.navigationMesh || []).filter(n => n.type === type);
          const used = new Set();

          // Sort pairs by distance, greedily pick closest unmatched pairs
          const pairs = [];
          for (const a of fromNodes) {
            for (const b of toNodes) {
              pairs.push({ a, b, dist: dist2D(a.position, b.position) });
            }
          }
          pairs.sort((x, y) => x.dist - y.dist);

          for (const { a, b, dist } of pairs) {
            if (used.has(a.id) || used.has(b.id)) continue;
            if (dist > CROSS_FLOOR_MAX_DIST) {
              console.log(`  跨层 ${type} 跳过: ${a.id}↔${b.id} 距离=${dist.toFixed(1)} > ${CROSS_FLOOR_MAX_DIST}`);
              break;
            }
            if (!a.connections.includes(b.id)) a.connections.push(b.id);
            if (!b.connections.includes(a.id)) b.connections.push(a.id);
            used.add(a.id);
            used.add(b.id);
          }
          const unpairedFrom = fromNodes.filter(n => !used.has(n.id));
          const unpairedTo = toNodes.filter(n => !used.has(n.id));
          if (unpairedFrom.length > 0) console.warn(`  ⚠ ${floor.name}→${adjFloor.name} 未配对 ${type}: ${unpairedFrom.map(n => n.id).join(', ')}`);
          if (unpairedTo.length > 0) console.warn(`  ⚠ ${adjFloor.name}→${floor.name} 未配对 ${type}: ${unpairedTo.map(n => n.id).join(', ')}`);
        }
      }
    }

    // Ensure every node has at least one connection (connect to nearest if isolated)
    const FALLBACK_MAX_DIST = SAME_FLOOR_MAX_DIST * 2;
    for (const floor of floors) {
      const nodes = floor.navigationMesh || [];
      for (const node of nodes) {
        if (node.connections.length > 0) continue;
        let nearest = null;
        let nearestDist = Infinity;
        for (const other of nodes) {
          if (other.id === node.id) continue;
          const d = dist2D(node.position, other.position);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = other;
          }
        }
        if (nearest && nearestDist <= FALLBACK_MAX_DIST) {
          node.connections.push(nearest.id);
          if (!nearest.connections.includes(node.id)) {
            nearest.connections.push(node.id);
          }
        } else if (nearest) {
          console.warn(`  ⚠ 孤立节点 ${node.id} (type=${node.type}) 最近距离 ${nearestDist.toFixed(1)} 超过阈值 ${FALLBACK_MAX_DIST}，跳过连接`);
        }
      }
    }
  }
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
generateConnections(data);

let totalConnections = 0;
for (const b of data.buildings) {
  for (const f of b.floors) {
    for (const n of f.navigationMesh || []) {
      totalConnections += n.connections.length;
    }
  }
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Generated ${totalConnections} connections across ${data.buildings.length} buildings`);
