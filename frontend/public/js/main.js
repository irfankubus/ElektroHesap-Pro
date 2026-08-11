/* Ortak yardımcı fonksiyonlar ve sidebar / toast */
(function () {
  const MODULES = [
    { key: "home", href: "/", label: "Ana Sayfa", icon: "home" },
    { key: "kablo", href: "/pages/kablo-kesidi.html", label: "Kablo Kesidi", icon: "cable" },
    { key: "trafo", href: "/pages/trafo.html", label: "Trafo & Kompanzasyon", icon: "zap" },
    { key: "busbar", href: "/pages/busbar.html", label: "Busbar Hatları", icon: "rows" },
    { key: "og", href: "/pages/orta-gerilim.html", label: "Orta Gerilim", icon: "bolt" },
    { key: "nyy", href: "/pages/nyy.html", label: "NYY Kablo Verisi", icon: "table" },
    { key: "sorti", href: "/pages/sorti.html", label: "Sorti Hesapları", icon: "plug" },
  ];

  const ICONS = {
    home:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h5v-6h4v6h5V9"/></svg>',
    cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2v4"/><path d="M19 22v-4"/><path d="M5 6a3 3 0 0 0 3 3v6a3 3 0 0 0 3 3 3 3 0 0 1 3 3v.5"/><path d="M19 18a3 3 0 0 0-3-3v-6a3 3 0 0 0-3-3 3 3 0 0 1-3-3V3"/></svg>',
    zap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    rows:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="15" width="18" height="6" rx="1"/><path d="M3 12h18"/></svg>',
    bolt:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m4.93 4.93 4.24 4.24"/><path d="M2 12h6"/><path d="M4.93 19.07 9.17 14.83"/><circle cx="12" cy="12" r="4"/><path d="m14.83 14.83 4.24 4.24"/><path d="M16 12h6"/><path d="m14.83 9.17 4.24-4.24"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    plug:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
    menu:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    warn:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    calc:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/></svg>',
    info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  function activeKey() {
    const p = window.location.pathname;
    if (p === "/" || p.endsWith("/index.html")) return "home";
    if (p.includes("kablo-kesidi")) return "kablo";
    if (p.includes("trafo")) return "trafo";
    if (p.includes("busbar")) return "busbar";
    if (p.includes("orta-gerilim")) return "og";
    if (p.includes("nyy")) return "nyy";
    if (p.includes("sorti")) return "sorti";
    return "";
  }

  function renderShell({ title, subtitle }) {
    const currentKey = activeKey();
    const navItems = MODULES.map(m =>
      `<li><a href="${m.href}" class="${m.key === currentKey ? "active" : ""}" data-testid="sidebar-nav-${m.key}">${ICONS[m.icon] || ""}<span>${m.label}</span></a></li>`
    ).join("");

    const shell = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <img src="/assets/logo.svg" alt="ElektroHesap Pro Logo"/>
          <div class="sidebar-brand-text">
            <span class="sidebar-brand-title">ElektroHesap</span>
            <span class="sidebar-brand-sub">Pro · v1.0</span>
          </div>
        </div>
        <div class="sidebar-section-label">Modüller</div>
        <ul class="sidebar-nav">${navItems}</ul>
        <div class="sidebar-foot">
          <div><strong>ElektroHesap Pro</strong></div>
          <div>Elektrik mühendisliği hesaplama modülleri</div>
          <div style="margin-top:0.4rem">© 2026 · v1.0</div>
        </div>
      </aside>
      <div class="main">
        <header class="header">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <button class="header-menu-btn" id="sidebarToggle" data-testid="sidebar-toggle" aria-label="Menu">${ICONS.menu}</button>
            <div class="header-title">
              <span class="header-title-main">${title || "ElektroHesap Pro"}</span>
              <span class="header-title-sub">${subtitle || "Mühendislik Hesaplama Portalı"}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-ghost btn-sm no-print" onclick="window.print()" data-testid="header-print-btn">${ICONS.print}<span>Yazdır</span></button>
          </div>
        </header>
        <main class="main-content" id="mainContent"></main>
      </div>
      <div class="toast-container" id="toastContainer"></div>
    `;
    document.body.classList.add("app-shell");
    document.body.innerHTML = shell;

    // Sidebar toggle
    const sidebar = document.getElementById("sidebar");
    document.getElementById("sidebarToggle")?.addEventListener("click", () => sidebar.classList.toggle("open"));

    // Analytics visit
    if (window.API) {
      window.API.trackVisit(currentKey || "unknown").catch(() => {});
    } else {
      // app-data.js yüklenemedi (reklam engelleyici, ağ hatası veya proxy/ingress
      // yönlendirme çakışması olabilir). Sessizce başarısız olup kullanıcıyı
      // kriptik bir "Cannot read properties of undefined" hatasıyla baş başa
      // bırakmak yerine burada açıkça uyarıyoruz.
      console.error("[ElektroHesap] /js/app-data.js yüklenemedi — window.API tanımsız.");
      setTimeout(() => {
        toast(
          "Uygulama verisi yüklenemedi. Sayfayı yenileyin; sorun devam ederse reklam engelleyicinizi/eklentilerinizi devre dışı bırakıp tekrar deneyin.",
          "error"
        );
      }, 300);
    }

    return document.getElementById("mainContent");
  }

  function toast(msg, type = "info") {
    const c = document.getElementById("toastContainer");
    if (!c) return;
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 240); }, 3500);
  }

  function fmt(n, digits = 2) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    if (typeof n !== "number") n = Number(n);
    return n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  }

  function badge(label, type = "info") {
    return `<span class="badge ${type}">${label}</span>`;
  }

  window.Shell = { renderShell, toast, fmt, badge, ICONS, MODULES };
})();
