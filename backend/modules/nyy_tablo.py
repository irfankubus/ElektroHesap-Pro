"""NYY Kablo Teknik Veri Tablosu — Excel 'veri' sheet'inden birebir."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/nyy", tags=["NYY Kablo"])

DATA_PATH = Path(__file__).parent.parent / "data" / "nyy_kablolar.json"
NYY_LIST = json.loads(DATA_PATH.read_text(encoding="utf-8"))


@router.get("/tablo")
async def tablo():
    return {
        "aciklama": (
            "YVV (NYY) — Enerji kablosu olarak toprak altında, kablo kanallarında hariçte "
            "ve dahilde, yeraltında, enerji santrallerinde, endüstriyel tesislerde ve şalt "
            "tesislerinde kullanılır. En yüksek iletken sıcaklığı: 70 °C. Anma gerilimi: 0.6/1 kV."
        ),
        "kablolar": NYY_LIST,
    }


@router.get("/kablo/{kesit_id}")
async def kablo(kesit_id: int):
    for k in NYY_LIST:
        if k["id"] == kesit_id:
            return k
    raise HTTPException(status_code=404, detail="Kablo bulunamadı")
