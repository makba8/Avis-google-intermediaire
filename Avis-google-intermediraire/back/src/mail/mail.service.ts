import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class MailService {
  private transporter;
  private logoPath: string | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Charger le chemin du logo pour l'utiliser comme pièce jointe
    this.logoPath = this.loadLogo();
    
    // Vérifier la configuration SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('⚠️ Configuration SMTP incomplète. Les emails ne pourront pas être envoyés.');
      this.logger.warn(`SMTP_HOST: ${process.env.SMTP_HOST || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_PORT: ${process.env.SMTP_PORT || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_USER: ${process.env.SMTP_USER || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_PASS: ${process.env.SMTP_PASS ? '***' : 'NON DÉFINI'}`);
    }
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Options supplémentaires pour améliorer la compatibilité
      secure: Number(process.env.SMTP_PORT) === 465, // true pour le port 465 (SSL)
      tls: {
        rejectUnauthorized: false // Accepter les certificats auto-signés (pour dev/test)
      }
    });
    
    // Vérifier la connexion SMTP au démarrage (de manière asynchrone pour ne pas bloquer)
    this.verifyConnection().catch(err => {
      this.logger.error(`Erreur lors de la vérification SMTP: ${err.message}`);
    });
  }
  
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Connexion SMTP vérifiée avec succès');
    } catch (error: any) {
      this.logger.error(`❌ Échec de la vérification de la connexion SMTP: ${error.message}`);
      this.logger.error('Les emails ne pourront pas être envoyés jusqu\'à ce que la configuration SMTP soit corrigée.');
    }
  }

  private loadLogo(): string | null {
    try {
      // Essayer plusieurs chemins possibles (dev et production)
      const possiblePaths = [
        path.join(process.cwd(), 'src', 'Ressources', 'logo.png'), // Dev
        path.join(process.cwd(), 'dist', 'src', 'Ressources', 'logo.png'), // Production compilée
        path.join(__dirname, '../Ressources/logo.png'), // Relatif depuis dist/src/mail
        path.join(__dirname, '../../src/Ressources/logo.png'), // Relatif depuis dist
      ];

      let logoPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          this.logger.log(`Logo trouvé à : ${p}`);
          break;
        }
      }

      if (logoPath) {
        // Retourner le chemin pour l'utiliser comme pièce jointe
        this.logger.log('Logo trouvé, sera utilisé comme pièce jointe');
        return logoPath;
      } else {
        this.logger.warn('Logo non trouvé, email sera envoyé sans logo');
        return null;
      }
    } catch (error) {
      this.logger.error(`Erreur lors du chargement du logo: ${error.message}`);
      return null;
    }
  }

  async sendFeedbackMail(to: string, token: string) {
    this.logger.log(`Envoi de l'email de feedback à ${to} avec le token ${token}`);
    const link = Constants.getFeedbackUrl(token);
    const year = new Date().getFullYear();
  
    const html = `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>Avis patient</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f6f7fb; margin:0; padding:0; }
        .container { max-width:600px; margin:24px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
        .header { padding:20px; text-align:center; background: linear-gradient(90deg,#0b74de,#0b9ede); color:#fff; }
        .logo { max-height:48px; margin-bottom:8px; }
        .content { padding:24px; color:#111; line-height:1.4; }
        .h1 { font-size:20px; margin:0 0 8px; }
        .p { margin:0 0 16px; color:#333; }
        .cta { display:block; width:80%; margin:0 auto 16px; text-align:center; padding:14px 18px; border-radius:6px; text-decoration:none; font-weight:600; background:#ff6b00; color:#fff; }
        .stars { text-align:center; margin-bottom:14px; }
        .small { font-size:12px; color:#666; }
        .footer { padding:16px 20px; font-size:12px; color:#666; background:#fafafa; }
        .muted { color:#999; font-size:12px; margin-top:8px; }
        a.link { color:#0b74de; text-decoration:none; }
        @media (max-width:420px){ .container{margin:12px} .cta{width:100%} .content{padding:16px} }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${this.logoPath ? `<img src="cid:logo" alt="${Constants.PODOLOGUE_NAME}" class="logo" style="max-height: 48px; display: block; margin: 0 auto 8px;" />` : ''}
          <div class="muted">Merci pour votre confiance</div>
        </div>
  
        <div class="content">
          <p class="h1">Bonjour,</p>
          <p class="p">
            Merci d'être venu(e) à votre rendez-vous chez <strong>${Constants.PODOLOGUE_NAME}</strong>.
            Votre avis compte beaucoup pour nous et aide d'autres patients à choisir notre cabinet.
          </p>
  
          <div class="stars" href="${link}>⭐ ⭐ ⭐ ⭐ ⭐</div>
  
          <a href="${link}" class="cta" target="_blank" rel="noopener noreferrer">Donner mon avis maintenant</a>
  
          <p class="p small">
            Cela ne prend qu'une minute.
          </p>
          <p class="small">
            Vous souhaitez nous contacter directement ?
            Écrivez-nous :
            <a class="link" href="mailto:${Constants.CONTACT_EMAIL}">${Constants.CONTACT_EMAIL}</a> 
            Ou appelez-nous: ${Constants.CONTACT_PHONE}.
          </p>
        </div>
  
        <div class="footer">
          <div><strong>${Constants.PODOLOGUE_NAME}</strong> — ${Constants.CLINIC_ADDRESS}</div>
          <p class="small" style="margin-top:10px;">
            Responsable du traitement : <strong>${Constants.PODOLOGUE_NAME }</strong> (${Constants.PODOLOGUE_NAME_FULL}).
            Finalité : envoi d'un e-mail de sollicitation d'avis suite à une prestation.
            Base légale : consentement explicite ou intérêt légitime du cabinet.
            Conservation : les données sont conservées pendant la durée nécessaire au traitement ou jusqu'à demande de suppression.
          </p>
          <p class="small">
            Droits : vous pouvez accéder, rectifier, demander la suppression ou la portabilité de vos données et vous opposer au traitement en contactant
            <a class="link" href="mailto:${Constants.CONTACT_EMAIL}">${Constants.CONTACT_EMAIL}</a>.
          </p>
          <p class="muted">© ${year} ${Constants.PODOLOGUE_NAME}. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  
    // Préparer les pièces jointes (attachments) pour le logo
    const attachments: Array<{ filename: string; path: string; cid: string }> = [];
    if (this.logoPath && fs.existsSync(this.logoPath)) {
      attachments.push({
        filename: 'logo.png',
        path: this.logoPath,
        cid: 'logo' // Content-ID utilisé dans le HTML avec src="cid:logo"
      });
      this.logger.log(`Logo ajouté comme pièce jointe: ${this.logoPath}`);
    }

    try {
      const info = await this.transporter.sendMail({
        from: Constants.EMAIL_FROM,
        to,
        subject: Constants.EMAIL_SUBJECT_FEEDBACK,
        html,
        attachments,
        text: `Bonjour,
  
  Merci d'être venu(e) à votre rendez-vous chez ${Constants.PODOLOGUE_NAME}.
  Votre avis compte beaucoup pour nous.
  
  Laissez votre avis ici : ${link}
  
  Si vous préférez ne plus recevoir ce type d'e-mail, contactez ${Constants.CONTACT_EMAIL}.
  
  ${Constants.PODOLOGUE_NAME || ''}
  ${process.env.CLINIC_ADDRESS || ''}
  `
      });
      this.logger.log(`✅ Email envoyé avec succès à ${to}. Message ID: ${info.messageId}`);
      return info;
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email à ${to}: ${error.message}`);
      this.logger.error(`Détails de l'erreur: ${error.stack || JSON.stringify(error)}`);
      // Vérifier la configuration SMTP
      if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
        this.logger.error(`Vérifiez votre configuration SMTP: HOST=${process.env.SMTP_HOST}, PORT=${process.env.SMTP_PORT}, USER=${process.env.SMTP_USER}`);
      }
      throw error; // Re-throw pour que l'appelant puisse gérer l'erreur
    }
  }
  

}
