"""Orta Gerilim Malzeme Seçimi — Excel Sheet D formülleri ile birebir."""
from math import sqrt
from fastapi import APIRouter
from pydantic import BaseModel, Field
from .standartlar import ctr, in_oran
from . import shared

router = APIRouter(prefix="/api/orta-gerilim", tags=["Orta Gerilim"])


class OGInput(BaseModel):
    trafo_gucu_kva: float = Field(1600, description="Trafo Gücü (kVA)")
    u1_kv: float = Field(31.5, description="Primer Gerilimi U1 (kV)")
    u2_kv: float = Field(0.4, description="Sekonder Gerilimi U2 (kV)")
    sistem_ksa_ka: float = Field(1, description="Seçilecek olan sistem kısa devre akımı (kA)")
    toplam_trafo_gucu_kva: float = Field(400, description="Toplam Trafo (Toplan Tesisi) Gücü (kVA)")


@router.post("/hesapla")
async def hesapla(inp: OGInput):
    i1 = round(inp.trafo_gucu_kva / (inp.u1_kv * sqrt(3)), 2)
    i2 = round(inp.trafo_gucu_kva / (inp.u2_kv * sqrt(3)), 2)

    koruma_ctr = ctr(i1)
    koruma_nom = in_oran((inp.sistem_ksa_ka * 1000) / koruma_ctr)

    toplam_in = round(inp.toplam_trafo_gucu_kva / (inp.u1_kv * sqrt(3)), 2)
    olcu_ctr = ctr(toplam_in)
    olcu_nom = in_oran((inp.sistem_ksa_ka * 1000) / olcu_ctr)

    uyari = None
    if inp.toplam_trafo_gucu_kva < inp.trafo_gucu_kva:
        uyari = "Toplam Trafo Gücü, Trafo gücünden küçük olamaz."

    result = {
        "primer_akim_i1_a": i1,
        "sekonder_akim_i2_a": i2,
        "koruma_ct_primer_a": koruma_ctr,
        "koruma_ct_orani": f"{koruma_ctr}/5 A (Class 3)",
        "koruma_nominal_akim_orani": koruma_nom,
        "toplam_tesisi_nominal_akim_a": toplam_in,
        "olcu_ct_primer_a": olcu_ctr,
        "olcu_ct_orani": f"{olcu_ctr}/5 A (Class 0.5)",
        "olcu_nominal_akim_orani": olcu_nom,
        "uyari": uyari,
    }
    await shared.log_calc("orta-gerilim", inp.model_dump())
    return result
