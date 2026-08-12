/* global Shell */
/* Sorti Hesapları modülü */
(async function () {
  const root = Shell.renderShell({ title: "Sorti Hesapları", subtitle: "Sıva altı ve nemli yer sortileri · malzeme maliyet analizi" });

  root.innerHTML = `
    <div class="pill-group" data-testid="sorti-tablo-tabs">
      <button data-tid="sorti_nya" class="active" data-testid="sorti-tab-nya">NYA (Sıva Altı & Nemli)</button>
      <button data-tid="sorti_n2xh" data-testid="sorti-tab-n2xh">N2XH (Halojensiz)</button>
      <button data-tid="sorti_n2xh_emt" data-testid="sorti-tab-n2xh-emt">N2XH + EMT Boru</button>
    </div>

    <div class="card" data-testid="sorti-info-card">
      <div class="card-header">
        <div><div class="card-title" id="tabloTitle">NYA Kablo Sorti Fiyatları</div><div class="card-subtitle" id="tabloSub">Malzemelerin fiyatları güncellenebilir · tablo hemen yeniden hesaplanır</div></div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <label class="form-label" for="uzunluk" style="margin:0">Sorti Uzunluğu:</label>
          <div class="form-input-suffix" style="width:130px"><input class="form-input" type="number" step="any" id="uzunluk" value="50" data-testid="sorti-input-uzunluk"/><span class="suffix">m</span></div>
          <button class="btn btn-primary btn-sm" id="hesaplaBtn" data-testid="sorti-hesapla-btn">${Shell.ICONS.calc}<span>Hesapla</span></button>
        </div>
      </div>
      <div id="totalsBody"></div>
    </div>

    <div class="card" style="margin-top:1.5rem" data-testid="sorti-materials-card">
      <div class="card-header"><div><div class="card-title">Malzeme Listesi</div><div class="card-subtitle">Fiyatları değiştirip yeniden hesaplayabilirsiniz</div></div></div>
      <div class="table-wrap">
        <table class="table compact">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th style="min-width:200px">Malzeme</th>
              <th class="num" style="width:120px">Birim Fiyat</th>
              <th class="num">SA Normal</th>
              <th class="num">SA Paralel</th>
              <th class="num">SA Priz</th>
              <th class="num">SA Komitatör</th>
              <th class="num">SA Vaviyen</th>
              <th class="num">Nem Normal</th>
              <th class="num">Nem Paralel</th>
              <th class="num">Nem Priz</th>
              <th class="num">Nem Komitatör</th>
              <th class="num">Nem Vaviyen</th>
            </tr>
          </thead>
          <tbody id="sortiTBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const TITLES = {
    sorti_nya: "NYA Kablo Sorti Fiyatları",
    sorti_n2xh: "N2XH Kablo Sorti Fiyatları",
    sorti_n2xh_emt: "N2XH + EMT Boru Sorti Fiyatları",
  };

  const SORT_TYPES = ["sa_normal","sa_paralel","sa_priz","sa_komitator","sa_vaviyen","nem_normal","nem_paralel","nem_priz","nem_komitator","nem_vaviyen"];
  const SORT_LABELS = { sa_normal:"SA Normal", sa_paralel:"SA Paralel", sa_priz:"SA Priz", sa_komitator:"SA Komitatör", sa_vaviyen:"SA Vaviyen",
    nem_normal:"Nem Normal", nem_paralel:"Nem Paralel", nem_priz:"Nem Priz", nem_komitator:"Nem Komitatör", nem_vaviyen:"Nem Vaviyen"};

  let currentTid = "sorti_nya";
  let currentData = null;
  let userPrices = {}; // { tid: { itemNo: newPrice } }

  async function loadAndCompute() {
    try {
      const uzunluk = parseFloat(document.getElementById("uzunluk").value);
      const payload = {
        tablo_id: currentTid,
        sorti_uzunluk: isNaN(uzunluk) ? null : uzunluk,
        birim_fiyatlar: userPrices[currentTid] || null,
      };
      const d = await window.API.sortiHesapla(payload);
      currentData = d;
      renderData(d);
    } catch (e) { Shell.toast("Hata: " + e.message, "error"); }
  }

  function renderData(d) {
    document.getElementById("tabloTitle").textContent = TITLES[d.tablo_id];
    document.getElementById("tabloSub").textContent = (d.aciklama || "") + " — Sorti uzunluğu: " + d.sorti_uzunluk + " m";

    document.getElementById("totalsBody").innerHTML = `
      <div class="kpi-grid" style="margin-top:0.5rem">
        ${SORT_TYPES.map(st => `
          <div class="kpi ${st.startsWith("sa_") ? "primary" : "success"}">
            <div class="kpi-label">${SORT_LABELS[st]}</div>
            <div class="kpi-value">${Shell.fmt(d.totals[st])}<span class="unit">₺</span></div>
          </div>`).join("")}
      </div>
    `;

    document.getElementById("sortiTBody").innerHTML = d.items.map((it, idx) => `
      <tr>
        <td>${it.no}</td>
        <td>${it.malzeme}</td>
        <td class="num">
          <input class="form-input" style="width:100px;text-align:right;padding:0.3rem 0.4rem;font-size:0.82rem" type="number" step="any" value="${it.birim_fiyat}" data-price-no="${it.no}" data-testid="sorti-price-${it.no}"/>
        </td>
        ${SORT_TYPES.map(st => {
          const c = it.kategori_fiyatlar[st];
          const active = c.miktar > 0;
          return `<td class="num" ${active ? "" : 'style="color:var(--text-muted)"'}>${active ? Shell.fmt(c.fiyat) : "—"}</td>`;
        }).join("")}
      </tr>
    `).join("");

    // Wire price inputs
    document.querySelectorAll("[data-price-no]").forEach((el) => {
      el.addEventListener("change", (e) => {
        userPrices[currentTid] = userPrices[currentTid] || {};
        userPrices[currentTid][el.dataset.priceNo] = parseFloat(e.target.value) || 0;
        loadAndCompute();
      });
    });
  }

  document.querySelectorAll("[data-tid]").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-tid]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      currentTid = b.dataset.tid;
      // Reset uzunluk to default per table
      const defaults = { sorti_nya: 50, sorti_n2xh: 10, sorti_n2xh_emt: 25 };
      document.getElementById("uzunluk").value = defaults[currentTid];
      loadAndCompute();
    });
  });

  document.getElementById("hesaplaBtn").addEventListener("click", loadAndCompute);

  loadAndCompute();
})();
