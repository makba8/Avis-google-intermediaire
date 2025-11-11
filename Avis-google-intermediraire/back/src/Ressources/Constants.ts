/**
 * Constantes de l'application
 * Centralise toutes les valeurs importantes utilisées dans le projet
 */

export class Constants {
// ============================================
  // Configuration Podologue
  // ============================================
  static readonly PODOLOGUE_NAME = 'Podialpes-Grenoble';
  static readonly PODOLOGUE_NAME_FULL = 'Adrien COUSIN';
  static readonly CLINIC_ADDRESS = '29 Boulevard Agutte Sembat, 38000 Grenoble';
  static readonly CONTACT_EMAIL = 'makba888@gmail.com';
  static readonly CONTACT_PHONE = '+33 6 87 65 90 23';
  static readonly EMAIL_FROM = 'Cabinet de podologie <makba888@gmail.com>';
  static readonly LOGO = '../Ressources/logo.png';


  // Sujets d'emails
  static readonly EMAIL_SUBJECT_FEEDBACK = 'Merci de votre visite — Donnez votre avis';
  
  // Templates d'emails
  static readonly EMAIL_TEMPLATE_FEEDBACK = (link: string) => `
    <p>Bonjour,</p>
    <p>Merci de votre visite au cabinet.</p>
    <p>Votre avis nous est précieux pour améliorer nos services.</p>
    <p><a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Cliquez ici pour laisser un avis</a></p>
    <p style="margin-top: 20px; font-size: 12px; color: #666;">Ce lien est valide pendant 30 jours.</p>
    <p style="margin-top: 10px; font-size: 12px; color: #666;">Si vous ne souhaitez pas recevoir ces emails, vous pouvez nous le signaler.</p>
  `;

  // ============================================
  // Configuration Votes
  // ============================================
  static readonly MIN_RATING = 1;
  static readonly MAX_RATING = 5;
  static readonly POSITIVE_RATING_THRESHOLD = 4; // Note >= 4 = positif
  static readonly TOKEN_LENGTH = 48; // 24 bytes en hex = 48 caractères
  static readonly TOKEN_EXPIRATION_DAYS = 30;

  // ============================================
  // Messages d'erreur
  // ============================================
  static readonly ERROR_INVALID_TOKEN = 'Invalid token';
  static readonly ERROR_VOTE_ALREADY_EXISTS = 'Vote already exists for this token';
  static readonly ERROR_INVALID_RATING = 'note must be between 1 and 5';
  static readonly ERROR_RDV_NOT_FOUND = 'RDV not found';

  // ============================================
  // Messages de succès
  // ============================================
  static readonly SUCCESS_VOTE_REGISTERED = 'Vote registered successfully';
  static readonly SUCCESS_EMAIL_SENT = 'Email sent successfully';

  // ============================================
  // Configuration API
  // ============================================
  static readonly API_PREFIX = '/api';
  static readonly RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  static readonly RATE_LIMIT_MAX_REQUESTS = 100; // 100 requêtes par fenêtre

  // ============================================
  // Validation
  // ============================================
  static readonly MAX_COMMENT_LENGTH = 500;
  static readonly MAX_NAME_LENGTH = 40;
  static readonly MAX_EMAIL_LENGTH = 255;

  // ============================================
  // Format de dates
  // ============================================
  static readonly DATE_FORMAT = 'YYYY-MM-DD';
  static readonly DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
  static readonly TIMEZONE = 'Europe/Paris';

  // ============================================
  // Chemins de fichiers
  // ============================================
  static readonly DATA_DIR = './data';
  static readonly LOGS_DIR = './logs';

  // ============================================
  // Configuration CORS
  // ============================================
  static readonly CORS_ORIGINS = [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  // ============================================
  // Configuration Logging
  // ============================================
  static readonly LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  static readonly LOG_FORMAT = 'json'; // 'json' ou 'simple'

  // ============================================
  // Configuration Sécurité
  // ============================================
  static readonly JWT_SECRET_MIN_LENGTH = 32;
  static readonly PASSWORD_MIN_LENGTH = 8;
  static readonly SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 heures

  // ============================================
  // Helpers
  // ============================================
  
  /**
   * Vérifie si une note est considérée comme positive
   */
  static isPositiveRating(note: number): boolean {
    return note >= Constants.POSITIVE_RATING_THRESHOLD;
  }

  /**
   * Vérifie si une note est valide
   */
  static isValidRating(note: number): boolean {
    return note >= Constants.MIN_RATING && note <= Constants.MAX_RATING;
  }

  /**
   * Génère l'URL complète du frontend avec token
   */
  static getFeedbackUrl(token: string): string {
    const frontendUrl = process.env.FRONTEND_URL;
    return `${frontendUrl}/feedback?token=${token}`;
  }

  /**
   * Génère l'URL Google Review
   */
  static getGoogleReviewUrl(): string {
    return process.env.GOOGLE_REVIEW_URL || 'https://www.podialpes.com/';
  }
}

