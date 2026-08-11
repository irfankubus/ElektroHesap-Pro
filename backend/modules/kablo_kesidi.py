"""Kablo Kesidi Hesabı — Excel Sheet B formülleri ile birebir."""
import json
from math import sqrt
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from . import shared

router = APIRouter(prefix="/api/kablo", tags=["Kablo Kesidi"])

DATA_PATH = Path(__file__).parent.parent / "data" / "nyy_kablolar.json"
NYY_LIST = json.loads(DATA_PATH.read_text(encoding="utf-8"))
NYY_BY_ID = {k["id"]: k for k in NYY_LIST}


class KabloInput(BaseModel):
    guc_kw: float = Field(950, description="Çekilen Güç (kW)")
    gerilim_v: float = Field(380, description="Devre Gerilimi (V)")
    cos_j: float = Field(0.9, ge=0, le=1, description="Güç Faktörü (cosφ)")
    mesafe_m: float = Field(130, description="Mesafe (m)")
    kesit_id: int = Field(17, description="Seçilen NYY kablo id'si (1-43)")
    hat_sayisi: int = Field(4, ge=1, description="1 Hat kaç per çekilecek")
    yan_yana_katsayi: float = Field(0.8, description="Yan yana gelmesi için katsayı")


@router.get("/kablolar")
async def kablolar():
    return NYY_LIST


@router.post("/hesapla")
async def hesapla(inp: KabloInput):
    kablo = NYY_BY_ID.get(inp.kesit_id)
    if not kablo:
        raise HTTPException(status_code=400, detail=f"Geçersiz kablo id: {inp.kesit_id}")

    I = round(inp.guc_kw * 1000 / (inp.gerilim_v * inp.cos_j * sqrt(3)), 2)

    if inp.hat_sayisi == 1:
        I_top = kablo["akim_toprakta"]
        I_hava = kablo["akim_havada"]
    else:
        I_top = kablo["akim_toprakta"] * inp.yan_yana_katsayi * inp.hat_sayisi
        I_hava = kablo["akim_havada"] * inp.yan_yana_katsayi * inp.hat_sayisi

    kesit_toplam = kablo["kesit"] * inp.hat_sayisi
    gd = (inp.guc_kw * 1000 * inp.mesafe_m) / (56 * kesit_toplam * inp.gerilim_v)
    max_gd = inp.gerilim_v * 0.03
    agirlik = kablo["agirlik"] * (inp.hat_sayisi * inp.mesafe_m / 1000)

    uygun_top = I <= I_top
    uygun_hava = I <= I_hava
    uygun_gd = gd <= max_gd
    genel_uygun = uygun_top and uygun_hava and uygun_gd

    result = {
        "kablo": kablo,
        "cekilen_akim_a": I,
        "akim_kapasitesi_toprakta_a": round(I_top, 2),
        "akim_kapasitesi_havada_a": round(I_hava, 2),
        "gerilim_dusumu_v": round(gd, 3),
        "max_gerilim_dusumu_v": round(max_gd, 2),
        "gerilim_dusumu_yuzde": round(gd / inp.gerilim_v * 100, 3),
        "kablo_capi_mm": kablo["cap"],
        "toplam_agirlik_kg": round(agirlik, 2),
        "durum_toprakta": "Uygun Kesit" if uygun_top else "Uygun Olmayan Kesit",
        "durum_havada": "Uygun Kesit" if uygun_hava else "Uygun Olmayan Kesit",
        "durum_gerilim_dusumu": "Uygun" if uygun_gd else "Uygun Değil",
        "genel_durum": "Uygun Kesit" if genel_uygun else "Uygun Olmayan Kesit",
        "mesaj": (
            f"{round(gd, 3)} V şebeke geriliminin %3'ü olan {round(max_gd, 2)} V'tan "
            + ("küçük olduğu için seçilen kesit uygundur." if uygun_gd
               else "büyük olduğu için seçilen kesit uygun değildir.")
        ),
    }
    await shared.log_calc("kablo", inp.model_dump())
    return result
