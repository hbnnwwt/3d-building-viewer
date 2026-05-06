# 3D Indoor Navigation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的3D室内导航和建筑监测系统，包含Viewer查看器、Editor编辑器和Node.js后端

**Architecture:** Monorepo结构，使用pnpm workspace管理三个子项目：server(Express+Prisma+SQLite)、apps/viewer、apps/editor。共享类型定义在packages/shared中。

**Tech Stack:** React 18, Three.js, TypeScript, Vite, Express, Prisma, SQLite, pnpm

---

## File Structure

```
indoor-nav-3d/
├── apps/
│   ├── viewer/         # React + Three.js 前端
│   └── editor/         # React + Three.js 前端
├── packages/
│   └── shared/         # 共享类型定义 (@indoor-nav/shared)
├── server/             # Node.js + Express + Prisma
├── package.json       # Workspace根配置
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Phase 1: Monorepo 初始化

### Task 1: 创建项目结构和根配置

**Files:**
- Create: `indoor-nav-3d/package.json`
- Create: `indoor-nav-3d/pnpm-workspace.yaml`
- Create: `indoor-nav-3d/turbo.json`
- Create: `indoor-nav-3d/tsconfig.base.json`

- [ ] **Step 1: 创建 indoor-nav-3d 目录**

```bash
mkdir -p indoor-nav-3d
```

- [ ] **Step 2: 创建 package.json (workspace根)**

```json
{
  "name": "indoor-nav-3d",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'server'
```

- [ ] **Step 4: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {}
  }
}
```

- [ ] **Step 5: 创建 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  }
}
```

- [ ] **Step 6: Commit**

```bash
cd indoor-nav-3d && git init && git add . && git commit -m "feat: initialize monorepo structure"
```

---

### Task 2: 创建 packages/shared 共享类型

**Files:**
- Create: `indoor-nav-3d/packages/shared/package.json`
- Create: `indoor-nav-3d/packages/shared/tsconfig.json`
- Create: `indoor-nav-3d/packages/shared/src/index.ts`
- Create: `indoor-nav-3d/packages/shared/src/types.ts`

- [ ] **Step 1: 创建 shared 包结构**

```bash
mkdir -p indoor-nav-3d/packages/shared/src
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "@indoor-nav/shared",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 3: 创建 types.ts - 核心类型定义**

```typescript
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
  createdAt: string;
  updatedAt: string;
}

export interface FloorGeometry {
  width: number;
  depth: number;
  floorHeight: number;
  modelUrl?: string; // optional OBJ/GLTF model
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
  connections: string[]; // node IDs
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
```

- [ ] **Step 4: 创建 index.ts**

```typescript
export * from './types';
```

- [ ] **Step 5: Commit**

```bash
cd indoor-nav-3d && git add packages/shared && git commit -m "feat(shared): add core TypeScript types"
```

---

### Task 3: 创建 server 后端

**Files:**
- Create: `indoor-nav-3d/server/package.json`
- Create: `indoor-nav-3d/server/tsconfig.json`
- Create: `indoor-nav-3d/server/prisma/schema.prisma`
- Create: `indoor-nav-3d/server/src/index.ts`
- Create: `indoor-nav-3d/server/src/routes/buildings.ts`
- Create: `indoor-nav-3d/server/src/routes/navigation.ts`
- Create: `indoor-nav-3d/server/src/routes/monitors.ts`
- Create: `indoor-nav-3d/server/src/services/buildingService.ts`
- Create: `indoor-nav-3d/server/src/services/navigationService.ts`

- [ ] **Step 1: 创建 server 包结构**

```bash
mkdir -p indoor-nav-3d/server/prisma
mkdir -p indoor-nav-3d/server/src/routes
mkdir -p indoor-nav-3d/server/src/services
```

- [ ] **Step 2: 创建 server/package.json**

```json
{
  "name": "@indoor-nav/server",
  "version": "0.1.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@indoor-nav/shared": "workspace:*",
    "@prisma/client": "^5.14.0",
    "cors": "^2.8.5",
    "express": "^4.19.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.0",
    "prisma": "^5.14.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*", "prisma/**/*"]
}
```

- [ ] **Step 4: 创建 prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Building {
  id        String   @id @default(cuid())
  name      String
  info      String   @default("")
  floors    Floor[]
  monitors  Monitor[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Floor {
  id           String   @id @default(cuid())
  buildingId   String
  building     Building @relation(fields: [buildingId], references: [id], onDelete: Cascade)
  name         String
  order        Int
  width        Float    @default(100)
  depth        Float    @default(100)
  floorHeight  Float    @default(3)
  modelUrl     String?
  brands       Brand[]
  navigationNodes NavigationNode[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Brand {
  id       String @id @default(cuid())
  floorId  String
  floor    Floor  @relation(fields: [floorId], references: [id], onDelete: Cascade)
  name     String
  posX     Float
  posY     Float
  posZ     Float
  width    Float  @default(5)
  depth    Float  @default(5)
  height   Float  @default(3)
}

model NavigationNode {
  id         String   @id @default(cuid())
  floorId    String
  floor      Floor    @relation(fields: [floorId], references: [id], onDelete: Cascade)
  posX       Float
  posY       Float
  posZ       Float
  nodeType   String   @default("walkable") // walkable, elevator, stair, entrance, exit
  connections String  @default("[]") // JSON array of node IDs
}

model Monitor {
  id         String   @id @default(cuid())
  buildingId String
  building   Building @relation(fields: [buildingId], references: [id], onDelete: Cascade)
  floorId    String
  monitorType String
  value      Float
  unit       String
  posX       Float
  posY       Float
  posZ       Float
  lastUpdate DateTime @default(now())
}
```

- [ ] **Step 5: 创建 src/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import { buildingsRouter } from './routes/buildings.js';
import { navigationRouter } from './routes/navigation.js';
import { monitorsRouter } from './routes/monitors.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/buildings', buildingsRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/monitors', monitorsRouter);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 6: 创建 src/routes/buildings.ts**

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const buildingsRouter = Router();

buildingsRouter.get('/', async (_, res) => {
  const buildings = await prisma.building.findMany({
    include: { floors: { orderBy: { order: 'asc' } } }
  });
  res.json(buildings);
});

buildingsRouter.post('/', async (req, res) => {
  const { name, info } = req.body;
  const building = await prisma.building.create({
    data: { name, info: info || '' }
  });
  res.json(building);
});

buildingsRouter.get('/:id', async (req, res) => {
  const building = await prisma.building.findUnique({
    where: { id: req.params.id },
    include: {
      floors: {
        orderBy: { order: 'asc' },
        include: {
          brands: true,
          navigationNodes: true
        }
      }
    }
  });
  if (!building) return res.status(404).json({ error: 'Not found' });
  res.json(building);
});

buildingsRouter.put('/:id', async (req, res) => {
  const { name, info } = req.body;
  const building = await prisma.building.update({
    where: { id: req.params.id },
    data: { name, info }
  });
  res.json(building);
});

buildingsRouter.delete('/:id', async (req, res) => {
  await prisma.building.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

buildingsRouter.post('/:id/floors', async (req, res) => {
  const { name, order, width, depth, floorHeight } = req.body;
  const floor = await prisma.floor.create({
    data: {
      buildingId: req.params.id,
      name,
      order: order || 0,
      width: width || 100,
      depth: depth || 100,
      floorHeight: floorHeight || 3
    }
  });
  res.json(floor);
});
```

- [ ] **Step 7: 创建 src/routes/navigation.ts**

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const navigationRouter = Router();

navigationRouter.get('/:buildingId', async (req, res) => {
  const floors = await prisma.floor.findMany({
    where: { buildingId: req.params.buildingId },
    include: { navigationNodes: true }
  });
  res.json({ buildingId: req.params.buildingId, floors });
});

navigationRouter.put('/:buildingId', async (req, res) => {
  const { floorId, nodes } = req.body;
  // Replace all navigation nodes for a floor
  await prisma.navigationNode.deleteMany({ where: { floorId } });
  if (nodes && nodes.length > 0) {
    await prisma.navigationNode.createMany({
      data: nodes.map((n: any) => ({
        floorId,
        posX: n.position.x,
        posY: n.position.y,
        posZ: n.position.z,
        nodeType: n.type,
        connections: JSON.stringify(n.connections || [])
      }))
    });
  }
  res.json({ success: true });
});
```

- [ ] **Step 8: 创建 src/routes/monitors.ts**

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const monitorsRouter = Router();

monitorsRouter.get('/:buildingId', async (req, res) => {
  const monitors = await prisma.monitor.findMany({
    where: { buildingId: req.params.buildingId }
  });
  res.json(monitors);
});

monitorsRouter.post('/', async (req, res) => {
  const { buildingId, floorId, type, value, unit, posX, posY, posZ } = req.body;
  const monitor = await prisma.monitor.create({
    data: {
      buildingId,
      floorId,
      monitorType: type,
      value,
      unit,
      posX,
      posY,
      posZ
    }
  });
  res.json(monitor);
});
```

- [ ] **Step 9: Commit**

```bash
cd indoor-nav-3d && git add server && git commit -m "feat(server): add Express + Prisma backend with building/navigation/monitor APIs"
```

---

### Task 4: 创建 apps/viewer 前端

**Files:**
- Create: `indoor-nav-3d/apps/viewer/package.json`
- Create: `indoor-nav-3d/apps/viewer/tsconfig.json`
- Create: `indoor-nav-3d/apps/viewer/vite.config.ts`
- Create: `indoor-nav-3d/apps/viewer/index.html`
- Create: `indoor-nav-3d/apps/viewer/src/main.tsx`
- Create: `indoor-nav-3d/apps/viewer/src/App.tsx`
- Create: `indoor-nav-3d/apps/viewer/src/components/Canvas/BuildingCanvas.tsx`
- Create: `indoor-nav-3d/apps/viewer/src/components/UI/NavigationPanel.tsx`
- Create: `indoor-nav-3d/apps/viewer/src/components/UI/MonitorPanel.tsx`
- Create: `indoor-nav-3d/apps/viewer/src/hooks/useBuilding.ts`
- Create: `indoor-nav-3d/apps/viewer/src/hooks/useNavigation.ts`

- [ ] **Step 1: 创建 viewer 包结构**

```bash
mkdir -p indoor-nav-3d/apps/viewer/src/{components/Canvas,components/UI,hooks}
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "@indoor-nav/viewer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@indoor-nav/shared": "workspace:*",
    "@react-three/drei": "^9.102.0",
    "@react-three/fiber": "^8.16.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.164.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.164.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "ESNext"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>3D Indoor Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: 创建 src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 7: 创建 src/App.tsx**

```typescript
import { useState } from 'react';
import BuildingCanvas from './components/Canvas/BuildingCanvas';
import NavigationPanel from './components/UI/NavigationPanel';
import MonitorPanel from './components/UI/MonitorPanel';
import { Building } from '@indoor-nav/shared';

export default function App() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showMonitorPanel, setShowMonitorPanel] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <BuildingCanvas building={selectedBuilding} />

      <div style={{
        position: 'absolute', top: 16, left: 16,
        display: 'flex', gap: 8
      }}>
        <button onClick={() => setShowNavPanel(!showNavPanel)}>
          导航
        </button>
        <button onClick={() => setShowMonitorPanel(!showMonitorPanel)}>
          监测
        </button>
      </div>

      {showNavPanel && selectedBuilding && (
        <NavigationPanel
          building={selectedBuilding}
          onClose={() => setShowNavPanel(false)}
        />
      )}

      {showMonitorPanel && selectedBuilding && (
        <MonitorPanel
          buildingId={selectedBuilding.id}
          onClose={() => setShowMonitorPanel(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 8: 创建 src/components/Canvas/BuildingCanvas.tsx**

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building } from '@indoor-nav/shared';
import FloorMesh from './FloorMesh';

interface Props {
  building: Building | null;
}

export default function BuildingCanvas({ building }: Props) {
  if (!building) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        请选择一个建筑
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {building.floors.map((floor, i) => (
        <FloorMesh key={floor.id} floor={floor} yOffset={i * (floor.floorHeight || 3)} />
      ))}
      <OrbitControls enableDamping />
    </Canvas>
  );
}
```

- [ ] **Step 9: 创建 src/components/Canvas/FloorMesh.tsx**

```typescript
import { Floor } from '@indoor-nav/shared';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  floor: Floor;
  yOffset: number;
}

export default function FloorMesh({ floor, yOffset }: Props) {
  const { width, depth, floorHeight } = floor.geometry || { width: 100, depth: 100, floorHeight: 3 };

  const floorGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, 0.2, depth);
  }, [width, depth]);

  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={floorGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[floorGeometry]} />
        <lineBasicMaterial color="#999" />
      </lineSegments>
      {floor.brands?.map(brand => (
        <mesh
          key={brand.id}
          position={[brand.position.x, brand.position.y + 1, brand.position.z]}
        >
          <boxGeometry args={[brand.size.width, brand.size.height, brand.size.depth]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 10: 创建 src/components/UI/NavigationPanel.tsx**

```typescript
import { useState } from 'react';
import { Building } from '@indoor-nav/shared';

interface Props {
  building: Building;
  onClose: () => void;
}

export default function NavigationPanel({ building, onClose }: Props) {
  const [fromFloor, setFromFloor] = useState(building.floors[0]?.id || '');
  const [toFloor, setToFloor] = useState(building.floors[1]?.id || '');

  const handleNavigate = () => {
    console.log('Navigate from', fromFloor, 'to', toFloor);
  };

  return (
    <div style={{
      position: 'absolute', right: 16, top: 16, width: 280,
      background: 'white', borderRadius: 8, padding: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>室内导航</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>起始楼层</label>
        <select value={fromFloor} onChange={e => setFromFloor(e.target.value)} style={{ width: '100%', padding: 8 }}>
          {building.floors.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>目标楼层</label>
        <select value={toFloor} onChange={e => setToFloor(e.target.value)} style={{ width: '100%', padding: 8 }}>
          {building.floors.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleNavigate} style={{ width: '100%', padding: 12, background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
        查询路线
      </button>
    </div>
  );
}
```

- [ ] **Step 11: 创建 src/components/UI/MonitorPanel.tsx**

```typescript
import { useEffect, useState } from 'react';
import { Monitor } from '@indoor-nav/shared';

interface Props {
  buildingId: string;
  onClose: () => void;
}

export default function MonitorPanel({ buildingId, onClose }: Props) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/monitors/${buildingId}`)
      .then(r => r.json())
      .then(data => { setMonitors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [buildingId]);

  return (
    <div style={{
      position: 'absolute', left: 16, top: 16, width: 260,
      background: 'white', borderRadius: 8, padding: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>环境监测</h3>
        <button onClick={onClose}>×</button>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : monitors.length === 0 ? (
        <p style={{ color: '#666' }}>暂无监测数据</p>
      ) : (
        <div>
          {monitors.map(m => (
            <div key={m.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold' }}>{m.type === 'temperature' ? '温度' : m.type}</div>
              <div style={{ fontSize: 24, color: '#007bff' }}>{m.value} {m.unit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 12: 创建 src/hooks/useBuilding.ts**

```typescript
import { useState, useEffect } from 'react';
import { Building } from '@indoor-nav/shared';

export function useBuilding(buildingId: string | null) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    fetch(`/api/buildings/${buildingId}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(data => { setBuilding(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [buildingId]);

  return { building, loading, error };
}

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/buildings')
      .then(r => r.json())
      .then(data => { setBuildings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { buildings, loading };
}
```

- [ ] **Step 13: 创建 src/hooks/useNavigation.ts**

```typescript
import { useState, useCallback } from 'react';
import { NavigationGraph, NavigationResponse } from '@indoor-nav/shared';

export function useNavigation() {
  const [result, setResult] = useState<NavigationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePath = useCallback(async (buildingId: string, from: any, to: any) => {
    setLoading(true);
    try {
      // A* pathfinding will be implemented here
      // For now, return a placeholder
      setResult({ path: [], totalDistance: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, calculatePath };
}
```

- [ ] **Step 14: Commit**

```bash
cd indoor-nav-3d && git add apps/viewer && git commit -m "feat(viewer): add React + Three.js viewer app with basic 3D canvas and UI panels"
```

---

### Task 5: 创建 apps/editor 前端（简化版，待后续扩展）

**Files:**
- Create: `indoor-nav-3d/apps/editor/package.json`
- Create: `indoor-nav-3d/apps/editor/tsconfig.json`
- Create: `indoor-nav-3d/apps/editor/vite.config.ts`
- Create: `indoor-nav-3d/apps/editor/index.html`
- Create: `indoor-nav-3d/apps/editor/src/main.tsx`
- Create: `indoor-nav-3d/apps/editor/src/App.tsx`

- [ ] **Step 1: 创建 editor 包结构**

```bash
mkdir -p indoor-nav-3d/apps/editor/src
```

- [ ] **Step 2: 创建 package.json (复用viewer配置)**

```json
{
  "name": "@indoor-nav/editor",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@indoor-nav/shared": "workspace:*",
    "@react-three/drei": "^9.102.0",
    "@react-three/fiber": "^8.16.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.164.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.164.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json, vite.config.ts, index.html** (复制viewer配置)

- [ ] **Step 4: 创建 src/main.tsx** (复制viewer结构)

- [ ] **Step 5: 创建 src/App.tsx** (基础编辑界面，待扩展)

```typescript
export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>3D Building Editor</h1>
      <p>建筑编辑器 - 待实现</p>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd indoor-nav-3d && git add apps/editor && git commit -m "feat(editor): add editor app scaffold"
```

---

## Phase 2: 核心功能实现（后续迭代）

> Phase 2 的具体任务将在 Phase 1 完成后详细定义。以下为初步规划：

### Task 6: A* 寻路算法实现

**Files:**
- Create: `indoor-nav-3d/packages/shared/src/pathfinding.ts`

**概述：** 在 `packages/shared` 中实现 A* 寻路算法，供 viewer 和 editor 共用。

**待实现内容：**
- `findPath(graph: NavigationGraph, from: string, to: string): NavigationStep[]`
- 支持同楼层寻路
- 支持跨楼层寻路（通过 elevator/stair 节点中转）
- 返回路径点和总距离

### Task 7: 3D导航路径可视化

**待实现内容：**
- 在 Three.js 场景中渲染导航路径线
- 高亮起点、终点
- 显示路径指示

### Task 8: 编辑器楼层管理UI

**待实现内容：**
- 楼层增删改查
- 楼层拖拽排序
- 楼层高度/尺寸编辑

### Task 9: 编辑器导航点编辑

**待实现内容：**
- 可视化添加/删除/移动导航节点
- 节点类型切换（walkable/elevator/stair）
- 连接线编辑

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-3d-indoor-nav-implementation-plan.md`**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**