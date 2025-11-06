import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rdv } from './rdv/rdv.entity';
import { Vote } from './vote/vote.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/avis.sqlite',
      entities: [Rdv, Vote],
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([Rdv, Vote]),
  ],
})
export class AppModule {}
