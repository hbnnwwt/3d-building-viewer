import { Building, NavigationStep } from '@indoor-nav/shared';
interface Props {
    building: Building | null;
    navigationPath?: NavigationStep[];
    showPath?: boolean;
    onNodeClick?: (node: any) => void;
    selectedNodeId?: string | null;
}
export default function BuildingCanvas({ building, navigationPath, showPath, onNodeClick, selectedNodeId }: Props): import("react/jsx-runtime").JSX.Element;
export {};
