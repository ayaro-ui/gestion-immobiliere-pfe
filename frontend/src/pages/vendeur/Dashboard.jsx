import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.id_user ?? u.id ?? null;
  } catch { return null; }
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

// ── Composants UI ─────────────────────────────────────────────────────────────
function Avatar({ nom, prenom, size = 34 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5", "#0891B2", "#059669", "#D97706", "#7C3AED", "#DC2626"];
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

const STATUTS = {
  en_attente:    { label: "En attente", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  signe_vendeur: { label: "À signer",  color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC" },
  signe_complet: { label: "Signé",     color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  signe:         { label: "Signé",     color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  annule:        { label: "Annulé",    color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 20, padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(15,23,42,.07)",
      borderLeft: `4px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform .15s, box-shadow .15s",
    }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(15,23,42,.12)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(15,23,42,.07)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748B", fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ margin: "6px 0 0", fontSize: 12, color, fontWeight: 700 }}>{sub}</p>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#F8FAFF", borderRadius: 14, padding: "14px 16px", border: "1px solid #E2E8F0", flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{value}</div>
      <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {value} <span style={{ color: "#94A3B8", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 7, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}

// ── Page Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const userId   = getUserId();
  const user     = getUser();

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [biens, setBiens]               = useState([]);
  const [contrats, setContrats]         = useState([]);
  const [paiements, setPaiements]       = useState([]);
  const [transactions, setTransactions] = useState([]);

  const load = useCallback(async () => {
    if (!userId) { setError("Session expirée."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      // ── Appels parallèles sur les routes existantes ──
      const [rBiens, rContrats, rPaiements, rTransactions] = await Promise.allSettled([
        axios.get("/biens"),
        axios.get(`/contrats/vendeur/${userId}`),
        axios.get("/paiements"),
        axios.get("/transactions"),
      ]);

      if (rBiens.status === "fulfilled") {
        const all = Array.isArray(rBiens.value.data) ? rBiens.value.data : [];
        // Filtrer les biens du vendeur connecté
        setBiens(all.filter((b) => b.id_vendeur === userId));
      }
      if (rContrats.status === "fulfilled") {
        setContrats(Array.isArray(rContrats.value.data) ? rContrats.value.data : []);
      }
      if (rPaiements.status === "fulfilled") {
        setPaiements(Array.isArray(rPaiements.value.data) ? rPaiements.value.data : []);
      }
      if (rTransactions.status === "fulfilled") {
        const all = Array.isArray(rTransactions.value.data) ? rTransactions.value.data : [];
        // Filtrer les transactions du propriétaire connecté
        setTransactions(all.filter(
          (t) => t.id_proprietaire === userId || t.proprietaire?.id_user === userId
        ));
      }
    } catch {
      setError("Impossible de charger le tableau de bord.");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Calcul des stats côté frontend ───────────────────────────────────────
  const contratIds   = contrats.map((c) => c.id_contrat);
  const mesPaiements = paiements.filter((p) => contratIds.includes(p.id_contrat));

  const stats = {
    totalBiens:      biens.length,
    biensDispos:     biens.filter((b) => b.statut === "disponible").length,
    biensVendus:     biens.filter((b) => b.statut === "vendu").length,
    biensLoues:      biens.filter((b) => b.statut === "loue").length,
    biensVente:      biens.filter((b) => b.type_bien === "vente").length,
    biensLocation:   biens.filter((b) => b.type_bien === "location").length,
    totalContrats:   contrats.length,
    contratsSignes:  contrats.filter((c) => ["signe_complet", "signe"].includes(c.statut)).length,
    contratsAttente: contrats.filter((c) => ["en_attente", "signe_vendeur"].includes(c.statut)).length,
    contratsAnnules: contrats.filter((c) => c.statut === "annule").length,
    revenus:         contrats.filter((c) => ["signe_complet", "signe"].includes(c.statut))
                             .reduce((s, c) => s + parseFloat(c.montant || 0), 0),
    totalPaiements:  mesPaiements.reduce((s, p) => s + parseFloat(p.montant || 0), 0),
  };

  const contratsRecents  = contrats.slice(0, 5);
  const paiementsRecents = mesPaiements.slice(0, 5);
  const transRecentes    = transactions.slice(0, 5);

  const h     = new Date().getHours();
  const salut = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: 260 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .rh:hover { background:#EEF2FF !important; cursor:pointer; }
        .rh { transition:background .12s; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>ESPACE VENDEUR</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>
              {salut}, {user?.prenom || "Vendeur"} 👋
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Aperçu de votre activité immobilière</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={load} style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 16 }} title="Actualiser">🔄</button>
            <button onClick={() => navigate("/vendeur/ajouter-bien")} style={{
              padding: "11px 20px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13,
              background: "linear-gradient(135deg,#4F46E5,#0891B2)", color: "#fff",
              cursor: "pointer", boxShadow: "0 4px 18px rgba(79,70,229,.3)",
            }}>+ Ajouter un bien</button>
            <button onClick={() => navigate("/vendeur/creer-contrat")} style={{
              padding: "11px 20px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13,
              background: "linear-gradient(135deg,#059669,#0891B2)", color: "#fff",
              cursor: "pointer", boxShadow: "0 4px 18px rgba(5,150,105,.3)",
            }}>+ Créer un contrat</button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 20px", color: "#DC2626", fontWeight: 600, marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Chargement…</p>
          </div>
        ) : (
          <>
            {/* ── 4 Stats principales ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="🏠" label="Mes Biens"       color="#4F46E5"
                value={stats.totalBiens}    sub={`${stats.biensDispos} disponibles`}
                onClick={() => navigate("/vendeur/mes-biens")} />
              <StatCard icon="📋" label="Contrats"        color="#0891B2"
                value={stats.totalContrats} sub={`${stats.contratsSignes} signés`}
                onClick={() => navigate("/vendeur/contrats")} />
              <StatCard icon="💰" label="Revenus générés" color="#059669"
                value={fmt(stats.revenus)}  sub="Contrats signés" />
              <StatCard icon="⏳" label="En attente"      color="#D97706"
                value={stats.contratsAttente} sub="À finaliser"
                onClick={() => navigate("/vendeur/contrats")} />
            </div>

            {/* ── Biens + Contrats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Biens */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(15,23,42,.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>🏠 Mes Biens</h3>
                  <button onClick={() => navigate("/vendeur/mes-biens")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Voir tout →</button>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <MiniCard icon="✅" label="Disponibles" value={stats.biensDispos}   color="#059669" />
                  <MiniCard icon="🏷️" label="Vendus"      value={stats.biensVendus}   color="#4F46E5" />
                  <MiniCard icon="🔑" label="Loués"       value={stats.biensLoues}    color="#D97706" />
                </div>
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>RÉPARTITION PAR TYPE</p>
                  <ProgressBar label="Vente"    value={stats.biensVente}    total={stats.totalBiens || 1} color="#4F46E5" />
                  <ProgressBar label="Location" value={stats.biensLocation} total={stats.totalBiens || 1} color="#059669" />
                </div>
              </div>

              {/* Contrats */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(15,23,42,.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>📋 Contrats</h3>
                  <button onClick={() => navigate("/vendeur/contrats")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Voir tout →</button>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <MiniCard icon="✅" label="Signés"     value={stats.contratsSignes}  color="#059669" />
                  <MiniCard icon="⏳" label="En attente" value={stats.contratsAttente} color="#D97706" />
                  <MiniCard icon="❌" label="Annulés"    value={stats.contratsAnnules} color="#DC2626" />
                </div>
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>ÉTAT DES CONTRATS</p>
                  <ProgressBar label="Signés"     value={stats.contratsSignes}  total={stats.totalContrats || 1} color="#059669" />
                  <ProgressBar label="En attente" value={stats.contratsAttente} total={stats.totalContrats || 1} color="#D97706" />
                  <ProgressBar label="Annulés"    value={stats.contratsAnnules} total={stats.totalContrats || 1} color="#DC2626" />
                </div>
              </div>
            </div>

            {/* ── Contrats récents ── */}
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)", marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>📋 Contrats récents</h3>
                <button onClick={() => navigate("/vendeur/contrats")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Voir tout →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 180px 140px 120px", padding: "10px 24px", background: "#F8FAFF", fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
                <div>N°</div><div>BIEN</div><div>ACHETEUR</div><div>MONTANT</div><div>STATUT</div>
              </div>
              {contratsRecents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                  <p style={{ margin: 0, fontWeight: 600 }}>Aucun contrat pour l'instant</p>
                </div>
              ) : (
                contratsRecents.map((c, i) => {
                  const img = c.bien?.images?.[0]?.url_image;
                  return (
                    <div key={c.id_contrat} className="rh"
                      onClick={() => navigate("/vendeur/contrats")}
                      style={{
                        display: "grid", gridTemplateColumns: "60px 1fr 180px 140px 120px",
                        padding: "14px 24px", alignItems: "center",
                        borderBottom: i < contratsRecents.length - 1 ? "1px solid #F1F5F9" : "none",
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>#{String(c.id_contrat).padStart(4, "0")}</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 40, height: 34, borderRadius: 8, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                          {img
                            ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 16 }}>🏠</div>
                          }
                        </div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.bien?.titre || "—"}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{fmtDate(c.date_contrat)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Avatar nom={c.acheteur?.nom} prenom={c.acheteur?.prenom} size={26} />
                        <span style={{ fontSize: 12, color: "#1E293B", fontWeight: 600 }}>{c.acheteur?.prenom} {c.acheteur?.nom}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{fmt(c.montant)}</div>
                      <div><Badge statut={c.statut} /></div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Paiements + Transactions ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Paiements */}
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>💳 Paiements récents</h3>
                  <button onClick={() => navigate("/vendeur/mes-paiements")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Voir tout →</button>
                </div>
                {paiementsRecents.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>💳</div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Aucun paiement</p>
                  </div>
                ) : (
                  paiementsRecents.map((p, i) => (
                    <div key={p.id_paiement} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 20px",
                      borderBottom: i < paiementsRecents.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💰</div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Contrat #{String(p.id_contrat).padStart(4, "0")}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{fmtDate(p.date_paiement)} · {p.mode_paiement || "—"}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>+{fmt(p.montant)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Transactions */}
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>🔁 Transactions récentes</h3>
                  <button onClick={() => navigate("/vendeur/mes-transactions")} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Voir tout →</button>
                </div>
                {transRecentes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>🔁</div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Aucune transaction</p>
                  </div>
                ) : (
                  transRecentes.map((t, i) => {
                    const typeColors = { vente: "#4F46E5", location: "#059669", paiement: "#0891B2", annulation: "#DC2626" };
                    const typeIcons  = { vente: "🏠", location: "🔑", paiement: "💳", annulation: "❌" };
                    const color = typeColors[t.type_transaction] || "#94A3B8";
                    return (
                      <div key={t.id_transaction} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "13px 20px",
                        borderBottom: i < transRecentes.length - 1 ? "1px solid #F1F5F9" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            {typeIcons[t.type_transaction] || "🔁"}
                          </div>
                          <div>
                            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{t.bien?.titre || "—"}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                              {fmtDate(t.date_transaction)} · <span style={{ color, fontWeight: 700 }}>{t.type_transaction}</span>
                            </p>
                          </div>
                        </div>
                        {t.montant && <span style={{ fontSize: 13, fontWeight: 800, color }}>{fmt(t.montant)}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}