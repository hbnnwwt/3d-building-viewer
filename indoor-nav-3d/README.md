# 3D Indoor Navigation System

室内3D导航与建筑监测系统。支持跨楼层路径规划、环境监测数据展示。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 (Viewer) | React 18, Three.js, TypeScript, Vite |
| 前端 (Editor) | React 18, Three.js, TypeScript, Vite |
| 后端 | Node.js, Express, TypeScript |
| 数据库 | SQLite (Prisma ORM) |
| 架构 | Monorepo (pnpm workspace + turbo) |

## 项目结构

```
indoor-nav-3d/
├── apps/
│   ├── viewer/         # 3D 查看器 - 浏览建筑、导航、监测
│   └── editor/        # 3D 编辑器 - 管理建筑、楼层、导航点
├── packages/
│   └── shared/         # 共享类型定义
├── server/             # Express API 服务
├── dev.bat            # 启动全部服务
└── setup.bat          # 初始化安装
```

## 快速开始

### Windows

```cmd
cd indoor-nav-3d
setup.bat          # 首次安装依赖
dev.bat           # 启动全部服务
```

### Linux/Mac

```bash
cd indoor-nav-3d
chmod +x *.sh
./setup.sh        # 首次安装依赖
./dev.sh         # 启动全部服务
```

## 服务地址

| 服务 | 地址 |
|------|------|
| Viewer | http://localhost:5173 |
| Editor | http://localhost:5174 |
| API | http://localhost:3001 |

## 功能

### Viewer (查看器)
- 3D 建筑楼层渲染
- 跨楼层导航路径规划 (A* 算法)
- 导航路径 3D 可视化
- 环境监测数据展示 (温度、湿度等)

### Editor (编辑器)
- 建筑增删改查
- 楼层管理 (名称、尺寸、高度)
- 导航节点编辑 (添加、删除、类型切换)
- 节点连接管理

## API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/buildings | 建筑列表 |
| POST | /api/buildings | 创建建筑 |
| GET | /api/buildings/:id | 获取建筑详情 |
| PUT | /api/buildings/:id | 更新建筑 |
| DELETE | /api/buildings/:id | 删除建筑 |
| POST | /api/buildings/:id/floors | 添加楼层 |
| GET | /api/navigation/:buildingId | 获取导航图 |
| PUT | /api/navigation/:buildingId | 更新导航图 |
| GET | /api/monitors/:buildingId | 获取监测数据 |
| GET | /api/health | 健康检查 |

## 开发

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
cd server && pnpm db:generate

# 推送数据库变更
cd server && pnpm db:push

# 启动开发服务器
pnpm dev
```

## License

MIT