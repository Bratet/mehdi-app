import os
from datetime import datetime, timedelta, date

from sqlalchemy import select

from database import async_session
from models.user import User
from models.device import Device
from models.product import Product
from models.session import Session, SessionProduct
from models.invoice import Invoice, InvoiceItem
from models.expense import Expense
from services.auth_service import hash_password


async def seed_data():
    async with async_session() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            return  # Already seeded

        # --- Users ---
        admin_password = os.getenv("ADMIN_PASSWORD", "1234")
        admin = User(
            username="admin",
            password_hash=hash_password(admin_password),
            role="admin",
        )
        cashier = User(
            username="cashier",
            password_hash=hash_password("1234"),
            role="cashier",
        )
        db.add_all([admin, cashier])
        await db.flush()

        # --- Devices ---
        devices = [
            Device(name="PS5 - Station 1", device_type="playstation", hourly_rate_single=30.0, hourly_rate_multi=50.0, icon="gamepad-2"),
            Device(name="PS5 - Station 2", device_type="playstation", hourly_rate_single=30.0, hourly_rate_multi=50.0, icon="gamepad-2"),
            Device(name="PS5 - Station 3", device_type="playstation", hourly_rate_single=30.0, hourly_rate_multi=50.0, icon="gamepad-2"),
            Device(name="PS4 - Station 4", device_type="playstation", hourly_rate_single=20.0, hourly_rate_multi=35.0, icon="gamepad"),
            Device(name="Xbox - Station 5", device_type="xbox", hourly_rate_single=25.0, hourly_rate_multi=40.0, icon="monitor"),
            Device(name="PC Gaming 1", device_type="pc", hourly_rate_single=25.0, hourly_rate_multi=25.0, icon="monitor"),
            Device(name="Billiards Table 1", device_type="billiards", hourly_rate_single=40.0, hourly_rate_multi=40.0, icon="circle-dot"),
            Device(name="Ping Pong Table", device_type="ping_pong", hourly_rate_single=20.0, hourly_rate_multi=20.0, icon="table-tennis"),
        ]
        db.add_all(devices)
        await db.flush()

        # --- Products ---
        products = [
            Product(name="Espresso", category="hot_drinks", price=15.0),
            Product(name="Cappuccino", category="hot_drinks", price=20.0),
            Product(name="Hot Chocolate", category="hot_drinks", price=18.0),
            Product(name="Coca-Cola", category="cold_drinks", price=10.0),
            Product(name="Fanta", category="cold_drinks", price=10.0),
            Product(name="Fresh Orange Juice", category="cold_drinks", price=15.0),
            Product(name="Water Bottle", category="cold_drinks", price=5.0),
            Product(name="Chips", category="snacks", price=8.0),
            Product(name="Chocolate Bar", category="snacks", price=12.0),
            Product(name="Sandwich", category="meals", price=25.0),
        ]
        db.add_all(products)
        await db.flush()

        # --- Sample completed sessions + invoices ---
        now = datetime.utcnow()
        for i in range(5):
            days_ago = 5 - i
            device = devices[i % len(devices)]
            session_start = now - timedelta(days=days_ago, hours=3)
            duration = 60 + (i * 15)
            cost = (duration / 60) * device.hourly_rate_single

            s = Session(
                device_id=device.id,
                mode="single",
                start_time=session_start,
                planned_duration_minutes=duration,
                single_minutes_used=float(duration),
                multi_minutes_used=0.0,
                status="completed",
                total_cost=cost + 15.0,
                payment_method="cash" if i % 2 == 0 else "digital",
            )
            db.add(s)
            await db.flush()

            sp = SessionProduct(
                session_id=s.id,
                product_id=products[i % len(products)].id,
                quantity=1,
                price_at_time=products[i % len(products)].price,
            )
            db.add(sp)

            inv = Invoice(
                session_id=s.id,
                device_name=device.name,
                session_duration=f"{duration}m",
                session_cost=cost,
                products_cost=15.0,
                total_cost=cost + 15.0,
                payment_method=s.payment_method,
            )
            db.add(inv)
            await db.flush()

            inv_item_session = InvoiceItem(
                invoice_id=inv.id,
                description=f"{device.name} - {duration} min",
                quantity=1,
                unit_price=cost,
                total_price=cost,
            )
            inv_item_product = InvoiceItem(
                invoice_id=inv.id,
                description=products[i % len(products)].name,
                quantity=1,
                unit_price=products[i % len(products)].price,
                total_price=products[i % len(products)].price,
            )
            db.add_all([inv_item_session, inv_item_product])

        # --- Sample expenses ---
        expenses = [
            Expense(title="Monthly Rent", amount=5000.0, category="rent", date=date.today().replace(day=1)),
            Expense(title="Electricity Bill", amount=800.0, category="utilities", date=date.today() - timedelta(days=5)),
            Expense(title="PS5 Controller Replacement", amount=250.0, category="maintenance", date=date.today() - timedelta(days=3)),
            Expense(title="Drinks Restock", amount=600.0, category="supplies", date=date.today() - timedelta(days=1)),
        ]
        db.add_all(expenses)

        await db.commit()
        print("✓ Database seeded successfully")
