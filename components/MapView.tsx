"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import type { RankedCreator } from "@/lib/types";

interface Props {
  creators: RankedCreator[];
  center?: { lat: number; lng: number };
  onMarkerClick?: (creator: RankedCreator) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  selectedId?: string;
}

export default function MapView({ creators, center, onMarkerClick, onBoundsChange, selectedId }: Props) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = await import("react-leaflet");
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon paths
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const markerCluster = (await import("leaflet.markercluster")).default;
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");

      const MapInner = ({ creatorsInner, centerInner, onMarkerClickInner, selected }: any) => {
        function MapEvents() {
          const map = useMapEvents({
            moveend: () => {
              if (onBoundsChange) {
                const b = map.getBounds();
                onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
              }
            },
          });
          return null;
        }

        return (
          <MapContainer
            center={[centerInner?.lat ?? 39.5, centerInner?.lng ?? -98.35]}
            zoom={centerInner ? 7 : 3}
            className="w-full h-[560px] rounded-3xl overflow-hidden"
            style={{ background: "#050814" }}
          >
            {/* Dark beautiful tiles (CartoDB Dark) */}
            <TileLayer
              attribution='&copy; OpenStreetMap & Carto'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapEvents />

            {creatorsInner.map((c: RankedCreator) => {
              if (!c.lat || !c.lng) return null;

              const isActive = selected === c.id;

              return (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  eventHandlers={{
                    click: () => onMarkerClickInner && onMarkerClickInner(c),
                  }}
                >
                  <Popup className="dark-popup">
                    <div className="min-w-[188px] text-[#F9FAFB]">
                      <div className="font-semibold tracking-tight">{c.display_name}</div>
                      <div className="text-xs text-[#9CA3AF]">@{c.username} • {c.category}</div>
                      {c._distanceKm != null && (
                        <div className="text-xs mt-1 text-[#3BF5FF]">{c._distanceKm.toFixed(0)} km away</div>
                      )}
                      <button
                        onClick={() => onMarkerClickInner && onMarkerClickInner(c)}
                        className="mt-2.5 w-full text-xs px-3 py-1.5 rounded-full bg-[#3BF5FF] text-[#05060A] font-medium"
                      >
                        View full profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        );
      };

      setMapComponent(() => MapInner);
    })();
  }, []);

  if (!MapComponent) {
    return (
      <div className="w-full h-[560px] rounded-3xl border border-[#1F2937] flex items-center justify-center bg-[#050814]">
        <div className="flex flex-col items-center text-[#9CA3AF]">
          <MapPin className="w-6 h-6 mb-2 text-[#3BF5FF]" />
          Loading dark map…
        </div>
      </div>
    );
  }

  return (
    <MapComponent
      creatorsInner={creators}
      centerInner={center}
      onMarkerClickInner={onMarkerClick}
      selected={selectedId}
    />
  );
}
