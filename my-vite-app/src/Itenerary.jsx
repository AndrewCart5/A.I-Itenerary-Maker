import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AVAILABLE_CITIES } from './data/cities';
import { AVAILABLE_PREFERENCES } from './data/preferences';
import { handleSignOut } from './App';
// Add this new component for the city search
const CitySearch = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (inputValue.length > 0) {
      const filtered = AVAILABLE_CITIES.filter(city =>
        city.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5); // Only show first 5 matches
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        className="border p-2 w-full"
        placeholder="Search destination"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {suggestions.map((city, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 border-b last:border-b-0 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => handleSuggestionClick(city)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add this new component after CitySearch
const PreferencesSelect = ({ selectedPreferences, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePreferenceClick = (preference) => {
    if (selectedPreferences.includes(preference)) {
      onChange(selectedPreferences.filter(p => p !== preference));
    } else if (selectedPreferences.length < 5) {
      onChange([...selectedPreferences, preference]);
    }
  };

  return (
    <div className="relative">
      <div 
        className="border p-2 w-full cursor-pointer bg-white flex flex-wrap gap-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedPreferences.length > 0 ? (
          selectedPreferences.map(pref => (
            <span 
              key={pref} 
              className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-bold"
            >
              {pref + ""}
            </span>
          ))
        ) : (
          <span className="text-gray-400">Select up to 5 preferences</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {AVAILABLE_PREFERENCES.map((preference) => (
            <div
              key={preference}
              className={`p-3 cursor-pointer transition-colors ${
                selectedPreferences.includes(preference)
                  ? 'bg-blue-50 text-blue-800'
                  : 'bg-gray-50 hover:bg-yellow-100'
              }`}
              onClick={() => handlePreferenceClick(preference)}
            >
              {preference}
              {selectedPreferences.includes(preference) && (
                <span className="float-right">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add this new component after your imports
const SavedItineraryCard = ({ itinerary }) => (
  <div className="bg-white p-4 rounded shadow-md mb-4">
    <h3 className="font-bold text-lg mb-2">{itinerary.city}</h3>
    <p className="text-sm text-gray-600 mb-2">
      {new Date(itinerary.arrival_date).toLocaleDateString()} - 
      {new Date(itinerary.departure_date).toLocaleDateString()}
    </p>
    <div className="space-y-2">
  {itinerary.itinerary_items.map((item, index) => (
    <p key={index} className="text-sm">{item}</p>
  ))}
</div>

  </div>
);

// Add this validation function after the imports
const validateDates = (arrival, departure) => {
  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);
  const diffTime = Math.abs(departureDate - arrivalDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

export default function Itenerary({ token, setIsAuthenticated }) {  // Add setIsAuthenticated to props
  const [city, setCity] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [weather, setWeather] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // Add this line
  // Add these to your existing state declarations
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const fetchItinerary = async () => {

    if (!token) {
      handleSignOut(setIsAuthenticated);  // Now this will work properly
      console.error('No token provided. User might not be authenticated.');
      return;
    }
    // Add date validation
    if (arrival && departure && !validateDates(arrival, departure)) {
      alert("Error: Itinerary can only be generated for trips up to 3 days long");
      return;
    }

    if (!AVAILABLE_CITIES.includes(city)) {
      alert("Please select a valid city from the suggestions");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          city, 
          arrival, 
          departure, 
          preferences: preferences.join(", ") 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch itinerary");
      }

      const data = await response.json();
      setItinerary(data.itinerary);
      fetchCityImage();
      fetchWeather();
    } catch (error) {
      console.error("Error fetching itinerary:", error);
    }
    setLoading(false);
  };

  const fetchCityImage = async () => {

    if (!token) {
      handleSignOut(setIsAuthenticated);  // Now this will work properly
      console.error('No token provided. User might not be authenticated.');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/get-city-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch city image");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  };

  const fetchWeather = async () => {

    if (!token) {
      handleSignOut(setIsAuthenticated);  // Now this will work properly
      console.error('No token provided. User might not be authenticated.');
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/get-weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      
      // Store the full 5-day forecast
      setWeather(data.forecast);
      
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
};

// Add this new function after your existing functions
const fetchSavedItineraries = async () => {

   if (!token) {
        handleSignOut(setIsAuthenticated);  // Now this will work properly
        console.error('No token provided. User might not be authenticated.');
        return;
      }
  try {
    const response = await fetch("http://localhost:5000/api/saved-itineraries", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch saved itineraries");
    }

    const data = await response.json();
    setSavedItineraries(data);
    setShowSaved(true);
  } catch (error) {
    console.error("Error fetching saved itineraries:", error);
    alert("Failed to fetch saved itineraries");
  }
};

const handleDragEnd = (result) => {
  if (!result.destination) return;
  const newItinerary = [...itinerary];
  const [movedItem] = newItinerary.splice(result.source.index, 1);
  newItinerary.splice(result.destination.index, 0, movedItem);
  setItinerary(newItinerary);
};

const saveItinerary = async () => {
  if (!city || itinerary.length === 0) {
    setSaveStatus('Nothing to save');
    return;
  }

  try {
    console.log("The city is ", city);
    console.log("The itinerary is ", itinerary);  
    console.log("The preferences are ", preferences);
    console.log("The arrival date is ", arrival);
    console.log("The departure date is ", departure);
    const response = await fetch("http://localhost:5000/api/save-itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        city,
        arrival,
        departure,
        itinerary,
        preferences
      }),
    });
    console.log("Response from server:", response);

    if (!response.ok) {
      throw new Error("Failed to save itinerary");
    }

    setSaveStatus('Itinerary saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000); // Clear message after 3 seconds
  } catch (error) {
    console.error("Error saving itinerary:", error);
    setSaveStatus('Failed to save itinerary');
  }
};

// Add these new functions after your existing functions
const searchFlights = () => {
  // Opens Google Flights in a new tab
  window.open(`https://www.google.com/travel/flights?q=flights%20to%20${encodeURIComponent(city)}`, '_blank');
};

const searchHotels = () => {
  // Opens Google Hotels in a new tab
  window.open(`https://www.google.com/travel/hotels/${encodeURIComponent(city)}`, '_blank');
};

// Add onChange handler for departure date
const handleDepartureDateChange = (e) => {
  const newDeparture = e.target.value;
  if (arrival && !validateDates(arrival, newDeparture)) {
    alert("Error: Trip duration cannot exceed 3 days");
    return;
  }
  setDeparture(newDeparture);
};

// Add onChange handler for arrival date
const handleArrivalDateChange = (e) => {
  const newArrival = e.target.value;
  if (departure && !validateDates(newArrival, departure)) {
    alert("Error: Trip duration cannot exceed 3 days");
    return;
  }
  setArrival(newArrival);
};

return (
  <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-6">
    <h1 className="text-3xl font-bold text-center mb-6">AI Travel Itinerary Planner</h1>
    
    {/* Input Form */}
    <div className="w-full max-w-2xl bg-white p-6 rounded shadow mb-6">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* City Search - Takes up one column */}
        <div>
          <CitySearch 
            value={city} 
            onChange={setCity}
          />
        </div>
        
        {/* Dates - Takes up one column */}
        <div className="flex flex-col gap-4">
          <input 
            className="border p-2 w-full" 
            type="date" 
            onChange={handleArrivalDateChange}
            value={arrival}
            placeholder="Arrival"
          />
          <input 
            className="border p-2 w-full" 
            type="date" 
            onChange={handleDepartureDateChange}
            value={departure}
            placeholder="Departure"
          />
        </div>

        {/* Preferences - Takes up one column */}
        <div>
          <PreferencesSelect
            selectedPreferences={preferences}
            onChange={setPreferences}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button 
        className="bg-blue-500 text-white p-2 w-full hover:bg-blue-600 transition-colors" 
        onClick={fetchItinerary} 
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>
    </div>
    

    {/* Travel Search Buttons - Only show after itinerary is generated */}
    {city && itinerary.length > 0 && (
      <div className="w-full flex justify-center">
        <div className="flex gap-4 max-w-2xl">
          <button
            onClick={searchFlights}
            className="w-40 text-sm bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.5 4.5a1.5 1.5 0 00-3 0v9.793l-1.146-1.147a.5.5 0 00-.708.708l2 2a.5.5 0 00.708 0l2-2a.5.5 0 00-.708-.708L8.5 14.293V4.5z"/>
            </svg>
            Search Flights to {city}
          </button>
          <button
            onClick={searchHotels}
            className="w-40 text-sm bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            Search Hotels in {city}
          </button>
        </div>
      </div>
    )}

    {/* City Image & Weather Section */}
    {imageUrl && weather && (
      <>
        {/* City Image */}
        <div className="w-full max-w-2xl bg-white p-4 rounded shadow">
          <img 
            src={imageUrl} 
            alt={city} 
            className="max-w-[250px] h-[180px] object-cover rounded-lg mx-auto"
            />
        </div>

        {/* Weather Section */}
        <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
  <h2 className="text-xl font-semibold mb-4 text-center">{city} 5-Day Weather Forecast</h2>
  <div className="grid grid-cols-5 gap-2">
    {weather.map((day, index) => (
      <div 
        key={index}
        className="flex flex-col items-center bg-gray-100 p-3 rounded-lg h-44 justify-between"
      >
        <div className="text-sm font-semibold">{day.date}</div>
        <img src={day.icon} alt="weather icon" className="h-10 w-10" />
        <div className="text-sm">{day.temp}°C</div>
        <div className="text-xs text-gray-600 text-center">{day.description}</div>
      </div>
    ))}
  </div>
</div>

      </>
    )}

    {/* Itinerary Section */}
    <div className="w-full max-w-2xl">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="itinerary" mode="virtual">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-4 border-2 border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <h2 className="text-xl font-bold text-center mb-4">Your Travel Itinerary</h2>
              {itinerary.map((item, index) => (
                <Draggable key={index} draggableId={String(index)} index={index}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      {...provided.dragHandleProps} 
                      className="bg-white p-4 rounded shadow flex items-center"
                    >
                      <span className="text-lg">{item}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Save Button and Status Message */}
              {itinerary.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={saveItinerary}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Save Itinerary
                  </button>
                  {saveStatus && (
                    <p className={`mt-2 text-sm ${
                      saveStatus.includes('success') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {saveStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
    
    
  </div>
);
}
