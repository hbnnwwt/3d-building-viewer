import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import * as THREE from 'three';
const NODE_COLORS = {
    walkable: 'var(--color-node-walkable)',
    entrance: 'var(--color-node-entrance)',
    exit: 'var(--color-node-exit)',
    elevator: 'var(--color-node-elevator)',
    stair: 'var(--color-node-stair)',
};
export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }) {
    const { width, depth } = floor.geometry || { width: 100, depth: 100 };
    const floorGeometry = useMemo(() => {
        return new THREE.BoxGeometry(width, 0.2, depth);
    }, [width, depth]);
    return (_jsxs("group", { position: [0, yOffset, 0], children: [_jsx("mesh", { geometry: floorGeometry, position: [0, 0, 0], children: _jsx("meshStandardMaterial", { color: "var(--color-border)" }) }), _jsxs("lineSegments", { children: [_jsx("edgesGeometry", { args: [floorGeometry] }), _jsx("lineBasicMaterial", { color: "var(--color-text-muted)" })] }), floor.brands?.map(brand => (_jsxs("mesh", { position: [brand.position.x, brand.position.y + 1, brand.position.z], children: [_jsx("boxGeometry", { args: [brand.size.width, brand.size.height, brand.size.depth] }), _jsx("meshStandardMaterial", { color: "var(--color-primary)" })] }, brand.id))), floor.navigationMesh?.map(node => (_jsxs("mesh", { position: [node.position.x, node.position.y, node.position.z], onClick: (e) => {
                    e.stopPropagation();
                    onNodeClick?.(node);
                }, children: [_jsx("sphereGeometry", { args: [0.8, 16, 16] }), _jsx("meshStandardMaterial", { color: selectedNodeId === node.id ? 'var(--color-node-exit)' : (NODE_COLORS[node.type] || 'var(--color-text-muted)') })] }, node.id)))] }));
}
