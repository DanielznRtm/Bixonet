"use client";

import type { FeatureCollection, Polygon } from "geojson";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  AttributionControl,
  Layer,
  type MapLayerMouseEvent,
  type MapRef,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/maplibre";
import type { RepublicResult } from "@/lib/data/republics";
import { circlePolygon } from "@/lib/geo";
import { formatPriceRange, KIND_LABEL } from "@/lib/search/format";
import { KIND_STYLE } from "@/lib/search/kind-style";
import { AREA_RADIUS_M, MAP_STYLE, OSM_ATTRIBUTION } from "./maplibre-setup";

type Props = {
  campus: { lat: number; lng: number; name: string; slug: string };
  republics: RepublicResult[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  /** Exige dois dedos / Ctrl+scroll para mexer no mapa (evita prender a rolagem da página). */
  cooperative?: boolean;
};

type AreaProps = { id: string; color: string; highlighted: boolean };

export default function RepublicMap({
  campus,
  republics,
  highlightedId,
  onHighlight,
  cooperative = false,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = republics.find((r) => r.id === selectedId) ?? null;

  const areas = useMemo<FeatureCollection<Polygon, AreaProps>>(
    () => ({
      type: "FeatureCollection",
      features: republics.map((r) => ({
        type: "Feature",
        geometry: circlePolygon(r.lat, r.lng, AREA_RADIUS_M),
        properties: {
          id: r.id,
          color: KIND_STYLE[r.kind].hex,
          highlighted: r.id === highlightedId || r.id === selectedId,
        },
      })),
    }),
    [republics, highlightedId, selectedId],
  );

  // Enquadra o campus e todas as repúblicas encontradas.
  const bounds = useMemo(() => {
    const lats = [campus.lat, ...republics.map((r) => r.lat)];
    const lngs = [campus.lng, ...republics.map((r) => r.lng)];
    const pad = 0.004;
    return [
      [Math.min(...lngs) - pad, Math.min(...lats) - pad],
      [Math.max(...lngs) + pad, Math.max(...lats) + pad],
    ] as [[number, number], [number, number]];
  }, [campus, republics]);

  // Quando os filtros mudam a lista, reenquadra o mapa (o initialViewState só vale na montagem).
  const boundsKey = bounds.flat().join(",");
  useEffect(() => {
    mapRef.current?.fitBounds(bounds, { padding: 32, maxZoom: 15, duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reenquadra só quando os limites mudam
  }, [boundsKey]);

  function handleClick(e: MapLayerMouseEvent) {
    const id = e.features?.[0]?.properties?.id as string | undefined;
    setSelectedId(id ?? null);
  }

  function handleMove(e: MapLayerMouseEvent) {
    const id = e.features?.[0]?.properties?.id as string | undefined;
    onHighlight(id ?? null);
    e.target.getCanvas().style.cursor = id ? "pointer" : "";
  }

  return (
    <div
      data-testid="republic-map"
      className="h-full w-full overflow-hidden rounded-2xl border border-border"
    >
      <Map
        ref={mapRef}
        initialViewState={{ bounds, fitBoundsOptions: { padding: 32, maxZoom: 15 } }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["republic-areas-fill"]}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => onHighlight(null)}
        attributionControl={false}
        cooperativeGestures={cooperative}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <AttributionControl
          position="bottom-right"
          compact
          customAttribution={OSM_ATTRIBUTION}
        />

        <Source id="republic-areas" type="geojson" data={areas}>
          <Layer
            id="republic-areas-fill"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": ["case", ["get", "highlighted"], 0.55, 0.3],
            }}
          />
          <Layer
            id="republic-areas-line"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": ["case", ["get", "highlighted"], 3, 1.5],
            }}
          />
        </Source>

        <Marker longitude={campus.lng} latitude={campus.lat} anchor="bottom">
          <div className="flex flex-col items-center" title={campus.name}>
            <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md">
              <GraduationCap aria-hidden className="size-3.5" />
              {campus.name}
            </span>
            <span className="size-2 -translate-y-0.5 rotate-45 bg-primary" />
          </div>
        </Marker>

        {selected ? (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            offset={12}
            closeButton
            onClose={() => setSelectedId(null)}
            maxWidth="240px"
          >
            <div className="grid gap-1 p-1 font-sans text-foreground">
              <p className="text-xs text-muted-foreground">
                {KIND_LABEL[selected.kind]} · área aproximada
              </p>
              <p className="font-heading text-base font-semibold">{selected.name}</p>
              <p className="text-sm">
                {formatPriceRange(selected.priceMin, selected.priceMax)}
              </p>
              <Link
                href={`/republica/${selected.slug}?de=${campus.slug}`}
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Ver república
              </Link>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
