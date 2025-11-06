import React, { useState } from 'react';
import Header from './components/Header';
import Stars from './components/Stars';
import FeedbackForm from './components/FeedbackForm';
import './App.css';

function App() {
  const [rating, setRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [placeId, setPlaceId] = useState('ChIJlYWqHon1ikcRjLcQ_0RZ4gM'); 
  const handleRating = (value) => {
    setRating(value);
    if (value >= 4) {
      window.location.href = `https://search.google.com/local/writereview?placeid=${placeId}`;
    } else {
      setShowForm(true);
    }
  };

  return (
    <div className="app">
      <Header />
      {!showForm && <Stars onRate={handleRating} />}
      {showForm && <FeedbackForm rating={rating} />}
    </div>
  );
}

export default App;
