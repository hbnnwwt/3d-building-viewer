import { useState, useEffect } from 'react';
import { Building } from '@indoor-nav/shared';

const EDITOR_STORAGE_KEY = 'indoor-nav-editor-data';

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'file' | 'editor'>('file');

  useEffect(() => {
    // Try to load from Editor's localStorage first
    const editorData = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (editorData) {
      try {
        const data = JSON.parse(editorData);
        if (data.buildings && data.buildings.length > 0) {
          setBuildings(data.buildings);
          setSource('editor');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse editor data', e);
      }
    }

    // Fall back to scanning data folder for all JSON files in parallel
    const loadAllData = async () => {
      // Mark as loading when entering the JSON fetch phase
      setLoading(true);

      const jsonFiles = ['buildings.json', 'buildings2.json', 'buildings3.json', 'buildings4.json', 'buildings5.json'];
      const results = await Promise.all(
        jsonFiles.map(file =>
          fetch(`/data/${file}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      );
      const allBuildings = results.filter(r => r?.buildings).flatMap(r => r.buildings);

      setBuildings(allBuildings);
      setSource('file');
      setLoading(false);
    };

    loadAllData();
  }, []);

  return { buildings, loading, source };
}