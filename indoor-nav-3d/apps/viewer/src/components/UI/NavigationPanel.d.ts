import { Building } from '@indoor-nav/shared';
interface Props {
    building: Building;
    onClose: () => void;
    onNavigate: (fromFloorId: string, toFloorId: string) => void;
}
export default function NavigationPanel({ building, onClose, onNavigate }: Props): import("react/jsx-runtime").JSX.Element;
export {};
