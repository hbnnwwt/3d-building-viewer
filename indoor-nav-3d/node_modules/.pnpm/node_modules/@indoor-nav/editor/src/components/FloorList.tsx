import { Floor } from '@indoor-nav/shared';

interface Props {
  floors: Floor[];
  selectedFloorId?: string;
  onSelectFloor: (floor: Floor) => void;
  onDeleteFloor: (floorId: string) => void;
}

export default function FloorList({ floors, selectedFloorId, onSelectFloor, onDeleteFloor }: Props) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {floors.map((floor, idx) => (
        <li key={floor.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 'bold', minWidth: 20 }}>{idx + 1}</span>
          <button
            onClick={() => onSelectFloor(floor)}
            style={{
              flex: 1,
              textAlign: 'left',
              padding: 8,
              background: selectedFloorId === floor.id ? '#e0e0e0' : 'transparent'
            }}
          >
            {floor.name}
          </button>
          <button onClick={() => onDeleteFloor(floor.id)} style={{ color: 'red' }}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
