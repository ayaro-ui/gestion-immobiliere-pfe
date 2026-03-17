import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const STATUTS = {
  en_attente: { label: "En attente", color: "#B45309", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)", dot: "#c8a96e" },
  accepte:    { label: "Accepté",    color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)",  dot: "#059669" },
  refuse:     { label: "Refusé",     color: "#991b1b", bg: "rgba(220,38,38,0.06)",  border: "rgba(220,38,38,0.2)",   dot: "#dc2626" },
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

function DemandeModal({ demande, onClose, onUpdated }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAction = async (statut) => {
    setSaving(true); setErr("");
    try {
      const { data } = await axios.put(`/contacts/${demande.id_contact}`, { statut });
      onUpdated(data);
      onClose();
    } catch { setErr("Erreur lors de la mise à jour."); }
    finally { setSaving(false); }
  };

  const bien   = demande.bien;
  const client = demande.client;
  const img    = bien?.images?.[0]?.url_image;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 560, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)" }}>

        {/* Header */}
        <div style={{ background: "#0f1e35", padding: "26px 30px", flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", left: "30px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Demande client
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "white" }}>
              {bien?.titre || "—"}
            </h2>
            <Badge statut={demande.statut} />
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 30px 28px", overflowY: "auto" }}>

          {/* Image */}
          {img && (
            <div style={{ borderRadius: 16, overflow: "hidden", height: 160, marginBottom: 18, border: "1px solid rgba(200,169,110,0.15)" }}>
              <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Bien */}
          <div style={{ background: "#faf8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(200,169,110,0.15)" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 8px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Bien immobilier</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{bien?.titre}</p>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                `${bien?.surface} m²`,
                `${bien?.nb_pieces} pièces`,
                bien?.type_bien === "vente" ? "Vente" : "Location",
              ].map((v, i) => (
                <span key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", background: "white", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 99, padding: "3px 10px" }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Client */}
          <div style={{ background: "#faf8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(200,169,110,0.15)" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 10px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Client</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar nom={client?.nom} prenom={client?.prenom} size={42} />
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{client?.prenom} {client?.nom}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 12, color: "#9ca3af" }}>{client?.email}</p>
                {client?.telephone && <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "3px 0 0", fontSize: 12, color: "#c8a96e", fontWeight: 600 }}>{client?.telephone}</p>}
              </div>
            </div>
          </div>

          {/* Message */}
          {demande.message && (
            <div style={{ background: "#faf8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(200,169,110,0.15)", borderLeft: "3px solid #c8a96e", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Message</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 13, color: "#0f1e35", lineHeight: 1.65 }}>{demande.message}</p>
            </div>
          )}

          {/* Date */}
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", marginBottom: 18 }}>
            Reçu le {new Date(demande.date_envoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>

          {err && <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "10px 14px", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 14 }}>{err}</div>}

          {/* Actions */}
          {demande.statut === "en_attente" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => handleAction("accepte")} disabled={saving} style={{ padding: "13px 0", borderRadius: 14, border: "none", background: saving ? "#d4c4a8" : "#065f46", color: "white", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", transition: "opacity .2s" }}
                onMouseEnter={e => !saving && (e.currentTarget.style.opacity=".85")}
                onMouseLeave={e => (e.currentTarget.style.opacity="1")}>
                Accepter
              </button>
              <button onClick={() => handleAction("refuse")} disabled={saving} style={{ padding: "13px 0", borderRadius: 14, border: "none", background: saving ? "#d4c4a8" : "#dc2626", color: "white", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", transition: "opacity .2s" }}
                onMouseEnter={e => !saving && (e.currentTarget.style.opacity=".85")}
                onMouseLeave={e => (e.currentTarget.style.opacity="1")}>
                Refuser
              </button>
            </div>
          )}

          {demande.statut === "accepte" && (
            <button onClick={() => { onClose(); navigate("/vendeur/creer-contrat", { state: { bien: demande.bien, acheteur: demande.client } }); }}
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: "#c8a96e", color: "white", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background="#b8955a"}
              onMouseLeave={e => e.currentTarget.style.background="#c8a96e"}>
              Créer un contrat pour ce client
            </button>
          )}

          {demande.statut === "refuse" && (
            <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 14, padding: "14px", textAlign: "center", fontFamily: "'DM Sans',sans-serif", color: "#991b1b", fontSize: 12, fontWeight: 600 }}>
              Cette demande a été refusée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MesDemandes() {
  const [demandes, setDemandes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [errLoad, setErrLoad]           = useState("");
  const [search, setSearch]             = useState("");
  const [filtStatut, setFiltStatut]     = useState("tous");
  const [selected, setSelected]         = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/contacts/vendeur/${user.id_user}`);
      setDemandes(data);
    } catch { setErrLoad("Impossible de charger les demandes."); }
    finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handleUpdated = (updated) => {
    setDemandes(p => p.map(d => d.id_contact === updated.id_contact ? updated : d));
  };

  const filtered = demandes.filter(d => {
    const q = search.toLowerCase();
    const ok = d.bien?.titre?.toLowerCase().includes(q) || d.client?.nom?.toLowerCase().includes(q) || d.client?.prenom?.toLowerCase().includes(q);
    return ok && (filtStatut === "tous" || d.statut === filtStatut);
  });

  const stats = {
    total:   demandes.length,
    attente: demandes.filter(d => d.statut === "en_attente").length,
    accepte: demandes.filter(d => d.statut === "accepte").length,
    refuse:  demandes.filter(d => d.statut === "refuse").length,
  };

  const STAT_ITEMS = [
    { label: "Total",       value: stats.total,   color: "#c8a96e",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: "En attente",  value: stats.attente, color: "#B45309",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "Acceptées",   value: stats.accepte, color: "#065f46",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: "Refusées",    value: stats.refuse,  color: "#991b1b",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
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
        .drow:hover { background: #faf8f4 !important; cursor: pointer; }
        .drow { transition: background .12s; }
        input:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1600&q=90"
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
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Mes Demandes</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Clients intéressés par vos biens immobiliers
            </p>
          </div>
          <button onClick={load} style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Actualiser
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 80px" }} className="fade-up">

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
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

        {/* ── Filtres ── */}
        <div style={{ background: "white", padding: "16px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,0.04)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par bien ou client..."
              style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "all .2s" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["tous","Tous"],["en_attente","En attente"],["accepte","Acceptées"],["refuse","Refusées"]].map(([v, l]) => (
              <button key={v} onClick={() => setFiltStatut(v)} style={{ padding: "8px 16px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${filtStatut === v ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: filtStatut === v ? "#0f1e35" : "transparent", color: filtStatut === v ? "#c8a96e" : "#9ca3af", transition: "all .14s", letterSpacing: "0.5px" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>

          {/* En-tête */}
          <div style={{ background: "#0f1e35", padding: "14px 28px", display: "grid", gridTemplateColumns: "1fr 200px 160px 130px" }}>
            {["Bien / Client", "Contact", "Date", "Statut"].map(h => (
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucune demande reçue</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Les clients intéressés par vos biens apparaîtront ici</p>
            </div>
          )}

          {!loading && filtered.map((d, i) => {
            const img = d.bien?.images?.[0]?.url_image;
            return (
              <div key={d.id_contact} className="drow" onClick={() => setSelected(d)} style={{ display: "grid", gridTemplateColumns: "1fr 200px 160px 130px", padding: "15px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>

                {/* Bien + Client */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 40, borderRadius: 10, overflow: "hidden", background: "#f8f7f4", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        </div>
                    }
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>{d.bien?.titre || "—"}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar nom={d.client?.nom} prenom={d.client?.prenom} size={20} />
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280" }}>{d.client?.prenom} {d.client?.nom}</span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 2px", fontSize: 12, color: "#0f1e35", fontWeight: 600 }}>{d.client?.email}</p>
                  {d.client?.telephone && <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#9ca3af" }}>{d.client?.telephone}</p>}
                </div>

                {/* Date */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280" }}>
                  {new Date(d.date_envoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </div>

                {/* Statut */}
                <div><Badge statut={d.statut} /></div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            {filtered.length} demande{filtered.length !== 1 ? "s" : ""}{filtered.length !== demandes.length ? ` sur ${demandes.length}` : ""} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>

      {selected && <DemandeModal demande={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </div>
  );
}