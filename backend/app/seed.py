"""Seed script — run with: python -m app.seed"""
import asyncio
from sqlalchemy import select
from .core.database import engine, async_session, Base
from .core.security import hash_password
from .models.user import User, Role
from .models.establishment import Establishment, EstablishmentSettings
from .models.device import DeviceType
from .models.product import Category
from .models.expense import ExpenseCategory
from .models.loyalty import LoyaltyTier


async def seed():
    async with engine.begin() as conn:
        from . import models  # noqa
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # 1. Demo establishment
        result = await db.execute(select(Establishment).where(Establishment.slug == "game-center-demo"))
        est = result.scalar_one_or_none()
        if not est:
            est = Establishment(
                name="Game Center Demo", slug="game-center-demo",
                address="123 Gaming Street", phone="+212600000000",
                email="demo@gamecenter.ma",
            )
            db.add(est)
            await db.flush()
            db.add(EstablishmentSettings(
                establishment_id=est.id, currency="MAD", booking_enabled=True, loyalty_enabled=True,
            ))
            print("Created demo establishment")

        # 2. Super admin
        result = await db.execute(select(User).where(User.email == "admin@gamecenter.com"))
        if not result.scalar_one_or_none():
            db.add(User(
                email="admin@gamecenter.com", password_hash=hash_password("GameCenter2026!"),
                first_name="Super", last_name="Admin", role=Role.super_admin,
                establishment_id=est.id,
            ))
            print("Created admin: admin@gamecenter.com / GameCenter2026!")

        # 3. Device types
        for name, icon in [
            ("PS4", "gamepad-2"), ("PS5", "gamepad-2"), ("PC Gaming", "monitor"),
            ("Xbox", "gamepad-2"), ("Nintendo Switch", "gamepad-2"),
            ("Billiard", "circle-dot"), ("Ping-Pong", "table-tennis"),
            ("Baby-Foot", "goal"), ("VR", "glasses"),
        ]:
            exists = await db.execute(select(DeviceType).where(DeviceType.name == name))
            if not exists.scalar_one_or_none():
                db.add(DeviceType(name=name, icon=icon))
        print("Created device types")

        # 4. Product categories
        for i, (name, icon) in enumerate([
            ("Hot Drinks", "coffee"), ("Cold Drinks", "cup-soda"),
            ("Snacks", "cookie"), ("Meals", "utensils"), ("Accessories", "headphones"),
        ], 1):
            exists = await db.execute(
                select(Category).where(Category.name == name, Category.establishment_id == est.id)
            )
            if not exists.scalar_one_or_none():
                db.add(Category(name=name, icon=icon, establishment_id=est.id, sort_order=i))
        print("Created product categories")

        # 5. Expense categories
        for name, icon in [
            ("Rent", "building"), ("Salaries", "banknote"), ("Supplies", "package"),
            ("Maintenance", "wrench"), ("Marketing", "megaphone"), ("Miscellaneous", "more-horizontal"),
        ]:
            exists = await db.execute(select(ExpenseCategory).where(ExpenseCategory.name == name))
            if not exists.scalar_one_or_none():
                db.add(ExpenseCategory(name=name, icon=icon))
        print("Created expense categories")

        # 6. Loyalty tiers
        for name, pts, mult, color in [
            ("Bronze", 0, 1, "#CD7F32"), ("Silver", 500, 1.5, "#C0C0C0"),
            ("Gold", 2000, 2, "#FFD700"), ("Platinum", 5000, 3, "#E5E4E2"),
        ]:
            exists = await db.execute(select(LoyaltyTier).where(LoyaltyTier.name == name))
            if not exists.scalar_one_or_none():
                db.add(LoyaltyTier(name=name, min_points=pts, multiplier=mult, color=color))
        print("Created loyalty tiers")

        await db.commit()
        print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
