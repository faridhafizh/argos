"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues with Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface WeddingEvent {
  id: string;
  couple_names: string;
  date: string;
  address: string;
  lat: number;
  lng: number;
  source_url: string;
  distance?: number;
}

interface MapProps {
  events: WeddingEvent[];
  userLocation: { lat: number; lng: number } | null;
}

// Component to recenter map when user location changes
function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function Map({ events, userLocation }: MapProps) {
  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Default to Jakarta
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <>
            <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}>
              <Popup>Your Location</Popup>
            </Marker>
          </>
        )}

        {events.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]} icon={icon}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-lg">{event.couple_names}</h3>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleString()}</p>
                <p className="text-sm mt-1">{event.address}</p>
                {event.distance && (
                  <p className="text-xs text-blue-600 mt-1">{event.distance.toFixed(1)} km away</p>
                )}
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                >
                  View Invitation
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
