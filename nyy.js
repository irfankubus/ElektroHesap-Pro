/* global Shell */
/* NYY Kablo Teknik Veri Tablosu */
(async function () {
  const root = Shell.renderShell({ title: "NYY Kablo Veri Tablosu", subtitle: "Kesit · çap · direnç · toprakta/havada akım kapasiteleri" });

  root.innerHTML = `
    <div class="card" data-testid="nyy-info-card">
      <div class="card-header"><div><div class="card-title">YVV (NYY) Kablosu</div><div class="card-subtitle">Anma gerilimi 0.6/1 kV — En yüksek iletken sıcaklığı 70 °C</div></div>${Shell.badge("43 KESİT", "info")}</div>
      <p id="aciklama" style="font-size:0.9rem"></p>
      <div class="form-input-suffix" style="max-width:360px;margin-top:0.75rem">
        <input class="form-input" type="text" id="searchInput" placeholder="Kablo tipi ara (ör: 4x25 veya 150mm)" data-testid="nyy-search"/>
        <span class="suffix">${Shell.ICONS.info}</span>
      </div>
    </div>

    <div class="card" style="margin-top:1.5rem" data-testid="nyy-table-card">
      <div class="card-header"><div><div class="card-title">Kablo Tablosu</div><div class="card-subtitle" id="tableSub">Tümü listeleniyor</div></div></div>
      <div class="table-wrap">
        <table class="table compact">
          <thead><tr><th>#</th><th>Kablo Tipi</th><th class="num">Kesit (mm²)</th><th class="num">Çap (mm)</th><th class="num">Direnç (Ω/km)</th><th class="num">Toprakta (A)</th><th class="num">Havada (A)</th><th class="num">Ağırlık (kg/km)</th></tr></thead>
          <tbody id="nyyTBody"></tbody>
        </table>
      </div>
    </div>
  `;

  let all = [];
  try {
    const data = await window.API.nyyTablo();
    all = data.kablolar;
    document.getElementById("aciklama").textContent = data.aciklama;
  } catch (e) { Shell.toast("Veri alınamadı: " + e.message, "error"); return; }

  const tbody = document.getElementById("nyyTBody");
  const tsub = document.getElementById("tableSub");

  function render(list) {
    tbody.innerHTML = list.map(k => `
      <tr>
        <td>${k.id}</td>
        <td>${k.kablo_tipi}</td>
        <td class="num">${k.kesit}</td>
        <td class="num">${k.cap}</td>
        <td class="num">${k.direnc}</td>
        <td class="num">${k.akim_toprakta}</td>
        <td class="num">${k.akim_havada}</td>
        <td class="num">${k.agirlik}</td>
      </tr>`).join("");
    tsub.textContent = list.length === all.length ? `Tümü listeleniyor (${all.length})` : `${list.length} / ${all.length} sonuç`;
  }

  render(all);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return render(all);
    render(all.filter(k => k.kablo_tipi.toLowerCase().includes(q)));
  });
})();
