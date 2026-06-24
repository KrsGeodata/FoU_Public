// Supabase configuration for database access
const SUPABASE_URL = 'https://dctlsklovjueodoiygak.supabase.co';
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdGxza2xvdmp1ZW9kb2l5Z2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNTU2MTksImV4cCI6MjA0MDkzMTYxOX0.7yi8lL--MMUv2iK6A9JzGNw91oMn_seJ_9O4Ki26wik";

// Global state variables
window.allowedBuildingArea = null;
window.allowedAreaLayer = null;
window.selectedBuildingType = 'garasje';
let deletedPolygons = [];
window.shortestLinesLayer = null;
window.propertyBoundaryLayer = null;
let checklistOpen = false;  // track if checklist overlay is open

// Define EPSG:25832 projection (UTM zone 32) for coordinate transforms
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map centered on Kristiansand
    window.map = L.map('map', {
        center: [58.1447, 7.99828],
        zoom: 15,
        maxZoom: 21,
        zoomSnap: 0.5,
        zoomDelta: 0.5
    });

    // Base layers
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 21
    }).addTo(map);

    // Overlay WMS layers
    const FKBLayer = L.tileLayer.wms('https://wms.geonorge.no/skwms1/wms.fkb', {
        layers: 'fkb',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        maxZoom: 21,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

    const PropertyLayer = L.tileLayer.wms('https://wms.geonorge.no/skwms1/wms.matrikkelkart', {
        layers: 'teiger',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        maxZoom: 21
    }).addTo(map);

    const RoadLayer = L.tileLayer.wms('https://wms.geonorge.no/skwms1/wms.vegnett2', {
        layers: 'vegnett2',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        maxZoom: 21,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

    // Feature groups for dynamic layers
    window.aiDetectionsLayer = L.featureGroup().addTo(map);
    window.drawnItems = L.featureGroup().addTo(map);
    const labelsLayer = new L.FeatureGroup();
    map.addLayer(labelsLayer);

    // Layer control for overlays
    const overlayMaps = {
        "FKB (Kartdata)": FKBLayer,
        "Eiendomsgrenser": PropertyLayer,
        "Veinett": RoadLayer,
        "AI deteksjoner": aiDetectionsLayer,
        "Tegnede objekter": drawnItems
    };
    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

    // Toggle button to show/hide layer control panel
    const toggleButton = L.control({ position: 'topleft' });
    toggleButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '<button id="toggleLayers" title="Vis/skjul lagkontroller">☰</button>';
        // NOTE: Inline styles for #toggleLayers (width: 30px; height: 30px; background: white; border: 1px solid #ccc; cursor: pointer) should be moved to an external CSS file.
        L.DomEvent.on(div, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            const controlContainer = document.querySelector('.leaflet-control-layers');
            if (controlContainer) {
                controlContainer.style.display = (controlContainer.style.display === "none") ? "block" : "none";
            }
        });
        return div;
    };
    toggleButton.addTo(map);

    // Custom zoom control (bottom-left) instead of default
    map.zoomControl.remove();
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    remove: true
  },
  draw: {
    polygon: true,
    polyline: false,
    rectangle: false,
    circle: false,
    marker: false,
    circlemarker: false
  }
});
map.addControl(drawControl);

// Norsk oversettelse av verktøytitler – kjør flere ganger for å sikre oversettelse
const intervalId = setInterval(() => {
  const buttons = document.querySelectorAll('.leaflet-draw-toolbar a');
  let foundAll = true;

  buttons.forEach(btn => {
    const title = btn.getAttribute('title');
    if (title === 'Draw a polygon') {
      btn.setAttribute('title', 'Tegn et bygg');
    } else if (title === 'Edit layers') {
      btn.setAttribute('title', 'Rediger bygg');
    } else if (title === 'Delete layers') {
      btn.setAttribute('title', 'Slett bygg');
    } else {
      foundAll = false;
    }
  });

  // Stopp etter maks 3 sekunder eller når alle knapper er oversatt
  if (foundAll) clearInterval(intervalId);
}, 500);

    // Save drawn polygons to localStorage
    function savePolygons() {
        const geojson = {
            type: "FeatureCollection",
            features: []
        };
        drawnItems.eachLayer(layer => {
            if (layer instanceof L.Polygon) {
                const feature = layer.toGeoJSON();
                feature.properties = feature.properties || {};
                feature.properties.style = polygonStyle;
                geojson.features.push(feature);
            }
        });
        localStorage.setItem('savedPolygons', JSON.stringify(geojson));
    }

    // Convert a drawn polygon layer to WKT in EPSG:25832
    function convertGeoJSONTo25832(layer) {
        if (!layer || !layer.toGeoJSON) return null;
        const coords = layer.toGeoJSON().geometry.coordinates[0];
        if (!coords || coords.length < 3) {
            console.warn("❌ Ikke nok punkter til å lage polygon.");
            return null;
        }
        // Transform coordinates from WGS84 (EPSG:4326) to EPSG:25832
        const transformed = coords.map(([lon, lat]) => proj4('EPSG:4326', 'EPSG:25832', [lon, lat]));
        // Ensure polygon is closed
        if (transformed.length > 0) {
            const [x0, y0] = transformed[0];
            const [xN, yN] = transformed[transformed.length - 1];
            if (x0 !== xN || y0 !== yN) {
                transformed.push(transformed[0]);
            }
        }
        const wkt = `POLYGON((${transformed.map(([x, y]) => `${x} ${y}`).join(', ')}))`;
        return wkt;
    }

    // Evaluate checklist via Supabase RPC for a given property and drawn layer
    async function evaluateChecklist(eiendom, drawnLayer) {
        const wkt = convertGeoJSONTo25832(drawnLayer);
        if (!wkt) return null;
        const payload = { eiendom, nybygg_wkt: wkt };
        console.log("📤 Sender til byggesoknad_sjekkliste:", payload);
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/byggesoknad_sjekkliste`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log("📥 Resultat fra byggesoknad_sjekkliste:", data);
            const result = Array.isArray(data) ? data[0] : data;
            if (!result || typeof result !== 'object' || result.error) {
                console.warn('⚠️ Ingen eller ugyldig svar fra byggesoknad_sjekkliste');
                if (result?.message) console.warn('Servermelding:', result.message);
                return null;
            }
            // Open the checklist overlay and set toggle button state
            const checklistOverlay = document.getElementById('checklist-overlay');
            const toggleBtn = document.getElementById('toggle-checklist');
            if (checklistOverlay && toggleBtn) {
                checklistOverlay.style.right = '0px';
                toggleBtn.innerHTML = '&larr;';
            }
            checklistOpen = true;
            // Fill in the checklist radio buttons based on response
            const questionMapping = {
                nabo_bygning_under_2m: 0,
                nabo_bygning_under_8m: 1,
                eiendom_bebygd: 2,
                eiendom_regulert: 3,
                regulert_lnf_omrade: 4,
                bygge_storrelse_ok: 5,
                avstand_til_bygning_ok: 6,
                for_nær_grense: 7,
                over_vann_avlop: 8,
                for_nær_vei: 9,
                flom_skredutsatt: 11,
                sjo_100m: 13,
                jernbane_30m: 15,
                har_nok_areal: 16,
                begrensning_kommunale_planer: 17
            };
            Object.entries(questionMapping).forEach(([key, idx]) => {
                const yesEl = document.getElementById(`check-${idx}-yes`);
                const noEl = document.getElementById(`check-${idx}-no`);
                if (yesEl && noEl && result.hasOwnProperty(key)) {
                    yesEl.checked = (result[key] === true);
                    noEl.checked = (result[key] === false);
                }
            });
            return result;
        } catch (err) {
            console.error("❌ Feil ved henting av sjekkliste:", err);
            return null;
        }
    }

    // Measure and label each side of drawn polygons, and display total area
    function measurePolygonSides() {
    // ❌ Først fjern gamle etiketter
    labelsLayer.clearLayers();

    drawnItems.eachLayer(layer => {
        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0];

            // 🔁 Sidelengde-etiketter
            for (let i = 0; i < latlngs.length; i++) {
                const nextIndex = (i + 1) % latlngs.length;
                const from = latlngs[i];
                const to = latlngs[nextIndex];
                const distance = from.distanceTo(to);
                const midPoint = L.latLng((from.lat + to.lat) / 2, (from.lng + to.lng) / 2);

                const label = L.marker(midPoint, {
                    icon: L.divIcon({
                        className: 'distance-label',
                        html: `${distance.toFixed(1)} m`,
                        iconSize: [0, 0]
                    })
                });
                labelsLayer.addLayer(label);
            }

            // 🔁 Areal-etikett (centroid)
            const area = L.GeometryUtil.geodesicArea(latlngs);
            const centroid = layer.getBounds().getCenter();
            const areaLabel = L.marker(centroid, {
                icon: L.divIcon({
                    className: 'area-label',
                    html: `<strong>${area.toFixed(1)} m²</strong>`,
                    iconSize: [0, 0]
                })
            });
            labelsLayer.addLayer(areaLabel);
        }
    });
}
    // Update (or reset) the checklist UI based on provided data
    function updateChecklist(data) {
    const checklistContainer = document.getElementById('checklist-content');
    if (!data || Object.keys(data).length === 0) {
        // Clear all radio selections (preserve the checklist structure)
        const radios = checklistContainer.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => { radio.checked = false; });
        return;
    }
    // Check off Yes/No according to the data values
    const radios = checklistContainer.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        const name = radio.name; // "check-0", "check-1", etc.
        const shouldBeYes = radio.value === "yes";
        if (data.hasOwnProperty(name)) {
            radio.checked = (data[name] === (shouldBeYes ? 'yes' : 'no'));
        }
    });
}

    // Fetch allowed building area (Tillatt byggeområde) for a property and display it
    async function getAllowedBuildingArea(eiendom) {
        console.log(" Henter tillatt byggeområde for eiendom:", eiendom);
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_allowedbuildingarea_by_eiendom`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({ eiendom })
            });
            console.log("📡 Statuskode:", response.status);
            const data = await response.json();
            console.log("Supabase-data (allowed area):", data);
            if (!Array.isArray(data) || !data[0] || !data[0].allowed_building_area) {
                console.warn("Ingen tillatt byggeområde returnert fra Supabase.");
                return;
            }
            const geom = data[0].allowed_building_area;
            // Normalize to a single GeoJSON feature
            window.allowedBuildingArea = (geom.type === "FeatureCollection")
                ? geom.features[0]
                : { type: "Feature", geometry: geom, properties: {} };
            // Remove old layer if present, then add new allowed area layer
            if (window.allowedAreaLayer) {
                map.removeLayer(window.allowedAreaLayer);
            }
            window.allowedAreaLayer = L.geoJSON(window.allowedBuildingArea, {
                style: { color: "#28a745", weight: 2, fillOpacity: 0.3 }
            }).addTo(map);
            console.log(" Tillatt byggeområde vist i kartet.");
        } catch (error) {
            console.error("Feil ved henting av tillatt byggeområde:", error);
        }
    }

    // Fetch and display the shortest lines from the drawn building to relevant features (roads, etc.)
  async function getShortestLines(polygonGeoJSON) {
  console.log("🔎 getShortestLines – sender geojson:", polygonGeoJSON);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/find_shortest_lines_combined`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input_geojson: polygonGeoJSON })
    });

    console.log("📡 Statuskode (shortest lines RPC):", response.status);
    const data = await response.json();
    console.log("📥 Supabase respons (korteste linjer):", data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log("❌ Ingen gyldige linjer funnet.");
      return;
    }

    const features = data.map((item, index) => {
      if (!item.line) {
        console.warn(`⚠️ Linje ${index} mangler GeoJSON-data`);
        return null;
      }

      return {
        type: "Feature",
        geometry: item.line,
        properties: {
          source: item.source,
          subtype: item.subtype,
          distance_m: item.distance_m
        }
      };
    }).filter(f => f !== null);

    if (window.shortestLinesLayer) {
      map.removeLayer(window.shortestLinesLayer);
    }

    window.shortestLinesLayer = L.geoJSON({ type: "FeatureCollection", features }, {
      style: {
        color: "blue",
        weight: 2,
        dashArray: "5,5"
      },
      onEachFeature: (feature, layer) => {
        const { source, subtype, distance_m } = feature.properties;
        const popup = `
          <strong>Kilde:</strong> ${source}<br>
          ${subtype ? `<strong>Type:</strong> ${subtype}<br>` : ""}
          <strong>Avstand:</strong> ${distance_m.toFixed(1)} meter
        `;
        layer.bindPopup(popup);
      }
    }).addTo(map);

    console.log(`✅ ${features.length} korteste linjer lagt til i kartet.`);
  } catch (error) {
    console.error("❌ Feil ved henting av korteste linjer:", error);
  }
}

    // Fetch property boundary geometry from Supabase and return as a Leaflet GeoJSON layer
    async function getPropertyBoundary(eiendom) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_geometry_from_eiendom`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ eiendom_input: eiendom })
        });
        const rows = await response.json();
        if (!rows.length || !rows[0].geometry) {
            throw new Error("Ingen eiendomsgeometri funnet.");
        }
        // Return the GeoJSON layer (not added to map here)
        return L.geoJSON(rows[0].geometry, {
            style: { color: "lime", weight: 5, fillOpacity: 0.1 }
        });
    }

    // Fetch AI-detected unregistered buildings for a property and display them (with processing)
    async function getPropertyDetections(eiendom) {
        try {
            const statusBox = document.getElementById("detection-status");
            if (statusBox) {
                statusBox.style.display = "none";
            }
            // Use existing property boundary (assume searchProperty set this)
            let propertyBoundaryLayer = window.propertyBoundaryLayer;
            if (!propertyBoundaryLayer) {
                // Fallback: fetch property boundary if not already available
                propertyBoundaryLayer = await getPropertyBoundary(eiendom);
                window.propertyBoundaryLayer = propertyBoundaryLayer;
                aiDetectionsLayer.clearLayers();
                propertyBoundaryLayer.addTo(aiDetectionsLayer);
            }
            const propertyBoundaryGeoJSON = propertyBoundaryLayer.toGeoJSON();
            // Ensure allowed building area is shown (assume fetched by searchProperty)
            // Fetch AI detections from Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_unregistered_ai_buildings_for_property`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({ property_eiendom: eiendom })
            });
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            console.log(" Fetched AI detections:", data);
            // If no detections found
            if (!data || !data.features || !Array.isArray(data.features) || data.features.length === 0) {
                console.log("Ingen AI-deteksjoner funnet for eiendommen.");
                // Show a temporary message on screen
                showNoUnregisteredWarning();
                // Allow the user to see the message again on hover over the property boundary
                propertyBoundaryLayer.on('mouseover', () => {
                    const box = document.getElementById('no-unregistered-warning');
                    if (box) { box.style.display = 'block'; box.style.opacity = '1'; }
                });
                propertyBoundaryLayer.on('mouseout', () => {
                    const box = document.getElementById('no-unregistered-warning');
                    if (box) { box.style.opacity = '0'; }
                });
                return null;
            }
            // Detections found – update status box to warn user
            if (statusBox) {
                statusBox.textContent = "⚠️ Mulige uregistrerte bygg funnet – vennligst kontroller.";
                statusBox.style.display = "block";
                statusBox.style.color = "orange";
            }
            // Process each detected feature (convert line outlines to polygons, etc.)
            const processedFeatures = [];
            for (const feature of data.features) {
                const geomType = feature.geometry.type;
                if (geomType === "LineString") {
                    // Close lines to polygons and find oriented bounding box
                    const coords = feature.geometry.coordinates.filter((pt, i, arr) => {
                        if (i === 0) return true;
                        const prev = arr[i - 1];
                        return pt[0] !== prev[0] || pt[1] !== prev[1];
                    });
                    if (coords.length < 3) continue;
                    const first = coords[0], last = coords[coords.length - 1];
                    if (first[0] !== last[0] || first[1] !== last[1]) {
                        coords.push(first);
                    }
                    const polygon = { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: feature.properties };
                    const center = turf.centroid(polygon);
                    let bestFit = null;
                    let smallestArea = Infinity;
                    for (let angle = 0; angle < 180; angle += 5) {
                        const rotated = turf.transformRotate(polygon, angle, { pivot: center });
                        const envelope = turf.envelope(rotated);
                        const area = turf.area(envelope);
                        if (area < smallestArea) {
                            smallestArea = area;
                            bestFit = turf.transformRotate(envelope, -angle, { pivot: center });
                        }
                    }
                    const clipped = turf.intersect(bestFit || polygon, propertyBoundaryGeoJSON);
                    if (clipped && clipped.geometry) {
                        if (clipped.geometry.type === "MultiPolygon") {
                            clipped.geometry.coordinates.forEach(coordsPart => {
                                processedFeatures.push({
                                    type: "Feature",
                                    geometry: { type: "Polygon", coordinates: coordsPart },
                                    properties: feature.properties
                                });
                            });
                        } else if (clipped.geometry.type === "Polygon") {
                            processedFeatures.push({
                                type: "Feature",
                                geometry: clipped.geometry,
                                properties: feature.properties
                            });
                        }
                    }
                } else if (geomType === "Polygon" || geomType === "MultiPolygon") {
                    // If detection is already a polygon, clip it to property boundary
                    const clipped = turf.intersect(feature, propertyBoundaryGeoJSON);
                    if (clipped && clipped.geometry) {
                        if (clipped.geometry.type === "MultiPolygon") {
                            clipped.geometry.coordinates.forEach(coordsPart => {
                                processedFeatures.push({
                                    type: "Feature",
                                    geometry: { type: "Polygon", coordinates: coordsPart },
                                    properties: feature.properties
                                });
                            });
                        } else if (clipped.geometry.type === "Polygon") {
                            processedFeatures.push({
                                type: "Feature",
                                geometry: clipped.geometry,
                                properties: feature.properties
                            });
                        }
                    }
                }
            }
            // Add processed detection polygons to the map
            if (processedFeatures.length > 0) {
                const detectionLayer = L.geoJSON({ type: "FeatureCollection", features: processedFeatures }, {
                    style: { color: 'red', weight: 2, fillOpacity: 0.3 },
                    onEachFeature: (feature, layer) => {
                        const id = feature.properties?.id ?? 'ukjent';
                        const height = feature.properties?.elev ?? 'ukjent';
                        layer.bindPopup(`
                            <strong>Mulig uregistrert bygg</strong><br>
                            ID: ${id}<br>
                            Høyde: ${height} m<br>
                            Informer kommunen hvis den ikke er registrert.
                        `);
                    }
                });
                detectionLayer.addTo(aiDetectionsLayer);
                // Fit map to show property boundary and detections
                const bounds = detectionLayer.getBounds().extend(propertyBoundaryLayer.getBounds());
                if (bounds.isValid()) {
                    map.fitBounds(bounds);
                }
                return processedFeatures.length;
            } else {
                console.log("Ingen gyldige deteksjoner etter prosessering.");
                return null;
            }
        } catch (error) {
            console.error(" Feil ved henting av AI-deteksjoner:", error);
            const statusBox = document.getElementById("detection-status");
            if (statusBox) {
                statusBox.textContent = " Feil ved henting av AI-deteksjoner.";
                statusBox.style.display = "block";
                statusBox.style.color = "red";
            }
            return null;
        }
    }

    // Show a temporary warning when no unregistered buildings are found
    function showNoUnregisteredWarning() {
        const box = document.getElementById('no-unregistered-warning');
        if (!box) return;
        box.style.display = 'block';
        box.style.opacity = '1';
        // Fade out after 10 seconds
        setTimeout(() => { box.style.opacity = '0'; }, 10000);
    }

    /**
     * Search for a property by GNR/BNR (gårdsnr/bruksnr), show its boundary and related info.
     */
    window.searchProperty = async function () {
        const eiendom = document.getElementById('eiendomInput').value.trim();
        const errorMessage = document.getElementById('errorMessage');
        // Clear any previous error message
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        // Validate format (expect "GNR/BNR")
        if (!eiendom || !/^[0-9]+\/[0-9]+$/.test(eiendom)) {
            errorMessage.textContent = ' Ugyldig eiendom. Skriv inn GNR/BNR (f.eks. 502/13).';
            errorMessage.style.display = 'block';
            return;
        }
        // Clear previous map layers and data
        drawnItems.clearLayers();
        labelsLayer.clearLayers();
        if (window.shortestLinesLayer) {
            map.removeLayer(window.shortestLinesLayer);
            window.shortestLinesLayer = null;
        }
        window.aiDetectionsLayer.clearLayers();
        localStorage.removeItem('savedPolygons');
        deletedPolygons = [];
        try {
            // Fetch and display the property boundary
            let propertyBoundaryLayer;
            try {
                propertyBoundaryLayer = await getPropertyBoundary(eiendom);
            } catch (err) {
                console.error(err);
                // Show user-friendly message if property not found
                if (err.message.includes("Ingen eiendomsgeometri")) {
                    errorMessage.textContent = 'Fant ingen eiendom med dette nummeret. Sjekk GNR/BNR og prøv igjen.';
                } else {
                    errorMessage.textContent = 'Det oppstod en teknisk feil ved henting av eiendomsdata.';
                }
                errorMessage.style.display = 'block';
                return;
            }
            window.propertyBoundaryLayer = propertyBoundaryLayer;
            propertyBoundaryLayer.addTo(window.aiDetectionsLayer);
            // Fetch and display allowed building area (if any)
            await getAllowedBuildingArea(eiendom);
            // Fetch AI detections (unregistered buildings) and display them
            const detectionCount = await getPropertyDetections(eiendom);
            // Fit map to property bounds if no detections were displayed
            if (window.propertyBoundaryLayer && window.propertyBoundaryLayer.getBounds().isValid() && !detectionCount) {
                map.fitBounds(window.propertyBoundaryLayer.getBounds());
            }
        } catch (error) {
            console.error("Feil ved søk:", error);
            errorMessage.textContent = ' Det oppstod en teknisk feil ved henting av data.';
            errorMessage.style.display = 'block';
        }
    };

    // Leaflet.draw: Polygon Created
    map.on('draw:created', async function (e) {
        const layer = e.layer;
        const drawnGeoJSON = layer.toGeoJSON().geometry;
        // Ensure allowedBuildingArea is loaded
        if (!window.allowedBuildingArea || !window.allowedBuildingArea.geometry) {
            alert("Tillatt byggeområde er ikke lastet inn ennå.");
            return;
        }
        // Warn if drawn polygon is outside allowed building area
        const isInside = turf.booleanWithin(drawnGeoJSON, window.allowedBuildingArea.geometry);
        if (!isInside) {
            console.warn("Bygningen er utenfor tillatt byggeområde.");
        }
        // Remove any existing drawn objects (only one at a time)
        drawnItems.clearLayers();
        layer.setStyle(polygonStyle);
        drawnItems.addLayer(layer);
        // Update measurements and save new polygon
        measurePolygonSides();
        savePolygons();
        // Calculate shortest lines from this new building to other features
        getShortestLines(drawnGeoJSON);
        // If property context exists, update area display and open checklist
        const eiendom = document.getElementById('eiendomInput')?.value;
        if (eiendom) {
            let area = 0;
            if (layer instanceof L.Polygon) {
                const latlngs = layer.getLatLngs()[0];
                area = L.GeometryUtil.geodesicArea(latlngs);
                const areaDisplay = document.getElementById('nybygg-areal-display');
                if (areaDisplay) {
                    areaDisplay.textContent = `${area.toFixed(1)} m²`;
                }
            }
            const checklistOverlay = document.getElementById('checklist-overlay');
            const toggleBtn = document.getElementById('toggle-checklist');
            if (checklistOverlay && toggleBtn) {
                checklistOverlay.style.right = '0px';
                toggleBtn.innerHTML = '&larr;';
            }
            // Save building data globally for later submission
            window.nybyggData = {
                eiendom,
                area,
                geojson: layer.toGeoJSON(),
                sjekkliste: await evaluateChecklist(eiendom, layer)
            };
        }
    });
    function oversettLeafletKnappetekst() {
  const tryTranslate = () => {
    const editBtn = document.querySelector('.leaflet-draw-edit-edit a');
    const deleteBtn = document.querySelector('.leaflet-draw-edit-remove a');

    if (editBtn && deleteBtn) {
      editBtn.setAttribute('title', 'Rediger bygg');
      editBtn.innerHTML = '<span class="fa fa-pencil-alt"></span>';
      deleteBtn.setAttribute('title', 'Slett bygg');
      deleteBtn.innerHTML = '<span class="fa fa-trash"></span>';
      return true;
    }
    return false;
  };

  let attempts = 0;
  const interval = setInterval(() => {
    if (tryTranslate() || attempts++ > 10) {
      clearInterval(interval);
    }
  }, 300);
}

    // Leaflet.draw: Polygon Edited
    map.on('draw:edited', async function (e) {
        const eiendom = document.getElementById('eiendomInput')?.value;
        if (!eiendom) return;

        // Fjern gamle linjer
        if (window.shortestLinesLayer) {
            map.removeLayer(window.shortestLinesLayer);
            window.shortestLinesLayer = null;
        }

        // Fjern gamle etiketter før nye
        labelsLayer.clearLayers();

        // For hver redigert polygon
        e.layers.eachLayer(async function (layer) {
            const geojson = layer.toGeoJSON();

            // Nye linjer
            getShortestLines(geojson.geometry);

            // Nytt areal
            let area = 0;
            if (layer instanceof L.Polygon) {
                const latlngs = layer.getLatLngs()[0];
                area = L.GeometryUtil.geodesicArea(latlngs);
                const areaDisplay = document.getElementById('nybygg-areal-display');
                if (areaDisplay) {
                    areaDisplay.textContent = `${area.toFixed(1)} m²`;
                }
            }

            // Evaluer sjekkliste på nytt
            const checklistData = await evaluateChecklist(eiendom, layer);

            // Oppdater global state
            window.nybyggData = {
                eiendom,
                area,
                geojson,
                sjekkliste: checklistData
            };
        });

        // 🔁 Legg til nye etiketter etter redigering
        measurePolygonSides();

        // Lagre
        savePolygons();
    });

    // Leaflet.draw: Polygon(s) Deleted
   map.on('draw:deleted', function (e) {
    e.layers.eachLayer(function (layer) {
        // Fjern avstandsetiketter
        labelsLayer.eachLayer(label => {
            if (layer.getBounds().contains(label.getLatLng())) {
                labelsLayer.removeLayer(label);
            }
        });
    });

    // Tøm lagrede polygoner
    e.layers.eachLayer(function (layer) {
        deletedPolygons.push(layer.toGeoJSON());
    });

    // Fjern korteste linjer
    if (window.shortestLinesLayer) {
        map.removeLayer(window.shortestLinesLayer);
        window.shortestLinesLayer = null;
    }

    // 🔁 Nullstill sjekkliste og global nybyggData
    updateChecklist({});
    window.nybyggData = null;

    // Fjern lagret i localStorage
    localStorage.removeItem('savedPolygons');

    // Lagre nåværende state (ofte tomt nå)
    savePolygons();
});

    // ✅ Legg til restore-knappen direkte etter at kartet er laget
const restoreButtonControl = L.control({ position: 'topleft' });
restoreButtonControl.onAdd = function () {
   const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
   div.style.backgroundColor = 'white';
   div.style.padding = '10px';
   div.style.cursor = 'pointer';
   div.innerHTML = '↪';
   div.title = 'Angre sletting';
   div.onclick = restoreLastDeleted;
   return div;
};
restoreButtonControl.addTo(map);


    // Restore the most recently deleted polygon
    function restoreLastDeleted() {
        if (deletedPolygons.length === 0) {
            alert("Ingen slettede polygoner å gjenopprette!");
            return;
        }
        const lastDeleted = deletedPolygons.pop();
        L.geoJSON(lastDeleted, {
            onEachFeature: async function (feature, layer) {
                layer.setStyle(polygonStyle);
                // Replace any existing drawn polygon with this one
                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                // Recalculate measurements and shortest lines
                measurePolygonSides();
                getShortestLines(feature.geometry);
                // Save the restored polygon state
                savePolygons();
                // If a property context exists, re-evaluate and open checklist
                const eiendom = document.getElementById('eiendomInput')?.value;
                if (!eiendom) return;
                // Update area display
                let area = 0;
                if (layer instanceof L.Polygon) {
                    const latlngs = layer.getLatLngs()[0];
                    area = L.GeometryUtil.geodesicArea(latlngs);
                    const areaDisplay = document.getElementById('nybygg-areal-display');
                    if (areaDisplay) {
                        areaDisplay.textContent = `${area.toFixed(1)} m²`;
                    }
                }
                // Open checklist overlay
                const checklistOverlay = document.getElementById('checklist-overlay');
                const toggleBtn = document.getElementById('toggle-checklist');
                if (checklistOverlay && toggleBtn) {
                    checklistOverlay.style.right = '0px';
                    toggleBtn.innerHTML = '&larr;';
                }
                // Save globally and update checklist questions
                window.nybyggData = {
                    eiendom,
                    area,
                    geojson: layer.toGeoJSON(),
                    sjekkliste: await evaluateChecklist(eiendom, layer)  // this also updates the checklist UI
                };
            }
        });
    }

   document.addEventListener('DOMContentLoaded', function () {
  const restoreBtn = document.getElementById('restoreButton');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', function (e) {
      e.preventDefault();
      restoreLastDeleted();
    });
  }
});

    // Add a custom control button to restore deleted polygon

    // Load any saved polygon from previous session
    const savedPolygons = localStorage.getItem('savedPolygons');
    if (savedPolygons) {
        try {
            const geojson = JSON.parse(savedPolygons);
            L.geoJSON(geojson, {
                onEachFeature: function (feature, layer) {
                    if (layer instanceof L.Polygon) {
                        layer.setStyle(polygonStyle);
                        drawnItems.addLayer(layer);
                    }
                }
            });
            measurePolygonSides();
        } catch (error) {
            console.error("Error loading saved polygons:", error);
            localStorage.removeItem('savedPolygons');
        }
    }

    // Show current zoom level on map
    const zoomDisplay = L.control({ position: 'bottomleft' });
    zoomDisplay.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'zoom-display');
        div.innerHTML = `Zoom: ${map.getZoom()}`;
        return div;
    };
    zoomDisplay.addTo(map);
    map.on('zoomend', function () {
        const zoomDiv = document.querySelector('.zoom-display');
        if (zoomDiv) {
            zoomDiv.innerHTML = `Zoom: ${map.getZoom()}`;
        }
    });

    // Polygon drawing style (for drawn buildings)
    const polygonStyle = {
        color: 'red',
        weight: 4,
        opacity: 0.7,
        fillColor: 'red',
        fillOpacity: 0.3,
        dashArray: null
    };

    // Class for creating the checklist UI
   class Checklist {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.questions = [
            "Er det mindre enn 2,0 meter til bygning på naboeiendom?",
            "Er det mindre enn 8,0 meter til nærmeste bygning på naboeiendommen?",
            "Er eiendommen bebygd?",
            "Er eiendommen regulert?",
            "Skal du bygge i et område regulert til LNF-område?",
            "Hvor stort blir det nye du skal bygge?",
            "Skal bygningen plasseres minst 1,0 meter fra andre bygninger på eiendommen din?",
            "Skal det du bygger plasseres minst 1,0 meter fra nabogrensa?",
            "Skal du bygge over vann- og avløpsledninger?",
            "Skal du bygge i nærheten av offentlig vei?",
            "Skal du bygge i nærheten av offentlig vei? --> Kan du likevel velge plasseringen du ønsker deg?",
            "Skal du bygge i et flom- eller skredutsatt område?",
            "Skal du bygge i et flom- eller skredutsatt område? --> Kan du likevel velge plasseringen du ønsker deg?",
            "Skal du bygge nærmere enn 100 meter fra sjøen?",
            "Skal du bygge nærmere enn 100 meter fra sjøen? --> Kan du likevel velge plasseringen du ønsker deg?",
            "Skal du bygge nærmere enn 30 meter til et jernbanespor?",
            "Har eiendommen din stort nok areal til bygningen du ønsker å sette opp?",
            "Begrenser kommunale planer eller andre forhold hva du kan bygge?"
        ];
        this.render();
    }

    render() {
        let html = "<ul class='checklist-ul'>";
        this.questions.forEach((question, index) => {
            html += `<li class="checklist-item">`;

            if (index === 5) {
                // Areal-spørsmål – vis kun verdi
                html += `
                    <span class="check-question">${question}</span>
                    <div class="check-options">
                        <span id="nybygg-areal-display">(Ikke oppgitt)</span>
                    </div>
                `;
            } else {
                // Standard spørsmål med Ja/Nei valg
                html += `
                    <span class="check-question">${question}</span>
                    <div class="check-options">
                        <input type="radio" name="check-${index}" id="check-${index}-yes" value="yes">
                        <label for="check-${index}-yes" class="yes">Ja</label>
                        <input type="radio" name="check-${index}" id="check-${index}-no" value="no">
                        <label for="check-${index}-no" class="no">Nei</label>
                    </div>
                `;
            }

            html += `</li>`;
        });
        html += "</ul>";

        // Bekreftelse nederst
        html += `
            <div class="confirmation-section">
                <p>Stemmer informasjonen?</p>
                <button id="confirm-yes">Ja, lagre</button>
                <button id="confirm-no">Nei</button>
            </div>
        `;

        this.container.innerHTML = html;
    }
}

// Initialiser sjekklisten
new Checklist('checklist-content');

    // Hook up the "Lagre" (save) button in the checklist overlay
    const saveButton = document.getElementById('confirm-yes');
    if (!saveButton) {
        console.warn(" Fant ikke lagre-knappen");
    } else {
        saveButton.addEventListener('click', async () => {
            const data = window.nybyggData;
            if (!data) {
                alert("Ingen bygning å lagre.");
                return;
            }
            // Gather checklist answers
            const responses = {};
            const items = document.querySelectorAll('.checklist-item');
            items.forEach((item, index) => {
                const yesEl = document.getElementById(`check-${index}-yes`);
                const noEl = document.getElementById(`check-${index}-no`);
                responses[`check-${index}`] = yesEl?.checked ? 'yes' : noEl?.checked ? 'no' : null;
            });
            data.sjekkliste = responses;
            console.log("Knappetrykk registrert. Sender data til Supabase:", data);
            // Save the new building (nybygg) data to Supabase (table "byggesoknader")
            const response = await fetch(`${SUPABASE_URL}/rest/v1/byggesoknader`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({
                    eiendom: data.eiendom,
                    geojson: data.geojson,
                    areal_m2: data.area,
                    sjekkliste: data.sjekkliste
                })
            });
            if (response.ok) {
                console.log(" Bygg lagret!");
                alert(" Bygg lagret i Supabase!");
            } else {
                const errorText = await response.text();
                console.error(" Lagring feilet:", errorText);
                alert("Lagring til Supabase feilet.");
            }
        });
    }

    // Global building type selection (dropdown)
    document.getElementById('buildingType').addEventListener('change', function (e) {
        const valgtType = e.target.value;
        window.selectedBuildingType = valgtType;
        if (valgtType !== 'garasje') {
            alert(" Merk: Kun garasje/bod er støttet foreløpig. Andre bygningstyper har ikke egne regler ennå.");
        }
        // Toggle checklist panel visibility control
        let checklistOpenLocal = false;
        function toggleChecklist(openState) {
            const checklistOverlay = document.getElementById('checklist-overlay');
            const toggleBtn = document.getElementById('toggle-checklist');
            if (!checklistOverlay || !toggleBtn) return;
            checklistOpenLocal = openState !== undefined ? openState : !checklistOpenLocal;
            if (checklistOpenLocal) {
                checklistOverlay.style.right = '0px';
                toggleBtn.innerHTML = '&larr;';
            } else {
                checklistOverlay.style.right = '-310px';
                toggleBtn.innerHTML = '&rarr;';
            }
        }
        // Attach event for the checklist toggle button
        document.getElementById('toggle-checklist').addEventListener('click', () => {
            toggleChecklist();
        });

    });
});
