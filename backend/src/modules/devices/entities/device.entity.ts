import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeviceStatus } from '@/common/enums';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { DeviceType } from './device-type.entity';
import { Zone } from './zone.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id' })
  establishmentId: string;

  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column({ name: 'device_type_id' })
  deviceTypeId: string;

  @ManyToOne(() => DeviceType)
  @JoinColumn({ name: 'device_type_id' })
  deviceType: DeviceType;

  @Column({ name: 'zone_id', nullable: true })
  zoneId: string;

  @ManyToOne(() => Zone)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.AVAILABLE })
  status: DeviceStatus;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
