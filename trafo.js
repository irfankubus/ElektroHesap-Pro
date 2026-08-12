/* global Shell */
/* Trafo & Kompanzasyon modülü */
(function () {
  const root = Shell.renderShell({ title: "Trafo & Kompanzasyon", subtitle: "Trafo gücü, güç faktörü düzeltme ve şalter seçimi" });

  root.innerHTML = `
    <div class="grid-2">
      <div class="card" data-testid="trafo-form-card">
        <div class="card-header">
          <div>
            <div class="card-title">Giriş Değerleri</div>
            <div class="card-subtitle">Trafo ve kompanzasyon parametreleri</div>
          </div>
          ${Shell.badge("TRAFO", "info")}
        </div>
        <form id="trafoForm" class="form-grid">
          <div class="form-group">
            <label class="form-label" for="pk">Toplam Kurulu Güç (Pk)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="pk" value="1400" data-testid="trafo-input-pk"/><span class="suffix">kW</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="ku">Eş Kullanım Katsayısı</label>
            <input class="form-input" type="number" step="0.01" id="ku" value="1" data-testid="trafo-input-ku"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="kd">Diversite</label>
            <input class="form-input" type="number" step="0.01" id="kd" value="0.9" data-testid="trafo-input-kd"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="cosj">Hesap cosφ</label>
            <input class="form-input" type="number" step="0.01" id="cosj" value="0.9" data-testid="trafo-input-cosj"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="mevcut">Mevcut cosφ</label>
            <input class="form-input" type="number" step="0.01" id="mevcut" value="0.8" data-testid="trafo-input-mevcut"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="hedef">Yükseltilmek İstenen cosφ</label>
            <input class="form-input" type="number" step="0.01" id="hedef" value="0.97" data-testid="trafo-input-hedef"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="uk">Trafo %uk</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="0.01" id="uk" value="6" data-testid="trafo-input-uk"/><span class="suffix">%</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="u1">Primer Gerilim (U1)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="u1" value="31.5" data-testid="trafo-input-u1"/><span class="suffix">kV</span></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="u2">Sekonder Gerilim (U2)</label>
            <div class="form-input-suffix"><input class="form-input" type="number" step="any" id="u2" value="0.4" data-testid="trafo-input-u2"/><span class="suffix">kV</span></div>
          </div>
          <div class="full" style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button type="submit" class="btn btn-primary" data-testid="trafo-hesapla-btn">${Shell.ICONS.calc}<span>Hesapla</span></button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>

      <div class="card" data-testid="trafo-result-card">
        <div class="card-header">
          <div><div class="card-title">Sonuç</div><div class="card-subtitle" id="profileSub">Hesap butonuna basınca burada çıkar</div></div>
          <div id="statusBadge"></div>
        </div>
        <div id="resultBody">
          <div class="alert info">${Shell.ICONS.info}<div><strong>Örnek değerlerle başlayabilirsiniz.</strong><br/>Trafo gücü, primer/sekonder akımlar, kompanzasyon gücü ve şalter seçimleri hesaplanır.</div></div>
        </div>
      </div>
    </div>

    <div class="card mt-3" style="margin-top:1.5rem">
      <div class="card-header"><div><div class="card-title">Kullanılan Formüller</div><div class="card-subtitle">TSE / IEC standart trafo ve şalter tabloları ile</div></div></div>
      <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
        <div>• Toplam Güç: <strong>Pr = Pk × Ku × Diversite</strong></div>
        <div>• Trafo Gücü: <strong>S = standart(Pr / cosφ)</strong></div>
        <div>• Primer Akım: <strong>I1 = S / (U1 × √3)</strong> ,&nbsp; Sekonder: <strong>I2 = S / (U2 × √3)</strong></div>
        <div>• Kompanzasyon: <strong>Q = S × 0.9 × (tan(acos(cosφ_mevcut)) − tan(acos(cosφ_hedef)))</strong></div>
        <div>• Kısa Devre Akımı: <strong>Icu = I2 / (%uk/100) / 1000</strong></div>
      </div>
    </div>
  `;

  const setResult = (d) => {
    document.getElementById("profileSub").textContent = d.profil;
    document.getElementById("statusBadge").innerHTML = Shell.badge(d.trafo_gucu_kva + " kVA", "info");
    document.getElementById("resultBody").innerHTML = `
      <div class="kpi-grid">
        <div class="kpi primary"><div class="kpi-label">Toplam Güç (Pr)</div><div class="kpi-value">${Shell.fmt(d.toplam_guc_pr_kw)}<span class="unit">kW</span></div></div>
        <div class="kpi primary"><div class="kpi-label">Trafo Gücü (S)</div><div class="kpi-value">${Shell.fmt(d.trafo_gucu_kva, 0)}<span class="unit">kVA</span></div></div>
        <div class="kpi"><div class="kpi-label">Primer Akım (I1)</div><div class="kpi-value">${Shell.fmt(d.primer_akim_a)}<span class="unit">A</span></div></div>
        <div class="kpi"><div class="kpi-label">Sekonder Akım (I2)</div><div class="kpi-value">${Shell.fmt(d.sekonder_akim_a)}<span class="unit">A</span></div></div>
        <div class="kpi success"><div class="kpi-label">Kompanzasyon (Q)</div><div class="kpi-value">${Shell.fmt(d.kompanzasyon_gucu_kvar, 0)}<span class="unit">kVAr</span></div></div>
        <div class="kpi"><div class="kpi-label">Katsayı k</div><div class="kpi-value">${Shell.fmt(d.katsayi_k, 4)}</div></div>
        <div class="kpi warning"><div class="kpi-label">Ana Şalter</div><div class="kpi-value">${Shell.fmt(d.ana_salter_a, 0)}<span class="unit">A</span></div></div>
        <div class="kpi warning"><div class="kpi-label">Komp. Şalteri</div><div class="kpi-value">${Shell.fmt(d.kompanzasyon_salter_a, 0)}<span class="unit">A</span></div></div>
        <div class="kpi danger"><div class="kpi-label">Kısa Devre (Icu)</div><div class="kpi-value">${Shell.fmt(d.ksa_akim_icu_ka)}<span class="unit">kA</span></div></div>
        <div class="kpi danger"><div class="kpi-label">Seçilecek Icu</div><div class="kpi-value">${Shell.fmt(d.secilen_salter_icu_ka)}<span class="unit">kA</span></div></div>
      </div>
    `;
  };

  document.getElementById("trafoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Hesaplanıyor...</span>';
    try {
      const payload = {
        kurulu_guc_kw: parseFloat(document.getElementById("pk").value),
        es_kullanim_kat: parseFloat(document.getElementById("ku").value),
        diversite: parseFloat(document.getElementById("kd").value),
        cos_j: parseFloat(document.getElementById("cosj").value),
        mevcut_cos_j: parseFloat(document.getElementById("mevcut").value),
        hedef_cos_j: parseFloat(document.getElementById("hedef").value),
        uk_yuzde: parseFloat(document.getElementById("uk").value),
        u1_kv: parseFloat(document.getElementById("u1").value),
        u2_kv: parseFloat(document.getElementById("u2").value),
      };
      const res = await window.API.trafoHesapla(payload);
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
