'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrashTag } from '@/types/trashtag';
import { TrashTagPreview } from './TrashTagPreview';

interface MapViewProps {
  tags: TrashTag[];
  selectedTag: TrashTag | null;
  onSelectTag: (tag: TrashTag) => void;
}

// Custom Leaflet marker generator
const createCustomIcon = (tag: TrashTag, isSelected: boolean) => {
  let colorClass = 'bg-amber-500 border-amber-300 text-amber-950';

  if (tag.severity === 'CRITICAL' || tag.status === 'REOPENED') {
    colorClass = 'bg-red-500 border-red-200 text-white';
  } else if (tag.status === 'MISSION_ACTIVE' || tag.status === 'MISSION_CREATED') {
    colorClass = 'bg-blue-500 border-blue-200 text-white';
  } else if (tag.status === 'RECOVERY_VERIFIED' || tag.status === 'CLEANUP_COMPLETED') {
    colorClass = 'bg-emerald-500 border-emerald-200 text-white';
  } else if (tag.status === 'TRANSFORMED' || tag.status === 'TRANSFORMATION_PLANNED') {
    colorClass = 'bg-purple-500 border-purple-200 text-white';
  }

  const ringEffect = isSelected ? 'ring-4 ring-emerald-400 scale-125 z-50' : 'hover:scale-110';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-all duration-300 ${ringEffect}">
      <div class="w-8 h-8 rounded-full ${colorClass} border-2 shadow-lg flex items-center justify-center font-bold font-mono text-[10px] tracking-tighter">
        ${tag.tagCode.replace('TT-', '')}
      </div>
      <div class="absolute -bottom-1 w-2 h-2 ${colorClass} rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to dynamically re-center map when a tag is selected & handle Leaflet viewport invalidation
const MapController: React.FC<{ selectedTag: TrashTag | null }> = ({ selectedTag }) => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    invalidate();
    const timer1 = setTimeout(invalidate, 100);
    const timer2 = setTimeout(invalidate, 400);
    window.addEventListener('resize', invalidate);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

  useEffect(() => {
    if (selectedTag) {
      map.invalidateSize();
      map.flyTo([selectedTag.latitude, selectedTag.longitude], 14, {
        duration: 1.2,
      });
    }
  }, [selectedTag, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ tags, selectedTag, onSelectTag }) => {
  const defaultCenter: [number, number] = tags.length > 0
    ? [tags[0].latitude, tags[0].longitude]
    : [12.9716, 77.5946];

  return (
    <div className="w-full h-full min-h-[450px] relative z-0 flex-1 flex flex-col">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full flex-1 rounded-2xl overflow-hidden shadow-inner min-h-[450px]"
      >
        {/* Standard OpenStreetMap tile layer (100% free, no API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController selectedTag={selectedTag} />

        {tags.map((tag) => {
          const isSelected = selectedTag?.id === tag.id;
          return (
            <Marker
              key={tag.id}
              position={[tag.latitude, tag.longitude]}
              icon={createCustomIcon(tag, isSelected)}
              eventHandlers={{
                click: () => onSelectTag(tag),
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false} offset={[0, -20]}>
                <div className="w-72 p-1">
                  <TrashTagPreview tag={tag} />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
