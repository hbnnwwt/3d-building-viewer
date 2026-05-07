import type {
  NavigationGraph,
  NavigationNode,
  NavigationStep,
  Position3D
} from './types';

interface AStarNode {
  id: string;
  g: number;
  h: number;
  f: number;
  parent: string | null;
}

// Heuristic: Euclidean distance
function heuristic(a: Position3D, b: Position3D): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

function distance(a: Position3D, b: Position3D): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

function buildAdjacencyList(graph: NavigationGraph): Map<string, Array<{nodeId: string; weight: number}>> {
  const adj = new Map<string, Array<{nodeId: string; weight: number}>>();

  for (const node of graph.nodes) {
    adj.set(node.id, []);
    for (const connId of node.connections) {
      const targetNode = graph.nodes.find(n => n.id === connId);
      if (targetNode) {
        const weight = distance(node.position, targetNode.position);
        adj.get(node.id)!.push({ nodeId: connId, weight });
      }
    }
  }

  return adj;
}

function findNearestTransitNode(
  graph: NavigationGraph,
  floorId: string,
  position: Position3D
): NavigationNode | null {
  const floorNodes = graph.nodes.filter(n => n.floorId === floorId && (n.type === 'elevator' || n.type === 'stair'));
  if (floorNodes.length === 0) return null;

  return floorNodes.reduce((nearest, node) => {
    const dist = distance(position, node.position);
    const nearestDist = nearest ? distance(position, nearest.position) : Infinity;
    return dist < nearestDist ? node : nearest;
  }, null as NavigationNode | null);
}

function findCrossFloorTransitNodes(
  graph: NavigationGraph,
  fromFloorId: string,
  toFloorId: string
): { fromTransit: NavigationNode | null; toTransit: NavigationNode | null } {
  const fromFloorTransits = graph.nodes.filter(n => n.floorId === fromFloorId && (n.type === 'elevator' || n.type === 'stair'));
  const toFloorTransits = graph.nodes.filter(n => n.floorId === toFloorId && (n.type === 'elevator' || n.type === 'stair'));

  if (fromFloorTransits.length === 0 || toFloorTransits.length === 0) {
    return { fromTransit: null, toTransit: null };
  }

  // Find the nearest pair of transit nodes between floors
  let bestPair: { fromTransit: NavigationNode; toTransit: NavigationNode; dist: number } | null = null;

  for (const fromTransit of fromFloorTransits) {
    for (const toTransit of toFloorTransits) {
      const dist = distance(fromTransit.position, toTransit.position);
      if (!bestPair || dist < bestPair.dist) {
        bestPair = { fromTransit, toTransit, dist };
      }
    }
  }

  return bestPair ? { fromTransit: bestPair.fromTransit, toTransit: bestPair.toTransit } : { fromTransit: null, toTransit: null };
}

export function findPath(
  graph: NavigationGraph,
  fromNodeId: string,
  toNodeId: string
): NavigationStep[] {
  const fromNode = graph.nodes.find(n => n.id === fromNodeId);
  const toNode = graph.nodes.find(n => n.id === toNodeId);

  if (!fromNode || !toNode) return [];

  // Same floor pathfinding
  if (fromNode.floorId === toNode.floorId) {
    return findSingleFloorPath(graph, fromNodeId, toNodeId);
  }

  // Cross-floor pathfinding via transit nodes
  return findCrossFloorPath(graph, fromNode, toNode);
}

function findSingleFloorPath(
  graph: NavigationGraph,
  fromId: string,
  toId: string
): NavigationStep[] {
  const adj = buildAdjacencyList(graph);
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));

  const openSet: AStarNode[] = [{
    id: fromId,
    g: 0,
    h: heuristic(nodeMap.get(fromId)!.position, nodeMap.get(toId)!.position),
    f: 0,
    parent: null
  }];
  openSet[0].f = openSet[0].g + openSet[0].h;

  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  const parentMap = new Map<string, string | null>();
  gScores.set(fromId, 0);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.id === toId) {
      return reconstructSingleFloorPath(graph, current.id, parentMap);
    }

    closedSet.add(current.id);

    const neighbors = adj.get(current.id) || [];
    for (const { nodeId, weight } of neighbors) {
      if (closedSet.has(nodeId)) continue;

      const neighborNode = nodeMap.get(nodeId);
      if (!neighborNode) continue;

      const tentativeG = current.g + weight;

      if (!gScores.has(nodeId) || tentativeG < gScores.get(nodeId)!) {
        gScores.set(nodeId, tentativeG);
        parentMap.set(nodeId, current.id);

        const existingIdx = openSet.findIndex(n => n.id === nodeId);
        const h = heuristic(neighborNode.position, nodeMap.get(toId)!.position);
        if (existingIdx !== -1) {
          openSet[existingIdx].g = tentativeG;
          openSet[existingIdx].f = tentativeG + h;
          openSet[existingIdx].parent = current.id;
        } else {
          openSet.push({
            id: nodeId,
            g: tentativeG,
            h: h,
            f: tentativeG + h,
            parent: current.id
          });
        }
      }
    }
  }

  return [];
}

function reconstructSingleFloorPath(
  graph: NavigationGraph,
  goalId: string,
  parentMap: Map<string, string | null>
): NavigationStep[] {
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  const path: Position3D[] = [];

  // Trace back parents to build path
  let currentId: string | null = goalId;
  while (currentId !== null) {
    const node = nodeMap.get(currentId);
    if (!node) break;
    path.push(node.position);
    currentId = parentMap.get(currentId) ?? null;
  }

  if (path.length === 0) return [];

  // Reverse to get start-to-goal order
  path.reverse();

  const goalNode = nodeMap.get(goalId)!;

  return [{
    floorId: goalNode.floorId,
    points: path,
    action: 'walk'
  }];
}

function findCrossFloorPath(
  graph: NavigationGraph,
  fromNode: NavigationNode,
  toNode: NavigationNode
): NavigationStep[] {
  const steps: NavigationStep[] = [];

  // Find nearest transit nodes on each floor
  const { fromTransit, toTransit } = findCrossFloorTransitNodes(graph, fromNode.floorId, toNode.floorId);

  if (!fromTransit || !toTransit) return [];

  // Path segment: start -> fromFloor transit
  const pathToTransit = findSingleFloorPath(graph, fromNode.id, fromTransit.id);
  if (pathToTransit.length > 0) {
    steps.push(...pathToTransit);
  }

  // Take elevator/stair between floors
  const transitType = fromTransit.type === 'elevator' ? 'takeElevator' : 'takeStair';
  steps.push({
    floorId: fromTransit.floorId,
    points: [fromTransit.position, toTransit.position],
    action: transitType
  });

  // Path segment: toFloor transit -> goal
  const pathFromTransit = findSingleFloorPath(graph, toTransit.id, toNode.id);
  if (pathFromTransit.length > 0) {
    // Update the floorId to the destination floor
    pathFromTransit.forEach(step => {
      step.floorId = toNode.floorId;
    });
    steps.push(...pathFromTransit);
  }

  return steps;
}

export function calculateTotalDistance(steps: NavigationStep[]): number {
  let total = 0;
  for (const step of steps) {
    const points = step.points;
    for (let i = 1; i < points.length; i++) {
      total += distance(points[i - 1], points[i]);
    }
  }
  return total;
}