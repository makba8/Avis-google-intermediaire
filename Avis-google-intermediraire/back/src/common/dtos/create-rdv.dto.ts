import { IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateRdvDto {
  @IsOptional()
  @IsEmail()
  emailClient?: string;

  @IsDateString()
  dateRdv: string;

  @IsOptional()
  calendarEventId?: string;
}



