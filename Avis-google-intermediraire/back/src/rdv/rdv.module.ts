import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rdv } from './rdv.entity';
import { RdvService } from './rdv.service';
import { RdvController } from './rdv.controller';
import { MailModule } from '../mail/mail.module';
import { SupabaseModule } from '../supabase/supabase.module';

// TypeORM uniquement en développement (si Supabase n'est pas configuré)
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

@Module({
  imports: [
    ...(useSupabase ? [] : [TypeOrmModule.forFeature([Rdv])]),
    MailModule,
    SupabaseModule,
  ],
  providers: [RdvService],
  controllers: [RdvController],
  exports: [RdvService],
})
export class RdvModule {}



