import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const STATUTS = {
  en_attente:    { label: "En attente", color: "#B45309", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)", dot: "#c8a96e" },
  signe_vendeur: { label: "À signer",  color: "#0f1e35", bg: "rgba(15,30,53,0.08)",   border: "rgba(15,30,53,0.2)",    dot: "#0f1e35" },
  signe_complet: { label: "Signé",     color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)",  dot: "#059669" },
  annule:        { label: "Annulé",    color: "#991b1b", bg: "rgba(220,38,38,0.06)",  border: "rgba(220,38,38,0.2)",   dot: "#dc2626" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 34 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

function PaiementModal({ contrat, onClose, onSuccess }) {
  const [form, setForm] = useState({
    montant: "", date_paiement: new Date().toISOString().split("T")[0], mode_paiement: "cash",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!form.montant || parseFloat(form.montant) <= 0) { setErr("Veuillez saisir un montant valide."); return; }
    setSaving(true); setErr("");
    try {
      await axios.post("/paiements", {
        montant: parseFloat(form.montant),
        date_paiement: form.date_paiement,
        mode_paiement: form.mode_paiement,
        id_contrat: contrat.id_contrat,
      });
      onSuccess(); onClose();
    } catch (e) { setErr(e.response?.data?.message || "Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const MODES = [
    { value: "cash",     label: "Cash",     color: "#065f46" },
    { value: "virement", label: "Virement", color: "#0f1e35" },
    { value: "cheque",   label: "Chèque",   color: "#B45309" },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,16,34,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 460, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)", overflow: "hidden" }}>
        <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative" }}>
          <div style={{ position: "absolute", left: "30px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Contrat #{String(contrat.id_contrat).padStart(5, "0")}
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "white" }}>Enregistrer un paiement</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              {contrat.bien?.titre} · {contrat.acheteur?.prenom} {contrat.acheteur?.nom}
            </p>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "26px 30px" }}>
          <div style={{ background: "#faf8f4", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 22 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 12, color: "#6b7280" }}>
              Montant total : <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#c8a96e" }}>{fmt(contrat.montant)}</span>
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Montant payé (MAD) *</label>
              <input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })}
                placeholder={`ex: ${contrat.montant}`}
                style={{ width: "100%", padding: "13px 16px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "#0f1e35", outline: "none", boxSizing: "border-box", background: "#fdfcfa", fontFamily: "'Cormorant Garamond',serif" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Date du paiement *</label>
              <input type="date" value={form.date_paiement} onChange={e => setForm({ ...form, date_paiement: e.target.value })}
                style={{ width: "100%", padding: "13px 16px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 14, color: "#0f1e35", outline: "none", boxSizing: "border-box", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Mode de paiement *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {MODES.map(m => (
                  <button key={m.value} onClick={() => setForm({ ...form, mode_paiement: m.value })} style={{ padding: "12px 8px", borderRadius: 12, cursor: "pointer", border: `1px solid ${form.mode_paiement === m.value ? m.color : "rgba(200,169,110,0.2)"}`, background: form.mode_paiement === m.value ? `${m.color}10` : "#fdfcfa", color: form.mode_paiement === m.value ? m.color : "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, transition: "all .14s" }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {err && <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "10px 14px", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginTop: 14 }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
            <button onClick={onClose} style={{ padding: "13px 0", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>Annuler</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "13px 0", borderRadius: 12, border: "none", background: saving ? "#d4c4a8" : "#c8a96e", color: "white", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Enregistrement..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ contrat, onClose, onPaiement }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 580, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#0f1e35", padding: "28px 32px", flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", left: "32px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: "22px" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Contrat N° {String(contrat.id_contrat).padStart(5, "0")}
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 12px", fontSize: 22, fontWeight: 700, color: "white" }}>{contrat.bien?.titre || "—"}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge statut={contrat.statut} />
              <span style={{ background: "rgba(200,169,110,0.15)", color: "#c8a96e", borderRadius: 99, padding: "3px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, border: "1px solid rgba(200,169,110,0.3)" }}>
                {contrat.bien?.type_bien === "vente" ? "Vente" : "Location"}
              </span>
              <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", borderRadius: 99, padding: "3px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700 }}>
                {fmtDate(contrat.date_contrat)}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "24px 32px 28px", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[{ label: "Vendeur", data: contrat.vendeur }, { label: "Acheteur", data: contrat.acheteur }].map(p => (
              <div key={p.label} style={{ background: "#faf8f4", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(200,169,110,0.15)" }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 10px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{p.label}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar nom={p.data?.nom} prenom={p.data?.prenom} />
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>{p.data?.prenom} {p.data?.nom}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#9ca3af" }}>{p.data?.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#0f1e35", borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 4px", fontSize: 9, color: "#c8a96e", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Montant</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 24, fontWeight: 700, color: "white", lineHeight: 1 }}>{fmt(contrat.montant)}</p>
            </div>
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 4px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Date</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 18, fontWeight: 700, color: "#0f1e35" }}>{fmtDate(contrat.date_contrat)}</p>
            </div>
          </div>

          {contrat.bien?.images?.[0]?.url_image && (
            <div style={{ borderRadius: 14, overflow: "hidden", height: 160, marginBottom: 16, border: "1px solid rgba(200,169,110,0.15)" }}>
              <img src={`http://127.0.0.1:8000/storage/${contrat.bien.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {(contrat.signature_vendeur || contrat.signature_acheteur) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[contrat.signature_vendeur && { label: "Signature vendeur", src: contrat.signature_vendeur }, contrat.signature_acheteur && { label: "Signature acheteur", src: contrat.signature_acheteur }].filter(Boolean).map(sig => (
                <div key={sig.label} style={{ background: "#faf8f4", borderRadius: 12, padding: "12px", border: "1px solid rgba(200,169,110,0.15)" }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "#065f46", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{sig.label}</p>
                  <img src={sig.src} alt="signature" style={{ width: "100%", height: 50, objectFit: "contain", background: "white", borderRadius: 6, border: "1px solid rgba(200,169,110,0.15)" }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contrat.statut === "signe_complet" && (
              <button onClick={() => { onClose(); onPaiement(contrat); }} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: "#c8a96e", color: "white", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background="#b8955a"}
                onMouseLeave={e => e.currentTarget.style.background="#c8a96e"}>
                Enregistrer un paiement
              </button>
            )}
            {contrat.fichier_pdf ? (
              <a href={`http://127.0.0.1:8000/storage/${contrat.fichier_pdf}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1e35", color: "white", borderRadius: 14, padding: "14px 0", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase" }}>
                Télécharger le PDF
              </a>
            ) : (
              <div style={{ background: "#faf8f4", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 14, padding: "14px 0", textAlign: "center", fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 12 }}>
                {contrat.statut === "signe_complet" ? "PDF en cours de génération..." : "PDF disponible après signature des deux parties"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MesContratsVendeur() {
  const navigate = useNavigate();
  const [contrats, setContrats]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [errLoad, setErrLoad]                 = useState("");
  const [search, setSearch]                   = useState("");
  const [filtStatut, setFiltStatut]           = useState("tous");
  const [selected, setSelected]               = useState(null);
  const [paiementContrat, setPaiementContrat] = useState(null);
  const [successMsg, setSuccessMsg]           = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/contrats/vendeur/${user.id_user}`);
      setContrats(Array.isArray(data) ? data : []);
    } catch { setErrLoad("Impossible de charger les contrats."); }
    finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handlePaiementSuccess = () => {
    setSuccessMsg("Paiement enregistré avec succès");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = contrats.filter(c => {
    const q = search.toLowerCase();
    const ok = c.bien?.titre?.toLowerCase().includes(q) || c.acheteur?.nom?.toLowerCase().includes(q) || c.acheteur?.prenom?.toLowerCase().includes(q) || String(c.id_contrat).includes(q);
    return ok && (filtStatut === "tous" || c.statut === filtStatut);
  });

  const stats = {
    total:   contrats.length,
    signes:  contrats.filter(c => c.statut === "signe_complet").length,
    attente: contrats.filter(c => c.statut === "en_attente").length,
    volume:  contrats.filter(c => c.statut === "signe_complet").reduce((s, c) => s + parseFloat(c.montant || 0), 0),
  };

  const STAT_ITEMS = [
    { label: "Total contrats", value: stats.total,   color: "#c8a96e",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: "Signés",         value: stats.signes,  color: "#065f46", sub: stats.signes > 0 ? fmt(stats.volume) : null,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: "En attente",     value: stats.attente, color: "#B45309",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pop     { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .crow:hover { background: #faf8f4 !important; cursor: pointer; }
        .crow { transition: background .12s; }
        input:focus, select:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Espace vendeur
            </span>
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Mes Contrats</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Contrats liés à vos biens immobiliers
            </p>
          </div>
          <button onClick={() => navigate("/vendeur/creer-contrat")} style={{ padding: "14px 28px", background: "#c8a96e", color: "white", border: "none", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background="#b8955a"}
            onMouseLeave={e => e.currentTarget.style.background="#c8a96e"}>
            + Nouveau contrat
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 80px" }} className="fade-up">

        {successMsg && (
          <div style={{ background: "#0f1e35", color: "white", padding: "14px 22px", borderRadius: 16, marginBottom: 24, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(200,169,110,0.4)", animation: "slideIn .3s ease" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {successMsg}
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          {STAT_ITEMS.map(s => (
            <div key={s.label} style={{ background: "white", padding: "22px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{s.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              {s.sub && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Filtres ── */}
        <div style={{ background: "white", padding: "16px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,0.04)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par bien, acheteur..."
              style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "all .2s" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["tous","Tous"],["en_attente","En attente"],["signe_vendeur","À signer"],["signe_complet","Signés"],["annule","Annulés"]].map(([v, l]) => (
              <button key={v} onClick={() => setFiltStatut(v)} style={{ padding: "8px 16px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${filtStatut === v ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: filtStatut === v ? "#0f1e35" : "transparent", color: filtStatut === v ? "#c8a96e" : "#9ca3af", transition: "all .14s", letterSpacing: "0.5px" }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 14px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", background: "transparent", cursor: "pointer", color: "#c8a96e", display: "flex", alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>

        {/* ── Tableau ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
          <div style={{ background: "#0f1e35", padding: "14px 28px", display: "grid", gridTemplateColumns: "80px 1fr 200px 160px 140px 140px" }}>
            {["N°", "Bien", "Acheteur", "Montant", "Statut", "Action"].map(h => (
              <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0 }}>Chargement...</p>
            </div>
          )}

          {!loading && errLoad && (
            <div style={{ padding: "20px 28px", background: "#fef2f2", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>
              {errLoad}
              <button onClick={load} style={{ background: "none", border: "none", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", textDecoration: "underline", cursor: "pointer", marginLeft: 8 }}>Réessayer</button>
            </div>
          )}

          {!loading && !errLoad && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#c4bfb8" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px", display: "block" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucun contrat trouvé</p>
            </div>
          )}

          {!loading && filtered.map((c, i) => (
            <div key={c.id_contrat} className="crow" onClick={() => setSelected(c)} style={{ display: "grid", gridTemplateColumns: "80px 1fr 200px 160px 140px 140px", padding: "15px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>#{String(c.id_contrat).padStart(5, "0")}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 36, borderRadius: 10, overflow: "hidden", background: "#f8f7f4", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                  {c.bien?.images?.[0]?.url_image
                    ? <img src={`http://127.0.0.1:8000/storage/${c.bien.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      </div>
                  }
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>{c.bien?.titre || "—"}</p>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: c.bien?.type_bien === "vente" ? "rgba(15,30,53,0.08)" : "rgba(200,169,110,0.1)", color: c.bien?.type_bien === "vente" ? "#0f1e35" : "#B45309" }}>
                    {c.bien?.type_bien === "vente" ? "Vente" : "Location"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar nom={c.acheteur?.nom} prenom={c.acheteur?.prenom} size={28} />
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 12, fontWeight: 600, color: "#0f1e35" }}>{c.acheteur?.prenom} {c.acheteur?.nom}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#9ca3af" }}>{c.bien?.type_bien === "location" ? "Locataire" : "Acheteur"}</p>
                </div>
              </div>

              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{fmt(c.montant)}</div>
              <div><Badge statut={c.statut} /></div>

              <div onClick={e => e.stopPropagation()}>
                {c.statut === "signe_complet" ? (
                  <button onClick={() => setPaiementContrat(c)} style={{ padding: "8px 16px", borderRadius: 99, border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.08)", color: "#B45309", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", transition: "all .2s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#c8a96e"; e.currentTarget.style.color="white"; e.currentTarget.style.borderColor="#c8a96e"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(200,169,110,0.08)"; e.currentTarget.style.color="#B45309"; e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"; }}>
                    Paiement
                  </button>
                ) : (
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8" }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            {filtered.length} contrat{filtered.length !== 1 ? "s" : ""}{filtered.length !== contrats.length ? ` sur ${contrats.length}` : ""} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>

      {selected && <DetailModal contrat={selected} onClose={() => setSelected(null)} onPaiement={c => setPaiementContrat(c)} />}
      {paiementContrat && <PaiementModal contrat={paiementContrat} onClose={() => setPaiementContrat(null)} onSuccess={handlePaiementSuccess} />}
    </div>
  );
}