import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Stars from './components/Stars';
import FeedbackForm from './components/FeedbackForm';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3030';

function App() {
  const [rating, setRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get token from URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else {
      setError('Token manquant. Veuillez utiliser le lien reçu par email.');
      setLoading(false);
    }
  }, []);

  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch(`${API_URL}/api/vote/validate?token=${tokenToValidate}`);
      const data = await response.json();
      
      if (data.valid) {
        setTokenValid(true);
        if (data.alreadyVoted) {
          setAlreadyVoted(true);
        }
      } else {
        setError('Token invalide ou expiré.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (value) => {
    setRating(value);
    
    // Si note < 4, on affiche le formulaire (le vote sera enregistré lors de la soumission)
    if (value < 4) {
      setShowForm(true);
      return;
    }

    // Pour les bonnes notes (>= 4), on enregistre immédiatement et redirige vers Google
    try {
      const response = await fetch(`${API_URL}/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          note: value,
          commentaire: null,
        }),
      });

      const data = await response.json();

      if (data.redirectUrl) {
        // Redirect to Google Review
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Erreur lors de l\'envoi du vote.');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (alreadyVoted) {
    return (
      <div className="app">
        <Header />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Merci !</h2>
          <p>Vous avez déjà soumis votre avis pour ce rendez-vous.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      {!showForm && tokenValid && <Stars onRate={handleRating} />}
      {showForm && <FeedbackForm rating={rating} token={token} apiUrl={API_URL} />}
    </div>
  );
}

export default App;
