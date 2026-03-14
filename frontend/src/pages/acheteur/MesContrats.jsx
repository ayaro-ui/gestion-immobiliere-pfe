import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const STATUTS = {
  en_attente:    { label: "En attente",       color: "#D97706", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  signe_vendeur: { label: "À signer",         color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC", dot: "#6366F1" },
  signe_complet: { label: "Signé",            color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981" },
  annule:        { label: "Annulé",           color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", dot: "#EF4444" },
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

function Avatar({ nom, prenom, size = 38 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5","#0891B2","#059669","#D97706","#7C3AED","#DC2626"];
  const c = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * .35,
      border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>{txt}</div>
  );
}

// ── Canvas de signature ───────────────────────────────────────────────────────
function SignatureCanvas({ onSigned, onClear, signed }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => { e.preventDefault(); drawing.current = true; lastPos.current = getPos(e, canvasRef.current); };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1E3A5F";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    onSigned(canvasRef.current.toDataURL("image/png"));
  };

  const handleClear = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onClear();
  };

  return (
    <div>
      <div style={{
        border: `2px dashed ${signed ? "#059669" : "#CBD5E1"}`,
        borderRadius: 16, overflow: "hidden", background: "#F8FAFF",
        position: "relative", transition: "border-color .2s",
      }}>
        {!signed && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", pointerEvents: "none", flexDirection: "column", gap: 6,
          }}>
            <span style={{ fontSize: 28, opacity: .3 }}>✍️</span>
            <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Signez ici avec votre souris ou doigt</span>
          </div>
        )}
        <canvas
          ref={canvasRef} width={480} height={160}
          style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button onClick={handleClear} style={{
          background: "none", border: "1.5px solid #E2E8F0", borderRadius: 9,
          padding: "7px 16px", color: "#64748B", fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>🗑️ Effacer</button>
        {signed && <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✅ Signature capturée</span>}
      </div>
    </div>
  );
}

// ── Modal signature + détails contrat ────────────────────────────────────────
function ContratModal({ contrat, onClose, onSigned }) {
  const [signatureData, setSignatureData] = useState(null);
  const [signing, setSigning]             = useState(false);
  const [signErr, setSignErr]             = useState("");
  const [signed, setSigned]               = useState(false);

  const bien    = contrat.bien;
  const vendeur = contrat.vendeur;
  const img     = bien?.images?.[0]?.url_image;

  const handleSign = async () => {
    if (!signatureData) { setSignErr("Veuillez signer avant de continuer."); return; }
    setSigning(true); setSignErr("");
    try {
      const { data } = await axios.put(`/contrats/${contrat.id_contrat}/signer`, {
        role:      "acheteur",
        signature: signatureData,
      });
      setSigned(true);
      onSigned(data);
    } catch {
      setSignErr("Erreur lors de l'enregistrement de la signature.");
    } finally { setSigning(false); }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,.65)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 580,
        boxShadow: "0 40px 100px rgba(15,23,42,.3)",
        overflow: "hidden", maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
      }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A5F)", padding: "24px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                CONTRAT N° {String(contrat.id_contrat).padStart(5, "0")}
              </p>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {bien?.titre || "—"}
              </h2>
              <Badge statut={contrat.statut} />
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10,
              color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px 28px", overflowY: "auto" }}>

          {/* Image bien */}
          {img && (
            <div style={{ borderRadius: 14, overflow: "hidden", height: 150, marginBottom: 18 }}>
              <img src={`http://127.0.0.1:8000/storage/${img}`} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Infos bien */}
          <div style={{ background: "#f8faff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b", fontWeight: 700 }}>🏠 BIEN IMMOBILIER</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{bien?.titre}</p>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#64748b" }}>
                  <span>📐 {bien?.surface} m²</span>
                  <span>🚪 {bien?.nb_pieces} pièces</span>
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#4F46E5" }}>{fmt(contrat.montant)}</span>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "#f8faff", borderRadius: 14, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b", fontWeight: 700 }}>👤 VENDEUR</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar nom={vendeur?.nom} prenom={vendeur?.prenom} size={32} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{vendeur?.prenom} {vendeur?.nom}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{vendeur?.email}</p>
                </div>
              </div>
              {contrat.signature_vendeur && (
                <div style={{ marginTop: 10, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, color: "#059669", fontWeight: 700 }}>✅ SIGNÉ</p>
                  <img src={contrat.signature_vendeur} alt="Signature vendeur"
                    style={{ maxWidth: "100%", height: 40, objectFit: "contain", background: "#F8FAFF", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                </div>
              )}
            </div>
            <div style={{ background: "#f8faff", borderRadius: 14, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b", fontWeight: 700 }}>🤝 VOUS (ACHETEUR)</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar nom={contrat.acheteur?.nom} prenom={contrat.acheteur?.prenom} size={32} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{contrat.acheteur?.prenom} {contrat.acheteur?.nom}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{contrat.acheteur?.email}</p>
                </div>
              </div>
              {contrat.statut === "signe_complet" && contrat.signature_acheteur && (
                <div style={{ marginTop: 10, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, color: "#059669", fontWeight: 700 }}>✅ SIGNÉ</p>
                  <img src={contrat.signature_acheteur} alt="Signature acheteur"
                    style={{ maxWidth: "100%", height: 40, objectFit: "contain", background: "#F8FAFF", borderRadius: 6, border: "1px solid #E2E8F0" }} />
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18 }}>
            📅 Date du contrat : {new Date(contrat.date_contrat).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>

          {/* ── Zone signature acheteur ── */}
          {contrat.statut === "signe_vendeur" && !signed && (
            <div style={{ borderTop: "1.5px solid #E2E8F0", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg,#059669,#16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  ✍️
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Votre signature requise</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>Le vendeur a déjà signé — signez pour finaliser le contrat</p>
                </div>
              </div>
              <SignatureCanvas
                onSigned={setSignatureData}
                onClear={() => setSignatureData(null)}
                signed={!!signatureData}
              />
              {signErr && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10,
                  padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                  ⚠️ {signErr}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={handleSign} disabled={!signatureData || signing} style={{
                  padding: "13px 28px", borderRadius: 13, border: "none", fontWeight: 700, fontSize: 14,
                  background: !signatureData || signing ? "#E2E8F0" : "linear-gradient(135deg,#059669,#16a34a)",
                  color: !signatureData || signing ? "#94A3B8" : "#fff",
                  cursor: !signatureData || signing ? "not-allowed" : "pointer",
                  boxShadow: !signatureData || signing ? "none" : "0 4px 18px rgba(5,150,105,.35)",
                }}>
                  {signing ? "⏳ Enregistrement…" : "✍️ Signer le contrat"}
                </button>
              </div>
            </div>
          )}

          {/* Succès signature */}
          {signed && (
            <div style={{ background: "#ECFDF5", borderRadius: 14, border: "1px solid #6EE7B7",
              padding: "20px", textAlign: "center", marginTop: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#065F46" }}>Contrat finalisé !</p>
              <p style={{ margin: 0, fontSize: 13, color: "#059669" }}>Les deux parties ont signé — le contrat est maintenant complet.</p>
            </div>
          )}

          {/* Contrat déjà signé */}
          {contrat.statut === "signe_complet" && !signed && (
            <div style={{ background: "#ECFDF5", borderRadius: 14, border: "1px solid #6EE7B7",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#065F46" }}>Contrat entièrement signé</p>
                <p style={{ margin: 0, fontSize: 12, color: "#059669" }}>Les deux signatures sont enregistrées.</p>
              </div>
            </div>
          )}

          {/* En attente vendeur */}
          {contrat.statut === "en_attente" && (
            <div style={{ background: "#FFFBEB", borderRadius: 13, border: "1px solid #FCD34D",
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>⏳</span>
              <p style={{ margin: 0, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                En attente de la signature du vendeur. Vous pourrez signer une fois que le vendeur aura validé.
              </p>
            </div>
          )}

          {/* ── Bouton télécharger PDF ── */}
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16, marginTop: 16 }}>
            {contrat.fichier_pdf ? (
              <a
                href={`http://127.0.0.1:8000/storage/${contrat.fichier_pdf}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", borderRadius: 13, textDecoration: "none",
                  fontWeight: 700, fontSize: 14,
                  background: "linear-gradient(135deg,#0F172A,#1E3A5F)",
                  color: "#fff", boxShadow: "0 4px 18px rgba(15,23,42,.25)",
                }}>
                📄 Télécharger le contrat en PDF
              </a>
            ) : (
              <div style={{
                background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 13,
                padding: "13px 0", textAlign: "center", color: "#92400E", fontSize: 13, fontWeight: 600,
              }}>
                {contrat.statut === "signe_vendeur"
                  ? "⏳ PDF disponible après votre signature"
                  : "⚠️ PDF disponible après signature des deux parties"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesContrats() {
  const [contrats, setContrats]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [errLoad, setErrLoad]     = useState("");
  const [search, setSearch]       = useState("");
  const [filtStatut, setFiltStatut] = useState("tous");
  const [selected, setSelected]   = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/contrats/acheteur/${user.id_user}`);
      setContrats(data);
    } catch {
      setErrLoad("Impossible de charger vos contrats.");
    } finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handleSigned = (updated) => {
    setContrats((prev) => prev.map((c) => c.id_contrat === updated.id_contrat ? updated : c));
    if (selected?.id_contrat === updated.id_contrat) setSelected(updated);
  };

  const filtered = contrats.filter((c) => {
    const q = search.toLowerCase();
    const ok = c.bien?.titre?.toLowerCase().includes(q) || c.vendeur?.nom?.toLowerCase().includes(q);
    return ok && (filtStatut === "tous" || c.statut === filtStatut);
  });

  const stats = {
    total:    contrats.length,
    attente:  contrats.filter((c) => c.statut === "en_attente").length,
    asigner:  contrats.filter((c) => c.statut === "signe_vendeur").length,
    complet:  contrats.filter((c) => c.statut === "signe_complet").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pop { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .crow:hover { background:#EEF2FF !important; cursor:pointer; }
        .crow { transition: background .12s; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#059669", letterSpacing: ".14em" }}>ESPACE ACHETEUR</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Mes Contrats</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Consultez et signez vos contrats immobiliers</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
          {[
            { icon: "📋", label: "Total",         value: stats.total,   color: "#4F46E5" },
            { icon: "⏳", label: "En attente",    value: stats.attente, color: "#D97706" },
            { icon: "✍️", label: "À signer",      value: stats.asigner, color: "#4F46E5" },
            { icon: "✅", label: "Signés",         value: stats.complet, color: "#059669" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "20px 24px",
              boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alerte contrats à signer */}
        {stats.asigner > 0 && (
          <div style={{ background: "#EEF2FF", border: "1.5px solid #A5B4FC", borderRadius: 14,
            padding: "14px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>✍️</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#3730A3" }}>
                {stats.asigner} contrat{stats.asigner > 1 ? "s" : ""} en attente de votre signature
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#4F46E5" }}>
                Cliquez sur un contrat marqué "À signer" pour apposer votre signature électronique.
              </p>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 16,
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          boxShadow: "0 1px 10px rgba(15,23,42,.06)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par bien ou vendeur…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A",
                background: "#F8FAFF", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["tous",         "Tous"],
              ["en_attente",   "En attente"],
              ["signe_vendeur","À signer"],
              ["signe_complet","Signés"],
              ["annule",       "Annulés"],
            ].map(([v, l]) => (
              <button key={v} onClick={() => setFiltStatut(v)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${filtStatut === v ? "#059669" : "#E2E8F0"}`,
                background: filtStatut === v ? "#ECFDF5" : "transparent",
                color: filtStatut === v ? "#059669" : "#94A3B8", transition: "all .14s",
              }}>{l}</button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", cursor: "pointer", fontSize: 15 }}>🔄</button>
        </div>

        {/* Liste */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>

          {/* Header table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 140px 130px 110px",
            padding: "12px 24px", background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F0",
            fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
            <div>BIEN / VENDEUR</div><div>MONTANT</div><div>DATE</div><div>STATUT</div><div>ACTION</div>
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
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Vos contrats immobiliers apparaîtront ici</p>
            </div>
          )}

          {!loading && filtered.map((c, i) => {
            const img = c.bien?.images?.[0]?.url_image;
            const needsSign = c.statut === "signe_vendeur";
            return (
              <div key={c.id_contrat} className="crow" onClick={() => setSelected(c)} style={{
                display: "grid", gridTemplateColumns: "1fr 180px 140px 130px 110px",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
                background: needsSign ? "rgba(79,70,229,.02)" : "transparent",
              }}>

                {/* Bien + Vendeur */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 40, borderRadius: 10, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>🏠</div>
                    }
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      {c.bien?.titre || "—"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar nom={c.vendeur?.nom} prenom={c.vendeur?.prenom} size={18} />
                      <span style={{ fontSize: 11, color: "#64748B" }}>
                        {c.vendeur?.prenom} {c.vendeur?.nom}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Montant */}
                <div style={{ fontSize: 14, fontWeight: 800, color: "#4F46E5" }}>{fmt(c.montant)}</div>

                {/* Date */}
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  📅 {new Date(c.date_contrat).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </div>

                {/* Statut */}
                <div><Badge statut={c.statut} /></div>

                {/* Action */}
                <div>
                  {needsSign ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "6px 12px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                      background: "linear-gradient(135deg,#4F46E5,#0891B2)", color: "#fff",
                      boxShadow: "0 2px 8px rgba(79,70,229,.3)",
                    }}>
                      ✍️ Signer
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
                      Voir →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} contrat{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== contrats.length && ` sur ${contrats.length}`} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {selected && (
        <ContratModal
          contrat={selected}
          onClose={() => setSelected(null)}
          onSigned={handleSigned}
        />
      )}
    </div>
  );
}