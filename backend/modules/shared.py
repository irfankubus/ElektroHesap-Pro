"""Shared runtime references for modules."""
import asyncio
import logging
from datetime import datetime, timezone

logger = logging.getLogger("elektrohesap.shared")

db = None  # Set by server.py at startup

# MongoDB kullanılamıyorsa (ör: local'de kurulu değil) analytics devre dışı kalır.
# Bir kez timeout hatası alırsak flag'i açıp bir daha denemiyoruz.
_mongo_disabled = False


async def _insert_analytics(payload: dict):
    """Actual mongo insert — arka planda çalışır."""
    global _mongo_disabled
    if _mongo_disabled or db is None:
        return
    try:
        await asyncio.wait_for(db.analytics.insert_one(payload), timeout=2.0)
    except (asyncio.TimeoutError, Exception) as e:
        _mongo_disabled = True
        logger.info(f"MongoDB erişilemiyor, analytics devre dışı: {type(e).__name__}")


async def log_calc(module_name: str, inputs: dict):
    """Analytics logging — fire-and-forget, endpoint yanıtını asla bloklamaz."""
    if _mongo_disabled or db is None:
        return
    payload = {
        "type": "calc",
        "module": module_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "inputs": inputs,
    }
    # asyncio.create_task ile background'a at — asla bekleme
    asyncio.create_task(_insert_analytics(payload))
