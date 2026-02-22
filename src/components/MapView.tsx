import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo, useState } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapViewProps = {
  lat: number;
  lon: number;
  city: string;
  showGeology: boolean;
  geologyLayer: "bedrock" | "quaternary";
  showOilGas: boolean;
};

type ClickPoint = {
  lat: number;
  lng: number;
};

function MapClickCoordinates({
  enabled,
  onClickPoint,
}: {
  enabled: boolean;
  onClickPoint: (p: ClickPoint) => void;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onClickPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export default function MapView({
  lat,
  lon,
  city,
  showGeology,
  geologyLayer,
  showOilGas,
}: MapViewProps) {
  const [showLegend, setShowLegend] = useState(false);

  // This is needed because you pass setClickPoint into MapClickCoordinates
  const [clickPoint, setClickPoint] = useState<ClickPoint | null>(null);

  // Build the correct legend URL for the selected geology layer
  const legendUrl = useMemo(() => {
    const serviceName =
      geologyLayer === "bedrock" ? "BerggrunnWMS3" : "LosmasserWMS3";

    return (
      `https://geo.ngu.no/mapserver/${serviceName}` +
      "?SERVICE=WMS" +
      "&REQUEST=GetLegendGraphic" +
      "&VERSION=1.3.0" +
      "&FORMAT=image/png" +
      `&LAYER=${serviceName}` +
      "&SLD_VERSION=1.1.0"
    );
  }, [geologyLayer]);

  const geologyLayerLabel =
    geologyLayer === "bedrock"
      ? "Bedrock (Berggrunn)"
      : "Loose deposits (Løsmasser)";

  // NGU search link for the clicked coordinate (now we will actually use it)
  const nguSearchUrl = (p: ClickPoint) =>
    `https://www.ngu.no/sok?query=${p.lat.toFixed(5)}%2C${p.lng.toFixed(5)}`;

  // Simple basin classification from latitude
  let basinName = "North Sea Basin";
  if (lat >= 60 && lat < 70) basinName = "Norwegian Sea Basin";
  if (lat >= 70) basinName = "Barents Sea Basin";

  const petroleumSystems: Record<
    string,
    {
      source: string;
      reservoir: string;
      seal: string;
      trap: string;
      migration: string;
    }
  > = {
    "North Sea Basin": {
      source: "Upper Jurassic Draupne Formation shales",
      reservoir: "Brent Group sandstones",
      seal: "Regional Jurassic–Cretaceous shales",
      trap: "Fault blocks and rotated structural traps",
      migration: "Vertical migration along rift faults",
    },
    "Norwegian Sea Basin": {
      source: "Jurassic marine shales",
      reservoir: "Cretaceous and Jurassic sandstones",
      seal: "Thick marine shales",
      trap: "Tilted fault blocks and structural highs",
      migration: "Fault-controlled migration pathways",
    },
    "Barents Sea Basin": {
      source: "Upper Paleozoic to Jurassic source rocks",
      reservoir: "Triassic sandstones",
      seal: "Regional shale intervals",
      trap: "Structural closures and stratigraphic traps",
      migration: "Long-distance lateral migration",
    },
  };

  // Safety fallback (should always exist, but prevents crash if keys change)
  const system =
    petroleumSystems[basinName] ?? petroleumSystems["North Sea Basin"];

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm text-slate-300">
          NGU geology overlays for learning and pre-field planning.
        </p>

        {showGeology && (
          <button
            onClick={() => setShowLegend((prev) => !prev)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-700 text-sm"
          >
            {showLegend ? "Hide legend" : "Show legend"}
          </button>
        )}
      </div>

      {/* Click info box (uses nguSearchUrl so build passes) */}
      {showGeology && clickPoint && (
        <div className="mb-4 p-3 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-300">
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-slate-400">Clicked:</span>{" "}
              {clickPoint.lat.toFixed(5)}, {clickPoint.lng.toFixed(5)}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={nguSearchUrl(clickPoint)}
                target="_blank"
                rel="noreferrer"
                className="underline text-slate-200 hover:text-white"
              >
                Search these coordinates on NGU
              </a>

              <button
                onClick={() => setClickPoint(null)}
                className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP + PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MAP */}
        <div className="lg:col-span-2 h-80 rounded-lg overflow-hidden border border-slate-700">
          <MapContainer
            center={[lat, lon]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showGeology && geologyLayer === "bedrock" && (
              <WMSTileLayer
                attribution="© NGU"
                url="https://geo.ngu.no/mapserver/BerggrunnWMS3"
                layers="BerggrunnWMS3"
                format="image/png"
                transparent={true}
                opacity={0.6}
              />
            )}

            {showGeology && geologyLayer === "quaternary" && (
              <WMSTileLayer
                attribution="© NGU"
                url="https://geo.ngu.no/mapserver/LosmasserWMS3"
                layers="LosmasserWMS3"
                format="image/png"
                transparent={true}
                opacity={0.6}
              />
            )}

            {showOilGas && (
              <WMSTileLayer
                attribution="© Norwegian Offshore Directorate"
                url="https://factmaps.sodir.no/api/services/Factmaps/FactMapsWGS84/MapServer/WMSServer"
                layers="0"
                format="image/png"
                transparent={true}
                opacity={0.6}
              />
            )}

            <MapClickCoordinates
              enabled={showGeology}
              onClickPoint={setClickPoint}
            />

            <Marker position={[lat, lon]} icon={markerIcon}>
              <Popup>
                <div className="font-semibold">{city}</div>
                <div>Lat: {lat}</div>
                <div>Lon: {lon}</div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* PETROLEUM PANEL */}
        {showOilGas && (
          <div className="lg:col-span-1 p-4 rounded-lg border border-slate-700 bg-slate-900">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Petroleum Systems Simplified
            </div>

            <h3 className="mt-2 text-lg font-semibold text-slate-100">
              {basinName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {showGeology
                ? "Geology overlay helps you connect structure + stratigraphy to petroleum elements."
                : "Turn on Geology to connect rocks and structures to petroleum elements."}
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>
                <div className="text-slate-400 text-xs">Main age</div>
                <div>Jurassic</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs">Key source rock</div>
                <div>Draupne Formation</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs">Common traps</div>
                <div>Fault blocks, structural traps</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs">Why it matters</div>
                <div>
                  One of the world’s most important offshore petroleum
                  provinces.
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs">
                  Petroleum System Elements
                </div>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>
                    <strong>Source:</strong> {system.source}
                  </li>
                  <li>
                    <strong>Reservoir:</strong> {system.reservoir}
                  </li>
                  <li>
                    <strong>Seal:</strong> {system.seal}
                  </li>
                  <li>
                    <strong>Trap:</strong> {system.trap}
                  </li>
                  <li>
                    <strong>Migration:</strong> {system.migration}
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <div className="text-slate-400 text-xs">
                  Field Geological Implications
                </div>

                <p className="mb-2 text-sm text-slate-300">
                  Geological context can amplify or reduce field risk depending
                  on weather and terrain conditions.
                </p>

                <ul className="list-disc ml-4 mt-1 space-y-1 text-sm">
                  <li>Faulted areas may contain fractured and unstable rock.</li>
                  <li>Loose Quaternary deposits increase slip risk during rain.</li>
                  <li>Steep structural dips may increase rockfall potential.</li>
                  <li>
                    Lithology affects erosion, drainage, and access conditions.
                  </li>
                </ul>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Basin classification and petroleum system elements shown here are
                simplified educational summaries based on dominant regional
                characteristics.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LEGEND */}
      {showGeology && showLegend && (
        <div className="mt-4 p-3 rounded-lg border border-slate-700 bg-slate-900">
          <div className="text-sm text-slate-300 mb-2">
            NGU legend: {geologyLayerLabel}
          </div>
          <img
            src={legendUrl}
            alt="NGU Legend"
            className="max-w-full rounded-md"
          />
        </div>
      )}
    </div>
  );
}