# 3D Building Viewer

一个3D建筑查看器项目集，包含多个版本和技术演进。

## 项目结构

```
3d-building-viewer/
├── main/               # 旧版 non-OOP (Three.js 7.1 + Bootstrap 2.3.2)
├── oop/                # 旧版 OOP 重构
├── indoor-nav-3d/      # ✨ 新版 - React + Three.js 全栈版本
└── index.html          # 项目导航页
```

## 子项目

### indoor-nav-3d (推荐使用)

现代化重写的3D室内导航系统，支持跨楼层路径规划、环境监测。

**技术栈:** React 18, Three.js, TypeScript, Vite, Express, Prisma, SQLite

**特性:**
- 3D 建筑楼层渲染
- A* 跨楼层导航
- 环境监测展示 (温度、湿度等)
- 建筑/楼层/导航节点编辑

**快速开始:**

```cmd
cd indoor-nav-3d
setup.bat
dev.bat
```

访问 http://localhost:5173 (Viewer) 或 http://localhost:5174 (Editor)

**文档:** [indoor-nav-3d/README.md](indoor-nav-3d/README.md)

---

### main / oop (遗留版本)

早期版本，使用 Three.js 7.1 和 Bootstrap 2.3.2。

- `main/index.html` - non-OOP 版本
- `oop/index.html` - OOP 重构版本

**在线演示:** https://hbnnwwt.github.io/3d-building-viewer/

## 第三方库

- [bootstrap-table](https://github.com/wenzhixin/bootstrap-table/)
- [jQuery.AutoComplete](https://github.com/nswish/jQuery.AutoComplete)
- [bootstrap-menu](https://github.com/wenzhixin/bootstrap-menu/)

## License

MIT