import { useState, useEffect } from 'react';
import { Building } from '@indoor-nav/shared';

export function useBuilding(buildingId: string | null) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    fetch(`/api/buildings/${buildingId}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(data => { setBuilding(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [buildingId]);

  return { building, loading, error };
}

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/buildings')
      .then(r => r.json())
      .then(data => { setBuildings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { buildings, loading };
}