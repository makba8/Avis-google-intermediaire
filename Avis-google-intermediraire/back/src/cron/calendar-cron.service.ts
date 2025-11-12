import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GoogleService } from '../google/google.service';
import { RdvService } from '../rdv/rdv.service';
import { addMinutes } from 'date-fns';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class CalendarCronService {
  private logger = new Logger(CalendarCronService.name);

  constructor(private google: GoogleService, private rdvService: RdvService) {}

  @Cron(`* * * * *`)
  async handleCron() {
    try {
      const now = new Date();
      if (isNaN(now.getTime())) {
        this.logger.error('Date actuelle invalide');
        return;
      }

      const lookback = addMinutes(now, -60 * 24); // 24 heures
      if (isNaN(lookback.getTime())) {
        this.logger.error('Date lookback invalide');
        return;
      }

      const timeMin = lookback.toISOString();
      const timeMax = now.toISOString();

      this.logger.log(`Polling Google Calendar from ${timeMin} to ${timeMax}`);
      const events = await this.google.listEvents(timeMin, timeMax);
      
      for (const ev of events) {
        if (!ev.end || !ev.start) continue;

        // Vérifier que dateTime existe et est valide
        if (!ev.end.dateTime) {
          this.logger.warn(`Événement ${ev.id} sans date de fin`);
          continue;
        }

        const endDate = new Date(ev.end.dateTime);
        if (isNaN(endDate.getTime())) {
          this.logger.warn(`Date invalide pour l'événement ${ev.id}: ${ev.end.dateTime}`);
          continue;
        }

        if (endDate > now) continue; // rendez-vous pas encore terminés

        // chercher email dans attendees
        const attendee = (ev.attendees || []).find(a => a.email);
        // const email = attendee?.email ?? null;

        // si déjà connu, skip
        const exists = await this.rdvService.findByCalendarEventId(ev.id);
      
        if (exists) continue;

        // créer rdv local et potentiellement envoyer mail
        await this.rdvService.createFromCalendar({
          calendarEventId: ev.id,
          emailClient: "arthur.cariou88@gmail.com",
          dateRdv: endDate
        });
      }
    } catch (error: any) {
      this.logger.error(`Erreur dans handleCron: ${error.message}`, error.stack);
    }
  }
}
