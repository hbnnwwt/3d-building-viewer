# 3D Indoor Navigation System

室内3D导航与建筑监测系统。支持跨楼层路径规划、环境监测数据展示。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 (Viewer) | React 18, Three.js, TypeScript, Vite |
| 前端 (Editor) | React 18, Three.js, TypeScript, Vite |
| 架构 | Monorepo (pnpm workspace) |

## 项目结构

```
indoor-nav-3d/
├── apps/
│   ├── viewer/         # 3D 查看器 - 加载静态JSON数据
│   └── editor/        # 3D 编辑器 - 本地使用，支持导入/导出JSON
├── packages/
│   └── shared/         # 共享类型定义和A*寻路算法
├── public/
│   └── data/           # 静态JSON数据文件
├── dev.bat            # 启动服务
└── setup.bat          # 初始化安装
```

## 快速开始

### Windows

```cmd
cd indoor-nav-3d
setup.bat          # 首次安装依赖
dev.bat           # 启动服务
```

### Linux/Mac

```bash
cd indoor-nav-3d
chmod +x *.sh
./setup.sh
./dev.sh
```

## 服务地址

| 服务 | 地址 |
|------|------|
| Viewer | http://localhost:5173 |
| Editor | http://localhost:5174 |

## 功能

### Viewer (查看器)
- 3D 建筑楼层渲染
- 跨楼层导航路径规划 (A* 算法)
- 导航路径 3D 可视化
- 环境监测数据展示 (温度、湿度等)
- 加载静态 JSON 数据，无需服务器

### Editor (编辑器)
- 建筑增删改查
- 楼层管理 (名称、尺寸、高度)
- 导航节点编辑 (添加、删除、类型切换)
- 节点连接管理
- **导入/导出 JSON** - 数据保存在本地，可导出分享

## 数据文件

Viewer 使用 `apps/viewer/public/data/buildings.json` 作为数据源。

Editor 支持：
- 从 JSON 文件导入建筑数据
- 导出建筑数据为 JSON 文件
- 自动保存到浏览器 localStorage

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## License

MIT