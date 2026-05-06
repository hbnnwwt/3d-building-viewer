# 3D Indoor Navigation & Monitoring System

**Date:** 2026-05-07  
**Status:** Draft

## Overview

A full-stack 3D indoor navigation and building monitoring system. Supports cross-floor pathfinding, environmental monitoring (temperature, humidity), and building data management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Monorepo                             │
│                   indoor-nav-3d                         │
├─────────────────────────────────────────────────────────┤
│  apps/                                                  │
│  ├── viewer/     React + Three.js + TypeScript + Vite  │
│  └── editor/     React + Three.js + TypeScript + Vite  │
├─────────────────────────────────────────────────────────┤
│  packages/                                              │
│  └── shared/     Shared TypeScript types                │
├─────────────────────────────────────────────────────────┤
│  server/                                               │
│  ├── Express + TypeScript                              │
│  ├── Prisma ORM                                        │
│  └── SQLite database                                   │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend (Viewer) | React 18, Three.js, TypeScript, Vite |
| Frontend (Editor) | React 18, Three.js, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite |
| ORM | Prisma |

## Core Features

### Viewer
- 3D building/floor rendering with Three.js
- Cross-floor navigation with A* pathfinding
- Navigation path visualization
- Environmental monitoring display (temperature, humidity) - interface only
- Touch-friendly interaction

### Editor
- Building data CRUD (create, read, update, delete)
- Floor management
- Navigation point editing
- Sensor configuration (interface only, data collection not implemented)

## Data Model

### Building
```
- id: string
- name: string
- info: string
- floors: Floor[]
```

### Floor
```
- id: string
- buildingId: string
- name: string
- order: number
- geometry: FloorGeometry
- brands: Brand[]
- navigationMesh: NavigationNode[]
```

### Navigation
```
- buildingId: string
- nodes: NavigationNode[]
- edges: NavigationEdge[]  // connections between nodes
```

### Monitor (Interface Only)
```
- id: string
- buildingId: string
- type: 'temperature' | 'humidity' | ...
- value: number
- unit: string
- location: { floorId, position }
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/buildings | List all buildings |
| POST | /api/buildings | Create building |
| GET | /api/buildings/:id | Get building by ID |
| PUT | /api/buildings/:id | Update building |
| DELETE | /api/buildings/:id | Delete building |
| GET | /api/buildings/:id/floors | Get floors for building |
| POST | /api/buildings/:id/floors | Create floor |
| GET | /api/navigation/:buildingId | Get navigation graph |
| PUT | /api/navigation/:buildingId | Update navigation graph |
| GET | /api/monitors/:buildingId | Get monitor data |

## Project Structure

```
indoor-nav-3d/
├── apps/
│   ├── viewer/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Canvas/
│   │   │   │   ├── Building/
│   │   │   │   ├── Navigation/
│   │   │   │   └── Monitor/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── App.tsx
│   │   └── package.json
│   └── editor/
│       └── (similar structure)
├── packages/
│   └── shared/
│       └── types/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── package.json
└── turbo.json
```

## Navigation Algorithm

- **Single floor**: A* grid-based pathfinding
- **Cross floor**: Predefined elevator/stair nodes, switch floor at transition points
- **Data structure**: Navigation Mesh or Grid Graph

## Open Issues

None currently.