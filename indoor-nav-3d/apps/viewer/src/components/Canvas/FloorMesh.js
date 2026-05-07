import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import * as THREE from 'three';
// Three.js doesn't support CSS variables - use actual hex colors
const NODE_COLORS = {
    walkable: 0x3b82f6, // blue
    entrance: 0x22c55e, // green
    exit: 0xef4444, // red
    elevator: 0xf59e0b, // amber
    stair: 0x8b5cf6, // purple
};
const FLOOR_COLOR = 0xe5e7eb; // var(--color-border) = #e5e7eb
const EDGE_COLOR = 0x6b7280; // var(--color-text-muted) = #6b7280
const BRAND_COLOR = 0x007bff; // var(--color-primary) = #007bff
const SELECTED_COLOR = 0xef4444; // var(--color-node-exit) = #ef4444
export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }) {
    const { width, depth } = floor.geometry || { width: 100, depth: 100 };
    const floorGeometry = useMemo(() => {
        return new THREE.BoxGeometry(width, 0.2, depth);
    }, [width, depth]);
    return (_jsxs("group", { position: [0, yOffset, 0], children: [_jsx("mesh", { geometry: floorGeometry, position: [0, 0, 0], children: _jsx("meshStandardMaterial", { color: FLOOR_COLOR }) }), _jsxs("lineSegments", { children: [_jsx("edgesGeometry", { args: [floorGeometry] }), _jsx("lineBasicMaterial", { color: EDGE_COLOR })] }), floor.brands?.map(brand => (_jsxs("mesh", { position: [brand.position.x, brand.position.y + 1, brand.position.z], children: [_jsx("boxGeometry", { args: [brand.size.width, brand.size.height, brand.size.depth] }), _jsx("meshStandardMaterial", { color: BRAND_COLOR })] }, brand.id))), floor.navigationMesh?.map(node => (_jsxs("mesh", { position: [node.position.x, node.position.y, node.position.z], onClick: (e) => {
                    e.stopPropagation();
                    onNodeClick?.(node);
                }, children: [_jsx("sphereGeometry", { args: [0.8, 16, 16] }), _jsx("meshStandardMaterial", { color: selectedNodeId === node.id ? SELECTED_COLOR : (NODE_COLORS[node.type] || EDGE_COLOR) })] }, node.id)))] }));
}
