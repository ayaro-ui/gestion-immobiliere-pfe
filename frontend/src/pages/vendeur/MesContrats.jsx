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
  en_attente:    { label: "En attente",  color: "#B45309", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  signe_vendeur: { label: "À signer",   color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC", dot: "#6366F1" },
  signe_complet: { label: "Signé",      color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981" },
  annule:        { label: "Annulé",     color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", dot: "#EF4444" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 34 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5","#0891B2","#059669","#D97706","#7C3AED","#DC2626"];
  const c = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.35,
      border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>{txt}</div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: "20px 24px", flex: "1 1 150px", minWidth: 150,
      boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Modal Paiement ─────────────────────────────────────────────────────────────
function PaiementModal({ contrat, onClose, onSuccess }) {
  const [form, setForm] = useState({
    montant:       "",
    date_paiement: new Date().toISOString().split("T")[0],
    mode_paiement: "cash",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleSubmit = async () => {
    if (!form.montant || parseFloat(form.montant) <= 0) {
      setErr("Veuillez saisir un montant valide."); return;
    }
    setSaving(true); setErr("");
    try {
      await axios.post("/paiements", {
        montant:       parseFloat(form.montant),
        date_paiement: form.date_paiement,
        mode_paiement: form.mode_paiement,
        id_contrat:    contrat.id_contrat,
      });
      onSuccess();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || "Erreur lors de l\'enregistrement.");
    } finally { setSaving(false); }
  };

  const MODES = [
    { value: "cash",     label: "💵 Cash",     color: "#059669" },
    { value: "virement", label: "🏦 Virement", color: "#4F46E5" },
    { value: "cheque",   label: "📝 Chèque",   color: "#D97706" },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 460,
        boxShadow: "0 40px 100px rgba(15,23,42,.35)",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }}>
        <div style={{ background: "linear-gradient(135deg,#059669,#0891B2)", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, letterSpacing: ".1em" }}>
                CONTRAT #{String(contrat.id_contrat).padStart(5, "0")}
              </p>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>💳 Enregistrer un paiement</h2>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,.7)" }}>
                {contrat.bien?.titre} · {contrat.acheteur?.prenom} {contrat.acheteur?.nom}
              </p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "12px 16px", marginBottom: 20, border: "1px solid #BBF7D0" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#059669", fontWeight: 600 }}>
              💰 Montant total du contrat : <strong>{fmt(contrat.montant)}</strong>
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Montant payé (MAD) *</label>
            <input type="number" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })}
              placeholder={`ex: ${contrat.montant}`}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 15, fontWeight: 700, color: "#0F172A", outline: "none", boxSizing: "border-box", background: "#F8FAFF" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Date du paiement *</label>
            <input type="date" value={form.date_paiement} onChange={(e) => setForm({ ...form, date_paiement: e.target.value })}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box", background: "#F8FAFF" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Mode de paiement *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {MODES.map((m) => (
                <button key={m.value} onClick={() => setForm({ ...form, mode_paiement: m.value })} style={{
                  padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${form.mode_paiement === m.value ? m.color : "#E2E8F0"}`,
                  background: form.mode_paiement === m.value ? `${m.color}15` : "#F8FAFF",
                  color: form.mode_paiement === m.value ? m.color : "#94A3B8",
                  fontWeight: 700, fontSize: 12, transition: "all .14s",
                }}>{m.label}</button>
              ))}
            </div>
          </div>
          {err && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>⚠️ {err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "13px 0", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#F8FAFF", color: "#64748B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Annuler</button>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: "13px 0", borderRadius: 12, border: "none",
              background: saving ? "#94A3B8" : "linear-gradient(135deg,#059669,#0891B2)",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 14px rgba(5,150,105,.3)",
            }}>{saving ? "⏳ Enregistrement…" : "✅ Confirmer"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Détail Contrat ───────────────────────────────────────────────────────
function DetailModal({ contrat, onClose, onPaiement }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 580,
        boxShadow: "0 40px 100px rgba(15,23,42,.3)",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A5F)", padding: "26px 30px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                CONTRAT N° {String(contrat.id_contrat).padStart(5, "0")}
              </p>
              <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: "#fff" }}>{contrat.bien?.titre || "—"}</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge statut={contrat.statut} />
                <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
                  {contrat.bien?.type_bien === "vente" ? "🏠 Vente" : "🔑 Location"}
                </span>
                <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
                  📅 {fmtDate(contrat.date_contrat)}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10, color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
        </div>

        <div style={{ padding: "22px 30px 28px", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "13px 15px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748B", fontWeight: 700 }}>👤 VENDEUR</p>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar nom={contrat.vendeur?.nom} prenom={contrat.vendeur?.prenom} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{contrat.vendeur?.prenom} {contrat.vendeur?.nom}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{contrat.vendeur?.email}</p>
                </div>
              </div>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "13px 15px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748B", fontWeight: 700 }}>🤝 ACHETEUR</p>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar nom={contrat.acheteur?.nom} prenom={contrat.acheteur?.prenom} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{contrat.acheteur?.prenom} {contrat.acheteur?.nom}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{contrat.acheteur?.email}</p>
                </div>
              </div>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 13, padding: "13px 15px", border: "1px solid #BBF7D0" }}>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "#059669", fontWeight: 700 }}>💰 MONTANT</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#064E3B" }}>{fmt(contrat.montant)}</p>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "13px 15px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "#64748B", fontWeight: 700 }}>📅 DATE</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{fmtDate(contrat.date_contrat)}</p>
            </div>
          </div>

          {contrat.bien?.images?.[0]?.url_image && (
            <div style={{ borderRadius: 13, overflow: "hidden", height: 160, marginBottom: 18 }}>
              <img src={`http://127.0.0.1:8000/storage/${contrat.bien.images[0].url_image}`}
                alt={contrat.bien.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Signatures */}
          {(contrat.signature_vendeur || contrat.signature_acheteur) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {contrat.signature_vendeur && (
                <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px", border: "1px solid #E2E8F0" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 10, color: "#059669", fontWeight: 700 }}>✅ SIGNATURE VENDEUR</p>
                  <img src={contrat.signature_vendeur} alt="sig vendeur" style={{ width: "100%", height: 50, objectFit: "contain", background: "#fff", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                </div>
              )}
              {contrat.signature_acheteur && (
                <div style={{ background: "#F8FAFF", borderRadius: 12, padding: "12px", border: "1px solid #E2E8F0" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 10, color: "#059669", fontWeight: 700 }}>✅ SIGNATURE ACHETEUR</p>
                  <img src={contrat.signature_acheteur} alt="sig acheteur" style={{ width: "100%", height: 50, objectFit: "contain", background: "#fff", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Bouton paiement */}
            {contrat.statut === "signe_complet" && (
              <button onClick={() => { onClose(); onPaiement(contrat); }} style={{
                width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#059669,#0891B2)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(5,150,105,.3)",
              }}>💳 Enregistrer un paiement</button>
            )}

            {/* Bouton PDF */}
            {contrat.fichier_pdf ? (
              <a href={`http://127.0.0.1:8000/storage/${contrat.fichier_pdf}`}
                target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "linear-gradient(135deg,#0F172A,#1E3A5F)", color: "#fff",
                  borderRadius: 12, padding: "13px 0", textDecoration: "none", fontWeight: 700, fontSize: 14,
                }}>📄 Télécharger le PDF du contrat</a>
            ) : (
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "13px 0", textAlign: "center", color: "#92400E", fontSize: 13, fontWeight: 600 }}>
                {contrat.statut === "signe_complet" ? "⏳ PDF en cours de génération…" : "⚠️ PDF disponible après signature des deux parties"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
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
    } catch {
      setErrLoad("Impossible de charger les contrats.");
    } finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handlePaiementSuccess = () => {
    setSuccessMsg("✅ Paiement enregistré avec succès !");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = contrats.filter((c) => {
    const q = search.toLowerCase();
    const ok = c.bien?.titre?.toLowerCase().includes(q)
      || c.acheteur?.nom?.toLowerCase().includes(q)
      || c.acheteur?.prenom?.toLowerCase().includes(q)
      || String(c.id_contrat).includes(q);
    return ok && (filtStatut === "tous" || c.statut === filtStatut);
  });

  const stats = {
    total:   contrats.length,
    signes:  contrats.filter((c) => c.statut === "signe_complet").length,
    attente: contrats.filter((c) => c.statut === "en_attente").length,
    volume:  contrats.filter((c) => c.statut === "signe_complet")
                     .reduce((s, c) => s + parseFloat(c.montant || 0), 0),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pop { from{opacity:0;transform:scale(.93) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .crow:hover { background:#EEF2FF !important; cursor:pointer; }
        .crow { transition: background .12s; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>ESPACE VENDEUR</p>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Mes Contrats</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Contrats liés à vos biens immobiliers</p>
          </div>
          <button onClick={() => navigate("/vendeur/creer-contrat")} style={{
            background: "linear-gradient(135deg,#4F46E5,#0891B2)", color: "#fff",
            border: "none", borderRadius: 14, padding: "13px 26px",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(79,70,229,.3)",
          }}>+ Nouveau contrat</button>
        </div>

        {successMsg && (
          <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#059669", fontWeight: 700, fontSize: 14 }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 14, marginBottom: 26, flexWrap: "wrap" }}>
          <StatCard icon="📋" label="Total"      value={stats.total}   color="#4F46E5" />
          <StatCard icon="✅" label="Signés"     value={stats.signes}  color="#059669" sub={stats.signes > 0 ? fmt(stats.volume) : null} />
          <StatCard icon="⏳" label="En attente" value={stats.attente} color="#D97706" />
        </div>

        {/* Filtres */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 10px rgba(15,23,42,.06)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par bien, acheteur…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["tous","Tous"],["en_attente","En attente"],["signe_vendeur","À signer"],["signe_complet","Signés"],["annule","Annulés"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltStatut(v)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${filtStatut===v ? "#4F46E5" : "#E2E8F0"}`,
                background: filtStatut===v ? "#EEF2FF" : "transparent",
                color: filtStatut===v ? "#4F46E5" : "#94A3B8", transition: "all .14s",
              }}>{l}</button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", cursor: "pointer", fontSize: 15 }}>🔄</button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 200px 160px 140px 140px", padding: "12px 24px", background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F0", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
            <div>N°</div><div>BIEN</div><div>ACHETEUR</div><div>MONTANT</div><div>STATUT</div><div>ACTION</div>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Chargement…</p>
            </div>
          )}

          {!loading && errLoad && (
            <div style={{ padding: "20px 24px", background: "#FEF2F2", color: "#DC2626", fontWeight: 600 }}>
              ⚠️ {errLoad}
              <button onClick={load} style={{ background: "none", border: "none", color: "#DC2626", textDecoration: "underline", cursor: "pointer", marginLeft: 8 }}>Réessayer</button>
            </div>
          )}

          {!loading && !errLoad && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Aucun contrat trouvé</p>
            </div>
          )}

          {!loading && filtered.map((c, i) => (
            <div key={c.id_contrat} className="crow" onClick={() => setSelected(c)} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 200px 160px 140px 140px",
              padding: "15px 24px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>#{String(c.id_contrat).padStart(5, "0")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                  {c.bien?.images?.[0]?.url_image
                    ? <img src={`http://127.0.0.1:8000/storage/${c.bien.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 20 }}>🏠</div>
                  }
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{c.bien?.titre || "—"}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 6,
                    background: c.bien?.type_bien === "vente" ? "#EEF2FF" : "#ECFDF5",
                    color: c.bien?.type_bien === "vente" ? "#4F46E5" : "#059669" }}>
                    {c.bien?.type_bien === "vente" ? "🏠 Vente" : "🔑 Location"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar nom={c.acheteur?.nom} prenom={c.acheteur?.prenom} size={30} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{c.acheteur?.prenom} {c.acheteur?.nom}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{c.bien?.type_bien === "location" ? "Locataire" : "Acheteur"}</p>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{fmt(c.montant)}</div>
              <div><Badge statut={c.statut} /></div>
              <div onClick={(e) => e.stopPropagation()}>
                {c.statut === "signe_complet" ? (
                  <button onClick={() => setPaiementContrat(c)} style={{
                    padding: "8px 14px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg,#059669,#0891B2)",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(5,150,105,.25)", whiteSpace: "nowrap",
                  }}>💳 Paiement</button>
                ) : (
                  <span style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 600 }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && (
          <p style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} contrat{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== contrats.length && ` sur ${contrats.length}`} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {selected && <DetailModal contrat={selected} onClose={() => setSelected(null)} onPaiement={(c) => setPaiementContrat(c)} />}
      {paiementContrat && <PaiementModal contrat={paiementContrat} onClose={() => setPaiementContrat(null)} onSuccess={handlePaiementSuccess} />}
    </div>
  );
}