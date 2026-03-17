import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const Ico = {
  Pin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Ruler: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
      <path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>
    </svg>
  ),
  Door: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/>
      <path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.069.998L3 20.562a2 2 0 0 1-1-3.562V5a2 2 0 0 1 2-2h9z"/>
    </svg>
  ),
  Tag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
      <path d="M7 7h.01"/>
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  Image: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  ),
  Home: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  Garage: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12H2M2 12V20h20V12M2 12L12 3l10 9"/><path d="M9 20v-4h6v4"/>
    </svg>
  ),
  Pool: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20M2 18h20M6 12V6a2 2 0 0 1 4 0v6M14 12V6a2 2 0 0 1 4 0v6"/>
    </svg>
  ),
  Garden: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12M12 12C12 12 8 10 6 6c4 0 6 2 6 6ZM12 12c0 0 4-2 6-6-4 0-6 2-6 6Z"/>
      <path d="M5 22h14"/>
    </svg>
  ),
  Furniture: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/>
      <path d="M4 18v2M20 18v2M12 4v9"/>
    </svg>
  ),
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  ),
};

export default function DetailBien() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bien,       setBien]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [imgIndex,   setImgIndex]   = useState(0);
  const [message,    setMessage]    = useState("");
  const [sending,    setSending]    = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");
  const [isFav,      setIsFav]      = useState(false);
  const [favId,      setFavId]      = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const token     = localStorage.getItem("token");
  const isClient  = token && user?.id_role === 3;
  const isVendeur = token && user?.id_role === 2;
  const showHeart = !token || isClient;

  useEffect(() => {
    axios.get(`/biens/${id}`)
      .then(res => setBien(res.data))
      .catch(() => setError("Bien introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isClient) return;
    axios.get('/favoris').then(res => {
      const fav = res.data.find(f => f.id_bien === parseInt(id) && f.id_user === user.id_user);
      if (fav) { setIsFav(true); setFavId(fav.id_favori); }
    }).catch(() => {});
  }, [id, isClient]);

  const toggleFavori = async () => {
    if (!isClient) { navigate("/login"); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await axios.delete(`/favoris/${favId}`);
        setIsFav(false); setFavId(null);
      } else {
        const { data } = await axios.post('/favoris', { id_bien: parseInt(id), id_user: user.id_user });
        setIsFav(true); setFavId(data.id_favori);
      }
    } catch {}
    setFavLoading(false);
  };

  const handleDemande = async () => {
    if (!token) { navigate("/login"); return; }
    setSending(true); setError(""); setSuccess("");
    try {
      await axios.post("/contacts", { id_bien: parseInt(id), id_client: user.id_user, message });
      setSuccess("Votre demande a été envoyée au vendeur avec succès !");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally { setSending(false); }
  };

  const fmt = n => new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7f4" }}>
      <div style={{ textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" style={{ animation: "spin 1s linear infinite", marginBottom: 16 }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <style>{ `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }` }</style>
        <p style={{ color: "#94a3b8", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Chargement...</p>
      </div>
    </div>
  );

  if (!bien) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7f4" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontWeight: 600 }}>Bien introuvable.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "none", background: "#0f1e35", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Retour</button>
      </div>
    </div>
  );

  const images  = bien.images || [];
  const fallback = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
  const imgUrl  = img => `http://127.0.0.1:8000/storage/${img.url_image}`;
  const isVente = bien.type_bien === "vente";

  const statutCfg = {
    disponible: { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e", label: "Disponible" },
    vendu:      { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Vendu" },
    loue:       { bg: "#dbeafe", color: "#2563eb", dot: "#3b82f6", label: "Loué" },
  }[bien.statut] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: bien.statut };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        .thumb-item { transition: all 0.15s; cursor: pointer; }
        .thumb-item:hover { opacity: 0.85; transform: scale(1.04); }
        .arrow-btn { transition: background 0.15s, transform 0.15s; }
        .arrow-btn:hover { background: rgba(0,0,0,0.8) !important; transform: translateY(-50%) scale(1.08); }
        .fav-btn { transition: all 0.2s; }
        .fav-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(239,68,68,0.2) !important; }
        .send-btn { transition: all 0.2s; }
        .send-btn:hover { opacity: 0.9; transform: translateY(-2px); }
        textarea:focus { outline: none; border-color: #c8a96e !important; box-shadow: 0 0 0 3px rgba(200,169,110,0.1); }
        .eq-item { transition: all 0.2s; }
        .eq-item:hover { background: #f0ede8 !important; border-color: #c8a96e !important; }
        .back-btn { transition: all 0.15s; }
        .back-btn:hover { background: #f0ede8 !important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px", animation: "fadeUp 0.4s ease" }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          <button className="back-btn" onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 8,
            border: "1px solid #e5e1d8", background: "white",
            color: "#4a4035", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <Ico.Back /> Retour
          </button>
          <span style={{ color: "#c8a96e", margin: "0 4px" }}>›</span>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: "#0f1e35", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Ico.Home /> Accueil
          </span>
          <span style={{ color: "#c8c4bc", margin: "0 2px" }}>›</span>
          <span style={{ color: "#9ca3af", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{bien.titre}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 390px", gap: 28, alignItems: "start" }}>

          {/* ══ COLONNE GAUCHE ══ */}
          <div>

            {/* ── Galerie ── */}
            <div style={{ background: "white", borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 32px rgba(10,20,40,0.1)", marginBottom: 24 }}>

              {/* Image principale */}
              <div style={{ position: "relative", height: 480, background: "#f0ede8", overflow: "hidden" }}>
                <img key={imgIndex}
                  src={images.length > 0 ? imgUrl(images[imgIndex]) : fallback}
                  alt={bien.titre}
                  style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.3s ease" }}
                  onError={e => e.target.src = fallback}
                />

                {/* Overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,30,0.65) 0%, rgba(10,15,30,0.1) 45%, transparent 70%)" }} />

                {/* Badge type */}
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  background: isVente ? "#0f1e35" : "#c8a96e",
                  color: "white", padding: "8px 18px",
                  fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {isVente ? <Ico.Tag /> : <Ico.Key />}
                  {isVente ? "À vendre" : "À louer"}
                </div>

                {/* Badge statut */}
                <div style={{
                  position: "absolute", top: 0, right: showHeart ? 48 : 0,
                  background: statutCfg.bg, color: statutCfg.color,
                  padding: "8px 16px", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statutCfg.dot }} />
                  {statutCfg.label}
                </div>

                {/* Bouton favori */}
                {showHeart && (
                  <button className="fav-btn" onClick={toggleFavori} disabled={favLoading} style={{
                    position: "absolute", top: 0, right: 0,
                    width: 48, height: 36,
                    background: isFav ? "#fff0f0" : "white",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isFav ? "#ef4444" : "#94a3b8",
                  }}>
                    <Ico.Heart filled={isFav} />
                  </button>
                )}

                {/* Prix */}
                <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                  <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "white", fontSize: 32, lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                    {fmt(bien.prix)}
                  </p>
                  {!isVente && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>/mois</span>}
                </div>

                {/* Compteur images */}
                {images.length > 1 && (
                  <div style={{
                    position: "absolute", bottom: 20, right: 20,
                    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                    color: "white", borderRadius: 20, padding: "5px 12px",
                    fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Ico.Image /> {imgIndex + 1} / {images.length}
                  </div>
                )}

                {/* Flèches navigation */}
                {images.length > 1 && (
                  <>
                    <button className="arrow-btn" onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)} style={{
                      position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                      color: "white", border: "none", borderRadius: "50%",
                      width: 44, height: 44, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Ico.ChevronLeft /></button>
                    <button className="arrow-btn" onClick={() => setImgIndex(i => (i + 1) % images.length)} style={{
                      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                      color: "white", border: "none", borderRadius: "50%",
                      width: 44, height: 44, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Ico.ChevronRight /></button>

                    {/* Dots */}
                    <div style={{ position: "absolute", bottom: 56, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                      {images.map((_, i) => (
                        <div key={i} onClick={() => setImgIndex(i)} style={{
                          width: imgIndex === i ? 24 : 7, height: 7, borderRadius: 4,
                          background: imgIndex === i ? "#c8a96e" : "rgba(255,255,255,0.5)",
                          cursor: "pointer", transition: "all 0.2s",
                        }} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 8, padding: "14px 18px", overflowX: "auto", background: "#fafaf8", borderTop: "1px solid #f0ede8" }}>
                  {images.map((img, i) => (
                    <div key={img.id_image} className="thumb-item" onClick={() => setImgIndex(i)} style={{
                      width: 84, height: 62, borderRadius: 4, overflow: "hidden", flexShrink: 0,
                      border: `2px solid ${imgIndex === i ? "#c8a96e" : "transparent"}`,
                    }}>
                      <img src={imgUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = fallback} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Infos principales ── */}
            <div style={{ background: "white", borderRadius: 4, padding: "36px 40px", boxShadow: "0 2px 20px rgba(10,20,40,0.07)", marginBottom: 20 }}>

              {/* Titre + adresse */}
              <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #f0ede8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 2, background: "#c8a96e" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" }}>
                    {isVente ? "Bien en vente" : "Bien en location"}
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: "#0f1e35", margin: "0 0 10px", lineHeight: 1.15 }}>
                  {bien.titre}
                </h1>
                {bien.adresse && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af" }}>
                    <Ico.Pin />
                    <span style={{ fontSize: 14 }}>{bien.adresse}</span>
                  </div>
                )}
              </div>

              {/* 4 stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#f0ede8", borderRadius: 4, overflow: "hidden", marginBottom: 32 }}>
                {[
                  { icon: <Ico.Ruler />, label: "Surface",  value: `${bien.surface} m²` },
                  { icon: <Ico.Door />,  label: "Pièces",   value: `${bien.nb_pieces} pièces` },
                  { icon: isVente ? <Ico.Tag /> : <Ico.Key />, label: "Type", value: isVente ? "Vente" : "Location" },
                  { icon: null, label: "Statut", value: statutCfg.label, color: statutCfg.color },
                ].map((info, i) => (
                  <div key={i} style={{ background: "white", padding: "22px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: "#c8a96e" }}>{info.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: info.color || "#0f1e35", marginBottom: 4 }}>{info.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.8px", textTransform: "uppercase" }}>{info.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#0f1e35", margin: "0 0 14px" }}>Description</h3>
                <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.85, margin: 0 }}>
                  {bien.description || "Aucune description disponible pour ce bien."}
                </p>
              </div>
            </div>

            {/* ── Équipements ── */}
            {(bien.garage || bien.piscine || bien.jardin || bien.meuble) && (
              <div style={{ background: "white", borderRadius: 4, padding: "28px 40px", boxShadow: "0 2px 20px rgba(10,20,40,0.07)" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#0f1e35", margin: "0 0 20px" }}>Équipements</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    bien.garage  && { icon: <Ico.Garage />,    label: "Garage" },
                    bien.piscine && { icon: <Ico.Pool />,      label: "Piscine" },
                    bien.jardin  && { icon: <Ico.Garden />,    label: "Jardin" },
                    bien.meuble  && { icon: <Ico.Furniture />, label: "Meublé" },
                  ].filter(Boolean).map(({ icon, label }) => (
                    <div key={label} className="eq-item" style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 20px", borderRadius: 4,
                      border: "1px solid #e5e1d8", background: "#fafaf8",
                      fontSize: 13, fontWeight: 600, color: "#4a4035",
                      cursor: "default",
                    }}>
                      <span style={{ color: "#c8a96e" }}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ COLONNE DROITE ══ */}
          <div style={{ position: "sticky", top: 80 }}>

            {/* ── Card principale ── */}
            <div style={{ background: "white", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 40px rgba(10,20,40,0.12)", marginBottom: 16 }}>

              {/* Header prix */}
              <div style={{ background: "linear-gradient(135deg, #0a1428, #0f1e35)", padding: "28px 32px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                  {isVente ? "Prix de vente" : "Loyer mensuel"}
                </p>
                <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>
                  {fmt(bien.prix)}
                  {!isVente && <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}> /mois</span>}
                </p>
                <div style={{ width: 40, height: 2, background: "#c8a96e", marginTop: 16 }} />
              </div>

              <div style={{ padding: "24px 28px" }}>

                {/* Vendeur */}
                {bien.vendeur && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 4, background: "#fafaf8", border: "1px solid #f0ede8", marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0f1e35,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                      <Ico.User />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f1e35", fontFamily: "'Cormorant Garamond', serif" }}>
                        {bien.vendeur.prenom} {bien.vendeur.nom}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", letterSpacing: "0.5px" }}>Propriétaire</p>
                      {bien.vendeur.telephone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, color: "#c8a96e", fontSize: 13, fontWeight: 600 }}>
                          <Ico.Phone /> {bien.vendeur.telephone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Non connecté */}
                {!token && (
                  <button onClick={() => navigate("/login")} style={{
                    width: "100%", padding: "14px 0", border: "none", borderRadius: 4,
                    background: "#0f1e35", color: "white", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.5px", marginBottom: 12,
                  }}>
                    Connectez-vous pour contacter
                  </button>
                )}

                {/* Vendeur connecté */}
                {isVendeur && (
                  <div style={{ background: "#fffbeb", borderRadius: 4, padding: "14px 16px", fontSize: 13, color: "#92400e", fontWeight: 600, textAlign: "center", border: "1px solid #fde68a" }}>
                    Vous êtes vendeur — vous ne pouvez pas faire une demande
                  </div>
                )}

                {/* Bien non disponible */}
                {isClient && bien.statut !== "disponible" && (
                  <div style={{ background: "#fef2f2", borderRadius: 4, padding: "14px 16px", fontSize: 13, color: "#dc2626", fontWeight: 600, textAlign: "center", border: "1px solid #fecaca" }}>
                    Ce bien n'est plus disponible
                  </div>
                )}

                {/* Formulaire contact */}
                {isClient && bien.statut === "disponible" && (
                  <div>
                    {success && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "12px 16px", color: "#16a34a", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                        <Ico.Check /> {success}
                      </div>
                    )}
                    {error && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, padding: "12px 16px", color: "#dc2626", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                        {error}
                      </div>
                    )}
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Votre message au vendeur (optionnel)..."
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 4,
                        border: "1.5px solid #e5e1d8", fontSize: 13, color: "#0f1e35",
                        resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                        background: "#fafaf8", lineHeight: 1.6, marginBottom: 12,
                      }}
                    />
                    <button className="send-btn" onClick={handleDemande} disabled={sending} style={{
                      width: "100%", padding: "14px 0", border: "none", borderRadius: 4,
                      background: sending ? "#94a3b8" : "#c8a96e",
                      color: "white", fontSize: 14, fontWeight: 700,
                      cursor: sending ? "not-allowed" : "pointer",
                      letterSpacing: "0.5px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: sending ? "none" : "0 4px 20px rgba(200,169,110,0.35)",
                    }}>
                      {sending ? "Envoi en cours..." : (<><Ico.Send /> Je suis intéressé</>)}
                    </button>

                    {/* Bouton favori */}
                    <button className="fav-btn" onClick={toggleFavori} disabled={favLoading} style={{
                      width: "100%", padding: "12px 0", marginTop: 10, borderRadius: 4,
                      border: `1.5px solid ${isFav ? "#ef4444" : "#e5e1d8"}`,
                      background: isFav ? "#fff0f0" : "white",
                      color: isFav ? "#ef4444" : "#64748b",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                      <Ico.Heart filled={isFav} />
                      {favLoading ? "..." : isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sécurité ── */}
            <div style={{ background: "white", borderRadius: 4, padding: "16px 20px", border: "1px solid #f0ede8", boxShadow: "0 2px 12px rgba(10,20,40,0.06)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ color: "#c8a96e", flexShrink: 0, marginTop: 2 }}><Ico.Lock /></div>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#0f1e35" }}>Transaction sécurisée</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                  Vos données sont protégées. Le vendeur sera notifié de votre demande sous 24h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}