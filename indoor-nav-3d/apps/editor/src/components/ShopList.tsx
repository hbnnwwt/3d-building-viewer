import { Shop } from '@indoor-nav/shared';

interface Props {
  shops: Shop[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ShopList({ shops, selectedId, onSelect }: Props) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {shops.map(shop => (
        <li key={shop.id}>
          <button
            onClick={() => onSelect(shop.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 6,
              background: selectedId === shop.id ? '#e0e0e0' : 'transparent',
              border: 'none', cursor: 'pointer', borderRadius: 4
            }}
          >
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: shop.color || '#94a3b8', marginRight: 6 }} />
            {shop.name || 'Unnamed'}
            <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>
              ({shop.entrances.length}门)
            </span>
          </button>
        </li>
      ))}
      {shops.length === 0 && <li style={{ color: '#999', fontSize: 13 }}>暂无店铺</li>}
    </ul>
  );
}
