import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function NavigationPanel({ building, onClose, onNavigate }) {
    const [fromFloor, setFromFloor] = useState(building.floors[0]?.id || '');
    const [toFloor, setToFloor] = useState(building.floors[1]?.id || '');
    const handleNavigate = () => {
        if (fromFloor && toFloor && fromFloor !== toFloor) {
            onNavigate(fromFloor, toFloor);
        }
    };
    const isValid = fromFloor && toFloor && fromFloor !== toFloor;
    return (_jsxs("section", { className: "panel", role: "dialog", "aria-labelledby": "nav-panel-title", "aria-modal": "true", style: {
            position: 'absolute', right: 16, top: 80, width: 300,
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-lg)'
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }, children: [_jsx("h2", { id: "nav-panel-title", style: { fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }, children: "\uD83E\uDDED \u5BA4\u5185\u5BFC\u822A" }), _jsx("button", { onClick: onClose, "aria-label": "\u5173\u95ED\u5BFC\u822A\u9762\u677F", style: {
                            width: 32, height: 32, borderRadius: '50%',
                            border: 'none', background: 'var(--color-surface-elevated)',
                            color: 'var(--color-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, transition: 'all var(--transition-fast)'
                        }, children: "\u2715" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 'var(--spacing-lg)' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }, children: "\u8D77\u59CB\u697C\u5C42" }), _jsx("select", { value: fromFloor, onChange: e => setFromFloor(e.target.value), style: {
                                    width: '100%', padding: '10px 12px',
                                    fontSize: 14, border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-surface-elevated)',
                                    cursor: 'pointer'
                                }, children: building.floors.map(f => (_jsx("option", { value: f.id, children: f.name }, f.id))) })] }), _jsx("div", { style: { fontSize: 20, color: 'var(--color-text-muted)', paddingTop: 20 }, children: "\u2192" }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }, children: "\u76EE\u6807\u697C\u5C42" }), _jsx("select", { value: toFloor, onChange: e => setToFloor(e.target.value), style: {
                                    width: '100%', padding: '10px 12px',
                                    fontSize: 14, border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-surface-elevated)',
                                    cursor: 'pointer'
                                }, children: building.floors.map(f => (_jsx("option", { value: f.id, children: f.name }, f.id))) })] })] }), _jsx("button", { onClick: handleNavigate, disabled: !isValid, style: {
                    width: '100%', padding: '14px',
                    background: isValid ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isValid ? 'white' : 'var(--color-text-muted)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: 15, fontWeight: 600,
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    transition: 'all var(--transition-fast)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }, children: isValid ? '🔍 查询路线' : '请选择起始和目标楼层' }), _jsxs("div", { style: { marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)' }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }, children: "\u8282\u70B9\u7C7B\u578B" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 12 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-walkable)' } }), _jsx("span", { children: "\u53EF\u901A\u884C" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-entrance)' } }), _jsx("span", { children: "\u5165\u53E3" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-exit)' } }), _jsx("span", { children: "\u51FA\u53E3" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx("span", { style: { width: 12, height: 12, borderRadius: '50%', background: 'var(--color-node-elevator)' } }), _jsx("span", { children: "\u7535\u68AF" })] })] })] })] }));
}
