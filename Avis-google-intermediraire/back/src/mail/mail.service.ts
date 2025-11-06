import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }

  async sendFeedbackMail(to: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/feedback?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Merci de votre visite — Donnez votre avis',
      html: `<p>Bonjour,</p><p>Merci de votre visite. <a href="${link}">Cliquez ici pour laisser un avis</a></p>`
    });
  }

  async sendInternalBadReview(to: string, note: number, commentaire?: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Avis négatif reçu (${note}★)`,
      text: `Un patient a laissé une note de ${note}.\n\nCommentaire:\n${commentaire || '-'}` 
    });
  }
}
