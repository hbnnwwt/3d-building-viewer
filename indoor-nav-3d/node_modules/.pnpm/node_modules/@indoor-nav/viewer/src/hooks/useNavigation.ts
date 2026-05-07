import { useState, useCallback } from 'react';
import { NavigationResponse } from '@indoor-nav/shared';

export function useNavigation() {
  const [result, setResult] = useState<NavigationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePath = useCallback(async (buildingId: string, from: any, to: any) => {
    setLoading(true);
    try {
      // A* pathfinding will be implemented here
      setResult({ path: [], totalDistance: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, calculatePath };
}