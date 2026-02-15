import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon (Vite + React needs this)
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
};

export default function MapView({ lat, lon, city }: MapViewProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
      <h2 className="text-lg font-semibold mb-3">Map</h2>

      <div className="h-80 rounded-lg overflow-hidden border border-slate-700">
        <MapContainer
          center={[lat, lon]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[lat, lon]} icon={markerIcon}>
            <Popup>
              {city}
              <br />
              Lat: {lat}, Lon: {lon}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
