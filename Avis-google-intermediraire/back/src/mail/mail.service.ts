import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Constants } from '../Ressources/Constants';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private transporter;
  private logoPath: string | '';
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.logoPath = process.env.NODE_ENV === 'production' 
      ? (process.env.LOGO || '')
      : Constants.LOGO;
    
    // Vérifier la configuration SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('⚠️ Configuration SMTP incomplète. Les emails ne pourront pas être envoyés.');
      this.logger.warn(`SMTP_HOST: ${process.env.SMTP_HOST || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_PORT: ${process.env.SMTP_PORT || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_USER: ${process.env.SMTP_USER || 'NON DÉFINI'}`);
      this.logger.warn(`SMTP_PASS: ${process.env.SMTP_PASS ? '***' : 'NON DÉFINI'}`);
    }
    
    const smtpConfig: any = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Options supplémentaires pour améliorer la compatibilité
      secure: Number(process.env.SMTP_PORT) === 465, // true pour le port 465 (SSL)
      tls: {
        rejectUnauthorized: false // Accepter les certificats auto-signés (pour dev/test)
      },
      // Timeouts augmentés pour les connexions lentes (cloud)
      connectionTimeout: 60000, // 60 secondes
      greetingTimeout: 30000, // 30 secondes
      socketTimeout: 60000, // 60 secondes
    };
    
    // Options de pool pour les environnements cloud
    if (process.env.SMTP_POOL === 'true') {
      smtpConfig.pool = true;
      smtpConfig.maxConnections = 1;
      smtpConfig.maxMessages = 3;
    }
    
    this.transporter = nodemailer.createTransport(smtpConfig);
    
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



  async sendFeedbackMail(to: string, token: string) {
    this.logger.log(`Envoi de l'email de feedback à ${to} avec le token ${token}`);
    
    // Vérifier si Resend API est configuré
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      return this.sendWithResend(to, token);
    }
    
    // Sinon, utiliser SMTP (nodemailer)
    return this.sendWithSMTP(to, token);
  }

  private async sendWithResend(to: string, token: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = Constants.getFeedbackUrl(token);
    const year = new Date().getFullYear();
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? ''; 
    
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
        .cta { display:inline-block; width:80%; max-width:300px; margin:16px auto; text-align:center; padding:14px 18px; border-radius:6px; text-decoration:none; font-weight:600; background:#ff6b00; color:#fff !important; }
        .stars { text-align:center; margin:16px 0; font-size:24px; line-height:1.5; }
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
  
          <div class="stars" style="text-align:center; margin:16px 0; font-size:24px;">⭐ ⭐ ⭐ ⭐ ⭐</div>
  
          <div style="text-align:center; margin:20px 0;">
            <a href="${link}" class="cta" target="_blank" rel="noopener noreferrer" style="display:inline-block; width:80%; max-width:300px; margin:0 auto; text-align:center; padding:14px 18px; border-radius:6px; text-decoration:none; font-weight:600; background:#ff6b00; color:#fff !important;">Donner mon avis maintenant</a>
          </div>
  
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
  
    const text = `Bonjour,

Merci d'être venu(e) à votre rendez-vous chez ${Constants.PODOLOGUE_NAME}.
Votre avis compte beaucoup pour nous.

Laissez votre avis ici : ${link}

Si vous préférez ne plus recevoir ce type d'e-mail, contactez ${Constants.CONTACT_EMAIL}.

${Constants.PODOLOGUE_NAME || ''}
${process.env.CLINIC_ADDRESS || ''}
`;

    try {
      // Pour Resend, on convertit le logo en base64 et on l'inclut directement dans le HTML
      // Cela évite qu'il soit en pièce jointe
      let htmlWithLogo = html;
      if (this.logoPath && fs.existsSync(this.logoPath)) {
        const logoBuffer = fs.readFileSync(this.logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;
        
        // Remplacer cid:logo par l'image base64 inline
        htmlWithLogo = html.replace(
          'src="cid:logo"',
          `src="${logoDataUrl}"`
        );
        this.logger.log(`Logo intégré inline dans l'email (base64)`);
      }

      // Resend retourne { data, error }
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: ['arthur.cariou88@gmail.com'], 
        subject: Constants.EMAIL_SUBJECT_FEEDBACK,
        html: htmlWithLogo,
        text,
      });

      if (error) {
        this.logger.error(`❌ Erreur Resend: ${JSON.stringify(error)}`);
        throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
      }

      this.logger.log(`✅ Email envoyé avec succès à ${to} via Resend. Message ID: ${data?.id}`);
      return data;
    } catch (error: any) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email à ${to}: ${error.message}`);
      this.logger.error(`Détails de l'erreur: ${error.stack || JSON.stringify(error)}`);
      throw error;
    }
  }

  private async sendWithSMTP(to: string, token: string) {
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
        .cta { display:inline-block; width:80%; max-width:300px; margin:16px auto; text-align:center; padding:14px 18px; border-radius:6px; text-decoration:none; font-weight:600; background:#ff6b00; color:#fff !important; }
        .stars { text-align:center; margin:16px 0; font-size:24px; line-height:1.5; }
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
      this.logger.log(`✅ Email envoyé avec succès à ${to} via SMTP. Message ID: ${info.messageId}`);
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
