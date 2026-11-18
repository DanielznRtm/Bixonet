"use client";

import { GraduationCap, MapPin } from "lucide-react";
import Map, {
  AttributionControl,
  type MapLayerMouseEvent,
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";
import { MAP_STYLE, OSM_ATTRIBUTION } from "@/components/map/maplibre-setup";

type Point = { lat: number; lng: number };

type Props = {
  value: Point | null;
  onChange: (point: Point) => void;
  /** Onde o mapa abre quando ainda não há ponto (centro da cidade ou do campus). */
  center: Point;
  campuses: { id: string; name: string; lat: number; lng: number }[];
};

/**
 * O dono marca a casa no mapa (toque ou arraste o pino) em vez de digitar o endereço.
 * O ponto é arredondado para ~100 m pelo banco ao salvar.
 */
export default function LocationPicker({ value, onChange, center, campuses }: Props) {
  function handleClick(e: MapLayerMouseEvent) {
    onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  }

  return (
    <Map
      initialViewState={{
        latitude: value?.lat ?? center.lat,
        longitude: value?.lng ?? center.lng,
        zoom: value ? 15 : 12.5,
      }}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      onClick={handleClick}
      cursor="crosshair"
    >
      <NavigationControl position="top-right" showCompass={false} />
      <AttributionControl
        position="bottom-right"
        compact
        customAttribution={OSM_ATTRIBUTION}
      />

      {campuses.map((c) => (
        <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="bottom">
          <span className="flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shadow">
            <GraduationCap aria-hidden className="size-3" />
            {c.name}
          </span>
        </Marker>
      ))}

      {value ? (
        <Marker
          longitude={value.lng}
          latitude={value.lat}
          anchor="bottom"
          draggable
          onDragEnd={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        >
          <MapPin
            aria-label="Ponto da república (arraste para ajustar)"
            className="size-10 fill-primary text-primary-foreground drop-shadow-md"
          />
        </Marker>
      ) : null}
    </Map>
  );
}
