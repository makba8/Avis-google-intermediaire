import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
export class Rdv {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ nullable: true })
  emailClient: string;

  @Column({ type: 'datetime', nullable: false })
  dateRdv: Date;

  @Column({ default: false })
  mailEnvoye: boolean;

  @Index({ unique: true })
  @Column({ unique: true })
  token: string;

  @Column({ nullable: true })
  calendarEventId: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
