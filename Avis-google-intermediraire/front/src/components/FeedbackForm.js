import { useState, useRef, useEffect } from 'react';
import emailjs from 'emailjs-com';

function FeedbackForm({ rating, token, apiUrl }) {
  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const userId = process.env.REACT_APP_EMAILJS_USER_ID;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const messageRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const adjustHeight = () => {
    const ta = messageRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const sendViaEmailJS = async () => {
    try {
      const result = await fetch(`${apiUrl}/api/vote/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await result.json();
      const formattedDateRdv = (() => {
        if (!data.dateRdv) return '';
        const d = new Date(data.dateRdv);
        if (isNaN(d)) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      })();

      const templateParams = {
        name: name === '' ? 'Anonyme' : name,
        note: rating,
        email: data.email || '',
        dateRdv: formattedDateRdv,
        message: message,
      };

      await emailjs.send(serviceId, templateId, templateParams, userId);
      setSent(true);
    } catch (err) {
      console.error('EmailJS or fetch error:', err);
      setError('Erreur lors de l\'envoi par email. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);

    // Pour les mauvaises notes, on fait deux choses en parallèle :
    // 1. Enregistrer le vote dans le backend (pour les stats)
    // 2. Envoyer l'email au podologue via EmailJS

    const commentaire = message ? 
      (name ? `${name}: ${message}` : message) : 
      (name ? `Commentaire de ${name}` : 'Aucun commentaire');

    // 1. Enregistrer le vote dans le backend
    let voteRegistered = false;
    if (token && apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            note: rating,
            commentaire: commentaire,
          }),
        });

        if (response.ok) {
          voteRegistered = true;
        } else {
          console.warn('Failed to register vote in backend');
        }
      } catch (err) {
        console.warn('Error registering vote in backend:', err);
      }
    }

    // 2. Envoyer l'email au podologue via EmailJS
    if (serviceId && templateId && userId) {
      sendViaEmailJS();
    } else if (voteRegistered) {
      // Si le vote est enregistré mais EmailJS pas configuré
      setSent(true);
      setSending(false);
    } else {
      setError('Configuration EmailJS manquante. Impossible d\'envoyer le message au podologue.');
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="form-container">
        <div className="feedback-form sent">
          <svg className="sent-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <h2>Merci, votre avis a bien été envoyé</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <form className="feedback-form" onSubmit={handleSubmit}>
        <h2>Merci pour votre retour</h2>
        <p className="subtitle">Votre avis nous aide à nous améliorer</p>

        <div className="rating-display">
          {Array.from({ length: rating }).map((_, i) => (
            <span key={i} className="star filled done">★</span>
          ))}
          {Array.from({ length: 5 - rating }).map((_, i) => (
            <span key={i} className="star done">★</span>
          ))}
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

         <input
           id="name"
           className="textarea-name"
          type="text"
          placeholder="Nom Prénom (Optionnel)"
          value={name}
          onChange={handleNameChange}
          maxLength={40}
        />

        <textarea
          ref={messageRef}
          id="message"
          placeholder="Expliquez ce que nous pourrions améliorer..."
          value={message}
          onChange={handleChange}
          maxLength={500}
          rows={3}
        />

        <button type="submit" disabled={sending}>
          {sending ? 'Envoi...' : 'Envoyer mon avis'}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;