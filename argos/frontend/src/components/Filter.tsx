"use client";

interface FilterProps {
  radius: number;
  setRadius: (radius: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
  pinnedLocation: { lat: number; lng: number } | null;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

export default function Filter({
  radius,
  setRadius,
  onRefresh,
  isLoading,
  pinnedLocation,
  onLocationChange,
}: FilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Pin Latitude
          </label>
          <input
            type="number"
            id="latitude"
            value={pinnedLocation?.lat ?? ""}
            onChange={(e) =>
              onLocationChange({
                lat: Number(e.target.value),
                lng: pinnedLocation?.lng ?? 0,
              })
            }
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Pin Longitude
          </label>
          <input
            type="number"
            id="longitude"
            value={pinnedLocation?.lng ?? ""}
            onChange={(e) =>
              onLocationChange({
                lat: pinnedLocation?.lat ?? 0,
                lng: Number(e.target.value),
              })
            }
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius: {radius} km
          </label>
          <input
            type="range"
            id="radius"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading || !pinnedLocation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? "Scanning..." : "Scan Nearby"}
        </button>
      </div>
    </div>
  );
}
