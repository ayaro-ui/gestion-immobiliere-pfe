import { useState, useEffect, useCallback } from "react";
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
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.id_user ?? u.id ?? null;
  } catch { return null; }
};

const MODE_CONFIG = {
  cash:     { label: "Cash",     color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)"  },
  virement: { label: "Virement", color: "#0f1e35", bg: "rgba(15,30,53,0.08)",   border: "rgba(15,30,53,0.2)"    },
  cheque:   { label: "Chèque",   color: "#B45309", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)" },
};

function ModeBadge({ mode }) {
  const m = MODE_CONFIG[mode] || { label: mode || "—", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: m.color, background: m.bg, border: `1px solid ${m.border}` }}>
      {m.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 32 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

function DetailModal({ paiement: p, onClose }) {
  const c        = p.contrat;
  const bien     = c?.bien;
  const acheteur = c?.acheteur;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 500, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative" }}>
          <div style={{ position: "absolute", left: "30px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Paiement N° {String(p.id_paiement).padStart(5, "0")}
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "white" }}>
              {bien?.titre || `Contrat #${String(p.id_contrat).padStart(4, "0")}`}
            </h2>
            <ModeBadge mode={p.mode_paiement} />
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Montant */}
          <div style={{ background: "#0f1e35", borderRadius: 16, padding: "20px 24px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "#c8a96e", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Montant encaissé</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>{fmt(p.montant)}</p>
          </div>

          {/* Infos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 5px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Date</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{fmtDate(p.date_paiement)}</p>
            </div>
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 5px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Contrat</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>#{String(p.id_contrat).padStart(4, "0")}</p>
            </div>
          </div>

          {/* Bien */}
          {bien && (
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)", marginBottom: 12 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 8px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Bien immobilier</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 44, height: 36, borderRadius: 8, overflow: "hidden", background: "#f0ede8", flexShrink: 0, border: "1px solid rgba(200,169,110,0.2)" }}>
                  {bien.images?.[0]?.url_image
                    ? <img src={`http://127.0.0.1:8000/storage/${bien.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      </div>
                  }
                </div>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>{bien.titre}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#9ca3af" }}>{bien.surface}m² · {bien.nb_pieces} pièces</p>
                </div>
              </div>
            </div>
          )}

          {/* Acheteur */}
          {acheteur && (
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar nom={acheteur.nom} prenom={acheteur.prenom} size={38} />
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 2px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Acheteur / Locataire</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>{acheteur.prenom} {acheteur.nom}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#9ca3af" }}>{acheteur.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MesPaiements() {
  const userId = getUserId();

  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [errLoad, setErrLoad]     = useState("");
  const [search, setSearch]       = useState("");
  const [filtMode, setFiltMode]   = useState("tous");
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const [rContrats, rPaiements] = await Promise.allSettled([
        axios.get(`/contrats/vendeur/${userId}`),
        axios.get("/paiements"),
      ]);
      let mesContrats = [];
      if (rContrats.status === "fulfilled") {
        mesContrats = Array.isArray(rContrats.value.data) ? rContrats.value.data : [];
      }
      if (rPaiements.status === "fulfilled") {
        const allPaiements = Array.isArray(rPaiements.value.data) ? rPaiements.value.data : [];
        const contratIds   = mesContrats.map(c => c.id_contrat);
        const enrichis     = allPaiements
          .filter(p => contratIds.includes(p.id_contrat))
          .map(p => ({ ...p, contrat: mesContrats.find(c => c.id_contrat === p.id_contrat) || null }));
        setPaiements(enrichis);
      }
    } catch { setErrLoad("Impossible de charger les paiements."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = paiements.filter(p => {
    const q  = search.toLowerCase();
    const ok = p.contrat?.bien?.titre?.toLowerCase().includes(q) || p.contrat?.acheteur?.nom?.toLowerCase().includes(q) || p.contrat?.acheteur?.prenom?.toLowerCase().includes(q) || String(p.id_contrat).includes(q);
    return ok && (filtMode === "tous" || p.mode_paiement === filtMode);
  });

  const stats = {
    total:    paiements.length,
    cash:     paiements.filter(p => p.mode_paiement === "cash").length,
    virement: paiements.filter(p => p.mode_paiement === "virement").length,
    cheque:   paiements.filter(p => p.mode_paiement === "cheque").length,
    volume:   paiements.reduce((s, p) => s + parseFloat(p.montant || 0), 0),
    mois:     paiements.filter(p => {
      const d = new Date(p.date_paiement), now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, p) => s + parseFloat(p.montant || 0), 0),
  };

  const STAT_ITEMS = [
    { label: "Total paiements", value: stats.total,    color: "#c8a96e",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    { label: "Cash",            value: stats.cash,     color: "#065f46",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: "Virement",        value: stats.virement, color: "#0f1e35",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
    { label: "Chèque",          value: stats.cheque,   color: "#B45309",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop     { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .rh:hover { background: #faf8f4 !important; cursor: pointer; }
        .rh { transition: background .12s; }
        input:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=90"
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
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Mes Paiements</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Suivi des paiements liés à vos contrats immobiliers
            </p>
          </div>
          <button onClick={load} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Actualiser
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 60px 80px" }} className="fade-up">

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
          {STAT_ITEMS.map(s => (
            <div key={s.label} style={{ background: "white", padding: "22px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{s.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Volumes ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#0f1e35", borderRadius: 20, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(200,169,110,0.15)" }}>
            <div>
              <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 10 }} />
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Volume total encaissé</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1 }}>{fmt(stats.volume)}</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 20, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(200,169,110,0.12)", borderTop: "3px solid #065f46", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Ce mois-ci</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 32, fontWeight: 700, color: "#065f46", lineHeight: 1 }}>{fmt(stats.mois)}</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div style={{ background: "white", padding: "16px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,0.04)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par bien, acheteur, contrat..."
              style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "all .2s" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["tous","Tous"],["cash","Cash"],["virement","Virement"],["cheque","Chèque"]].map(([v, l]) => (
              <button key={v} onClick={() => setFiltMode(v)} style={{ padding: "8px 16px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${filtMode === v ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: filtMode === v ? "#0f1e35" : "transparent", color: filtMode === v ? "#c8a96e" : "#9ca3af", transition: "all .14s", letterSpacing: "0.5px" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
          <div style={{ background: "#0f1e35", padding: "14px 28px", display: "grid", gridTemplateColumns: "60px 1fr 180px 130px 150px 120px" }}>
            {["N°", "Bien / Contrat", "Acheteur", "Mode", "Montant", "Date"].map(h => (
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
            <div style={{ textAlign: "center", padding: "64px 0", color: "#c4bfb8" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun paiement trouvé</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Les paiements liés à vos contrats apparaîtront ici</p>
            </div>
          )}

          {!loading && filtered.map((p, i) => {
            const bien     = p.contrat?.bien;
            const acheteur = p.contrat?.acheteur;
            const img      = bien?.images?.[0]?.url_image;
            return (
              <div key={p.id_paiement} className="rh" onClick={() => setSelected(p)} style={{ display: "grid", gridTemplateColumns: "60px 1fr 180px 130px 150px 120px", padding: "15px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>

                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>
                  #{String(p.id_paiement).padStart(4, "0")}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 44, height: 36, borderRadius: 10, overflow: "hidden", background: "#f8f7f4", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        </div>
                    }
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>
                      {bien?.titre || `Contrat #${String(p.id_contrat).padStart(4, "0")}`}
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#9ca3af" }}>
                      Contrat #{String(p.id_contrat).padStart(4, "0")}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {acheteur ? (
                    <>
                      <Avatar nom={acheteur.nom} prenom={acheteur.prenom} size={26} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0f1e35", fontWeight: 600 }}>{acheteur.prenom} {acheteur.nom}</span>
                    </>
                  ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>}
                </div>

                <div><ModeBadge mode={p.mode_paiement} /></div>

                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#065f46" }}>
                  +{fmt(p.montant)}
                </div>

                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280" }}>
                  {fmtDate(p.date_paiement)}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            {filtered.length} paiement{filtered.length !== 1 ? "s" : ""}{filtered.length !== paiements.length ? ` sur ${paiements.length}` : ""} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>

      {selected && <DetailModal paiement={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}