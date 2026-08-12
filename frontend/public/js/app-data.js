/* Ortak API katmanı — Aynı origin üzerinden /api'a fetch atar (Kubernetes ingress /api → backend) */
(function () {
  // Local geliştirme: frontend 3000, backend 8001 farklı portlarda.
  // Üretim (emergent preview): aynı origin, /api ingress ile backend'e yönlenir.
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const API_BASE = isLocal
  ? "http://localhost:8001/api"
  : "https://elektrohesap-pro-api.onrender.com/api";

  async function request(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j.detail || j.message || msg;
      } catch (e) { /* ignore */ }
      throw new Error(msg);
    }
    return res.json();
  }

  const API = {
    stats: () => request("/stats"),
    trackVisit: (page) => request("/track/visit", { method: "POST", body: JSON.stringify({ page }) }),

    kabloListe: () => request("/kablo/kablolar"),
    kabloHesapla: (payload) => request("/kablo/hesapla", { method: "POST", body: JSON.stringify(payload) }),

    trafoHesapla: (payload) => request("/trafo/hesapla", { method: "POST", body: JSON.stringify(payload) }),

    busbarTipler: () => request("/busbar/tipler"),
    busbarHesapla: (payload) => request("/busbar/hesapla", { method: "POST", body: JSON.stringify(payload) }),

    ogHesapla: (payload) => request("/orta-gerilim/hesapla", { method: "POST", body: JSON.stringify(payload) }),

    nyyTablo: () => request("/nyy/tablo"),

    sortiTablolar: () => request("/sorti/tablolar"),
    sortiTablo: (tid) => request(`/sorti/tablo/${tid}`),
    sortiHesapla: (payload) => request("/sorti/hesapla", { method: "POST", body: JSON.stringify(payload) }),
  };

  window.API = API;
})();
