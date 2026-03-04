import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Establishment } from './establishment.entity';

@Entity('establishment_settings')
export class EstablishmentSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id', unique: true })
  establishmentId: string;

  @OneToOne(() => Establishment)
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column({ default: 'MAD' })
  currency: string;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ name: 'opening_time', type: 'time', default: '09:00' })
  openingTime: string;

  @Column({ name: 'closing_time', type: 'time', default: '00:00' })
  closingTime: string;

  @Column({ name: 'pause_limit_minutes', default: 30 })
  pauseLimitMinutes: number;

  @Column({ name: 'alert_intervals', type: 'jsonb', default: [30, 15, 5] })
  alertIntervals: number[];

  @Column({ name: 'solo_rate_per_hour', type: 'decimal', precision: 10, scale: 2, default: 20 })
  soloRatePerHour: number;

  @Column({ name: 'multiplayer_rate_per_hour', type: 'decimal', precision: 10, scale: 2, default: 30 })
  multiplayerRatePerHour: number;

  @Column({ name: 'booking_enabled', default: false })
  bookingEnabled: boolean;

  @Column({ name: 'booking_deposit_required', default: false })
  bookingDepositRequired: boolean;

  @Column({ name: 'booking_deposit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  bookingDepositAmount: number;

  @Column({ name: 'loyalty_enabled', default: false })
  loyaltyEnabled: boolean;

  @Column({ name: 'loyalty_points_per_currency', type: 'decimal', precision: 10, scale: 2, default: 1 })
  loyaltyPointsPerCurrency: number;
}
