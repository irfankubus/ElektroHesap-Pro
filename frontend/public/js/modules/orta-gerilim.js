/* global Shell */
/* Orta Gerilim Malzeme Seçimi */
(function () {
  const root = Shell.renderShell({ title: "Orta Gerilim Malzeme", subtitle: "Primer/sekonder akım · koruma & ölçü akım trafosu seçimi" });

  root.innerHTML = `
    <div class="grid-2">
      <div class="card" data-testid="og-form-card">
        <div class="card-header">
          <div><div class="card-title">Giriş Değerleri</div><div class="card-subtitle">Trafo ve sistem parametreleri</div></div>
          ${Shell.badge("ORTA GERİLİM", "info")}
        </div>
        <form id="ogForm" class="form-grid">
          <div class="form-group full">
            <label class="form-label" for="s">Trafo Gücü (S)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="s" value="1600" data-testid="og-input-s"/><span class="suffix">kVA</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="u1">Primer Gerilim (U1)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="u1" value="31.5" data-testid="og-input-u1"/><span class="suffix">kV</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="u2">Sekonder Gerilim (U2)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="u2" value="0.4" data-testid="og-input-u2"/><span class="suffix">kV</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="ksa">Sistem Kısa Devre Akımı</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="ksa" value="1" data-testid="og-input-ksa"/><span class="suffix">kA</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="toplam">Toplam Tesisi Trafo Gücü</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="toplam" value="400" data-testid="og-input-toplam"/><span class="suffix">kVA</span></div>
          </div>
          <div class="full" style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button type="submit" class="btn btn-primary" data-testid="og-hesapla-btn">${Shell.ICONS.calc}<span>Hesapla</span></button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>

      <div class="card" data-testid="og-result-card">
        <div class="card-header">
          <div><div class="card-title">Seçim Sonucu</div><div class="card-subtitle" id="ogSub">Class 3 koruma + Class 0.5 ölçü akım trafosu</div></div>
        </div>
        <div id="resultBody">
          <div class="alert info">${Shell.ICONS.info}<div>Hesapla butonuna basınca; primer/sekonder akımlar, koruma CT ve ölçü CT seçimleri görünür.</div></div>
        </div>
      </div>
    </div>

    <div class="card mt-3" style="margin-top:1.5rem">
      <div class="card-header"><div><div class="card-title">Kullanılan Formüller</div><div class="card-subtitle">IEC 60044 CT primer değerlerine snap</div></div></div>
      <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
        <div>• Primer Akım: <strong>I1 = S / (U1 × √3)</strong></div>
        <div>• Sekonder Akım: <strong>I2 = S / (U2 × √3)</strong></div>
        <div>• Koruma CT (Class 3) primer değeri: I1 üzerinden standart CT tablosu ile snap</div>
        <div>• Nominal Akım Oranı: <strong>In = (Icc × 1000) / CT_primer</strong></div>
        <div>• Toplam Tesisi In: <strong>In = Toplam / (U1 × √3)</strong> → Ölçü CT (Class 0.5)</div>
      </div>
    </div>
  `;

  document.getElementById("ogForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Hesaplanıyor...</span>';
    try {
      const payload = {
        trafo_gucu_kva: parseFloat(document.getElementById("s").value),
        u1_kv: parseFloat(document.getElementById("u1").value),
        u2_kv: parseFloat(document.getElementById("u2").value),
        sistem_ksa_ka: parseFloat(document.getElementById("ksa").value),
        toplam_trafo_gucu_kva: parseFloat(document.getElementById("toplam").value),
      };
      const d = await window.API.ogHesapla(payload);
      const body = document.getElementById("resultBody");
      body.innerHTML = `
        ${d.uyari ? `<div class="alert warning">${Shell.ICONS.warn}<div>${d.uyari}</div></div>` : ""}
        <div class="kpi-grid">
          <div class="kpi primary"><div class="kpi-label">Primer Akım (I1)</div><div class="kpi-value">${Shell.fmt(d.primer_akim_i1_a)}<span class="unit">A</span></div></div>
          <div class="kpi primary"><div class="kpi-label">Sekonder Akım (I2)</div><div class="kpi-value">${Shell.fmt(d.sekonder_akim_i2_a)}<span class="unit">A</span></div></div>
          <div class="kpi warning"><div class="kpi-label">Koruma CT (Class 3)</div><div class="kpi-value" style="font-size:1.1rem">${d.koruma_ct_orani}</div></div>
          <div class="kpi"><div class="kpi-label">Koruma Nominal Akım Oranı</div><div class="kpi-value">${Shell.fmt(d.koruma_nominal_akim_orani, 3)}<span class="unit">In</span></div></div>
          <div class="kpi"><div class="kpi-label">Toplam Tesisi In</div><div class="kpi-value">${Shell.fmt(d.toplam_tesisi_nominal_akim_a)}<span class="unit">A</span></div></div>
          <div class="kpi success"><div class="kpi-label">Ölçü CT (Class 0.5)</div><div class="kpi-value" style="font-size:1.1rem">${d.olcu_ct_orani}</div></div>
          <div class="kpi"><div class="kpi-label">Ölçü Nominal Akım Oranı</div><div class="kpi-value">${Shell.fmt(d.olcu_nominal_akim_orani, 3)}<span class="unit">In</span></div></div>
        </div>
      `;
      Shell.toast("Hesaplama tamamlandı", "success");
    } catch (err) {
      Shell.toast("Hata: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
})();
