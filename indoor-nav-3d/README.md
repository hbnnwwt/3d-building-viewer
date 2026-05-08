# 3D Indoor Navigation System

室内3D导航与建筑监测系统。支持跨楼层路径规划、环境监测数据展示。

## 技术架构

```
indoor-nav-3d/
├── apps/
│   ├── viewer/          # 3D 查看器（React + Three.js）
│   │   └── public/data/ # 静态 JSON 数据源
│   └── editor/          # 3D 编辑器（React + Three.js）
├── packages/
│   └── shared/          # 共享类型 + A* 寻路算法
├── scripts/             # 数据生成脚本
├── dev.bat / setup.bat  # Windows 启动脚本
└── turbo.json           # Turborepo 配置
```

| 层级 | 技术 |
|------|------|
| UI 框架 | React 18, TypeScript |
| 3D 渲染 | Three.js, @react-three/fiber, @react-three/drei |
| 寻路算法 | A* (MinHeap 优先队列), 支持跨楼层路由 |
| 构建 | Vite, Turborepo |
| 包管理 | pnpm workspace (monorepo) |
| 部署 | GitHub Pages (纯静态, 无需服务器) |

## 快速开始

### Windows

```cmd
cd indoor-nav-3d
setup.bat          # 首次安装依赖
dev.bat            # 启动 Viewer + Editor
```

### Linux / Mac

```bash
cd indoor-nav-3d
pnpm install
pnpm dev
```

## 服务地址

| 服务 | 地址 |
|------|------|
| Viewer | http://localhost:5173 |
| Editor | http://localhost:5174 |

## 功能

### Viewer（查看器）
- 3D 建筑楼层渲染，楼层切换显示
- 跨楼层导航路径规划（A* 全局寻路，自动经过中间楼层）
- 点击导航模式：选择起点终点，实时显示路径
- 面板导航模式：选择起止楼层，自动规划路径
- 环境监测数据展示（温度、湿度、空气质量、噪声）
- 加载静态 JSON 数据，纯前端无需后端

### Editor（编辑器）
- 建筑 / 楼层增删改查
- 导航节点编辑（添加、删除、类型切换：walkable / elevator / stair / entrance / exit）
- 节点连接管理（手动连接、自动连接、断开全部）
- 导入 / 导出 JSON 数据
- 自动保存到浏览器 localStorage

## 数据流

```
Editor 编辑 → 导出 buildings.json → 放入 viewer/public/data/ → Viewer 加载渲染
```

Editor 导出 JSON 后，将文件放到 `apps/viewer/public/data/` 目录，Viewer 即可加载。

## 开发

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动所有服务
pnpm build         # 构建生产版本
```

## License

MIT
