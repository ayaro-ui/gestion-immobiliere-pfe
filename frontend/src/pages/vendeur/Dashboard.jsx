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

const getUserId = () => {
  try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.id_user ?? u.id ?? null; }
  catch { return null; }
};
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};

const STATUTS = {
  en_attente:    { label: "En attente", color: "#B45309", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)", dot: "#c8a96e" },
  signe_vendeur: { label: "À signer",  color: "#0f1e35", bg: "rgba(15,30,53,0.08)",   border: "rgba(15,30,53,0.2)",    dot: "#0f1e35" },
  signe_complet: { label: "Signé",     color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)",  dot: "#059669" },
  signe:         { label: "Signé",     color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)",  dot: "#059669" },
  annule:        { label: "Annulé",    color: "#991b1b", bg: "rgba(220,38,38,0.06)",  border: "rgba(220,38,38,0.2)",   dot: "#dc2626" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", fontSize: 10, fontWeight: 700,
      fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 34 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
      fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)",
    }}>{txt}</div>
  );
}

function StatCard({ label, value, sub, color, onClick, icon }) {
  return (
    <div onClick={onClick} style={{
      background: "white", border: "1px solid rgba(200,169,110,0.12)",
      padding: "24px 26px", cursor: onClick ? "pointer" : "default",
      transition: "transform .2s, box-shadow .2s",
      boxShadow: "0 2px 16px rgba(10,20,40,0.05)",
      borderTop: `3px solid ${color}`,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(10,20,40,0.1)"; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(10,20,40,0.05)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#0f1e35", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#0f1e35" }}>
          {value} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 4, background: "#f0ede8", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .7s ease" }} />
      </div>
    </div>
  );
}

export default function DashboardVendeur() {
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
      const [rBiens, rContrats, rPaiements, rTransactions] = await Promise.allSettled([
        axios.get("/biens"),
        axios.get(`/contrats/vendeur/${userId}`),
        axios.get("/paiements"),
        axios.get("/transactions"),
      ]);
      if (rBiens.status === "fulfilled") {
        const all = Array.isArray(rBiens.value.data) ? rBiens.value.data : [];
        setBiens(all.filter((b) => b.id_vendeur === userId));
      }
      if (rContrats.status === "fulfilled") setContrats(Array.isArray(rContrats.value.data) ? rContrats.value.data : []);
      if (rPaiements.status === "fulfilled") setPaiements(Array.isArray(rPaiements.value.data) ? rPaiements.value.data : []);
      if (rTransactions.status === "fulfilled") {
        const all = Array.isArray(rTransactions.value.data) ? rTransactions.value.data : [];
        setTransactions(all.filter(t => t.id_proprietaire === userId || t.proprietaire?.id_user === userId));
      }
    } catch { setError("Impossible de charger le tableau de bord."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const contratIds   = contrats.map(c => c.id_contrat);
  const mesPaiements = paiements.filter(p => contratIds.includes(p.id_contrat));

  const stats = {
    totalBiens:      biens.length,
    biensDispos:     biens.filter(b => b.statut === "disponible").length,
    biensVendus:     biens.filter(b => b.statut === "vendu").length,
    biensLoues:      biens.filter(b => b.statut === "loue").length,
    biensVente:      biens.filter(b => b.type_bien === "vente").length,
    biensLocation:   biens.filter(b => b.type_bien === "location").length,
    totalContrats:   contrats.length,
    contratsSignes:  contrats.filter(c => ["signe_complet","signe"].includes(c.statut)).length,
    contratsAttente: contrats.filter(c => ["en_attente","signe_vendeur"].includes(c.statut)).length,
    contratsAnnules: contrats.filter(c => c.statut === "annule").length,
    revenus:         contrats.filter(c => ["signe_complet","signe"].includes(c.statut)).reduce((s,c) => s + parseFloat(c.montant||0), 0),
    totalPaiements:  mesPaiements.reduce((s,p) => s + parseFloat(p.montant||0), 0),
  };

  const contratsRecents  = contrats.slice(0, 5);
  const paiementsRecents = mesPaiements.slice(0, 5);
  const transRecentes    = transactions.slice(0, 5);

  const h     = new Date().getHours();
  const salut = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .row-hover:hover { background: #faf8f4 !important; cursor: pointer; }
        .row-hover { transition: background .12s; }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=90" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Espace vendeur
            </span>
            <h1 style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>
              {salut}, {user?.prenom || "Vendeur"}
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Aperçu de votre activité immobilière
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={load} style={{ padding: "11px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", transition: "all .2s" }}
              title="Actualiser">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button onClick={() => navigate("/vendeur/ajouter-bien")} style={{ padding: "11px 22px", background: "#c8a96e", color: "white", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background="#b8955a"}
              onMouseLeave={e => e.currentTarget.style.background="#c8a96e"}>
              + Ajouter un bien
            </button>
            <button onClick={() => navigate("/vendeur/creer-contrat")} style={{ padding: "11px 22px", background: "#0f1e35", color: "white", border: "1px solid rgba(200,169,110,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#c8a96e"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"}>
              + Créer un contrat
            </button>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px 80px" }} className="fade-up">

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", padding: "14px 20px", marginBottom: 28, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0 }}>Chargement...</p>
          </div>
        ) : (
          <>
            {/* ── 4 Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label="Mes biens" color="#c8a96e"
                value={stats.totalBiens} sub={`${stats.biensDispos} disponibles`}
                onClick={() => navigate("/vendeur/mes-biens")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
              />
              <StatCard label="Contrats" color="#0f1e35"
                value={stats.totalContrats} sub={`${stats.contratsSignes} signés`}
                onClick={() => navigate("/vendeur/contrats")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              />
              <StatCard label="Revenus générés" color="#065f46"
                value={fmt(stats.revenus)} sub="Contrats signés"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
              <StatCard label="En attente" color="#B45309"
                value={stats.contratsAttente} sub="À finaliser"
                onClick={() => navigate("/vendeur/contrats")}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
            </div>

            {/* ── Biens + Contrats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Biens */}
              <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", padding: "28px", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ width: 20, height: 2, background: "#c8a96e", marginBottom: 6 }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 20, fontWeight: 700, color: "#0f1e35" }}>Mes Biens</h3>
                  </div>
                  <button onClick={() => navigate("/vendeur/mes-biens")} style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", color: "#c8a96e", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Voir tout →</button>
                </div>

                {/* Mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Disponibles", value: stats.biensDispos,   color: "#065f46" },
                    { label: "Vendus",      value: stats.biensVendus,   color: "#0f1e35" },
                    { label: "Loués",       value: stats.biensLoues,    color: "#B45309" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f8f7f4", padding: "14px 12px", textAlign: "center", border: "1px solid rgba(200,169,110,0.1)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)", paddingTop: 18 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>Répartition par type</div>
                  <ProgressBar label="Vente"    value={stats.biensVente}    total={stats.totalBiens || 1} color="#0f1e35" />
                  <ProgressBar label="Location" value={stats.biensLocation} total={stats.totalBiens || 1} color="#c8a96e" />
                </div>
              </div>

              {/* Contrats */}
              <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", padding: "28px", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ width: 20, height: 2, background: "#c8a96e", marginBottom: 6 }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 20, fontWeight: 700, color: "#0f1e35" }}>Contrats</h3>
                  </div>
                  <button onClick={() => navigate("/vendeur/contrats")} style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", color: "#c8a96e", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Voir tout →</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Signés",      value: stats.contratsSignes,  color: "#065f46" },
                    { label: "En attente",  value: stats.contratsAttente, color: "#B45309" },
                    { label: "Annulés",     value: stats.contratsAnnules, color: "#991b1b" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f8f7f4", padding: "14px 12px", textAlign: "center", border: "1px solid rgba(200,169,110,0.1)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)", paddingTop: 18 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>État des contrats</div>
                  <ProgressBar label="Signés"     value={stats.contratsSignes}  total={stats.totalContrats || 1} color="#065f46" />
                  <ProgressBar label="En attente" value={stats.contratsAttente} total={stats.totalContrats || 1} color="#c8a96e" />
                  <ProgressBar label="Annulés"    value={stats.contratsAnnules} total={stats.totalContrats || 1} color="#991b1b" />
                </div>
              </div>
            </div>

            {/* ── Contrats récents ── */}
            <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", overflow: "hidden", boxShadow: "0 2px 16px rgba(10,20,40,0.05)", marginBottom: 20 }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(200,169,110,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1e35" }}>
                <div>
                  <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 6 }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 18, fontWeight: 700, color: "white" }}>Contrats récents</h3>
                </div>
                <button onClick={() => navigate("/vendeur/contrats")} style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", color: "#c8a96e", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Voir tout →</button>
              </div>

              {/* Entête tableau */}
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 180px 160px 120px", padding: "10px 28px", background: "#faf8f4", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
                {["N°", "Bien", "Acheteur", "Montant", "Statut"].map(h => (
                  <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{h}</div>
                ))}
              </div>

              {contratsRecents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "44px 0", color: "#c4bfb8" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  </svg>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucun contrat pour l'instant</p>
                </div>
              ) : (
                contratsRecents.map((c, i) => {
                  const img = c.bien?.images?.[0]?.url_image;
                  return (
                    <div key={c.id_contrat} className="row-hover"
                      onClick={() => navigate("/vendeur/contrats")}
                      style={{ display: "grid", gridTemplateColumns: "60px 1fr 180px 160px 120px", padding: "14px 28px", alignItems: "center", borderBottom: i < contratsRecents.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>#{String(c.id_contrat).padStart(4,"0")}</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 42, height: 34, overflow: "hidden", background: "#f8f7f4", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                          {img
                            ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                              </div>
                          }
                        </div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>{c.bien?.titre || "—"}</p>
                          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af" }}>{fmtDate(c.date_contrat)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar nom={c.acheteur?.nom} prenom={c.acheteur?.prenom} size={26} />
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0f1e35", fontWeight: 600 }}>{c.acheteur?.prenom} {c.acheteur?.nom}</span>
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{fmt(c.montant)}</div>
                      <div><Badge statut={c.statut} /></div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Paiements + Transactions ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Paiements */}
              <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", overflow: "hidden", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ width: 18, height: 2, background: "#c8a96e", marginBottom: 5 }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 18, fontWeight: 700, color: "#0f1e35" }}>Paiements récents</h3>
                  </div>
                  <button onClick={() => navigate("/vendeur/mes-paiements")} style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", color: "#c8a96e", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Voir tout →</button>
                </div>
                {paiementsRecents.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 0", color: "#c4bfb8" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucun paiement</p>
                  </div>
                ) : (
                  paiementsRecents.map((p, i) => (
                    <div key={p.id_paiement} className="row-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", borderBottom: i < paiementsRecents.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#0f1e35" }}>Contrat #{String(p.id_contrat).padStart(4,"0")}</p>
                          <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af" }}>{fmtDate(p.date_paiement)} · {p.mode_paiement || "—"}</p>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#065f46" }}>+{fmt(p.montant)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Transactions */}
              <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", overflow: "hidden", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ width: 18, height: 2, background: "#c8a96e", marginBottom: 5 }} />
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 18, fontWeight: 700, color: "#0f1e35" }}>Transactions récentes</h3>
                  </div>
                  <button onClick={() => navigate("/vendeur/mes-transactions")} style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", color: "#c8a96e", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>Voir tout →</button>
                </div>
                {transRecentes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 0", color: "#c4bfb8" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucune transaction</p>
                  </div>
                ) : (
                  transRecentes.map((t, i) => {
                    const typeColor = { vente: "#0f1e35", location: "#c8a96e", paiement: "#065f46", annulation: "#991b1b" };
                    const color = typeColor[t.type_transaction] || "#9ca3af";
                    return (
                      <div key={t.id_transaction} className="row-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", borderBottom: i < transRecentes.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                            </svg>
                          </div>
                          <div>
                            <p style={{ margin: "0 0 2px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#0f1e35" }}>{t.bien?.titre || "—"}</p>
                            <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af" }}>
                              {fmtDate(t.date_transaction)} · <span style={{ color, fontWeight: 700 }}>{t.type_transaction}</span>
                            </p>
                          </div>
                        </div>
                        {t.montant && <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color }}>{fmt(t.montant)}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>
    </div>
  );
}