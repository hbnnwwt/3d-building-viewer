import { Floor, NavigationNode } from '@indoor-nav/shared';
interface Props {
    floor: Floor;
    yOffset: number;
    onNodeClick?: (node: NavigationNode) => void;
    selectedNodeId?: string | null;
}
export default function FloorMesh({ floor, yOffset, onNodeClick, selectedNodeId }: Props): import("react/jsx-runtime").JSX.Element;
export {};
