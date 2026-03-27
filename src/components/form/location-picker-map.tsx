"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useWizardStore } from "@/lib/store/wizard-store";
import { MapPin } from "lucide-react";

// Guatemala City center
const GUATEMALA_CITY = { lat: 14.6349, lng: -90.5069 };
const DEFAULT_ZOOM = 12;

export function LocationPickerMap() {
  const t = useTranslations("locationMap");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const formData = useWizardStore((s) => s.formData);
  const updateField = useWizardStore((s) => s.updateField);

  const savedLat = formData.injury_lat as number | undefined;
  const savedLng = formData.injury_lng as number | undefined;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialCenter = savedLat && savedLng
        ? { lat: savedLat, lng: savedLng }
        : GUATEMALA_CITY;

      const map = L.map(mapRef.current!).setView(
        [initialCenter.lat, initialCenter.lng],
        DEFAULT_ZOOM
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Place marker if coords already saved
      if (savedLat && savedLng) {
        const marker = L.marker([savedLat, savedLng], { draggable: true }).addTo(map);
        marker.bindPopup(`📍 ${savedLat.toFixed(5)}, ${savedLng.toFixed(5)}`).openPopup();
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          updateField("injury_lat", parseFloat(pos.lat.toFixed(6)));
          updateField("injury_lng", parseFloat(pos.lng.toFixed(6)));
          marker.setPopupContent(`📍 ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
          marker.openPopup();
        });
        markerRef.current = marker;
      }

      // Click on map to place / move marker
      map.on("click", (e: unknown) => {
        const { lat, lng } = (e as { latlng: { lat: number; lng: number } }).latlng;

        if (markerRef.current) {
          (markerRef.current as { setLatLng: (pos: [number, number]) => void;
            setPopupContent: (s: string) => void; openPopup: () => void }).setLatLng([lat, lng]);
          (markerRef.current as { setPopupContent: (s: string) => void; openPopup: () => void })
            .setPopupContent(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          (markerRef.current as { openPopup: () => void }).openPopup();
        } else {
          const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
          marker.bindPopup(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            updateField("injury_lat", parseFloat(pos.lat.toFixed(6)));
            updateField("injury_lng", parseFloat(pos.lng.toFixed(6)));
            marker.setPopupContent(`📍 ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
            marker.openPopup();
          });
          markerRef.current = marker;
        }

        updateField("injury_lat", parseFloat(lat.toFixed(6)));
        updateField("injury_lng", parseFloat(lng.toFixed(6)));
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = () => {
    if (markerRef.current) {
      (markerRef.current as { remove: () => void }).remove();
      markerRef.current = null;
    }
    updateField("injury_lat", undefined);
    updateField("injury_lng", undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4 text-gray-500" />
          {t("title")}
          <span className="text-xs font-normal text-gray-500 ml-1">
            — {t("hint")}
          </span>
        </label>
        {savedLat && savedLng && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            {t("clearPin")}
          </button>
        )}
      </div>

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
        style={{ height: "320px", zIndex: 0 }}
      />

      {savedLat && savedLng ? (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-green-600" />
          <span className="text-green-700 font-medium">Coordinates saved:</span>
          {" "}lat {savedLat.toFixed(5)}, lng {savedLng.toFixed(5)}
          <span className="text-gray-400 ml-1">· drag pin to adjust</span>
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          No location selected — this field is optional but enables geospatial analysis.
        </p>
      )}
    </div>
  );
}
