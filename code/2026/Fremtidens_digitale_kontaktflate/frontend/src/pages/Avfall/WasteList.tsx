import WasteCard from "./WasteCard";
import { WasteItem } from "../../types/waste";

type WasteListProps = {
  items: WasteItem[];
};

/** Main purpose: Render a list of waste cards, or an empty state when no items exist. */
export default function WasteList({
  items,
}: WasteListProps) {
  if (!items.length) {
    return <p className="waste-note">Ingen avfallspunkter funnet.</p>;
  }

  return (
    <div className="pickup-entries">
      {items.map((item) => (
        <WasteCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}
