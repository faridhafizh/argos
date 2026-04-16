"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Settings as SettingsIcon } from "lucide-react";
import EventList from "@/components/EventList";
import Filter from "@/components/Filter";
import SettingsModal, { AppSettings } from "@/components/SettingsModal";
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
  const [events] = useState<WeddingEvent[]>(mockEvents);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    apiUrl: "http://localhost:8000",
    llmModel: "gpt-4-turbo",
    concurrentAgents: 3,
    maxSearchDepth: 2,
    systemPromptOverride: "",
  });

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-6 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">ARGOS</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              Discover Nearby Wedding Events
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - List & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {locationError && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl text-sm transition-colors">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nearby Weddings ({events.length})
            </h2>
            <EventList events={events} />
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="lg:col-span-2 h-[500px] lg:h-auto min-h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <Map events={events} userLocation={userLocation} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onSave={setAppSettings}
      />
    </main>
  );
}
