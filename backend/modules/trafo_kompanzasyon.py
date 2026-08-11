"""Trafo & Kompanzasyon Hesabı — Excel Sheet A formülleri ile birebir."""
from math import sqrt, acos, tan, ceil
from fastapi import APIRouter
from pydantic import BaseModel, Field
from .standartlar import trafo, salter
from . import shared

router = APIRouter(prefix="/api/trafo", tags=["Trafo & Kompanzasyon"])


class TrafoInput(BaseModel):
    kurulu_guc_kw: float = Field(1400, description="Toplam Kurulu Güç Pk (kW)")
    es_kullanim_kat: float = Field(1, description="Eş Kullanım Katsayısı")
    diversite: float = Field(0.9, description="Diversite katsayısı")
    cos_j: float = Field(0.9, description="Trafo hesabında kullanılacak cosφ")
    mevcut_cos_j: float = Field(0.8, description="Mevcut cosφ")
    hedef_cos_j: float = Field(0.97, description="Hedeflenen cosφ")
    uk_yuzde: float = Field(6, description="Trafo kısa devre değeri %uk")
    u1_kv: float = Field(31.5, description="Primer gerilim (kV)")
    u2_kv: float = Field(0.4, description="Sekonder gerilim (kV)")


def roundup(x: float, digits: int = 0) -> float:
    factor = 10 ** digits
    return ceil(x * factor) / factor


@router.post("/hesapla")
async def hesapla(inp: TrafoInput):
    pr = inp.kurulu_guc_kw * inp.es_kullanim_kat * inp.diversite
    s = trafo(pr / inp.cos_j)
    i1 = roundup(s / (inp.u1_kv * sqrt(3)), 2)
    i2 = roundup(s / (inp.u2_kv * sqrt(3)), 2)

    tan_mevcut = tan(acos(inp.mevcut_cos_j))
    tan_hedef = tan(acos(inp.hedef_cos_j))
    k = round(tan_mevcut - tan_hedef, 4)
    q = roundup(s * 0.9 * k, -1)  # ROUNDUP to nearest 10

    ana_salter = salter(i2)
    komp_akim = roundup((q / (sqrt(3) * inp.u2_kv)) * 1.43, 2)
    komp_salter = salter(komp_akim)

    uk = inp.uk_yuzde / 100
    icu = round(i2 / uk / 1000, 2)
    salter_icu = round(icu * 1.25, 2)

    result = {
        "toplam_guc_pr_kw": round(pr, 2),
        "trafo_gucu_kva": s,
        "primer_akim_a": i1,
        "sekonder_akim_a": i2,
        "katsayi_k": k,
        "kompanzasyon_gucu_kvar": q,
        "ana_salter_a": ana_salter,
        "kompanzasyon_salter_a": komp_salter,
        "ksa_akim_icu_ka": icu,
        "secilen_salter_icu_ka": salter_icu,
        "profil": f"{s} kVA — {inp.u1_kv}/{inp.u2_kv} kV — %uk={inp.uk_yuzde}",
    }
    await shared.log_calc("trafo", inp.model_dump())
    return result
