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

export interface PathResult {
  path: NavigationStep[];
  error?: string;
}

class MinHeap<T extends { f: number }> {
  private data: T[] = [];

  get size(): number {
    return this.data.length;
  }

  push(item: T): void {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].f <= this.data[i].f) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.data[left].f < this.data[smallest].f) smallest = left;
      if (right < n && this.data[right].f < this.data[smallest].f) smallest = right;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

function distance(a: Position3D, b: Position3D): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );
}

function buildAdjacencyList(graph: NavigationGraph): Map<string, Array<{ nodeId: string; weight: number }>> {
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  const adj = new Map<string, Array<{ nodeId: string; weight: number }>>();

  for (const node of graph.nodes) {
    const neighbors: Array<{ nodeId: string; weight: number }> = [];
    for (const connId of node.connections) {
      const target = nodeMap.get(connId);
      if (target) {
        neighbors.push({ nodeId: connId, weight: distance(node.position, target.position) });
      }
    }
    adj.set(node.id, neighbors);
  }

  return adj;
}

function astarSearch(
  graph: NavigationGraph,
  fromId: string,
  toId: string
): string[] {
  const adj = buildAdjacencyList(graph);
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  const toNode = nodeMap.get(toId);
  if (!toNode) return [];

  const openSet = new MinHeap<AStarNode>();
  const inOpen = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  const parentMap = new Map<string, string | null>();

  const startNode = nodeMap.get(fromId);
  if (!startNode) return [];

  const startH = distance(startNode.position, toNode.position);
  const startEntry: AStarNode = { id: fromId, g: 0, h: startH, f: startH, parent: null };
  openSet.push(startEntry);
  inOpen.set(fromId, startEntry);
  gScores.set(fromId, 0);

  while (openSet.size > 0) {
    const current = openSet.pop()!;

    if (current.id === toId) {
      const path: string[] = [];
      let id: string | null = current.id;
      while (id !== null) {
        path.push(id);
        id = parentMap.get(id) ?? null;
      }
      path.reverse();
      return path;
    }

    closedSet.add(current.id);
    inOpen.delete(current.id);

    const neighbors = adj.get(current.id) || [];
    for (const { nodeId, weight } of neighbors) {
      if (closedSet.has(nodeId)) continue;

      const neighborNode = nodeMap.get(nodeId);
      if (!neighborNode) continue;

      const tentativeG = current.g + weight;

      if (!gScores.has(nodeId) || tentativeG < gScores.get(nodeId)!) {
        gScores.set(nodeId, tentativeG);
        parentMap.set(nodeId, current.id);

        const h = distance(neighborNode.position, toNode.position);
        const existing = inOpen.get(nodeId);
        if (existing) {
          existing.g = tentativeG;
          existing.f = tentativeG + h;
          existing.parent = current.id;
        } else {
          const entry: AStarNode = { id: nodeId, g: tentativeG, h, f: tentativeG + h, parent: current.id };
          openSet.push(entry);
          inOpen.set(nodeId, entry);
        }
      }
    }
  }

  return [];
}

function splitPathIntoSteps(
  graph: NavigationGraph,
  nodeIds: string[]
): NavigationStep[] {
  if (nodeIds.length === 0) return [];

  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  const steps: NavigationStep[] = [];
  let currentFloorId = nodeMap.get(nodeIds[0])!.floorId;
  let currentPoints: Position3D[] = [nodeMap.get(nodeIds[0])!.position];

  for (let i = 1; i < nodeIds.length; i++) {
    const node = nodeMap.get(nodeIds[i])!;
    const prevNode = nodeMap.get(nodeIds[i - 1])!;

    if (node.floorId !== currentFloorId) {
      currentPoints.push(prevNode.position);

      const transitAction: 'takeElevator' | 'takeStair' =
        (prevNode.type === 'elevator' || node.type === 'elevator') ? 'takeElevator' : 'takeStair';

      if (currentPoints.length >= 2) {
        steps.push({ floorId: currentFloorId, points: [...currentPoints], action: 'walk' });
      }

      steps.push({
        floorId: currentFloorId,
        points: [prevNode.position, node.position],
        action: transitAction
      });

      currentFloorId = node.floorId;
      currentPoints = [node.position];
    } else {
      currentPoints.push(node.position);
    }
  }

  if (currentPoints.length >= 1) {
    steps.push({ floorId: currentFloorId, points: currentPoints, action: 'walk' });
  }

  return steps;
}

export function findPath(
  graph: NavigationGraph,
  fromNodeId: string,
  toNodeId: string
): NavigationStep[] {
  const result = findPathWithError(graph, fromNodeId, toNodeId);
  return result.path;
}

export function findPathWithError(
  graph: NavigationGraph,
  fromNodeId: string,
  toNodeId: string
): PathResult {
  const fromNode = graph.nodes.find(n => n.id === fromNodeId);
  const toNode = graph.nodes.find(n => n.id === toNodeId);

  if (!fromNode) return { path: [], error: '起点节点不存在' };
  if (!toNode) return { path: [], error: '终点节点不存在' };

  const nodeIds = astarSearch(graph, fromNodeId, toNodeId);
  if (nodeIds.length === 0) {
    return { path: [], error: '无法找到路径，请检查节点之间的连接' };
  }

  const path = splitPathIntoSteps(graph, nodeIds);
  return { path };
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
