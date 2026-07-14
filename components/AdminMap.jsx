"use client";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

const POS = {
  BR: [-14.2, -51.9], US: [39.8, -98.6], PT: [39.6, -8.0], ES: [40.4, -3.7], MX: [23.6, -102.5],
  AR: [-38.4, -63.6], CO: [4.6, -74.1], CL: [-35.7, -71.5], PE: [-9.2, -75.0], UY: [-32.5, -55.8],
  PY: [-23.4, -58.4], BO: [-16.3, -63.6], EC: [-1.8, -78.2], VE: [6.4, -66.6], CA: [56.1, -106.3],
  GB: [54.0, -2.9], IE: [53.4, -8.2], FR: [46.6, 2.2], DE: [51.2, 10.4], IT: [41.9, 12.6],
  NL: [52.1, 5.3], BE: [50.5, 4.5], CH: [46.8, 8.2], AT: [47.5, 14.6], SE: [62.0, 15.0],
  NO: [64.5, 11.0], DK: [56.0, 10.0], FI: [64.0, 26.0], PL: [52.0, 19.0], CZ: [49.8, 15.5],
  RO: [45.9, 25.0], GR: [39.0, 22.0], TR: [39.0, 35.0], IL: [31.4, 35.0], AE: [24.0, 54.0],
  SA: [24.0, 45.0], ZA: [-29.0, 24.0], AO: [-12.3, 17.5], MZ: [-18.7, 35.5], NG: [9.1, 8.7],
  EG: [26.8, 30.8], IN: [21.0, 78.0], CN: [35.0, 103.0], JP: [36.2, 138.3], KR: [36.5, 127.9],
  SG: [1.35, 103.8], AU: [-25.3, 133.8], NZ: [-41.0, 174.0], PH: [12.9, 121.8], ID: [-2.5, 118.0],
  TH: [15.8, 101.0], VN: [16.0, 107.8], DO: [18.7, -70.2], CR: [9.7, -83.8], PA: [8.5, -80.1],
  GT: [15.8, -90.2], HN: [14.8, -86.6], SV: [13.8, -88.9], NI: [12.9, -85.2], JM: [18.1, -77.3],
};

export default function AdminMap({ byCountry }) {
  const entries = Object.entries(byCountry || {}).filter(([c]) => POS[c]);
  const unknown = Object.entries(byCountry || {}).filter(([c]) => !POS[c]);
  return (
    <div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        .td-pin { position: relative; width: 38px; height: 38px; }
        .td-pin .body { position: absolute; inset: 0; background: #F47B20; border: 3px solid #12143A;
          border-radius: 50% 50% 50% 6px; transform: rotate(-45deg); box-shadow: 0 3px 8px rgba(0,0,0,0.45); }
        .td-pin span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: #12143A; font-weight: 900; font-size: 14px; font-family: Inter, system-ui, sans-serif; }
        .leaflet-container { background: #0D0F2E; }
      `}</style>
      <MapContainer center={[18, -20]} zoom={2} minZoom={1} style={{ height: 420, width: "100%", borderRadius: 14 }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {entries.map(([c, n]) => (
          <Marker key={c} position={POS[c]}
            icon={L.divIcon({ className: "", html: '<div class="td-pin"><div class="body"></div><span>' + n + "</span></div>", iconSize: [38, 38], iconAnchor: [19, 34] })}>
            <Tooltip>{c}: {n}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {unknown.length > 0 && (
        <p style={{ color: "#A9AEDB", fontSize: 14, marginTop: 8 }}>
          Sem posição no mapa: {unknown.map(([c, n]) => c + " (" + n + ")").join(" · ")}
        </p>
      )}
    </div>
  );
}
