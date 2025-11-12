import { Injectable, Logger } from '@nestjs/common';
import { Constants } from '../Ressources/Constants';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private logoPath: string | '';
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.logoPath = process.env.NODE_ENV === 'production' 
      ? (process.env.LOGO || '')
      : Constants.LOGO;
   
  }
  

  async sendFeedbackMail(to: string, token: string) {
    this.logger.log(`Envoi de l'email de feedback à ${to} avec le token ${token}`);
    
    // Vérifier si Resend API est configuré
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      return this.sendWithResend(to, token);
    }
  
    return;
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
          ${this.logoPath ? `<img src="${this.logoPath}" alt="${Constants.PODOLOGUE_NAME}" class="logo" style="max-height: 48px; display: block; margin: 0 auto 8px;" />` : ''}
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

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: ['arthur.cariou88@gmail.com'], 
        subject: Constants.EMAIL_SUBJECT_FEEDBACK,
        html: html,
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


}
