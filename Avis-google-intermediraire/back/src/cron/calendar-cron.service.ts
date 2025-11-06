import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GoogleService } from '../google/google.service';
import { RdvService } from '../rdv/rdv.service';
import { addMinutes } from 'date-fns';

@Injectable()
export class CalendarCronService {
  private logger = new Logger(CalendarCronService.name);

  constructor(private google: GoogleService, private rdvService: RdvService) {}

  @Cron(`*/${process.env.CALENDAR_POLL_MINUTES || 15} * * * *`)
  async handleCron() {
    const now = new Date();
    const lookback = addMinutes(now, -60 * 24); // 24h back (ajuster si nécessaire)
    const timeMin = lookback.toISOString();
    const timeMax = now.toISOString();

    this.logger.log(`Polling Google Calendar from ${timeMin} to ${timeMax}`);
    const events = await this.google.listEvents(timeMin, timeMax);
    for (const ev of events) {
      if (!ev.end || !ev.start) continue;
      // ignore all-day events
      if (ev.start.date) continue;
      const endDate = new Date(ev.end.dateTime || ev.end.date);
      if (endDate > now) continue; // rendez-vous pas encore terminés

      // chercher email dans attendees
      const attendee = (ev.attendees || []).find(a => a.email);
      const email = attendee?.email ?? null;

      // si déjà connu, skip
      const exists = await this.rdvService.findByCalendarEventId(ev.id);
      if (exists) continue;

      // créer rdv local et potentiellement envoyer mail
      await this.rdvService.createFromCalendar({
        calendarEventId: ev.id,
        emailClient: email,
        dateRdv: endDate
      });
    }
  }
}
