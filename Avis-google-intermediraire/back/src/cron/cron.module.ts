import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CalendarCronService } from './calendar-cron.service';
import { GoogleModule } from '../google/google.module';
import { RdvModule } from '../rdv/rdv.module';

@Module({
  imports: [ScheduleModule.forRoot(), GoogleModule, RdvModule],
  providers: [CalendarCronService],
})
export class CronModule {}



