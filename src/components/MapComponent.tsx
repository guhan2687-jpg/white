import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ServiceProvider, UserLocation } from '../types';
import { CATEGORIES_META } from '../data/mockProviders';
import { formatCurrency, formatDistance } from '../utils/geoUtils';
import { Compass, LocateFixed, Maximize2 } from 'lucide-react';

interface MapComponentProps {
  userLocation: UserLocation;
  providers: ServiceProvider[];
  selectedProvider: ServiceProvider | null;
  onSelectProvider: (provider: ServiceProvider | null) => void;
  onLocationChange: (lat: number, lng: number) => void;
  maxRadiusKm: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  providers,
  selectedProvider,
  onSelectProvider,
  onLocationChange,
  maxRadiusKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right to avoid header overlay
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Click on map to relocate search center
    map.on('click', (e: L.LeafletMouseEvent) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    });

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location pin and coverage radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // User pin icon with radar pulse
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-blue-500/30 rounded-full radar-pulse"></div>
        <div class="relative w-8 h-8 bg-blue-600 border-3 border-white rounded-full shadow-lg flex items-center justify-center text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    `;

    const userDivIcon = L.divIcon({
      className: 'custom-map-pin',
      html: userIconHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userDivIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-3 text-center">
          <div class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Your Selected Location</div>
          <div class="text-sm font-medium text-slate-800">${userLocation.addressName || 'Current Search Point'}</div>
          <div class="text-xs text-slate-500 mt-1">Tap anywhere on map to move search center</div>
        </div>
      `, { className: 'custom-popup' });

      userMarkerRef.current = marker;
    }

    // Radius coverage circle
    const radiusMeters = maxRadiusKm * 1000;
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      radiusCircleRef.current.setRadius(radiusMeters);
    } else {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusMeters,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.12,
        weight: 1.8,
        dashArray: '4, 6',
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [userLocation.lat, userLocation.lng, userLocation.addressName, maxRadiusKm]);

  // Update provider markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    providers.forEach((prov) => {
      const meta = CATEGORIES_META.find((c) => c.id === prov.category) || CATEGORIES_META[1];
      const isSelected = selectedProvider?.id === prov.id;

      // Icon colors based on category
      const pinColor = meta.color || '#3b82f6';
      const isEmergency = prov.category === 'emergency_sos';

      const iconEmoji =
        prov.category === 'electrician' ? '⚡' :
        prov.category === 'plumber' ? '🔧' :
        prov.category === 'mechanic' ? '🚗' :
        prov.category === 'ac_repair' ? '❄️' :
        prov.category === 'doctor' ? '🏥' :
        prov.category === 'emergency_sos' ? '🚨' :
        prov.category === 'carpenter' ? '🪚' :
        prov.category === 'cleaning' ? '🧹' : '📺';

      const markerHtml = `
        <div class="group relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-115'
        }">
          <div class="flex items-center justify-center w-9 h-9 rounded-2xl shadow-md border-2 ${
            isSelected ? 'border-amber-400 ring-4 ring-amber-300/60' : 'border-white'
          } ${isEmergency ? 'bg-red-600 animate-pulse' : ''}" style="background-color: ${pinColor}">
            <span class="text-base select-none">${iconEmoji}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${pinColor}"></div>
          ${
            prov.distanceKm !== undefined
              ? `<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">${formatDistance(
                  prov.distanceKm
                )}</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: markerHtml,
        iconSize: [36, 46],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([prov.lat, prov.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 w-64 text-left';
      popupContent.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor}">
            ${meta.label}
          </span>
          <div class="flex items-center text-xs font-bold text-amber-600">
            ★ ${prov.rating.toFixed(1)}
          </div>
        </div>
        <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-1">${prov.name}</h4>
        <p class="text-xs text-slate-500 mb-2 line-clamp-1">${prov.locality}</p>
        
        <div class="flex items-center justify-between text-xs py-1.5 border-t border-b border-slate-100 mb-2">
          <span class="text-slate-600 font-medium">Distance: <b class="text-blue-700">${prov.distanceKm ? formatDistance(prov.distanceKm) : 'Nearby'}</b></span>
          <span class="text-emerald-700 font-bold">${formatCurrency(prov.hourlyRate)}/hr</span>
        </div>

        <button id="view-prov-${prov.id}" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm transition">
          View Profile & Book
        </button>
      `;

      marker.bindPopup(popupContent, { className: 'custom-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prov-${prov.id}`);
        if (btn) {
          btn.onclick = () => onSelectProvider(prov);
        }
      });

      marker.on('click', () => {
        onSelectProvider(prov);
      });

      marker.addTo(markersLayer);
    });
  }, [providers, selectedProvider]);

  // Draw dashed route / connection line when a provider is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (selectedProvider) {
      const userLatLng: [number, number] = [userLocation.lat, userLocation.lng];
      const provLatLng: [number, number] = [selectedProvider.lat, selectedProvider.lng];

      const polyline = L.polyline([userLatLng, provLatLng], {
        color: '#2563eb',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routeLineRef.current = polyline;

      // Pan to show both user and provider
      const bounds = L.latLngBounds([userLatLng, provLatLng]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [selectedProvider, userLocation.lat, userLocation.lng]);

  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
      duration: 0.8,
    });
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || providers.length === 0) return;
    const points: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      ...providers.map((p): [number, number] => [p.lat, p.lng]),
    ];
    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterOnUser}
          title="Recenter on My Location"
          className="p-2.5 bg-white/95 backdrop-blur-sm text-slate-700 hover:text-blue-600 rounded-xl shadow-md border border-slate-200 transition hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
        >
          <LocateFixed className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Center Me</span>
        </button>

        <button
          onClick={handleFitAll}
          title="Fit all nearby service providers"
          className="p-2.5 bg-white/95 backdrop-blur-sm text-slate-700 hover:text-blue-600 rounded-xl shadow-md border border-slate-200 transition hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
        >
          <Maximize2 className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* Map Hint Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <span>Click anywhere on the map to re-locate search</span>
      </div>
    </div>
  );
};
