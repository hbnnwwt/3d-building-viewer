import { useState, useEffect } from 'react';
import { Building } from '@indoor-nav/shared';

interface BuildingsData {
  buildings: Building[];
}

export function useBuilding(buildingId: string | null) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    fetch('/data/buildings.json')
      .then(r => r.json())
      .then((data: BuildingsData) => {
        const found = data.buildings.find(b => b.id === buildingId);
        if (!found) throw new Error('Building not found');
        setBuilding(found);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [buildingId]);

  return { building, loading, error };
}

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/buildings.json')
      .then(r => r.json())
      .then((data: BuildingsData) => {
        setBuildings(data.buildings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { buildings, loading };
}