import { useState, useEffect } from "react";
import Itenerary from "./Itenerary";
import Auth from "./Auth";
import PreviousIteneraries from "./PreviousIteneraries";
// Background images
import travel1 from './assets/NYC_GettyImages-640006562.webp';
import travel2 from './assets/VS_Zoom-Background_Space-Needle.jpg';
import travel3 from './assets/pexels-zahid-lilani-1061925-2104742.jpg';
import travel4 from './assets/premium_photo-1697730215093-baeae8060bfe.jpeg';

const backgroundImages = [travel1, travel2, travel3, travel4];

export const handleSignOut = (setIsAuthenticated) => {
  localStorage.removeItem('token');
  setIsAuthenticated(false);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPreviousIteneraries, setShowPreviousIteneraries] = useState(false);
  const [showItineraries, setShowItineraries] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === backgroundImages.length - 1 ? 0 : prev + 1
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const resetViews = () => {
    setShowPreviousIteneraries(false);
    setShowItineraries(false);
  };

  const onSignOut = () => {
    handleSignOut(setIsAuthenticated);
  };

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <div className="auth-screen">
          <div
            className="auth-background"
            style={{
              backgroundImage: `url(${backgroundImages[currentImageIndex]})`
            }}
          />
          <div className="auth-form-wrapper">
            <Auth setIsAuthenticated={setIsAuthenticated} />
          </div>
        </div>
      ) : (
        <div>
          <nav className="navbar">
            <div className="nav-left">
              <button onClick={() => { resetViews(); setShowItineraries(true); }}>Itineraries</button>
              <button onClick={() => { resetViews(); setShowPreviousIteneraries(true); }}>Viewed Saved Iteneraries</button>   {/* Button to view Past Iteneraries */}

            </div>
            <button className="signout-button" onClick={onSignOut}>Sign Out</button>
          </nav>

          <div className="content">
            { showPreviousIteneraries ? (
              <div>
                <h2>Previous Iteneraries</h2>
                <PreviousIteneraries 
                  token={localStorage.getItem('token')} 
                  setIsAuthenticated={setIsAuthenticated}
                />
              </div>
            )
              : showItineraries ? (
              <Itenerary 
                token={localStorage.getItem('token')} 
                setIsAuthenticated={setIsAuthenticated} 
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
