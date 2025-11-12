import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  token: string;

  @Column('integer')
  note: number;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'timestamp' })
  dateVote: Date;

  @CreateDateColumn() createdAt: Date;
}
