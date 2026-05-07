import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const typeConfig = {
    temperature: { label: '温度', icon: '🌡️', color: '#ef4444' },
    humidity: { label: '湿度', icon: '💧', color: '#3b82f6' },
    airQuality: { label: '空气质量', icon: '🌬️', color: '#22c55e' },
    noise: { label: '噪音', icon: '🔊', color: '#f59e0b' }
};
export default function MonitorPanel({ monitors, onClose }) {
    return (_jsxs("section", { className: "panel", role: "dialog", "aria-labelledby": "monitor-panel-title", "aria-modal": "true", style: {
            position: 'absolute', left: 16, top: 80, width: 280,
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-lg)'
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }, children: [_jsx("h2", { id: "monitor-panel-title", style: { fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }, children: "\uD83D\uDCCA \u73AF\u5883\u76D1\u6D4B" }), _jsx("button", { onClick: onClose, "aria-label": "\u5173\u95ED\u76D1\u6D4B\u9762\u677F", style: {
                            width: 32, height: 32, borderRadius: '50%',
                            border: 'none', background: 'var(--color-surface-elevated)',
                            color: 'var(--color-text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, transition: 'all var(--transition-fast)'
                        }, children: "\u2715" })] }), monitors.length === 0 ? (_jsxs("div", { style: {
                    textAlign: 'center', padding: 'var(--spacing-xl) 0',
                    color: 'var(--color-text-muted)'
                }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\uD83D\uDCCB" }), _jsx("div", { style: { fontSize: 14 }, children: "\u6682\u65E0\u76D1\u6D4B\u6570\u636E" }), _jsx("div", { style: { fontSize: 12, marginTop: 4 }, children: "\u8BF7\u5728Editor\u4E2D\u6DFB\u52A0\u76D1\u6D4B\u8BBE\u5907" })] })) : (_jsx("div", { style: { display: 'grid', gap: 12 }, children: monitors.map(m => {
                    const config = typeConfig[m.type] || { label: m.type, icon: '📊', color: 'var(--color-primary)' };
                    return (_jsxs("div", { style: {
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${config.color}`
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }, children: [_jsx("span", { style: { fontSize: 18 }, children: config.icon }), _jsx("span", { style: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }, children: config.label })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 4 }, children: [_jsx("span", { style: { fontSize: 28, fontWeight: 700, color: config.color }, children: m.value }), _jsx("span", { style: { fontSize: 14, color: 'var(--color-text-muted)' }, children: m.unit })] }), m.lastUpdate && (_jsxs("div", { style: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }, children: ["\u66F4\u65B0: ", new Date(m.lastUpdate).toLocaleString('zh-CN')] }))] }, m.id));
                }) }))] }));
}
