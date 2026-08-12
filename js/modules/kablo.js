/* global Shell */
/* Kablo Kesidi modülü */
(async function () {
  const root = Shell.renderShell({ title: "Kablo Kesidi Hesaplama", subtitle: "Çekilen güç · gerilim · mesafeye göre NYY kablo seçimi" });

  let kablolar = [];
  try { kablolar = await window.API.kabloListe(); }
  catch (e) { Shell.toast("Kablo listesi alınamadı: " + e.message, "error"); }

  const options = kablolar.map(k =>
    `<option value="${k.id}">${k.kablo_tipi} — ${k.kesit} mm²</option>`
  ).join("");

  root.innerHTML = `
    <div class="grid-2">
      <div class="card" data-testid="kablo-form-card">
        <div class="card-header">
          <div>
            <div class="card-title">Giriş Değerleri</div>
            <div class="card-subtitle">Devreye ait değerleri giriniz</div>
          </div>
          ${Shell.badge("KABLO KESİDİ", "info")}
        </div>
        <form id="kabloForm" class="form-grid">
          <div class="form-group">
            <label class="form-label" for="guc">Çekilen Güç (P) <span class="hint">kW</span></label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="guc" value="950" data-testid="kablo-input-guc" required/><span class="suffix">kW</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="gerilim">Devre Gerilimi (U) <span class="hint">V</span></label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="gerilim" value="380" data-testid="kablo-input-gerilim" required/><span class="suffix">V</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="cosj">Güç Faktörü (cosφ)</label>
            <input class="form-input" type="number" step="0.01" min="0" max="1" id="cosj" value="0.9" data-testid="kablo-input-cosj" required/>
          </div>
          <div class="form-group">
            <label class="form-label" for="mesafe">Mesafe <span class="hint">m</span></label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="mesafe" value="130" data-testid="kablo-input-mesafe" required/><span class="suffix">m</span></div>
          </div>
          <div class="form-group full">
            <label class="form-label" for="kesit">Kullanılan İletken (NYY)</label>
            <select class="form-select" id="kesit" data-testid="kablo-input-kesit">${options}</select>
          </div>
          <div class="form-group">
            <label class="form-label" for="hatSayisi">1 Hat Kaç Per Çekilecek</label>
            <div class="form-input-suffix"><input class="form-input" type="number" min="1" step="1" id="hatSayisi" value="4" data-testid="kablo-input-hat"/><span class="suffix">adet</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="yanYana">Yan Yana Katsayısı</label>
            <input class="form-input" type="number" step="0.01" min="0" max="1" id="yanYana" value="0.8" data-testid="kablo-input-katsayi"/>
          </div>
          <div class="full" style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button type="submit" class="btn btn-primary" data-testid="kablo-hesapla-btn">${Shell.ICONS.calc}<span>Hesapla</span></button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>

      <div class="card" id="resultCard" data-testid="kablo-result-card">
        <div class="card-header">
          <div>
            <div class="card-title">Sonuç</div>
            <div class="card-subtitle">Hesap butonuna basınca burada çıkar</div>
          </div>
          <div id="statusBadge"></div>
        </div>
        <div id="resultBody">
          <div class="alert info">${Shell.ICONS.info}<div><strong>Örnek değerlerle başlayabilirsiniz.</strong><br/>Hesapla butonuna basınca; akım, akım taşıma kapasitesi, gerilim düşümü ve uygunluk raporu görünür.</div></div>
        </div>
      </div>
    </div>

    <div class="card mt-3" style="margin-top:1.5rem">
      <div class="card-header">
        <div>
          <div class="card-title">Kullanılan Formüller</div>
          <div class="card-subtitle">Excel projesi ile birebir uyumlu</div>
        </div>
      </div>
      <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
        <div>• Çekilen Akım: <strong>I = P × 1000 / (U × cosφ × √3)</strong></div>
        <div>• Toprakta Akım Kapasitesi: hat = 1 ise NYY tablo değeri, aksi halde <strong>Kap × k × per</strong></div>
        <div>• Gerilim Düşümü: <strong>ΔU = (P × 1000 × L) / (56 × (kesit × per) × U)</strong></div>
        <div>• Müsaade edilen: <strong>U × %3</strong></div>
      </div>
    </div>
  `;

  const setResult = (data) => {
    const badge = document.getElementById("statusBadge");
    const uygun = data.genel_durum === "Uygun Kesit";
    badge.innerHTML = Shell.badge(uygun ? "UYGUN" : "UYGUN DEĞİL", uygun ? "success" : "danger");

    const body = document.getElementById("resultBody");
    body.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi primary"><div class="kpi-label">Çekilen Akım</div><div class="kpi-value">${Shell.fmt(data.cekilen_akim_a)}<span class="unit">A</span></div></div>
        <div class="kpi ${data.durum_toprakta === "Uygun Kesit" ? "success" : "danger"}"><div class="kpi-label">Akım Kap. Toprakta</div><div class="kpi-value">${Shell.fmt(data.akim_kapasitesi_toprakta_a)}<span class="unit">A</span></div></div>
        <div class="kpi ${data.durum_havada === "Uygun Kesit" ? "success" : "danger"}"><div class="kpi-label">Akım Kap. Havada</div><div class="kpi-value">${Shell.fmt(data.akim_kapasitesi_havada_a)}<span class="unit">A</span></div></div>
        <div class="kpi ${data.durum_gerilim_dusumu === "Uygun" ? "success" : "danger"}"><div class="kpi-label">Gerilim Düşümü</div><div class="kpi-value">${Shell.fmt(data.gerilim_dusumu_v, 3)}<span class="unit">V (%${Shell.fmt(data.gerilim_dusumu_yuzde, 2)})</span></div></div>
        <div class="kpi"><div class="kpi-label">Kablo Çapı</div><div class="kpi-value">${Shell.fmt(data.kablo_capi_mm)}<span class="unit">mm</span></div></div>
        <div class="kpi"><div class="kpi-label">Toplam Ağırlık</div><div class="kpi-value">${Shell.fmt(data.toplam_agirlik_kg)}<span class="unit">kg</span></div></div>
      </div>
      <div class="alert ${uygun ? "success" : "danger"}" style="margin-top:1rem">
        ${uygun ? Shell.ICONS.check : Shell.ICONS.warn}
        <div>${data.mesaj}</div>
      </div>
      <div class="table-wrap" style="margin-top:1rem">
        <table class="table compact">
          <thead><tr><th>Değer</th><th class="num">Toprakta</th><th class="num">Havada</th><th>Gerilim Düşümü</th></tr></thead>
          <tbody>
            <tr><td>Akım Taşıma Kapasitesi Durumu</td>
              <td>${Shell.badge(data.durum_toprakta, data.durum_toprakta === "Uygun Kesit" ? "success" : "danger")}</td>
              <td>${Shell.badge(data.durum_havada, data.durum_havada === "Uygun Kesit" ? "success" : "danger")}</td>
              <td>${Shell.badge(data.durum_gerilim_dusumu, data.durum_gerilim_dusumu === "Uygun" ? "success" : "danger")}</td>
            </tr>
            <tr><td>Kablo Tipi</td><td colspan="3">${data.kablo.kablo_tipi}</td></tr>
            <tr><td>Direnç</td><td colspan="3" class="num">${data.kablo.direnc} Ω/km</td></tr>
          </tbody>
        </table>
      </div>
    `;
  };

  document.getElementById("kabloForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Hesaplanıyor...</span>';
    try {
      const payload = {
        guc_kw: parseFloat(document.getElementById("guc").value),
        gerilim_v: parseFloat(document.getElementById("gerilim").value),
        cos_j: parseFloat(document.getElementById("cosj").value),
        mesafe_m: parseFloat(document.getElementById("mesafe").value),
        kesit_id: parseInt(document.getElementById("kesit").value, 10),
        hat_sayisi: parseInt(document.getElementById("hatSayisi").value, 10),
        yan_yana_katsayi: parseFloat(document.getElementById("yanYana").value),
      };
      const res = await window.API.kabloHesapla(payload);
      setResult(res);
      Shell.toast("Hesaplama tamamlandı", "success");
    } catch (err) {
      Shell.toast("Hata: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
})();
