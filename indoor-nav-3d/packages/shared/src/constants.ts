export const NODE_COLORS: Record<string, { hex: string; numeric: number; label: string }> = {
  walkable:  { hex: '#3b82f6', numeric: 0x3b82f6, label: '可通行' },
  elevator:  { hex: '#f59e0b', numeric: 0xf59e0b, label: '电梯' },
  stair:     { hex: '#8b5cf6', numeric: 0x8b5cf6, label: '楼梯' },
  entrance:  { hex: '#22c55e', numeric: 0x22c55e, label: '入口' },
  exit:      { hex: '#ef4444', numeric: 0xef4444, label: '出口' },
};
