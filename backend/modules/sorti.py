"""Sorti Hesapları — Excel Sorti / Sorti N2XH / Sorti N2XH EMT sheet'lerinden birebir."""
import json
from pathlib import Path
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from . import shared

router = APIRouter(prefix="/api/sorti", tags=["Sorti"])

DATA_PATH = Path(__file__).parent.parent / "data" / "sorti.json"
DATA = json.loads(DATA_PATH.read_text(encoding="utf-8"))

SORTIE_TYPES = [
    "sa_normal", "sa_paralel", "sa_priz", "sa_komitator", "sa_vaviyen",
    "nem_normal", "nem_paralel", "nem_priz", "nem_komitator", "nem_vaviyen",
]

SORTIE_LABELS = {
    "sa_normal": "SA — Normal Sorti",
    "sa_paralel": "SA — Paralel Sorti",
    "sa_priz": "SA — Priz Sorti",
    "sa_komitator": "SA — Komitatör Sorti",
    "sa_vaviyen": "SA — Vaviyen Sorti",
    "nem_normal": "Nemliyer — Normal Sorti",
    "nem_paralel": "Nemliyer — Paralel Sorti",
    "nem_priz": "Nemliyer — Priz Sorti",
    "nem_komitator": "Nemliyer — Komitatör Sorti",
    "nem_vaviyen": "Nemliyer — Vaviyen Sorti",
}


class SortiInput(BaseModel):
    tablo_id: str = Field(..., description="sorti_nya | sorti_n2xh | sorti_n2xh_emt")
    birim_fiyatlar: Optional[Dict[str, float]] = Field(
        default=None, description="Malzeme no bazlı özel birim fiyat sözlüğü"
    )
    sorti_uzunluk: Optional[float] = Field(default=None, description="Yeni sorti uzunluğu (m)")


@router.get("/labels")
async def labels():
    return SORTIE_LABELS


@router.get("/tablolar")
async def tablolar():
    return {k: {"aciklama": v.get("aciklama", ""), "sorti_uzunluk": v["sorti_uzunluk"], "items": v["items"]} for k, v in DATA.items()}


@router.get("/tablo/{tablo_id}")
async def get_tablo(tablo_id: str):
    if tablo_id not in DATA:
        raise HTTPException(404, "Tablo bulunamadı")
    return DATA[tablo_id]


@router.post("/hesapla")
async def hesapla(inp: SortiInput):
    if inp.tablo_id not in DATA:
        raise HTTPException(400, "Geçersiz tablo id")
    tablo = DATA[inp.tablo_id]
    default_len = tablo["sorti_uzunluk"] or 1
    new_len = inp.sorti_uzunluk if inp.sorti_uzunluk else default_len
    scale = new_len / default_len

    totals = {st: 0.0 for st in SORTIE_TYPES}
    items_out = []
    for item in tablo["items"]:
        no_key = str(item["no"])
        bf = item["birim_fiyat"]
        if inp.birim_fiyatlar and no_key in inp.birim_fiyatlar:
            bf = float(inp.birim_fiyatlar[no_key])
        row = {"no": item["no"], "malzeme": item["malzeme"], "birim_fiyat": bf, "kategori_fiyatlar": {}}
        for st in SORTIE_TYPES:
            miktar = float(item["miktarlar"].get(st, 0)) * scale
            fiyat = round(bf * miktar, 4)
            row["kategori_fiyatlar"][st] = {"miktar": round(miktar, 2), "fiyat": fiyat}
            totals[st] += fiyat
        items_out.append(row)

    totals = {k: round(v, 2) for k, v in totals.items()}
    await shared.log_calc("sorti", {"tablo": inp.tablo_id, "sorti_uzunluk": new_len})
    return {
        "tablo_id": inp.tablo_id,
        "aciklama": tablo.get("aciklama", ""),
        "sorti_uzunluk": new_len,
        "labels": SORTIE_LABELS,
        "totals": totals,
        "items": items_out,
    }
