"use client";

import type { Feature, Polygon } from "geojson";
import Map, {
  AttributionControl,
  Layer,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";
import { circlePolygon } from "@/lib/geo";
import { AREA_RADIUS_M, MAP_STYLE, OSM_ATTRIBUTION } from "./maplibre-setup";

type Props = { lat: number; lng: number; color: string };

/** Mapa de uma república só: um círculo de ~150 m em volta do ponto aproximado. */
export default function AreaMap({ lat, lng, color }: Props) {
  const area: Feature<Polygon> = {
    type: "Feature",
    geometry: circlePolygon(lat, lng, AREA_RADIUS_M),
    properties: {},
  };

  return (
    <Map
      initialViewState={{ latitude: lat, longitude: lng, zoom: 14.5 }}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      cooperativeGestures
      maxZoom={16}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <AttributionControl
        position="bottom-right"
        compact
        customAttribution={OSM_ATTRIBUTION}
      />
      <Source id="area" type="geojson" data={area}>
        <Layer
          id="area-fill"
          type="fill"
          paint={{ "fill-color": color, "fill-opacity": 0.3 }}
        />
        <Layer
          id="area-line"
          type="line"
          paint={{ "line-color": color, "line-width": 2 }}
        />
      </Source>
    </Map>
  );
}
