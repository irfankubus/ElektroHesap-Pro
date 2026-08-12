/* global Shell */
/* Busbar Hatları modülü — A/B kolu gerilim düşümü */
(async function () {
  const root = Shell.renderShell({ title: "Busbar Hatları", subtitle: "A ve B kolu busbar gerilim düşümü analizi" });

  let tipler = [];
  try { tipler = await window.API.busbarTipler(); }
  catch (e) { Shell.toast("Busbar listesi alınamadı: " + e.message, "error"); }

  const busbarOptions = tipler.filter(t => t.tip).map(t =>
    `<option value="${t.tip}">${t.tip} (${t.akim} A · ${t.iletken})</option>`
  ).join("");

  root.innerHTML = `
    <div class="pill-group" data-testid="busbar-kol-tabs">
      <button data-kol="A" class="active" data-testid="busbar-tab-A">A Kolu Busbar</button>
      <button data-kol="B" data-testid="busbar-tab-B">B Kolu Busbar</button>
    </div>

    <div class="grid-2">
      <div class="card" data-testid="busbar-form-card">
        <div class="card-header">
          <div>
            <div class="card-title">Genel Parametreler</div>
            <div class="card-subtitle">Formül: ΔU = √3 × L × I × (R × cosφ + XL × sinφ)</div>
          </div>
          ${Shell.badge("BUSBAR HATTI", "info")}
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="gerilim">Gerilim</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="gerilim" value="380" data-testid="busbar-input-gerilim"/><span class="suffix">V</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="cosj">cosφ</label>
            <input class="form-input" type="number" step="0.01" min="0" max="1" id="cosj" value="0.99" data-testid="busbar-input-cosj"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="div">Diversite</label>
            <input class="form-input" type="number" step="0.01" id="div" value="0.6" data-testid="busbar-input-div"/>
          </div>
        </div>
      </div>

      <div class="card" data-testid="busbar-totals-card">
        <div class="card-header">
          <div><div class="card-title">Toplam Gerilim Düşümü</div><div class="card-subtitle">Hesap sonrası burada gösterilir</div></div>
          <div id="statusBadge"></div>
        </div>
        <div id="totalsBody">
          <div class="alert info">${Shell.ICONS.info}<div>Aşağıdaki segmentleri düzenleyip <strong>Hesapla</strong>'ya basın.</div></div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:1.5rem" data-testid="busbar-rows-card">
      <div class="card-header">
        <div><div class="card-title">Busbar Segmentleri</div><div class="card-subtitle" id="kolLabel">A Kolu — Her segment için busbar tipi, uzunluk (m) ve devreye giren makine güçlerini girin.</div></div>
        <button class="btn btn-accent btn-sm" id="addRowBtn" data-testid="busbar-add-row">${Shell.ICONS.plus}<span>Segment Ekle</span></button>
      </div>
      <div id="rowsContainer"></div>
      <div style="margin-top:1rem"><button class="btn btn-primary" id="hesaplaBtn" data-testid="busbar-hesapla-btn">${Shell.ICONS.calc}<span>Hesapla</span></button></div>
    </div>

    <div class="card" id="rowsResult" style="margin-top:1.5rem; display:none" data-testid="busbar-result-card">
      <div class="card-header"><div><div class="card-title">Segment Sonuçları</div><div class="card-subtitle">Cascading kalan güç yaklaşımı ile</div></div></div>
      <div class="table-wrap">
        <table class="table compact">
          <thead><tr><th>#</th><th>Busbar</th><th class="num">L (m)</th><th class="num">Grup Güç (kW)</th><th class="num">Kalan (Pk kW)</th><th class="num">Pr (kW)</th><th class="num">I (A)</th><th class="num">ΔU (V)</th><th>Durum</th></tr></thead>
          <tbody id="resultTBody"></tbody>
        </table>
      </div>
    </div>
  `;

  let selectedKol = "A";
  const kols = { A: [], B: [] };

  function defaultRows() {
    // A default: Excel'deki A kolu satırlarından
    kols.A = [
      { busbar_kod: "KXA 20", L_m: 4, makine_gucleri_kw: [528] },
      { busbar_kod: "KXA 20", L_m: 3, makine_gucleri_kw: [134] },
      { busbar_kod: "KXA 20", L_m: 2, makine_gucleri_kw: [142] },
      { busbar_kod: "KXA 20", L_m: 6, makine_gucleri_kw: [135] },
      { busbar_kod: "KXA 20", L_m: 11, makine_gucleri_kw: [174] },
    ];
    kols.B = [
      { busbar_kod: "KXA 20", L_m: 4, makine_gucleri_kw: [1229] },
      { busbar_kod: "KXA 20", L_m: 4, makine_gucleri_kw: [111] },
      { busbar_kod: "KXA 20", L_m: 1, makine_gucleri_kw: [111] },
    ];
  }
  defaultRows();

  function renderRows() {
    const c = document.getElementById("rowsContainer");
    document.getElementById("kolLabel").textContent = `${selectedKol} Kolu — Her segment için busbar tipi, uzunluk (m) ve devreye giren makine güçlerini girin.`;
    c.innerHTML = kols[selectedKol].map((row, idx) => `
      <div class="busbar-row" data-idx="${idx}" data-testid="busbar-row-${idx}">
        <select class="form-select" data-field="busbar_kod">${busbarOptions.replace(new RegExp(`value="${row.busbar_kod}"`), `value="${row.busbar_kod}" selected`)}</select>
        <div class="form-input-suffix"><input class="form-input" type="number" step="any" data-field="L_m" value="${row.L_m}" placeholder="Uzunluk"/><span class="suffix">m</span></div>
        <div>
          <div class="busbar-machines" data-machines>
            ${row.makine_gucleri_kw.map((mg, mi) => `<span class="machine-chip">${mg} kW<button data-remove-machine="${mi}">×</button></span>`).join("")}
            <input class="form-input" style="width:110px" type="number" step="any" placeholder="+ kW" data-add-machine/>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" data-remove-row title="Segmenti sil">${Shell.ICONS.x}</button>
      </div>
    `).join("");
    bindRowEvents();
  }

  function bindRowEvents() {
    document.querySelectorAll(".busbar-row").forEach((el) => {
      const idx = parseInt(el.dataset.idx, 10);
      el.querySelector('[data-field="busbar_kod"]').addEventListener("change", (e) => kols[selectedKol][idx].busbar_kod = e.target.value);
      el.querySelector('[data-field="L_m"]').addEventListener("input", (e) => kols[selectedKol][idx].L_m = parseFloat(e.target.value) || 0);
      el.querySelector('[data-remove-row]').addEventListener("click", () => {
        kols[selectedKol].splice(idx, 1);
        renderRows();
      });
      const addMachine = el.querySelector('[data-add-machine]');
      addMachine.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const v = parseFloat(addMachine.value);
          if (!isNaN(v) && v > 0) {
            kols[selectedKol][idx].makine_gucleri_kw.push(v);
            renderRows();
          }
        }
      });
      el.querySelectorAll('[data-remove-machine]').forEach((b) => {
        b.addEventListener("click", () => {
          const mi = parseInt(b.dataset.removeMachine, 10);
          kols[selectedKol][idx].makine_gucleri_kw.splice(mi, 1);
          renderRows();
        });
      });
    });
  }

  document.querySelectorAll("[data-kol]").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-kol]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      selectedKol = b.dataset.kol;
      renderRows();
    });
  });

  document.getElementById("addRowBtn").addEventListener("click", () => {
    kols[selectedKol].push({ busbar_kod: "KXA 20", L_m: 2, makine_gucleri_kw: [] });
    renderRows();
  });

  document.getElementById("hesaplaBtn").addEventListener("click", async () => {
    const btn = document.getElementById("hesaplaBtn");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Hesaplanıyor...</span>';
    try {
      const payload = {
        kol_adi: selectedKol,
        gerilim_v: parseFloat(document.getElementById("gerilim").value),
        cos_j: parseFloat(document.getElementById("cosj").value),
        diversite: parseFloat(document.getElementById("div").value),
        rows: kols[selectedKol],
      };
      const res = await window.API.busbarHesapla(payload);

      const uygun = res.genel_durum === "UYGUN";
      document.getElementById("statusBadge").innerHTML = Shell.badge(uygun ? "UYGUN" : "HATALI", uygun ? "success" : "danger");
      document.getElementById("totalsBody").innerHTML = `
        <div class="kpi-grid">
          <div class="kpi ${uygun ? "success" : "danger"}"><div class="kpi-label">Toplam ΔU</div><div class="kpi-value">${Shell.fmt(res.toplam_gerilim_dusumu_v)}<span class="unit">V</span></div></div>
          <div class="kpi"><div class="kpi-label">Max ΔU (%3)</div><div class="kpi-value">${Shell.fmt(res.max_gerilim_dusumu_v)}<span class="unit">V</span></div></div>
          <div class="kpi primary"><div class="kpi-label">Kol</div><div class="kpi-value">${res.kol_adi}</div></div>
        </div>
        <div class="alert ${uygun ? "success" : "danger"}" style="margin-top:1rem">
          ${uygun ? Shell.ICONS.check : Shell.ICONS.warn}
          <div>${res.mesaj}</div>
        </div>
      `;

      document.getElementById("rowsResult").style.display = "";
      document.getElementById("resultTBody").innerHTML = res.rows.map((r, i) => {
        if (r.error) return `<tr><td>${i + 1}</td><td colspan="8">${Shell.badge("HATA", "danger")} ${r.error}</td></tr>`;
        return `<tr>
          <td>${i + 1}</td><td>${r.busbar_kod}</td>
          <td class="num">${Shell.fmt(r.L_m)}</td>
          <td class="num">${Shell.fmt(r.grup_guc_kw)}</td>
          <td class="num">${Shell.fmt(r.kalan_guc_pk_kw)}</td>
          <td class="num">${Shell.fmt(r.pr_kw)}</td>
          <td class="num">${Shell.fmt(r.akim_a)}</td>
          <td class="num">${Shell.fmt(r.gerilim_dusumu_v)}</td>
          <td>${Shell.badge(r.durum, r.durum === "UYGUN" ? "success" : "danger")}</td>
        </tr>`;
      }).join("");

      Shell.toast("Hesaplama tamamlandı", "success");
    } catch (err) {
      Shell.toast("Hata: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });

  renderRows();
})();
