import { Building } from '@indoor-nav/shared';
export declare function useBuildings(): {
    buildings: Building[];
    loading: boolean;
    source: "file" | "editor";
};
