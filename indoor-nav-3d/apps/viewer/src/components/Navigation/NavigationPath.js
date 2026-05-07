import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
export default function NavigationPath({ path, visible }) {
    // Create line geometry from path points
    const points = useMemo(() => {
        if (!visible || path.length === 0)
            return [];
        const result = [];
        for (const step of path) {
            for (const point of step.points) {
                result.push([point.x, point.y, point.z]);
            }
        }
        return result;
    }, [path, visible]);
    if (!visible || points.length < 2)
        return null;
    return (_jsxs("group", { children: [_jsx(Line, { points: points, color: "#007bff", lineWidth: 3 }), path[0]?.points[0] && (_jsxs("mesh", { position: [
                    path[0].points[0].x,
                    path[0].points[0].y + 0.5,
                    path[0].points[0].z
                ], children: [_jsx("sphereGeometry", { args: [0.5, 16, 16] }), _jsx("meshStandardMaterial", { color: "#00ff00" })] })), path[path.length - 1]?.points.slice(-1)[0] && (_jsxs("mesh", { position: [
                    path[path.length - 1].points.slice(-1)[0].x,
                    path[path.length - 1].points.slice(-1)[0].y + 0.5,
                    path[path.length - 1].points.slice(-1)[0].z
                ], children: [_jsx("sphereGeometry", { args: [0.5, 16, 16] }), _jsx("meshStandardMaterial", { color: "#ff0000" })] }))] }));
}
