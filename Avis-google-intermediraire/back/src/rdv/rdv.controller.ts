import { Controller, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { RdvService } from './rdv.service';
import { CreateRdvDto } from '../common/dtos/create-rdv.dto';
import { Constants } from '../Ressources/Constants';

@Controller(Constants.API_PREFIX + '/rdv')
export class RdvController {
  constructor(private rdvService: RdvService) {}

  @Post()
  async create(@Body() body: CreateRdvDto) {
    return this.rdvService.createFromCalendar({
      calendarEventId: body.calendarEventId || '',
      emailClient: body.emailClient,
      dateRdv: new Date(body.dateRdv)
    });
  }

  @Post(':id/send-mail')
  async sendMail(@Param('id') id: string) {
    const result = await this.rdvService.markMailSent(id);
    if (!result) {
      throw new NotFoundException(Constants.ERROR_RDV_NOT_FOUND);
    }
    return result;
  }
}
