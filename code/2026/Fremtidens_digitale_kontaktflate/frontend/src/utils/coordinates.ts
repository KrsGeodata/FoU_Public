export type MapResponse = {
  lat?: number | null;
  lon?: number | null;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

/** Convert unknown coordinate values to valid numbers. */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Build map coordinates only when values are valid WGS84 lat/lon. */
export function toMapCoordinates(mapData: MapResponse | null): Coordinates | null {
  if (!mapData) {
    return null;
  }

  const lat = toNumber(mapData.lat);
  const lon = toNumber(mapData.lon);

  if (lat === null || lon === null) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return { lat, lng: lon };
}
