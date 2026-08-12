/* Ortak API katmanı — frontend GitHub Pages'te, backend Render.com'da ayrı servis olarak çalışır. */
(function () {
  // Local geliştirme: frontend 3000, backend 8001 farklı portlarda.
  // Üretim: GitHub Pages statik dosya sunucusu olduğundan /api route'u YOK.
  // Bu yüzden canlıda backend'in tam Render URL'ine gitmemiz gerekiyor.
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  // NOT: Render'a ilk deploy sonrası servis URL'inizi kontrol edin, farklıysa burayı güncelleyin.
  const API_BASE = isLocal ? "http://localhost:8001/api" : "https://elektrohesap-pro-api.onrender.com/api";

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
