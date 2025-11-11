import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rdv } from './rdv.entity';
import { RdvService } from './rdv.service';
import { RdvController } from './rdv.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rdv]), MailModule],
  providers: [RdvService],
  controllers: [RdvController],
  exports: [RdvService],
})
export class RdvModule {}



