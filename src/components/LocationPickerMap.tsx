'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface LocationPickerMapProps {
  initialLocation: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

export default function LocationPickerMap({
  initialLocation,
  onLocationSelect,
  height = '400px',
}: LocationPickerMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<[number, number]>(initialLocation);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(initialLocation, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Custom Google Maps style marker icon
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; width: 30px; height: 40px;">
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <!-- Pin shadow -->
              <ellipse cx="15" cy="38" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
              <!-- Pin body -->
              <path d="M15 0C8.925 0 4 4.925 4 11c0 8.25 11 24 11 24s11-15.75 11-24c0-6.075-4.925-11-11-11z" 
                    fill="#EF4444" stroke="#B91C1C" stroke-width="1"/>
              <!-- Pin inner circle -->
              <circle cx="15" cy="11" r="5" fill="white"/>
              <circle cx="15" cy="11" r="3" fill="#B91C1C"/>
            </svg>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      });

      // Add initial marker
      const marker = L.marker(initialLocation, {
        icon: markerIcon,
        draggable: true,
      }).addTo(map);

      marker
        .bindPopup(
          '<b>Lokasi Anda</b><br>Klik peta atau drag marker untuk mengubah lokasi'
        )
        .openPopup();

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setSelectedLocation([position.lat, position.lng]);
        onLocationSelect(position.lat, position.lng);
        marker
          .bindPopup(
            `<b>Lokasi Baru</b><br>Lat: ${position.lat.toFixed(
              6
            )}<br>Lng: ${position.lng.toFixed(6)}`
          )
          .openPopup();
      });

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedLocation([lat, lng]);
        onLocationSelect(lat, lng);
        marker
          .bindPopup(
            `<b>Lokasi Baru</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(
              6
            )}`
          )
          .openPopup();
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initialLocation, onLocationSelect]);

  // Update marker position when initialLocation changes externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(initialLocation);
      mapRef.current.setView(initialLocation, mapRef.current.getZoom());
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-16 bg-white px-4 py-3 shadow-lg z-[1000] border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">
          <strong>Tip:</strong> Klik peta atau drag marker untuk memilih lokasi
        </p>
        <p className="text-xs text-slate-700 font-mono font-semibold">
          {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
        </p>
      </div>
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="shadow-lg cursor-crosshair"
      />
    </div>
  );
}
