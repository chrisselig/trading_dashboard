from collections.abc import AsyncGenerator

from sqlalchemy import MetaData, Table, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    f"sqlite+aiosqlite:///{settings.bot_db_path}",
    echo=False,
)


@event.listens_for(engine.sync_engine, "connect")
def _set_pragma(dbapi_conn, _connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA query_only = ON")
    cursor.close()


async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

metadata = MetaData()


async def reflect_tables() -> dict[str, Table]:
    async with engine.begin() as conn:
        await conn.run_sync(metadata.reflect)
    return metadata.tables


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with async_session() as session:
        yield session
