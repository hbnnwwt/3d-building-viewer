export interface Building {
  id: string;
  name: string;
  info: string;
  floors: Floor[];
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  order: number;
  geometry: FloorGeometry;
  navigationMesh: NavigationNode[];
  brands: Brand[];
  createdAt: string;
  updatedAt: string;
}

export interface FloorGeometry {
  width: number;
  depth: number;
  floorHeight: number;
  modelUrl?: string;
}

export interface Brand {
  id: string;
  floorId: string;
  name: string;
  position: Position3D;
  size: Size3D;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Size3D {
  width: number;
  depth: number;
  height: number;
}

export interface NavigationNode {
  id: string;
  floorId: string;
  position: Position3D;
  type: 'walkable' | 'elevator' | 'stair' | 'entrance' | 'exit';
  connections: string[];
}

export interface NavigationEdge {
  from: string;
  to: string;
  weight: number;
}

export interface NavigationGraph {
  buildingId: string;
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export interface Monitor {
  id: string;
  buildingId: string;
  floorId: string;
  type: 'temperature' | 'humidity' | 'airQuality' | 'noise';
  value: number;
  unit: string;
  position: Position3D;
  lastUpdate: string;
}

export interface NavigationRequest {
  buildingId: string;
  from: { floorId: string; position: Position3D };
  to: { floorId: string; position: Position3D };
}

export interface NavigationResponse {
  path: NavigationStep[];
  totalDistance: number;
}

export interface NavigationStep {
  floorId: string;
  points: Position3D[];
  action?: 'walk' | 'takeElevator' | 'takeStair' | 'enter' | 'exit';
}