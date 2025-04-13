import React, { useState } from 'react';

export default function SavedItineraryCard({ itinerary }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{itinerary.city}</h3>
          <p className="text-sm text-gray-600">
            {new Date(itinerary.arrival_date).toLocaleDateString()} - {new Date(itinerary.departure_date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {/* Preferences Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Preferences:</h4>
        <div className="flex flex-wrap gap-2">
          {itinerary.preferences.split(',').map((pref, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {pref.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Itinerary Details */}
      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Daily Schedule:</h4>
          <div className="space-y-2">
            {Array.isArray(itinerary.itinerary_items) ? (
              itinerary.itinerary_items.map((item, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-600 italic">No detailed itinerary available</p>
            )}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-gray-500">
        <span>Created: {new Date(itinerary.created_at).toLocaleDateString()}</span>
        <div className="flex gap-2">
          
          
        </div>
      </div>
    </div>
  );
}