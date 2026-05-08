import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../apps/viewer/public/data/buildings.json');

const SAME_FLOOR_MAX_DIST = 28;
const CROSS_FLOOR_MAX_DIST = 50;

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

    // Cross-floor: connect elevator/stair nodes to closest matching type on adjacent floors
    for (let fi = 0; fi < floors.length; fi++) {
      const floor = floors[fi];
      const adjIndices = [];
      if (fi > 0) adjIndices.push(fi - 1);
      if (fi < floors.length - 1) adjIndices.push(fi + 1);

      for (const adjIdx of adjIndices) {
        const adjFloor = floors[adjIdx];
        const adjTransitNodes = (adjFloor.navigationMesh || []).filter(
          n => n.type === 'elevator' || n.type === 'stair'
        );

        for (const node of floor.navigationMesh || []) {
          if (node.type !== 'elevator' && node.type !== 'stair') continue;
          let closest = null;
          let closestDist = Infinity;
          for (const adjNode of adjTransitNodes) {
            if (adjNode.type !== node.type) continue;
            const d = dist2D(node.position, adjNode.position);
            if (d < closestDist) {
              closestDist = d;
              closest = adjNode;
            }
          }
          if (closest && closestDist <= CROSS_FLOOR_MAX_DIST) {
            if (!node.connections.includes(closest.id)) {
              node.connections.push(closest.id);
            }
            if (!closest.connections.includes(node.id)) {
              closest.connections.push(node.id);
            }
          }
        }
      }
    }

    // Ensure every node has at least one connection (connect to nearest if isolated)
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
        if (nearest) {
          node.connections.push(nearest.id);
          if (!nearest.connections.includes(node.id)) {
            nearest.connections.push(node.id);
          }
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
