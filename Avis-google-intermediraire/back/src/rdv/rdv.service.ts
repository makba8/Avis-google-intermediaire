import { Injectable, Optional } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rdv } from './rdv.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class RdvService {
  private useSupabase: boolean;

  constructor(
    @Optional() @InjectRepository(Rdv) private rdvRepo: Repository<Rdv> | null,
    private mailService: MailService,
    private supabaseService: SupabaseService
  ) {
    // Vérifier si Supabase est configuré (via variables d'env ou service)
    this.useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) || this.supabaseService.isEnabled();
  }

  private genToken() {
    // Génère un token de 24 bytes = 48 caractères hex
    return crypto.randomBytes(Constants.TOKEN_LENGTH / 2).toString('hex');
  }

  async findByCalendarEventId(eventId: string) {
    if (this.useSupabase) {
      return this.supabaseService.findRdvByCalendarEventId(eventId);
    }
    if (!this.rdvRepo) {
      // Si TypeORM n'est pas disponible, essayer Supabase comme fallback
      if (this.supabaseService.isEnabled()) {
        this.useSupabase = true;
        return this.supabaseService.findRdvByCalendarEventId(eventId);
      }
      throw new Error('TypeORM non initialisé et Supabase non disponible');
    }
    return this.rdvRepo.findOne({ where: { calendarEventId: eventId } });
  }

  async createFromCalendar(payload: { calendarEventId: string; emailClient?: string; dateRdv: Date }) {
    const token = this.genToken();
    
    let rdv: any;
    
    if (this.useSupabase) {
      rdv = await this.supabaseService.createRdv({
        emailClient: payload.emailClient || '',
        dateRdv: payload.dateRdv,
        token,
        calendarEventId: payload.calendarEventId,
        mailEnvoye: false,
      });
    } else {
      if (!this.rdvRepo) throw new Error('TypeORM non initialisé');
      rdv = this.rdvRepo.create({
        emailClient: payload.emailClient || '',
        dateRdv: payload.dateRdv,
        token,
        calendarEventId: payload.calendarEventId
      });
      await this.rdvRepo.save(rdv);
    }

    if (payload.emailClient) {
      try {
        await this.mailService.sendFeedbackMail(payload.emailClient, token);
        if (this.useSupabase) {
          await this.supabaseService.updateRdv(rdv.id, { mailEnvoye: true });
        } else {
          if (!this.rdvRepo) throw new Error('TypeORM non initialisé');
          rdv.mailEnvoye = true;
          await this.rdvRepo.save(rdv);
        }
      } catch (err: any) {
        // Log l'erreur mais continue l'exécution
        console.error(`Erreur lors de l'envoi de l'email pour le RDV ${rdv.id}:`, err.message);
        // mailEnvoye reste false, l'email pourra être renvoyé plus tard
      }
    }
    return rdv;
  }

  async markMailSent(rdvId: string) {
    if (this.useSupabase) {
      return this.supabaseService.updateRdv(rdvId, { mailEnvoye: true });
    }
    if (!this.rdvRepo) throw new Error('TypeORM non initialisé');
    const r = await this.rdvRepo.findOne({ where: { id: rdvId } });
    if (!r) return null;
    r.mailEnvoye = true;
    return this.rdvRepo.save(r);
  }
}
