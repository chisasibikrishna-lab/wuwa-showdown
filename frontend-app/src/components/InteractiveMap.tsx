"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTile, setTile } from "@/lib/tileCache";

export interface InteractiveMapProps {
  onLocationSelect?: (coords: [number, number]) => void;
  selectedLocation?: [number, number] | null;
  correctLocation?: [number, number] | null;
  readOnly?: boolean;
}

export default function InteractiveMap({ onLocationSelect, selectedLocation, correctLocation, readOnly = false }: InteractiveMapProps = {}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const readOnlyRef = useRef(readOnly);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    readOnlyRef.current = readOnly;
    onLocationSelectRef.current = onLocationSelect;
  }, [readOnly, onLocationSelect]);

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current || !containerRef.current) return;

    // Define categories
    const CATEGORIES = {
      nexus: { id: "nexus", name: "Resonance Nexus", color: "#3b82f6", active: true },
      beacon: { id: "beacon", name: "Resonance Beacon", color: "#60a5fa", active: true },
      chest: { id: "chest", name: "Supply Chest", color: "#eab308", active: true },
      casket: { id: "casket", name: "Sonance Casket", color: "#a855f7", active: true },
      enemy: { id: "enemy", name: "Elite Enemy", color: "#ef4444", active: false },
      resource: { id: "resource", name: "Rare Resource", color: "#22c55e", active: false },
    };

    const MAP_SIZE = 2048;
    const markersData: any[] = []; // Empty array for initial data like the user's snippet
    let markerLayers: L.Marker[] = [];
    const foundMarkers = new Set(JSON.parse(localStorage.getItem("gameMap_found") || "[]"));

    const GameCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1, 0, 1, 0),
    });

    const map = L.map(containerRef.current, {
      crs: GameCRS,
      minZoom: -2,
      maxZoom: 3,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [-500, -500],
        [2548, 2548],
      ],
    });

    mapRef.current = map;

    const bounds: L.LatLngBoundsLiteral = [
      [0, 0],
      [MAP_SIZE, MAP_SIZE],
    ];

    const getTileUrlForCoords = (coords: any): string | null => {
      const x = coords.x;
      const y = coords.y;
      if (x < 0 || x > 3 || y < 0 || y > 3) return null;
      const fileX = Math.floor(x / 2);
      const fileY = Math.floor(y / 2);
      const cropX = (x % 2) * 512;
      const cropY = (y % 2) * 512;
      return `https://static-web.ghzs.com/cspage_pro/mingchao-map/map/694b547e098e7f00018a63b8/${fileX}_${fileY}.webp?x-oss-process=image/resize,p_25/crop,x_${cropX},y_${cropY},w_512,h_512`;
    };

    const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const WutheringLayer = L.TileLayer.extend({
      createTile(coords: any, done: (err: Error | null, tile: HTMLElement) => void) {
        const img = document.createElement("img");
        img.setAttribute("role", "presentation");

        const url = getTileUrlForCoords(coords);
        if (!url) {
          img.src = BLANK_TILE;
          done(null, img);
          return img;
        }

        const cacheKey = `tile_${coords.x}_${coords.y}_${coords.z}`;

        getTile(cacheKey).then((cached) => {
          if (cached) {
            // Serve from IndexedDB
            img.src = URL.createObjectURL(cached);
            done(null, img);
          } else {
            // Fetch from network, cache it, then display
            fetch(url, { mode: "cors" })
              .then((res) => {
                if (!res.ok) throw new Error("network");
                return res.blob();
              })
              .then((blob) => {
                setTile(cacheKey, blob); // fire-and-forget
                img.src = URL.createObjectURL(blob);
                done(null, img);
              })
              .catch(() => {
                // CORS or network failed — fall back to direct URL
                img.src = url;
                img.onload = () => done(null, img);
                img.onerror = () => done(new Error("tile load failed"), img);
              });
          }
        });

        return img;
      },
    });

    // @ts-ignore
    new WutheringLayer("", {
      tileSize: 512,
      minNativeZoom: 0,
      maxNativeZoom: 0,
      minZoom: -2,
      maxZoom: 3,
      noWrap: true,
      bounds: bounds,
    }).addTo(map);

    map.fitBounds(bounds);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Pin Dropping Logic
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (readOnlyRef.current) return;
      if (onLocationSelectRef.current) {
        onLocationSelectRef.current([e.latlng.lat, e.latlng.lng]);
      }
    });

    const renderMarkers = () => {
      markerLayers.forEach((layer) => map.removeLayer(layer));
      markerLayers = [];

      markersData.forEach((data) => {
        // @ts-ignore
        const cat = CATEGORIES[data.type];
        const isFound = foundMarkers.has(data.id);

        const iconHtml = `
            <div class="game-marker ${isFound ? "found" : ""}" style="color: ${cat.color}; width: 16px; height: 16px;">
            </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "", // Clear default leaflet classes
          iconSize: [16, 16],
          iconAnchor: [8, 8], // Center
          popupAnchor: [0, -10],
        });

        const marker = L.marker([data.lat, data.lng], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
            <div class="p-0">
                <div class="px-4 py-3 border-b border-slate-700" style="border-top: 3px solid ${cat.color}">
                    <div class="flex items-center gap-2 mb-1">
                        <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${cat.color}; box-shadow: 0 0 8px ${cat.color}"></div>
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">${cat.name}</span>
                    </div>
                    <h3 class="font-bold text-base text-white">${data.title}</h3>
                </div>
                <div class="px-4 py-3 text-sm text-slate-300">
                    <p class="mb-4">${data.desc}</p>
                    <div class="flex gap-2">
                        <button class="toggle-found-btn flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                          isFound ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-blue-600 text-white hover:bg-blue-500"
                        }">
                            ${isFound ? "Unmark" : "Mark Found"}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const toggleBtn = popupContent.querySelector(".toggle-found-btn");
        if (toggleBtn) {
          toggleBtn.addEventListener("click", () => {
            if (foundMarkers.has(data.id)) {
              foundMarkers.delete(data.id);
            } else {
              foundMarkers.add(data.id);
            }
            localStorage.setItem("gameMap_found", JSON.stringify(Array.from(foundMarkers)));
            map.closePopup();
            renderMarkers(); // Re-render to update classes
          });
        }

        marker.bindPopup(popupContent, { minWidth: 240, maxWidth: 240 });
        markerLayers.push(marker);
      });
    };

    renderMarkers();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run only once on mount

  // Effect to sync selectedLocation pin
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const correctMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedLocation) {
      if (!selectedMarkerRef.current) {
        const iconHtml = `
          <div class="flex flex-col items-center justify-center -translate-y-3">
            <div class="game-marker" style="background-color: #ffcc00; width: 20px; height: 20px; border: 2px solid white; box-shadow: 0 0 15px #ffcc00;"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-primary mt-1 bg-black/80 px-1 border border-primary/30 rounded whitespace-nowrap">Your Mark</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [60, 40],
          iconAnchor: [30, 20], // Center
        });
        selectedMarkerRef.current = L.marker(selectedLocation, { icon: customIcon }).addTo(mapRef.current);
      } else {
        selectedMarkerRef.current.setLatLng(selectedLocation);
      }
    } else if (selectedMarkerRef.current) {
      mapRef.current.removeLayer(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }

    // Correct Location Pin
    if (correctLocation) {
      if (!correctMarkerRef.current) {
        const iconHtml = `
          <div class="flex flex-col items-center justify-center -translate-y-3 relative z-50">
            <div style="background-color: #22c55e; width: 24px; height: 24px; border: 2px solid white; box-shadow: 0 0 20px #22c55e; border-radius: 50%;"></div>
            <span class="text-[11px] font-bold uppercase tracking-widest text-[#22c55e] mt-1 bg-black/90 px-2 py-0.5 border border-[#22c55e]/50 rounded whitespace-nowrap">Actual Target</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [80, 50],
          iconAnchor: [40, 25],
        });
        correctMarkerRef.current = L.marker(correctLocation, { icon: customIcon }).addTo(mapRef.current);
      } else {
        correctMarkerRef.current.setLatLng(correctLocation);
      }

      // Draw dashed line between them if both are active
      if (selectedLocation) {
        if (!lineRef.current) {
          lineRef.current = L.polyline([selectedLocation, correctLocation], {
            color: "#ffffff",
            weight: 3,
            dashArray: "10, 10",
            opacity: 0.8,
          }).addTo(mapRef.current);
          
          // Fit map boundaries to newly revealed distance!
          mapRef.current.fitBounds(L.latLngBounds([selectedLocation, correctLocation]), { padding: [50, 50] });
        } else {
          lineRef.current.setLatLngs([selectedLocation, correctLocation]);
        }
      }
    } else {
      if (correctMarkerRef.current) {
        mapRef.current.removeLayer(correctMarkerRef.current);
        correctMarkerRef.current = null;
      }
      if (lineRef.current) {
        mapRef.current.removeLayer(lineRef.current);
        lineRef.current = null;
      }
    }
  }, [selectedLocation, correctLocation]);

  return (
    <>
      <style>{`
        .leaflet-container { background: #063143ff; outline: 0; z-index: 10; }
        
        .leaflet-popup-content-wrapper {
            background-color: #1e293b;
            color: #f8fafc;
            border: 1px solid #334155;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
            padding: 0;
            overflow: hidden;
        }
        .leaflet-popup-content { margin: 0; width: 240px !important; }
        .leaflet-popup-tip {
            background-color: #1e293b;
            border-top: 1px solid #334155;
            border-left: 1px solid #334155;
        }
        .leaflet-popup-close-button { color: #cbd5e1 !important; margin-top: 4px; margin-right: 4px; }

        .game-marker {
            border-radius: 50%;
            transition: all 0.2s ease;
            background-color: currentColor;
            box-shadow: 0 0 12px currentColor;
            cursor: pointer;
            position: relative;
        }
        .game-marker:hover { transform: scale(1.2); z-index: 1000 !important; }
        .game-marker::after {
            content: '';
            position: absolute;
            top: -4px; left: -4px; right: -4px; bottom: -4px;
            border-radius: 50%;
            border: 1px solid currentColor;
            opacity: 0.5;
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
      <div ref={containerRef} className="w-full h-full relative z-10" />
    </>
  );
}
