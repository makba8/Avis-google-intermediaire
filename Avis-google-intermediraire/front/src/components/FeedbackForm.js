import { useState, useRef, useEffect } from 'react';
import emailjs from 'emailjs-com';

function FeedbackForm({ rating }) {
  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const userId = process.env.REACT_APP_EMAILJS_USER_ID;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const messageRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const templateParams = {
      name: name === '' ? 'Anonyme' : name,
      note: rating,
      message: message,
    };

    emailjs
      .send(serviceId, templateId, templateParams, userId)
      .then(() => {
        setSent(true);
      })
      .catch((err) => {
        console.error(err);
        setSending(false);
      });
  };

  if (sent) {
    return (
      <div className="form-container">
        <div className="feedback-form sent">
          <svg className="sent-check" xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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