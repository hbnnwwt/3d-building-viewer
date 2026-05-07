import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import BuildingCanvas from './components/Canvas/BuildingCanvas';
import NavigationPanel from './components/UI/NavigationPanel';
import MonitorPanel from './components/UI/MonitorPanel';
import { useBuildings } from './hooks/useBuilding';
import { findPath } from '@indoor-nav/shared';
export default function App() {
    const { buildings, loading, source } = useBuildings();
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [showNavPanel, setShowNavPanel] = useState(false);
    const [showMonitorPanel, setShowMonitorPanel] = useState(false);
    const [navigationPath, setNavigationPath] = useState([]);
    const [showPath, setShowPath] = useState(false);
    const [navMode, setNavMode] = useState(false);
    const [fromNode, setFromNode] = useState(null);
    const [toNode, setToNode] = useState(null);
    const [path, setPath] = useState([]);
    const handleNavigate = (fromFloorId, toFloorId) => {
        if (!selectedBuilding)
            return;
        const allNodes = selectedBuilding.floors.flatMap(f => f.navigationMesh || []);
        const edges = [];
        for (const node of allNodes) {
            for (const connId of node.connections) {
                edges.push({ from: node.id, to: connId, weight: 1 });
            }
        }
        const navigationGraph = {
            buildingId: selectedBuilding.id,
            nodes: allNodes,
            edges: edges.map(e => ({ from: e.from, to: e.to, weight: e.weight }))
        };
        const fromFloor = selectedBuilding.floors.find(f => f.id === fromFloorId);
        const toFloor = selectedBuilding.floors.find(f => f.id === toFloorId);
        if (!fromFloor || !toFloor)
            return;
        const fromNodeInFloor = fromFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'entrance');
        const toNodeInFloor = toFloor.navigationMesh?.find(n => n.type === 'walkable' || n.type === 'exit');
        if (!fromNodeInFloor || !toNodeInFloor)
            return;
        const result = findPath(navigationGraph, fromNodeInFloor.id, toNodeInFloor.id);
        setNavigationPath(result);
        setShowPath(true);
        setShowNavPanel(false);
    };
    const resetNavMode = () => {
        setNavMode(false);
        setFromNode(null);
        setToNode(null);
        setPath([]);
    };
    const handleNodeClick = (node) => {
        if (!fromNode) {
            setFromNode(node);
        }
        else if (!toNode && node.id !== fromNode.id) {
            setToNode(node);
            const allNodes = selectedBuilding.floors.flatMap(f => f.navigationMesh || []);
            const edges = [];
            for (const n of allNodes) {
                for (const connId of n.connections) {
                    edges.push({ from: n.id, to: connId, weight: 1 });
                }
            }
            const navGraph = { buildingId: selectedBuilding.id, nodes: allNodes, edges };
            const result = findPath(navGraph, fromNode.id, node.id);
            setPath(result);
        }
    };
    if (loading) {
        return (_jsxs("div", { style: {
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-bg-3d)', color: 'white', gap: 'var(--spacing-md)'
            }, children: [_jsx("div", { className: "loading-spinner", style: { width: 40, height: 40 } }), _jsx("span", { style: { fontSize: 16 }, children: "\u52A0\u8F7D\u5EFA\u7B51\u6570\u636E..." })] }));
    }
    return (_jsxs("div", { style: { width: '100%', height: '100%', position: 'relative', background: 'var(--color-bg-3d)' }, children: [_jsx("a", { href: "#main-content", className: "skip-link", children: "\u8DF3\u8F6C\u5230\u4E3B\u8981\u5185\u5BB9" }), _jsx(BuildingCanvas, { building: selectedBuilding, navigationPath: navMode ? path : navigationPath, showPath: navMode ? path.length > 0 : showPath, onNodeClick: navMode ? handleNodeClick : undefined, selectedNodeId: navMode ? (fromNode && toNode ? toNode.id : fromNode ? fromNode.id : null) : null }), _jsxs("div", { id: "main-content", className: "building-selector", style: {
                    position: 'absolute', top: 16, left: 16, zIndex: 100,
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 200,
                    maxWidth: 280
                }, children: [_jsx("label", { style: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }, children: "\u9009\u62E9\u5EFA\u7B51" }), _jsxs("select", { value: selectedBuilding?.id || '', onChange: e => {
                            const b = buildings.find(b => b.id === e.target.value);
                            setSelectedBuilding(b || null);
                            setShowPath(false);
                            resetNavMode();
                        }, style: {
                            width: '100%', padding: '10px 12px',
                            fontSize: 15, border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface-elevated)',
                            cursor: 'pointer'
                        }, "aria-label": "\u9009\u62E9\u5EFA\u7B51", children: [_jsx("option", { value: "", children: "-- \u8BF7\u9009\u62E9\u5EFA\u7B51 --" }), buildings.map(b => (_jsx("option", { value: b.id, children: b.name }, b.id)))] })] }), selectedBuilding && (_jsxs("nav", { className: "nav-bottom-bar", style: {
                    position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 100,
                    display: 'flex', gap: 8, justifyContent: 'center'
                }, children: [_jsx("button", { onClick: () => setShowNavPanel(!showNavPanel), "aria-label": "\u6253\u5F00\u5BFC\u822A\u9762\u677F", "aria-pressed": showNavPanel, style: {
                            flex: 1, maxWidth: 120, padding: '14px 20px',
                            background: showNavPanel ? 'var(--color-primary-dark)' : 'var(--color-surface)',
                            color: showNavPanel ? 'white' : 'var(--color-text)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'all var(--transition-fast)'
                        }, children: "\uD83E\uDDED \u5BFC\u822A" }), _jsx("button", { onClick: () => setShowMonitorPanel(!showMonitorPanel), "aria-label": "\u6253\u5F00\u76D1\u6D4B\u9762\u677F", "aria-pressed": showMonitorPanel, style: {
                            flex: 1, maxWidth: 120, padding: '14px 20px',
                            background: showMonitorPanel ? 'var(--color-primary-dark)' : 'var(--color-surface)',
                            color: showMonitorPanel ? 'white' : 'var(--color-text)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'all var(--transition-fast)'
                        }, children: "\uD83D\uDCCA \u76D1\u6D4B" }), _jsx("button", { onClick: () => { setNavMode(!navMode); resetNavMode(); }, "aria-label": navMode ? '退出导航模式' : '进入导航模式', "aria-pressed": navMode, style: {
                            flex: 1, maxWidth: 120, padding: '14px 20px',
                            background: navMode ? 'var(--color-success)' : 'var(--color-surface)',
                            color: navMode ? 'white' : 'var(--color-text)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'all var(--transition-fast)'
                        }, children: navMode ? '✓ 完成导航' : '🖱 点击导航' })] })), navMode && (_jsxs("div", { className: "nav-hint", style: {
                    position: 'absolute', top: 80, left: 16, zIndex: 100,
                    background: 'var(--color-surface)',
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8
                }, children: [_jsx("span", { style: {
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, height: 24, borderRadius: '50%',
                            background: fromNode ? 'var(--color-success)' : 'var(--color-border)',
                            color: 'white', fontSize: 12
                        }, children: "1" }), _jsx("span", { style: { color: 'var(--color-text-muted)' }, children: "\u2192" }), _jsx("span", { style: {
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, height: 24, borderRadius: '50%',
                            background: toNode ? 'var(--color-success)' : 'var(--color-border)',
                            color: 'white', fontSize: 12
                        }, children: "2" }), _jsxs("span", { style: { color: 'var(--color-text)', fontWeight: 500 }, children: [fromNode ? `已选: ${fromNode.type}` : '点击选择起点', " ", toNode ? `→ ${toNode.type}` : ' → 点击选择终点'] })] })), showNavPanel && selectedBuilding && (_jsx(NavigationPanel, { building: selectedBuilding, onClose: () => setShowNavPanel(false), onNavigate: handleNavigate })), showMonitorPanel && selectedBuilding && (_jsx(MonitorPanel, { monitors: selectedBuilding.monitors || [], onClose: () => setShowMonitorPanel(false) })), !selectedBuilding && (_jsx("div", { style: {
                    position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-surface)', padding: '12px 24px', borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--shadow-lg)', fontSize: 14, color: 'var(--color-text-muted)'
                }, children: "\uD83D\uDC46 \u4ECE\u4E0A\u65B9\u9009\u62E9\u5EFA\u7B51\u5F00\u59CB\u5BFC\u822A" }))] }));
}
