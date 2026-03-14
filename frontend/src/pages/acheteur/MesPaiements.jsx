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

const MODE_CONFIG = {
  cash:     { label: "Cash",     color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "💵" },
  virement: { label: "Virement", color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC", icon: "🏦" },
  cheque:   { label: "Chèque",   color: "#D97706", bg: "#FFFBEB", border: "#FCD34D", icon: "📝" },
};

function ModeBadge({ mode }) {
  const m = MODE_CONFIG[mode] || { label: mode || "—", color: "#64748B", bg: "#F8FAFF", border: "#E2E8F0", icon: "💳" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function DetailModal({ paiement: p, onClose }) {
  const c    = p.contrat;
  const bien = c?.bien;
  const vendeur = c?.vendeur;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500,
        boxShadow: "0 40px 100px rgba(15,23,42,.3)",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A5F)", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                PAIEMENT N° {String(p.id_paiement).padStart(5, "0")}
              </p>
              <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {bien?.titre || `Contrat #${String(p.id_contrat).padStart(4, "0")}`}
              </h2>
              <ModeBadge mode={p.mode_paiement} />
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10,
              color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>

          {/* Montant */}
          <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: "1px solid #A5B4FC", textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#4F46E5", fontWeight: 700 }}>MONTANT PAYÉ</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#1E1B4B" }}>{fmt(p.montant)}</p>
          </div>

          {/* Grille */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>📅 DATE</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{fmtDate(p.date_paiement)}</p>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>📋 CONTRAT</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>#{String(p.id_contrat).padStart(4, "0")}</p>
            </div>
          </div>

          {/* Bien */}
          {bien && (
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0", marginBottom: 12 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>🏠 BIEN IMMOBILIER</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 50, height: 40, borderRadius: 8, overflow: "hidden", background: "#E2E8F0", flexShrink: 0 }}>
                  {bien.images?.[0]?.url_image
                    ? <img src={`http://127.0.0.1:8000/storage/${bien.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>🏠</div>
                  }
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{bien.titre}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>
                    {bien.surface}m² · {bien.type_bien === "vente" ? "Vente" : "Location"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vendeur */}
          {vendeur && (
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#4F46E5,#0891B2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>
                {vendeur.prenom?.[0]}{vendeur.nom?.[0]}
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>PROPRIÉTAIRE / VENDEUR</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{vendeur.prenom} {vendeur.nom}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{vendeur.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MesPaiementsAcheteur() {
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const userId   = user.id_user;

  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [errLoad, setErrLoad]     = useState("");
  const [search, setSearch]       = useState("");
  const [filtMode, setFiltMode]   = useState("tous");
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/paiements/acheteur/${userId}`);
      setPaiements(Array.isArray(data) ? data : []);
    } catch {
      setErrLoad("Impossible de charger vos paiements.");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = paiements.filter((p) => {
    const q  = search.toLowerCase();
    const ok = p.contrat?.bien?.titre?.toLowerCase().includes(q)
      || p.contrat?.vendeur?.nom?.toLowerCase().includes(q)
      || p.contrat?.vendeur?.prenom?.toLowerCase().includes(q)
      || String(p.id_contrat).includes(q);
    return ok && (filtMode === "tous" || p.mode_paiement === filtMode);
  });

  // Stats
  const total   = paiements.reduce((s, p) => s + parseFloat(p.montant || 0), 0);
  const moisEnCours = paiements.filter((p) => {
    const d = new Date(p.date_paiement), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, p) => s + parseFloat(p.montant || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        .rh:hover { background:#EEF2FF !important; cursor:pointer; }
        .rh { transition:background .12s; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>ESPACE CLIENT</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Mes Paiements</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Historique de vos paiements immobiliers</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { icon: "💳", label: "Total paiements",  value: paiements.length,                                           color: "#4F46E5" },
            { icon: "💵", label: "Cash",              value: paiements.filter(p => p.mode_paiement === "cash").length,     color: "#059669" },
            { icon: "🏦", label: "Virement",          value: paiements.filter(p => p.mode_paiement === "virement").length, color: "#0891B2" },
            { icon: "📝", label: "Chèque",            value: paiements.filter(p => p.mode_paiement === "cheque").length,   color: "#D97706" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "18px 20px",
              boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Volumes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <div style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 18, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>TOTAL PAYÉ</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" }}>{fmt(total)}</p>
            </div>
            <div style={{ fontSize: 40, opacity: .4 }}>💰</div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#0891B2,#059669)", borderRadius: 18, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>CE MOIS-CI</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" }}>{fmt(moisEnCours)}</p>
            </div>
            <div style={{ fontSize: 40, opacity: .4 }}>📅</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 10px rgba(15,23,42,.06)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par bien, vendeur, contrat…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["tous","Tous"],["cash","💵 Cash"],["virement","🏦 Virement"],["cheque","📝 Chèque"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltMode(v)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${filtMode===v ? "#4F46E5" : "#E2E8F0"}`,
                background: filtMode===v ? "#EEF2FF" : "transparent",
                color: filtMode===v ? "#4F46E5" : "#94A3B8", transition: "all .14s",
              }}>{l}</button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", cursor: "pointer", fontSize: 15 }}>🔄</button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 180px 130px 140px 120px", padding: "12px 24px", background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F0", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
            <div>N°</div><div>BIEN / CONTRAT</div><div>VENDEUR</div><div>MODE</div><div>MONTANT</div><div>DATE</div>
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
              <div style={{ fontSize: 44, marginBottom: 10 }}>💳</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Aucun paiement trouvé</p>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Vos paiements apparaîtront ici après signature d'un contrat</p>
            </div>
          )}

          {!loading && filtered.map((p, i) => {
            const bien    = p.contrat?.bien;
            const vendeur = p.contrat?.vendeur;
            const img     = bien?.images?.[0]?.url_image;
            return (
              <div key={p.id_paiement} className="rh" onClick={() => setSelected(p)} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 180px 130px 140px 120px",
                padding: "15px 24px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>
                  #{String(p.id_paiement).padStart(4, "0")}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 44, height: 36, borderRadius: 9, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>🏠</div>
                    }
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                      {bien?.titre || `Contrat #${String(p.id_contrat).padStart(4, "0")}`}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>
                      Contrat #{String(p.id_contrat).padStart(4, "0")}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {vendeur ? (
                    <>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", background: "#4F46E5", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: 9,
                      }}>{vendeur.prenom?.[0]}{vendeur.nom?.[0]}</div>
                      <span style={{ fontSize: 12, color: "#1E293B", fontWeight: 600 }}>{vendeur.prenom} {vendeur.nom}</span>
                    </>
                  ) : <span style={{ fontSize: 12, color: "#94A3B8" }}>—</span>}
                </div>

                <div><ModeBadge mode={p.mode_paiement} /></div>

                <div style={{ fontSize: 14, fontWeight: 800, color: "#DC2626" }}>−{fmt(p.montant)}</div>

                <div style={{ fontSize: 12, color: "#64748B" }}>{fmtDate(p.date_paiement)}</div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} paiement{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== paiements.length && ` sur ${paiements.length}`} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {selected && <DetailModal paiement={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}