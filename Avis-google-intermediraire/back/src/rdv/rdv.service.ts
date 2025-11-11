import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rdv } from './rdv.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class RdvService {
  constructor(
    @InjectRepository(Rdv) private rdvRepo: Repository<Rdv>,
    private mailService: MailService
  ) {}

  private genToken() {
    // Génère un token de 24 bytes = 48 caractères hex
    return crypto.randomBytes(Constants.TOKEN_LENGTH / 2).toString('hex');
  }

  async findByCalendarEventId(eventId: string) {
    return this.rdvRepo.findOne({ where: { calendarEventId: eventId } });
  }

  async createFromCalendar(payload: { calendarEventId: string; emailClient?: string; dateRdv: Date }) {
    const token = this.genToken();
    const rdv = this.rdvRepo.create({
      emailClient: payload.emailClient || '',
      dateRdv: payload.dateRdv,
      token,
      calendarEventId: payload.calendarEventId
    });
    await this.rdvRepo.save(rdv);
    if (payload.emailClient) {
      try {
        await this.mailService.sendFeedbackMail(payload.emailClient, token);
        rdv.mailEnvoye = true;
        await this.rdvRepo.save(rdv);
      } catch (err: any) {
        // Log l'erreur mais continue l'exécution
        console.error(`Erreur lors de l'envoi de l'email pour le RDV ${rdv.id}:`, err.message);
        // mailEnvoye reste false, l'email pourra être renvoyé plus tard
      }
    }
    return rdv;
  }

  async markMailSent(rdvId: string) {
    const r = await this.rdvRepo.findOne({ where: { id: rdvId } });
    if (!r) return null;
    r.mailEnvoye = true;
    return this.rdvRepo.save(r);
  }
}
