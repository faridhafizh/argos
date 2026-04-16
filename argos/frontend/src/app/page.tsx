"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Settings as SettingsIcon } from "lucide-react";
import EventList from "@/components/EventList";
import Filter from "@/components/Filter";
import SettingsModal, { AppSettings } from "@/components/SettingsModal";
import { WeddingEvent } from "@/components/Map";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />,
});

export default function Home() {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 40.7128,
    lng: -74.006,
  });
  const [radius, setRadius] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    apiUrl: "http://localhost:8000",
    llmModel: "gpt-4o-mini",
    concurrentAgents: 3,
    maxSearchDepth: 2,
    systemPromptOverride: "",
  });

  const handleRefresh = async () => {
    if (!userLocation) {
      setLocationError("Set a map pin or enter coordinates first.");
      return;
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      const query = new URLSearchParams({
        lat: String(userLocation.lat),
        lng: String(userLocation.lng),
        radius: String(radius),
        model: appSettings.llmModel,
      });

      const response = await fetch(`${appSettings.apiUrl}/events/nearby?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = (await response.json()) as WeddingEvent[];
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events", error);
      setLocationError("Could not fetch live events. Confirm backend is running and sources are reachable.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 font-medium hidden sm:block">Discover Nearby Wedding Events</p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          {locationError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">{locationError}</div>
          )}

          <Filter
            radius={radius}
            setRadius={setRadius}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            pinnedLocation={userLocation}
            onLocationChange={setUserLocation}
          />

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Weddings ({events.length})</h2>
            <EventList events={events} />
          </div>
        </div>

        <div className="lg:col-span-2 h-[500px] lg:h-auto min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Map events={events} userLocation={userLocation} onPinLocation={setUserLocation} />
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
