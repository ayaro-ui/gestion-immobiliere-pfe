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

const TYPE_CONFIG = {
  vente:    { label: "Vente",    color: "#0f1e35", bg: "rgba(15,30,53,0.08)",   border: "rgba(15,30,53,0.2)"    },
  location: { label: "Location", color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)"  },
};

function TypeBadge({ type }) {
  const t = TYPE_CONFIG[type] || { label: type || "—", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: t.color, background: t.bg, border: `1px solid ${t.border}` }}>
      {t.label}
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

function DetailModal({ transaction: t, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 500, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative" }}>
          <div style={{ position: "absolute", left: "30px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Transaction N° {String(t.id_transaction).padStart(5, "0")}
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "white" }}>
              {t.bien?.titre || "—"}
            </h2>
            <TypeBadge type={t.type_transaction} />
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Montant */}
          <div style={{ background: "#0f1e35", borderRadius: 16, padding: "20px 24px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "#c8a96e", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Montant</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>{fmt(t.montant)}</p>
          </div>

          {/* Infos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 5px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Date</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{fmtDate(t.date_transaction)}</p>
            </div>
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 5px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Type</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{t.type_transaction === "vente" ? "Vente" : "Location"}</p>
            </div>
          </div>

          {/* Client */}
          {t.client && (
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar nom={t.client?.nom} prenom={t.client?.prenom} size={38} />
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 2px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Client</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>{t.client?.prenom} {t.client?.nom}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#9ca3af" }}>{t.client?.email}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {t.description && (
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(200,169,110,0.15)", borderLeft: "3px solid #c8a96e", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 5px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Description</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 13, color: "#0f1e35", lineHeight: 1.65 }}>{t.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MesTransactions() {
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id_user;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [errLoad, setErrLoad]           = useState("");
  const [search, setSearch]             = useState("");
  const [filtType, setFiltType]         = useState("tous");
  const [selected, setSelected]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/transactions/vendeur/${userId}`);
      setTransactions(Array.isArray(data) ? data : []);
    } catch { setErrLoad("Impossible de charger les transactions."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter(t => {
    const q  = search.toLowerCase();
    const ok = t.bien?.titre?.toLowerCase().includes(q) || t.client?.nom?.toLowerCase().includes(q) || t.client?.prenom?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    return ok && (filtType === "tous" || t.type_transaction === filtType);
  });

  const volume = transactions.reduce((s, t) => s + parseFloat(t.montant || 0), 0);

  const STAT_ITEMS = [
    { label: "Total",     value: transactions.length,                                          color: "#c8a96e",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
    { label: "Ventes",    value: transactions.filter(t => t.type_transaction === "vente").length,    color: "#0f1e35",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: "Locations", value: transactions.filter(t => t.type_transaction === "location").length, color: "#065f46",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .rh:hover { background: #faf8f4 !important; cursor: pointer; }
        .rh { transition: background .12s; }
        input:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1600&q=90"
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
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Mes Transactions</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Historique de toutes vos ventes et locations
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
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

        {/* ── Volume ── */}
        <div style={{ background: "#0f1e35", borderRadius: 20, padding: "22px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(200,169,110,0.15)" }}>
          <div>
            <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 10 }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Volume total encaissé</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>{fmt(volume)}</p>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div style={{ background: "white", padding: "16px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,0.04)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par bien, client..."
              style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "all .2s" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["tous","Tous"],["vente","Ventes"],["location","Locations"]].map(([v, l]) => (
              <button key={v} onClick={() => setFiltType(v)} style={{ padding: "8px 16px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${filtType === v ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: filtType === v ? "#0f1e35" : "transparent", color: filtType === v ? "#c8a96e" : "#9ca3af", transition: "all .14s", letterSpacing: "0.5px" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
          <div style={{ background: "#0f1e35", padding: "14px 28px", display: "grid", gridTemplateColumns: "60px 1fr 160px 140px 150px 120px" }}>
            {["N°", "Bien", "Client", "Type", "Montant", "Date"].map(h => (
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
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucune transaction</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Les transactions apparaîtront automatiquement après chaque paiement</p>
            </div>
          )}

          {!loading && filtered.map((t, i) => {
            const img = t.bien?.images?.[0]?.url_image;
            return (
              <div key={t.id_transaction} className="rh" onClick={() => setSelected(t)} style={{ display: "grid", gridTemplateColumns: "60px 1fr 160px 140px 150px 120px", padding: "15px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>

                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>
                  #{String(t.id_transaction).padStart(4, "0")}
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
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>{t.bien?.titre || "—"}</p>
                    {t.description && <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{t.description}</p>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {t.client ? (
                    <>
                      <Avatar nom={t.client?.nom} prenom={t.client?.prenom} size={26} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0f1e35", fontWeight: 600 }}>{t.client?.prenom} {t.client?.nom}</span>
                    </>
                  ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>}
                </div>

                <div><TypeBadge type={t.type_transaction} /></div>

                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#065f46" }}>
                  +{fmt(t.montant)}
                </div>

                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280" }}>
                  {fmtDate(t.date_transaction)}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{filtered.length !== transactions.length ? ` sur ${transactions.length}` : ""} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>

      {selected && <DetailModal transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}