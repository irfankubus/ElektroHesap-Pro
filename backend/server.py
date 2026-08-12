from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
from pydantic import BaseModel
import os
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB isteğe bağlıdır.
mongo_url = os.environ.get("MONGO_URL", "").strip()
db_name = os.environ.get("DB_NAME", "elektrohesap")

mongo_client = None
db = None

if mongo_url:
    try:
        mongo_client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=2000
        )
        db = mongo_client[db_name]
    except Exception as exc:
        logging.getLogger("elektrohesap").warning(
            "MongoDB başlatılamadı; analytics devre dışı: %s",
            exc
        )
        mongo_client = None
        db = None

app = FastAPI(
    title="ElektroHesap Pro API",
    version="1.0.0"
)

api_router = APIRouter(prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ElektroHesap Pro API",
        "mongo": "enabled" if db is not None else "disabled",
    }


class VisitEvent(BaseModel):
    page: str = "home"


@api_router.get("/")
async def root():
    return {
        "app": "ElektroHesap Pro",
        "version": "1.0.0"
    }


@api_router.get("/stats")
async def get_stats():
    from modules import shared as _shared

    if _shared._mongo_disabled or db is None:
        return {
            "visits": 0,
            "calculations": {},
            "total_calculations": 0,
            "mongo": "disabled"
        }

    try:
        import asyncio

        total_visits = await asyncio.wait_for(
            db.analytics.count_documents({"type": "visit"}),
            timeout=2.0
        )

        modules_stats = {}

        for module_name in [
            "kablo",
            "trafo",
            "busbar",
            "orta-gerilim",
            "nyy",
            "sorti"
        ]:
            modules_stats[module_name] = await asyncio.wait_for(
                db.analytics.count_documents({
                    "type": "calc",
                    "module": module_name
                }),
                timeout=2.0
            )

        return {
            "visits": total_visits,
            "calculations": modules_stats,
            "total_calculations": sum(modules_stats.values()),
            "mongo": "enabled"
        }

    except Exception:
        _shared._mongo_disabled = True

        return {
            "visits": 0,
            "calculations": {},
            "total_calculations": 0,
            "mongo": "disabled"
        }


@api_router.post("/track/visit")
async def track_visit(event: VisitEvent):
    from modules import shared as _shared

    if _shared._mongo_disabled or db is None:
        return {
            "ok": True,
            "mongo": "disabled"
        }

    import asyncio

    async def _do():
        try:
            await asyncio.wait_for(
                db.analytics.insert_one({
                    "type": "visit",
                    "page": event.page,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }),
                timeout=2.0
            )
        except Exception:
            _shared._mongo_disabled = True

    asyncio.create_task(_do())

    return {"ok": True}


app.include_router(api_router)


from modules import shared  # noqa: E402

shared.db = db


from modules.kablo_kesidi import router as kablo_router  # noqa: E402
from modules.trafo_kompanzasyon import router as trafo_router  # noqa: E402
from modules.busbar import router as busbar_router  # noqa: E402
from modules.orta_gerilim import router as og_router  # noqa: E402
from modules.nyy_tablo import router as nyy_router  # noqa: E402
from modules.sorti import router as sorti_router  # noqa: E402


app.include_router(kablo_router)
app.include_router(trafo_router)
app.include_router(busbar_router)
app.include_router(og_router)
app.include_router(nyy_router)
app.include_router(sorti_router)


raw_origins = os.environ.get(
    "CORS_ORIGINS",
    "https://irfankubus.github.io,http://localhost:3000,http://localhost:8000"
)

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in raw_origins.split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("elektrohesap")


@app.on_event("shutdown")
async def shutdown_db_client():
    if mongo_client is not None:
        mongo_client.close()
