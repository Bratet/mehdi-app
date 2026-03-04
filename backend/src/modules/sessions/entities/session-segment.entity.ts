import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SessionMode } from '@/common/enums';
import { Session } from './session.entity';

@Entity('session_segments')
export class SessionSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.segments)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ type: 'enum', enum: SessionMode })
  mode: SessionMode;

  @Column({ name: 'rate_per_hour', type: 'decimal', precision: 10, scale: 2 })
  ratePerHour: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;
}
