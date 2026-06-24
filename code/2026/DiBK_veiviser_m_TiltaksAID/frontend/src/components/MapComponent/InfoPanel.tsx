import type { site_constraints_props } from '../../lib/map/drawingHandlers';

export const questionLayerMap: Record<string, string[]> = {
  'distance-from-neighbour':   ['neighbourBuilding'],
  'distance-from-neighbour2':  ['neighbourBuilding'],
  'distance-to-road':          ['roads'],
  'distance-to-road-possible': ['roads'],
  'placement-neighbours':      ['propertyBorder'],
  'placement-buildings':       ['propertyBuilding'],
  'train-tracks':              ['trainTracks'],
  'train-tracks-possible':     ['trainTracks'],
  'flood-landslide':           ['jordskred', 'flom'],
  'flood-landslide-possible':  ['jordskred', 'flom'],
  'distance-to-sea':           ['hoyvann'],
  'building-size':             ['area']
};

interface InfoPanelProps {
  constraintsInformation: site_constraints_props;
  currentQuestionId?: string;
}

export default function InfoPanel({ constraintsInformation, currentQuestionId }: InfoPanelProps) {
  const visible = new Set(currentQuestionId ? (questionLayerMap[currentQuestionId] ?? []) : []);

  const hasContent =
    (visible.has('roads') && constraintsInformation.roadInfo.length > 0) ||
    (visible.has('propertyBorder') && constraintsInformation.eiendomsgrenseInfo.length > 0) ||
    (visible.has('neighbourBuilding') && constraintsInformation.nabobebyggelseInfo.length > 0) ||
    (visible.has('propertyBuilding') && constraintsInformation.eiendomBebyggelseInfo.length > 0) ||
    ((visible.has('jordskred') || visible.has('flom')) && constraintsInformation.jordskredInfo.length > 0) ||
    (visible.has('area') && constraintsInformation.drawnPolygonArea != null) ||
    (visible.has('hoyvann') && constraintsInformation.hoyvannInfo.length > 0);

  if (!hasContent) return null;

  return (
    <div className="absolute top-2 right-2 z-[401] w-80 bg-white overflow-y-auto max-h-[70vh] p-4 space-y-4 text-primary text-sm">
{/*       <div className="font-bold text-primary">Tiltak informasjon</div> */}

      {visible.has('roads') && constraintsInformation.roadInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-start text-primary">Avstand til vei</div>
          {constraintsInformation.roadInfo.map((dataElement, i) => (
            <div key={`veg-${i}`} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
              <span className="capitalize">{dataElement.source}</span>
              <span className="font-medium">{dataElement.distance_m.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

      {visible.has('propertyBorder') && constraintsInformation.eiendomsgrenseInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-start text-primary">Avstand til eiendomsgrense</div>
          {constraintsInformation.eiendomsgrenseInfo.map((dataElement, i) => (
            <div key={`eiendomsgrense-${i}`} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
              <span>Eiendomsgrense {i + 1}</span>
              <span className="font-medium">{dataElement.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

      {visible.has('neighbourBuilding') && constraintsInformation.nabobebyggelseInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-start  text-primary">Avstand til bebyggelse på nabo-eiendom</div>
          {constraintsInformation.nabobebyggelseInfo.map((dataElement, i) => (
            <div key={`naboBebyggelse-${i}`} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
              <span>Bebyggelse {i + 1}</span>
              <span className="font-medium">{dataElement.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

      {visible.has('propertyBuilding') && constraintsInformation.eiendomBebyggelseInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-start text-primary">Avstand til bebyggelse på eiendom</div>
          {constraintsInformation.eiendomBebyggelseInfo.map((dataElement, i) => (
            <div key={`eiendomBebyggelse-${i}`} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
              <span>Bebyggelse {i + 1}</span>
              <span className="font-medium">{dataElement.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

      {(visible.has('jordskred') || visible.has('flom')) && constraintsInformation.jordskredInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold">Jordskred</div>
          {constraintsInformation.jordskredInfo.map((dataElement, i) => (
            <div key={`jordskred-${i}`} className="bg-[#CCDCEE] px-3 py-2 flex justify-between">
              <span>Jordskred {i + 1}</span>
              <span className="font-medium">{dataElement.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

      {visible.has('area') && constraintsInformation.drawnPolygonArea != null && (
        <div className="space-y-1">
          <div className="font-semibold text-start text-primary">Tiltak areal</div>
          <div className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
            <span>Areal</span>
            <span className="font-medium">{constraintsInformation.drawnPolygonArea.toFixed(1)} m²</span>
          </div>
        </div>
      )}

      {visible.has('hoyvann') && constraintsInformation.hoyvannInfo.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-start text-primary">Avstand til sjø</div>
          {constraintsInformation.hoyvannInfo.map((dataElement, i) => (
            <div key={`naboBebyggelse-${i}`} className="bg-info border-l-4 border-info-border px-3 py-2 flex justify-between">
              <span>Avstand: {i + 1}</span>
              <span className="font-medium">{dataElement.toFixed(1)} m</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
