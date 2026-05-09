import { useState, useEffect } from 'react';
import { Building, legacyBrandsToShops } from '@indoor-nav/shared';

function normalizeBuildings(buildings: Building[]): Building[] {
  return buildings.map(b => ({
    ...b,
    floors: b.floors.map(f => {
      if ((!f.shops || f.shops.length === 0) && f.brands && f.brands.length > 0) {
        return { ...f, shops: legacyBrandsToShops(f.brands, f.id) };
      }
      return f;
    }),
  }));
}

const EDITOR_STORAGE_KEY = 'indoor-nav-editor-data';

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'file' | 'editor'>('file');

  useEffect(() => {
    const editorData = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (editorData) {
      try {
        const data = JSON.parse(editorData);
        if (data.buildings && data.buildings.length > 0) {
          setBuildings(normalizeBuildings(data.buildings));
          setSource('editor');
          setLoading(false);
          return;
        }
      } catch {
        // Invalid localStorage data, fall through to file loading
      }
    }

    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      const jsonFiles = ['buildings.json'];

      try {
        const baseUrl = import.meta.env.BASE_URL;
        const results = await Promise.all(
          jsonFiles.map(file =>
            fetch(`${baseUrl}data/${file}`).then(r => r.ok ? r.json() : null).catch(() => null)
          )
        );
        const allBuildings = results.filter((r): r is { buildings: Building[] } => r?.buildings != null).flatMap(r => r.buildings);

        if (allBuildings.length === 0) {
          setError('未找到建筑数据，请确认 data 目录下有 buildings.json 文件');
        } else {
          setBuildings(normalizeBuildings(allBuildings));
          setSource('file');
        }
      } catch {
        setError('加载建筑数据失败，请刷新页面重试');
      }

      setLoading(false);
    };

    loadAllData();
  }, []);

  return { buildings, loading, error, source };
}
