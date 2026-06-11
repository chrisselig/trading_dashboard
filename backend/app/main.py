from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine
from app.routers import dashboard, events, performance, system, trades


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="Forex Trading Dashboard API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(trades.router)
app.include_router(trades.orders_router)
app.include_router(performance.router)
app.include_router(events.router)
app.include_router(system.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
