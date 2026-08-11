"""Busbar Hattı Gerilim Düşümü — Excel Sheet BUSBAR HATTI (A/B) formülleri ile birebir.

Formül: ΔU = √3 × L × I × (R × cosφ + XL × sinφ)
"""
import json
from math import acos, sin
from pathlib import Path
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, Field
from . import shared

router = APIRouter(prefix="/api/busbar", tags=["Busbar"])

DATA_PATH = Path(__file__).parent.parent / "data" / "busbar.json"
BUSBAR_LIST = json.loads(DATA_PATH.read_text(encoding="utf-8"))
BUSBAR_BY_KOD = {b["tip"].strip(): b for b in BUSBAR_LIST if b.get("tip")}


class BusbarRow(BaseModel):
    busbar_kod: str = Field(..., description="Busbar tip kodu (ör: KXA 20)")
    L_m: float = Field(..., description="Segment uzunluğu (m)")
    makine_gucleri_kw: List[float] = Field(default_factory=list, description="Bu segmentte devreye giren makine güçleri (kW)")


class BusbarInput(BaseModel):
    kol_adi: str = Field("A", description="Busbar Kolu Adı (A veya B)")
    gerilim_v: float = Field(380)
    cos_j: float = Field(0.99)
    diversite: float = Field(0.6)
    rows: List[BusbarRow]


@router.get("/tipler")
async def get_tipler():
    return BUSBAR_LIST


@router.post("/hesapla")
async def hesapla(inp: BusbarInput):
    sin_j = sin(acos(inp.cos_j))
    n = len(inp.rows)
    grup_gucler = [sum(r.makine_gucleri_kw) for r in inp.rows]
    # Kalan güç (cascading) = SUM(grup_gucler[i..end])
    kalan_gucler = [sum(grup_gucler[i:]) for i in range(n)]

    results = []
    total_du = 0.0
    for i, r in enumerate(inp.rows):
        b = BUSBAR_BY_KOD.get(r.busbar_kod.strip())
        if not b:
            results.append({
                "row_index": i,
                "busbar_kod": r.busbar_kod,
                "error": f"Busbar tipi bulunamadı: {r.busbar_kod}",
            })
            continue
        pk = kalan_gucler[i]
        pr = round(pk * inp.diversite, 2)
        akim = round((pr * 1000) / (1.73 * inp.gerilim_v * inp.cos_j), 2) if pr > 0 else 0.0
        du = round((r.L_m / 1000) * 1.73 * akim * (b["R"] * inp.cos_j + b["XL"] * sin_j), 2) if akim > 0 else 0.0
        total_du += du
        durum = "UYGUN" if akim <= b["akim"] else "HATALI"
        results.append({
            "row_index": i,
            "busbar_kod": r.busbar_kod,
            "busbar_akim_kapasitesi_a": b["akim"],
            "R": b["R"],
            "XL": b["XL"],
            "L_m": r.L_m,
            "grup_guc_kw": grup_gucler[i],
            "kalan_guc_pk_kw": pk,
            "pr_kw": pr,
            "akim_a": akim,
            "gerilim_dusumu_v": du,
            "durum": durum,
        })

    max_du = inp.gerilim_v * 0.03
    total_du = round(total_du, 2)
    uygun = total_du <= max_du

    result = {
        "kol_adi": inp.kol_adi,
        "gerilim_v": inp.gerilim_v,
        "toplam_gerilim_dusumu_v": total_du,
        "max_gerilim_dusumu_v": round(max_du, 2),
        "genel_durum": "UYGUN" if uygun else "HATALI",
        "mesaj": (
            f"{total_du} V şebeke geriliminin %3'ü olan {round(max_du, 2)} V'tan "
            + ("küçük olduğu için seçilen kesit uygundur." if uygun
               else "büyük olduğu için seçilen kesit uygun değildir.")
        ),
        "rows": results,
    }
    await shared.log_calc("busbar", {"kol": inp.kol_adi, "row_count": len(inp.rows)})
    return result
