"use client";

import { WeddingEvent } from "./Map";
import { MapPin, Calendar, Heart } from "lucide-react";

interface EventListProps {
  events: WeddingEvent[];
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <Heart className="w-8 h-8 mb-2 opacity-50" />
        <p>No weddings found nearby</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800">{event.couple_names}</h3>
            {event.distance && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {event.distance.toFixed(1)} km
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(event.date).toLocaleString()}</span>
            </div>

            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{event.address}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Invitation
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Navigate
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
