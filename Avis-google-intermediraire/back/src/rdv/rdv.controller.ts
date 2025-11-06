import { Controller, Post, Body, Param } from '@nestjs/common';
import { RdvService } from './rdv.service';

@Controller('api/rdv')
export class RdvController {
  constructor(private rdvService: RdvService) {}

  @Post()
  async create(@Body() body: { emailClient?: string; dateRdv: string }) {
    return this.rdvService.createFromCalendar({
      calendarEventId: '',
      emailClient: body.emailClient,
      dateRdv: new Date(body.dateRdv)
    });
  }

  @Post(':id/send-mail')
  async sendMail(@Param('id') id: string) {
    return this.rdvService.markMailSent(id);
  }
}
