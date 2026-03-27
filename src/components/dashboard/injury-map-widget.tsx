"use client";

import { useEffect, useRef } from "react";

interface Point {
  lat: number;
  lng: number;
  outcome?: string;
}

interface Props {
  points: Point[];
}

const GC_CENTER: [number, number] = [14.6349, -90.5069];

export function InjuryMapWidget({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
        .setView(GC_CENTER, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      // Draw all points as circles
      points.forEach((pt) => {
        const isDeath = pt.outcome?.startsWith("died");
        L.circleMarker([pt.lat, pt.lng], {
          radius: 6,
          fillColor: isDeath ? "#dc2626" : "#2563eb",
          color: isDeath ? "#991b1b" : "#1d4ed8",
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.55,
        }).addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="space-y-2">
        <div
          ref={mapRef}
          className="w-full rounded-lg border overflow-hidden"
          style={{ height: 340, zIndex: 0 }}
        />
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 opacity-70" />
            Survived ({points.filter(p => !p.outcome?.startsWith("died")).length})
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600 opacity-70" />
            Death ({points.filter(p => p.outcome?.startsWith("died")).length})
          </span>
        </div>
      </div>
    </>
  );
}
