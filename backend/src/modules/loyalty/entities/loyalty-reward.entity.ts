import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LoyaltyRewardType } from '@/common/enums';
import { Establishment } from '../../establishments/entities/establishment.entity';

@Entity('loyalty_rewards')
export class LoyaltyReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id' })
  establishmentId: string;

  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: LoyaltyRewardType })
  type: LoyaltyRewardType;

  @Column({ name: 'points_cost' })
  pointsCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
