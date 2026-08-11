"""Standart trafo, şalter ve akım trafosu değerleri (TSE / IEC 60076, IEC 60947, IEC 60044)."""

TRAFO_STANDART_KVA = [50, 100, 160, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150]

SALTER_STANDART_A = [
    16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500,
    630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300,
]

CTR_STANDART_A = [
    5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400,
    500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000,
]

IN_STANDART = [
    0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5,
    2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20,
]


def _snap_up(value: float, table: list):
    for t in table:
        if t >= value:
            return t
    return table[-1]


def trafo(pr_kva: float):
    """Bir sonraki standart trafo gücü (kVA)."""
    return _snap_up(pr_kva, TRAFO_STANDART_KVA)


def salter(akim_a: float):
    """Bir sonraki standart şalter değeri (A)."""
    return _snap_up(akim_a, SALTER_STANDART_A)


def ctr(akim_a: float):
    """Bir sonraki standart akım trafosu primer değeri (A)."""
    return _snap_up(akim_a, CTR_STANDART_A)


def in_oran(oran: float):
    """Bir sonraki standart nominal akım değeri."""
    return _snap_up(oran, IN_STANDART)
