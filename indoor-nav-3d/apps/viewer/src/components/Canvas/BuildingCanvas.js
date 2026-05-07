import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FloorMesh from './FloorMesh';
import NavigationPath from '../Navigation/NavigationPath';
export default function BuildingCanvas({ building, navigationPath, showPath, onNodeClick, selectedNodeId }) {
    if (!building) {
        return (_jsx("div", { style: { width: '100%', height: '100%', background: 'var(--color-bg-3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }, children: "\u8BF7\u9009\u62E9\u4E00\u4E2A\u5EFA\u7B51" }));
    }
    return (_jsxs(Canvas, { camera: { position: [50, 50, 50], fov: 60 }, children: [_jsx("ambientLight", {}), _jsx("pointLight", { position: [10, 10, 10] }), building.floors.map((floor, i) => (_jsx(FloorMesh, { floor: floor, yOffset: i * (floor.geometry?.floorHeight || 3), onNodeClick: onNodeClick, selectedNodeId: selectedNodeId }, floor.id))), _jsx(NavigationPath, { path: navigationPath || [], visible: showPath || false }), _jsx(OrbitControls, { enableDamping: true })] }));
}
