import { NavigationNode } from '@indoor-nav/shared';

interface Props {
  nodes: NavigationNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function NavPointList({ nodes, selectedId, onSelect }: Props) {
  const typeLabels: Record<string, string> = {
    walkable: 'Walk',
    elevator: 'Elevator',
    stair: 'Stair',
    entrance: 'Entrance',
    exit: 'Exit'
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {nodes.map(node => (
        <li key={node.id}>
          <button
            onClick={() => onSelect(node.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 6,
              background: selectedId === node.id ? '#e0e0e0' : 'transparent'
            }}
          >
            {typeLabels[node.type] || node.type} ({node.position.x.toFixed(1)}, {node.position.z.toFixed(1)})
          </button>
        </li>
      ))}
    </ul>
  );
}
