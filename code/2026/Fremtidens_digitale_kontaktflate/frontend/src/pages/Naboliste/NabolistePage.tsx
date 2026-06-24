import Naboliste from "../../components/Naboliste/Naboliste";
import "./NabolistePage.css";
import AddressDropdown from "../../components/AddressDropdown/AddressDropdown";
import type { PropertyOption } from "../../components/PropertyChooser/PropertyChooser";

type NabolistePageProps = {
  selectedProperty: PropertyOption | null;
  properties?: PropertyOption[];
  onPropertySelect?: (p: PropertyOption) => void;
};

export default function NabolistePage({
  selectedProperty,
  properties = [],
  onPropertySelect,
}: NabolistePageProps) {
  return (
    <div className="page-layout naboliste-page-layout">
      <section className="page-panel naboliste-header-panel">
        <AddressDropdown
          properties={properties}
          selectedProperty={selectedProperty ?? null}
          onSelect={onPropertySelect}
        />
        <h1 className="page-title">Naboliste</h1>
        <p className="page-subtitle">Få oversikt over naboene dine og send nabovarsel direkte herfra.</p>
      </section>
      <Naboliste selectedProperty={selectedProperty} />
    </div>
  );
}
