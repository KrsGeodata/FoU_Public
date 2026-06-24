import type { PropertyOption } from "../PropertyChooser/PropertyChooser";
import { propertyKey } from "../PropertyChooser/PropertyChooser";
import "./AddressDropdown.css";

interface AddressDropdownProps {
  properties: PropertyOption[];
  selectedProperty: PropertyOption | null;
  onSelect?: (p: PropertyOption) => void;
}

export default function AddressDropdown({
  properties,
  selectedProperty,
  onSelect,
}: AddressDropdownProps) {
  if (properties.length <= 1) {
    const label = properties[0]?.label ?? "Ingen eiendom valgt";
    return (
      <p className="address-chip">{label}</p>
    );
  }

  const selectedKey = selectedProperty ? propertyKey(selectedProperty) : "";

  return (
    <select
      className="address-dropdown"
      value={selectedKey}
      onChange={(e) => {
        const match = properties.find((p) => propertyKey(p) === e.target.value);
        if (match) onSelect?.(match);
      }}
      aria-label="Velg eiendom"
    >
      {!selectedProperty && (
        <option value="" disabled>
          Ingen eiendom valgt
        </option>
      )}
      {properties.map((p) => (
        <option key={propertyKey(p)} value={propertyKey(p)}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
