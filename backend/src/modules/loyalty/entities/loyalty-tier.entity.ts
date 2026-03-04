import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('loyalty_tiers')
export class LoyaltyTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'min_points', default: 0 })
  minPoints: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  multiplier: number;

  @Column({ nullable: true })
  color: string;
}
