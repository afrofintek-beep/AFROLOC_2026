import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "../../lib/mapbox";

// Mapa de navegação (mapbox-gl) — PORTADO da Yamioo (NavMap "Como chegar"):
// estilo navigation-day, rota azul com contorno branco, pin de destino, seta de
// posição orientada pelo rumo e câmara inclinada que segue o movimento durante
// o guia ativo. É a MESMA navegação que a Yamioo usa.

const NAV_STYLE = "mapbox://styles/mapbox/navigation-day-v1";
const ROUTE_BLUE = "#1a73e8";
const ROUTE_CASING = "#ffffff";

interface NavMapProps {
  /** geometria da rota em [lat, lng] */
  routeCoords: [number, number][];
  straight: boolean;
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number };
  destTitle: string;
  /** posição ao vivo (só durante o guia) */
  position: { lat: number; lng: number } | null;
  heading: number | null;
  guiding: boolean;
  arrived: boolean;
}

function puckElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = "width:46px;height:46px;display:grid;place-items:center;";
  el.innerHTML = `
    <svg width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#1a73e8" fill-opacity="0.15"/>
      <circle cx="23" cy="23" r="12" fill="#1a73e8" stroke="#ffffff" stroke-width="3"/>
      <path d="M23 13 L29 26 L23 23 L17 26 Z" fill="#ffffff"/>
    </svg>`;
  return el;
}

function originElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText =
    "width:14px;height:14px;border-radius:50%;background:#5f6368;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);";
  return el;
}

export default function NavMap({
  routeCoords,
  straight,
  origin,
  destination,
  destTitle,
  position,
  heading,
  guiding,
  arrived,
}: NavMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const puckRef = useRef<mapboxgl.Marker | null>(null);
  const wasGuidingRef = useRef(false);
  const propsRef = useRef<NavMapProps>({ routeCoords, straight, origin, destination, destTitle, position, heading, guiding, arrived });
  propsRef.current = { routeCoords, straight, origin, destination, destTitle, position, heading, guiding, arrived };

  function syncRoute() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const p = propsRef.current;
    const src = map.getSource("rota") as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: p.routeCoords.map(([la, ln]) => [ln, la]) },
    });
    map.setPaintProperty("rota-linha", "line-color", p.straight ? "#e8542e" : ROUTE_BLUE);
    map.setPaintProperty("rota-linha", "line-dasharray", p.straight ? [1.5, 1.5] : [1, 0]);
    map.setLayoutProperty("rota-casing", "visibility", p.straight ? "none" : "visible");

    destMarkerRef.current?.setLngLat([p.destination.lng, p.destination.lat]);
    if (p.origin) {
      originMarkerRef.current?.setLngLat([p.origin.lng, p.origin.lat]);
      originMarkerRef.current?.getElement().style.setProperty("display", p.guiding ? "none" : "block");
    } else {
      originMarkerRef.current?.getElement().style.setProperty("display", "none");
    }
  }

  function fitOverview() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const p = propsRef.current;
    const pts: [number, number][] = p.routeCoords.length > 1
      ? p.routeCoords
      : [[p.destination.lat, p.destination.lng], ...(p.origin ? [[p.origin.lat, p.origin.lng] as [number, number]] : [])];
    if (pts.length > 1) {
      const b = new mapboxgl.LngLatBounds();
      pts.forEach(([la, ln]) => b.extend([ln, la]));
      map.fitBounds(b, { padding: 70, pitch: 0, bearing: 0, maxZoom: 16.5, duration: 600 });
    } else {
      map.easeTo({ center: [p.destination.lng, p.destination.lat], zoom: 15, pitch: 0, bearing: 0, duration: 600 });
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: NAV_STYLE,
      center: [destination.lng, destination.lat],
      zoom: 13,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    const setup = () => {
      if (readyRef.current) return;
      map.addSource("rota", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: "rota-casing",
        type: "line",
        source: "rota",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ROUTE_CASING, "line-width": 11, "line-opacity": 0.9 },
      });
      map.addLayer({
        id: "rota-linha",
        type: "line",
        source: "rota",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ROUTE_BLUE, "line-width": 6.5 },
      });

      destMarkerRef.current = new mapboxgl.Marker({ color: "#e8542e" })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup({ offset: 28 }).setText(propsRef.current.destTitle))
        .addTo(map);
      originMarkerRef.current = new mapboxgl.Marker({ element: originElement() })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);
      puckRef.current = new mapboxgl.Marker({ element: puckElement(), rotationAlignment: "map", pitchAlignment: "map" })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);
      puckRef.current.getElement().style.display = "none";

      readyRef.current = true;
      syncRoute();
      fitOverview();
      map.resize();
    };
    if (map.isStyleLoaded()) setup();
    else map.once("style.load", setup);

    // Garante o 1º paint das tiles base: o contentor pode surgir via Suspense
    // depois do init — sem isto o mapa fica branco até haver um resize. Um
    // map.resize() simples não chega (tamanho "igual" → no-op); disparar o
    // evento de resize força o repaint. Repetido para cobrir o layout tardio.
    const nudge = () => {
      try {
        map.resize();
        map.triggerRepaint();
        // Força o browser a recompositar o canvas WebGL (sob o transform da
        // moldura de telemóvel, as tiles ficam pintadas mas não compostas).
        // Mantém a opacidade baixa ~80ms (garante ≥1 paint real) e restaura —
        // força o compositor a repintar as tiles (que ficam pintadas mas não
        // compostas sob o transform da moldura). Um toggle por RAF é coalescido.
        const cv = map.getCanvas();
        cv.style.opacity = "0.4";
        setTimeout(() => { cv.style.opacity = "1"; }, 90);
      } catch { /* mapa já removido */ }
    };
    const resizeTimers = [250, 700, 1400, 2400].map((ms) => setTimeout(nudge, ms));

    return () => {
      resizeTimers.forEach(clearTimeout);
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    syncRoute();
    if (!propsRef.current.guiding) fitOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeCoords, straight, origin?.lat, origin?.lng, destination.lat, destination.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const puck = puckRef.current;

    if (guiding && position) {
      wasGuidingRef.current = true;
      if (puck) {
        puck.getElement().style.display = "block";
        puck.setLngLat([position.lng, position.lat]);
        if (heading != null) puck.setRotation(heading);
      }
      if (arrived) {
        map.easeTo({ center: [destination.lng, destination.lat], zoom: 16.5, pitch: 0, bearing: 0, duration: 900 });
      } else {
        const zoomAtual = map.getZoom();
        map.easeTo({
          center: [position.lng, position.lat],
          zoom: Number.isFinite(zoomAtual) ? Math.max(zoomAtual, 17) : 17,
          pitch: 55,
          bearing: heading ?? map.getBearing(),
          duration: 850,
          offset: [0, Math.round((containerRef.current?.clientHeight ?? 600) * 0.18)],
        });
      }
    } else if (wasGuidingRef.current) {
      wasGuidingRef.current = false;
      if (puck) puck.getElement().style.display = "none";
      fitOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guiding, arrived, position?.lat, position?.lng, heading]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-label="Mapa de navegação" />;
}
