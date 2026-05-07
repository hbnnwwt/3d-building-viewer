import { NavigationResponse } from '@indoor-nav/shared';
export declare function useNavigation(): {
    result: NavigationResponse | null;
    loading: boolean;
    calculatePath: (buildingId: string, from: any, to: any) => Promise<void>;
};
