import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STATUT_STYLE = {
  disponible: { bg: "rgba(5,150,105,0.08)",   color: "#065f46", dot: "#059669", label: "Disponible" },
  vendu:      { bg: "rgba(220,38,38,0.07)",   color: "#991b1b", dot: "#dc2626", label: "Vendu"      },
  loue:       { bg: "rgba(200,169,110,0.12)", color: "#B45309", dot: "#c8a96e", label: "Loué"       },
};

export default function MesBiens() {
  const [biens, setBiens]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filtreStatut, setFiltreStatut]   = useState("tous");
  const [filtreType, setFiltreType]       = useState("tous");
  const [recherche, setRecherche]         = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification]   = useState(null);

  useEffect(() => {
    const user  = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:8000/api/biens", {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    })
      .then(r => r.json())
      .then(d => setBiens(d.filter(b => b.id_vendeur === user?.id_user)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      setBiens(p => p.filter(b => b.id_bien !== id));
      setConfirmDelete(null);
      setNotification("Bien supprimé avec succès");
      setTimeout(() => setNotification(null), 3000);
    } catch (e) { console.error(e); }
  };

  const biensFiltres = biens.filter(b => {
    const okS = filtreStatut === "tous" || b.statut === filtreStatut;
    const okT = filtreType   === "tous" || b.type_bien === filtreType;
    const okR = b.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
                b.adresse?.toLowerCase().includes(recherche.toLowerCase());
    return okS && okT && okR;
  });

  const getImage = (b) => {
    if (b.images?.length > 0) {
      const u = b.images[0].url_image;
      return u.startsWith("http") ? u : `http://127.0.0.1:8000/storage/${u}`;
    }
    return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";
  };

  const STATS = [
    { label: "Total biens",  value: biens.length,                                        color: "#c8a96e" },
    { label: "Disponibles",  value: biens.filter(b => b.statut === "disponible").length, color: "#065f46" },
    { label: "Vendus",       value: biens.filter(b => b.statut === "vendu").length,      color: "#991b1b" },
    { label: "Loués",        value: biens.filter(b => b.statut === "loue").length,       color: "#B45309" },
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
        .bien-card { transition: transform .28s cubic-bezier(.34,1.3,.64,1), box-shadow .28s; }
        .bien-card:hover { transform: translateY(-8px) !important; box-shadow: 0 24px 52px rgba(10,20,40,0.14) !important; }
        .bien-card:hover .bien-img { transform: scale(1.06); }
        .bien-img { transition: transform .5s ease; }
        .btn-edit:hover { background: #faf8f4 !important; border-color: #c8a96e !important; }
        .btn-del:hover  { background: rgba(220,38,38,0.1) !important; }
        .filter-inp:focus { border-color: #c8a96e !important; outline: none; }
        .filter-sel:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── Notification ── */}
      {notification && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#0f1e35", color: "white", padding: "14px 24px", borderRadius: 16, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, animation: "slideIn .3s ease", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(200,169,110,0.4)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {notification}
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=90" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Espace vendeur
            </span>
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Mes Biens</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Gérez tous vos biens immobiliers publiés
            </p>
          </div>
          <Link to="/vendeur/ajouter-bien" style={{
            padding: "14px 28px", background: "#c8a96e", color: "white", textDecoration: "none",
            borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "2px", textTransform: "uppercase", transition: "background .2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#b8955a"}
            onMouseLeave={e => e.currentTarget.style.background="#c8a96e"}>
            + Ajouter un bien
          </Link>
        </div>
      </div>

      <main style={{ padding: "36px 80px 80px", maxWidth: 1300, margin: "0 auto" }} className="fade-up">

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: "white", padding: "22px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filtres ── */}
        <div style={{ background: "white", padding: "18px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", marginBottom: 28, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,0.04)" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Rechercher par titre ou ville..." value={recherche}
              onChange={e => setRecherche(e.target.value)} className="filter-inp"
              style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", outline: "none", transition: "all .2s" }} />
          </div>
          {[
            { val: filtreStatut, set: setFiltreStatut, opts: [["tous","Tous les statuts"],["disponible","Disponible"],["vendu","Vendu"],["loue","Loué"]] },
            { val: filtreType,   set: setFiltreType,   opts: [["tous","Tous les types"],["vente","Vente"],["location","Location"]] },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => f.set(e.target.value)} className="filter-sel"
              style={{ padding: "11px 16px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", cursor: "pointer", outline: "none", transition: "all .2s" }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
            {biensFiltres.length} résultat{biensFiltres.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0 }}>Chargement de vos biens...</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && biensFiltres.length === 0 && (
          <div style={{ background: "white", padding: "80px 40px", borderRadius: 28, textAlign: "center", border: "1px solid rgba(200,169,110,0.12)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ width: 28, height: 1, background: "#c8a96e", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0f1e35", margin: "0 0 8px" }}>Aucun bien trouvé</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0 }}>
              Ajoutez votre premier bien en cliquant sur "Ajouter un bien".
            </p>
          </div>
        )}

        {/* ── Grille ── */}
        {!loading && biensFiltres.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {biensFiltres.map(bien => {
              const s = STATUT_STYLE[bien.statut] || STATUT_STYLE.disponible;
              const isVente = bien.type_bien === "vente";
              return (
                <div key={bien.id_bien} className="bien-card" style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 4px 20px rgba(10,20,40,0.06)" }}>

                  {/* Image */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f8f7f4" }}>
                    <img className="bien-img" src={getImage(bien)} alt={bien.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => e.target.src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,40,0.65) 0%, transparent 55%)" }} />

                    {/* Badge type */}
                    <div style={{ position: "absolute", top: 12, left: 12, background: isVente ? "#0f1e35" : "#c8a96e", color: "white", padding: "5px 14px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                      {isVente ? "Vente" : "Location"}
                    </div>

                    {/* Badge statut */}
                    <div style={{ position: "absolute", top: 12, right: 12, background: s.bg, color: s.color, border: `1px solid ${s.dot}40`, padding: "5px 12px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                      {s.label}
                    </div>

                    {/* Prix */}
                    <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1 }}>
                        {Number(bien.prix).toLocaleString("fr-MA")} MAD
                      </span>
                      {!isVente && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>/mois</span>}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontSize: 19, fontWeight: 700, color: "#0f1e35", margin: "0 0 5px", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {bien.titre}
                    </h3>

                    {bien.adresse && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, color: "#9ca3af" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>{bien.adresse}</span>
                      </div>
                    )}

                    {/* Ligne dorée */}
                    <div style={{ height: 1, background: "linear-gradient(90deg, #c8a96e, transparent)", marginBottom: 12 }} />

                    {/* Specs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      {[
                        { val: `${bien.surface} m²`, label: "Surface" },
                        { val: `${bien.nb_pieces} pièces`, label: "Pièces" },
                      ].map((sp, i) => (
                        <span key={i} style={{ background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 99, padding: "5px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
                          {sp.val}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/vendeur/modifier-bien/${bien.id_bien}`} className="btn-edit" style={{
                        flex: 1, background: "white", color: "#0f1e35", padding: "10px 0",
                        borderRadius: 12, textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
                        fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                        textAlign: "center", border: "1px solid rgba(200,169,110,0.25)",
                        transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </Link>
                      <button onClick={() => setConfirmDelete(bien)} className="btn-del" style={{
                        flex: 1, background: "rgba(220,38,38,0.06)", color: "#991b1b",
                        padding: "10px 0", borderRadius: 12, border: "1px solid rgba(220,38,38,0.2)",
                        fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700,
                        letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all .2s",
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Modal suppression ── */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{ position: "fixed", inset: 0, background: "rgba(8,16,34,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, padding: "44px 48px", maxWidth: 420, width: "90%", textAlign: "center", border: "1px solid rgba(200,169,110,0.2)", boxShadow: "0 24px 64px rgba(10,20,40,0.3)", animation: "pop .25s ease" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", border: "1px solid rgba(220,38,38,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
            </div>
            <div style={{ width: 28, height: 1, background: "#c8a96e", margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#0f1e35", margin: "0 0 10px" }}>Supprimer ce bien ?</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: "0 0 6px" }}>Vous êtes sur le point de supprimer :</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#0f1e35", fontWeight: 700, fontSize: 16, margin: "0 0 10px" }}>« {confirmDelete.titre} »</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#dc2626", fontSize: 12, margin: "0 0 28px" }}>Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "13px 0", background: "white", color: "#6b7280", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#c8a96e"}
                onMouseLeave={e => e.currentTarget.style.borderColor="rgba(200,169,110,0.25)"}>
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDelete.id_bien)} style={{ flex: 1, padding: "13px 0", background: "#dc2626", color: "white", border: "none", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity=".88"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>
    </div>
  );
}