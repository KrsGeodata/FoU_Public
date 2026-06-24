interface BYAToolProps {
  visible: boolean;
  polygons: { id: string; area: number }[];
  onRemove: (id: string) => void;
  eiendomAreal: number | null;
  bygningAreal: number | null;
  tilbyggAreal: number | null;
}

export default function BYATool({ visible, polygons, onRemove, eiendomAreal, bygningAreal, tilbyggAreal }: BYAToolProps) {
  if (!visible) return null;

  const drawnTotal = polygons.reduce((sum, p) => sum + p.area, 0);
  const totalBYA = (bygningAreal ?? 0) + (tilbyggAreal ?? 0) + drawnTotal;
  const prosent = eiendomAreal ? (totalBYA / eiendomAreal) * 100 : null;

  return (
    <div className="absolute top-2 right-2 z-[401] w-80 bg-white overflow-y-auto max-h-[70vh] p-4 space-y-4 text-primary text-sm">

      {/* Eksisterende bygg */}
      <div className="space-y-1">
        <div className="font-semibold text-start text-primary">Eksisterende bygg</div>
        <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
          <span>Bygningsmasse</span>
          <span className="font-medium">
            {bygningAreal != null ? `${bygningAreal.toFixed(1)} m²` : '–'}
          </span>
        </div>
      </div>

      {/* Tegnet tilbygg fra kartverktøy */}
      <div className="space-y-1">
        <div className="font-semibold text-start text-primary">Tegnet tilbygg</div>
        <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
          <span>Plassert på kart</span>
          <span className="font-medium">
            {tilbyggAreal != null ? `${tilbyggAreal.toFixed(1)} m²` : '–'}
          </span>
        </div>
      </div>

      {/* Ekstra BYA-polygoner */}
      <div className="space-y-1">
        <div className="font-semibold text-start text-primary">Ekstra areal</div>
        {polygons.length === 0 ? (
          <p className="text-slate-400 text-xs px-1">Tegn polygoner på kartet for å legge til areal</p>
        ) : (
          polygons.map((p, i) => (
            <div key={p.id} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between items-center">
              <span>Areal {i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.area.toFixed(1)} m²</span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-slate-400 hover:text-red-500 leading-none"
                  aria-label="Fjern areal"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totaler */}
      <div className="space-y-1">
        <div className="font-semibold text-start text-primary">Estimert BYA</div>
        <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
          <span>BYA m²</span>
          <span className="font-medium">{totalBYA.toFixed(1)} m²</span>
        </div>
        {prosent != null && (
          <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
            <span>BYA prosent</span>
            <span className="font-medium">{prosent.toFixed(1)} %</span>
          </div>
        )}
        {eiendomAreal != null && (
          <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
            <span>Tomteareal</span>
            <span className="font-medium">{eiendomAreal.toFixed(1)} m²</span>
          </div>
        )}
      </div>

    </div>
  );
}
