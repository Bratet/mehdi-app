import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Establishment } from '../../modules/establishments/entities/establishment.entity';
import { EstablishmentSettings } from '../../modules/establishments/entities/establishment-settings.entity';
import { DeviceType } from '../../modules/devices/entities/device-type.entity';
import { Category } from '../../modules/products/entities/category.entity';
import { ExpenseCategory } from '../../modules/expenses/entities/expense-category.entity';
import { LoyaltyTier } from '../../modules/loyalty/entities/loyalty-tier.entity';
import { Role } from '../../common/enums';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'gamecenter',
    password: process.env.POSTGRES_PASSWORD ?? 'gamecenterpass',
    database: process.env.POSTGRES_DB ?? 'gamecenterdb',
    entities: ['src/modules/**/entities/*.entity.ts'],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  // 1. Create demo establishment
  const establishmentRepo = dataSource.getRepository(Establishment);
  let establishment = await establishmentRepo.findOne({ where: { slug: 'game-center-demo' } });
  if (!establishment) {
    establishment = establishmentRepo.create({
      name: 'Game Center Demo',
      slug: 'game-center-demo',
      address: '123 Gaming Street',
      phone: '+212600000000',
      email: 'demo@gamecenter.ma',
      isActive: true,
    });
    establishment = await establishmentRepo.save(establishment);
    console.log('Created demo establishment');
  }

  // 2. Create default settings
  const settingsRepo = dataSource.getRepository(EstablishmentSettings);
  const existingSettings = await settingsRepo.findOne({ where: { establishmentId: establishment.id } });
  if (!existingSettings) {
    const settings = settingsRepo.create({
      establishmentId: establishment.id,
      currency: 'MAD',
      vatRate: 20,
      openingTime: '09:00',
      closingTime: '00:00',
      pauseLimitMinutes: 30,
      alertIntervals: [30, 15, 5],
      soloRatePerHour: 20,
      multiplayerRatePerHour: 30,
      bookingEnabled: true,
      loyaltyEnabled: true,
    });
    await settingsRepo.save(settings);
    console.log('Created establishment settings');
  }

  // 3. Create super admin
  const userRepo = dataSource.getRepository(User);
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@gamecenter.com' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('GameCenter2026!', 10);
    const admin = userRepo.create({
      email: 'admin@gamecenter.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
      establishmentId: establishment.id,
    });
    await userRepo.save(admin);
    console.log('Created super admin: admin@gamecenter.com / GameCenter2026!');
  }

  // 4. Create device types
  const deviceTypeRepo = dataSource.getRepository(DeviceType);
  const deviceTypes = [
    { name: 'PS4', icon: 'gamepad-2' },
    { name: 'PS5', icon: 'gamepad-2' },
    { name: 'PC Gaming', icon: 'monitor' },
    { name: 'Xbox', icon: 'gamepad-2' },
    { name: 'Nintendo Switch', icon: 'gamepad-2' },
    { name: 'Billiard', icon: 'circle-dot' },
    { name: 'Ping-Pong', icon: 'table-tennis' },
    { name: 'Baby-Foot', icon: 'goal' },
    { name: 'VR', icon: 'glasses' },
  ];
  for (const dt of deviceTypes) {
    const exists = await deviceTypeRepo.findOne({ where: { name: dt.name } });
    if (!exists) {
      await deviceTypeRepo.save(deviceTypeRepo.create(dt));
    }
  }
  console.log('Created device types');

  // 5. Create product categories
  const categoryRepo = dataSource.getRepository(Category);
  const categories = [
    { name: 'Hot Drinks', icon: 'coffee', establishmentId: establishment.id, sortOrder: 1 },
    { name: 'Cold Drinks', icon: 'cup-soda', establishmentId: establishment.id, sortOrder: 2 },
    { name: 'Snacks', icon: 'cookie', establishmentId: establishment.id, sortOrder: 3 },
    { name: 'Meals', icon: 'utensils', establishmentId: establishment.id, sortOrder: 4 },
    { name: 'Accessories', icon: 'headphones', establishmentId: establishment.id, sortOrder: 5 },
  ];
  for (const cat of categories) {
    const exists = await categoryRepo.findOne({
      where: { name: cat.name, establishmentId: establishment.id },
    });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(cat));
    }
  }
  console.log('Created product categories');

  // 6. Create expense categories
  const expenseCategoryRepo = dataSource.getRepository(ExpenseCategory);
  const expenseCategories = [
    { name: 'Rent', icon: 'building' },
    { name: 'Salaries', icon: 'banknote' },
    { name: 'Supplies', icon: 'package' },
    { name: 'Maintenance', icon: 'wrench' },
    { name: 'Marketing', icon: 'megaphone' },
    { name: 'Miscellaneous', icon: 'more-horizontal' },
  ];
  for (const ec of expenseCategories) {
    const exists = await expenseCategoryRepo.findOne({ where: { name: ec.name } });
    if (!exists) {
      await expenseCategoryRepo.save(expenseCategoryRepo.create(ec));
    }
  }
  console.log('Created expense categories');

  // 7. Create loyalty tiers
  const loyaltyTierRepo = dataSource.getRepository(LoyaltyTier);
  const tiers = [
    { name: 'Bronze', minPoints: 0, multiplier: 1, color: '#CD7F32' },
    { name: 'Silver', minPoints: 500, multiplier: 1.5, color: '#C0C0C0' },
    { name: 'Gold', minPoints: 2000, multiplier: 2, color: '#FFD700' },
    { name: 'Platinum', minPoints: 5000, multiplier: 3, color: '#E5E4E2' },
  ];
  for (const tier of tiers) {
    const exists = await loyaltyTierRepo.findOne({ where: { name: tier.name } });
    if (!exists) {
      await loyaltyTierRepo.save(loyaltyTierRepo.create(tier));
    }
  }
  console.log('Created loyalty tiers');

  await dataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
