"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import EventList from "@/components/EventList";
import Filter from "@/components/Filter";
import { WeddingEvent } from "@/components/Map";

// Dynamic import for Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />
});

// Mock initial data for development
const mockEvents: WeddingEvent[] = [
  {
    id: "1",
    couple_names: "Romeo & Juliet",
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    address: "Verona Grand Hotel, Verona Street",
    lat: -6.2146,
    lng: 106.8451,
    source_url: "https://example.com/invitation1",
    distance: 2.4
  },
  {
    id: "2",
    couple_names: "John & Jane",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    address: "Central Park Gardens",
    lat: -6.1932,
    lng: 106.8231,
    source_url: "https://example.com/invitation2",
    distance: 4.1
  }
];

export default function Home() {
  const [events, setEvents] = useState<WeddingEvent[]>(mockEvents);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Request location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Please enable location access to find weddings near you.");
          // Default to Jakarta for demo if location denied
          setUserLocation({ lat: -6.2088, lng: 106.8456 });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setUserLocation({ lat: -6.2088, lng: 106.8456 });
    }
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // TODO: Connect to actual backend API
    // const res = await fetch(`/api/events/nearby?lat=${userLocation?.lat}&lng=${userLocation?.lng}&radius=${radius}`);
    // const data = await res.json();
    // setEvents(data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ARGOS</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium hidden sm:block">
            Discover Nearby Wedding Events
          </p>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - List & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {locationError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
              {locationError}
            </div>
          )}

          <Filter
            radius={radius}
            setRadius={setRadius}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nearby Weddings ({events.length})
            </h2>
            <EventList events={events} />
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="lg:col-span-2 h-[500px] lg:h-auto min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Map events={events} userLocation={userLocation} />
        </div>
      </div>
    </main>
  );
}
