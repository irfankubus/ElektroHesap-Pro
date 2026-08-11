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
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ['DB_NAME']]

# App
app = FastAPI(title="ElektroHesap Pro API", version="1.0.0")
api_router = APIRouter(prefix="/api")


# --- Analytics ---
class VisitEvent(BaseModel):
    page: str = "home"


@api_router.get("/")
async def root():
    return {"app": "ElektroHesap Pro", "version": "1.0.0"}


@api_router.get("/stats")
async def get_stats():
    from modules import shared as _shared
    if _shared._mongo_disabled or db is None:
        return {"visits": 0, "calculations": {}, "total_calculations": 0, "mongo": "disabled"}
    try:
        import asyncio
        total_visits = await asyncio.wait_for(db.analytics.count_documents({"type": "visit"}), timeout=2.0)
        modules_stats = {}
        for m in ["kablo", "trafo", "busbar", "orta-gerilim", "nyy", "sorti"]:
            modules_stats[m] = await asyncio.wait_for(
                db.analytics.count_documents({"type": "calc", "module": m}), timeout=2.0
            )
        return {
            "visits": total_visits,
            "calculations": modules_stats,
            "total_calculations": sum(modules_stats.values()),
        }
    except Exception:
        _shared._mongo_disabled = True
        return {"visits": 0, "calculations": {}, "total_calculations": 0, "mongo": "disabled"}


@api_router.post("/track/visit")
async def track_visit(event: VisitEvent):
    from modules import shared as _shared
    if _shared._mongo_disabled or db is None:
        return {"ok": True, "mongo": "disabled"}
    import asyncio
    async def _do():
        try:
            await asyncio.wait_for(db.analytics.insert_one({
                "type": "visit",
                "page": event.page,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }), timeout=2.0)
        except Exception:
            _shared._mongo_disabled = True
    asyncio.create_task(_do())
    return {"ok": True}


# Register main router first
app.include_router(api_router)

# Wire shared db and register module routers
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("elektrohesap")


@app.on_event("shutdown")
async def shutdown_db_client():
    mongo_client.close()
