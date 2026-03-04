import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { LoyaltyTier } from './loyalty-tier.entity';

@Entity('loyalty_accounts')
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', unique: true })
  customerId: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'tier_id' })
  tierId: string;

  @ManyToOne(() => LoyaltyTier)
  @JoinColumn({ name: 'tier_id' })
  tier: LoyaltyTier;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ name: 'available_points', default: 0 })
  availablePoints: number;

  @Column({ name: 'qr_code', unique: true })
  qrCode: string;
}
