import React, { useState, useEffect } from 'react';
import SavedItineraryCard from './SavedItineraryCard';
import { handleSignOut } from './App';

export default function PreviousIteneraries({ token, setIsAuthenticated }) {
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const fetchSavedItineraries = async () => {
    if (!token) {
      handleSignOut(setIsAuthenticated);
      console.error('No token provided. User might not be authenticated.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/saved-itineraries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Saved itineraries:', data);
      if (!Array.isArray(data)) {
        console.error('Expected an array of itineraries, but got:', data);
        return;
      }
      setSavedItineraries(data);
      setShowSaved(true);
    } catch (error) {
      console.error('Error fetching saved itineraries:', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6">
      <button
        onClick={fetchSavedItineraries}
        className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors"
      >
        Show Saved Itineraries
      </button>
      {showSaved && (
        <div className="w-full max-w-2xl mt-6">
          {savedItineraries.map((itinerary, index) => (
            <SavedItineraryCard key={index} itinerary={itinerary} />
          ))}
        </div>
      )}
    </div>
  );
}