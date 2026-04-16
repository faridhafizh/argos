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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
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
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? "Scanning..." : "Scan Nearby"}
        </button>
      </div>
    </div>
  );
}
