import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const STEPS = [
  { num: 1, label: "Bien" },
  { num: 2, label: "Parties" },
  { num: 3, label: "Contrat" },
  { num: 4, label: "Résumé" },
  { num: 5, label: "Signature" },
];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
      {STEPS.map((s, i) => {
        const done = s.num < current, active = s.num === current;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans',sans-serif", fontWeight: "700", fontSize: 13,
                background: done ? "#c8a96e" : active ? "#0f1e35" : "white",
                color: done || active ? "white" : "#9ca3af",
                border: done || active ? "none" : "1px solid rgba(200,169,110,0.25)",
                transition: "all .3s",
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s.num}
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: active ? "#c8a96e" : done ? "#0f1e35" : "#c4bfb8" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: "0 12px", marginBottom: 28, background: done ? "#c8a96e" : "rgba(200,169,110,0.15)", transition: "background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Avatar({ nom, prenom, size = 38 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * .35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

function SignatureCanvas({ onSigned, onClear, signed }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
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
    ctx.strokeStyle = "#0f1e35";
    ctx.lineWidth = 2;
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
        border: `1px dashed ${signed ? "#c8a96e" : "rgba(200,169,110,0.3)"}`,
        overflow: "hidden", background: signed ? "white" : "#fdfcfa",
        position: "relative", transition: "all .2s",
      }}>
        {!signed && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", pointerEvents: "none", flexDirection: "column", gap: 8,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,110,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8", fontWeight: 500 }}>Signez ici</span>
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
          background: "none", border: "1px solid rgba(200,169,110,0.25)",
          padding: "7px 16px", color: "#6b7280", fontFamily: "'DM Sans',sans-serif",
          fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
        }}>Effacer</button>
        {signed && (
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0f6e56", fontWeight: 700 }}>
            Signature capturée
          </span>
        )}
      </div>
    </div>
  );
}

function BienCard({ bien, selected, onSelect }) {
  const img = bien.images?.[0]?.url_image;
  return (
    <div onClick={() => onSelect(bien)} style={{
      overflow: "hidden", cursor: "pointer", background: "#fff",
      border: `1px solid ${selected ? "#c8a96e" : "rgba(200,169,110,0.15)"}`,
      boxShadow: selected ? "0 4px 20px rgba(200,169,110,0.2)" : "0 2px 12px rgba(10,20,40,0.05)",
      transform: selected ? "translateY(-3px)" : "none", transition: "all .2s",
    }}>
      <div style={{ height: 140, background: "#f8f7f4", position: "relative", overflow: "hidden" }}>
        {img
          ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt={bien.titre} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,40,0.6) 0%, transparent 50%)" }} />
        <div style={{
          position: "absolute", top: 0, left: 0,
          background: bien.type_bien === "vente" ? "#0f1e35" : "#c8a96e",
          color: "white", padding: "4px 12px",
          fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
        }}>
          {bien.type_bien === "vente" ? "Vente" : "Location"}
        </div>
        {selected && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#c8a96e", borderRadius: "50%",
            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 10, left: 12 }}>
          <p style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "white", fontSize: 16, lineHeight: 1 }}>
            {fmt(bien.prix)}
          </p>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p style={{ margin: "0 0 3px", fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "#0f1e35",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bien.titre}</p>
        <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>
          {bien.surface}m² · {bien.nb_pieces} pièces
        </p>
      </div>
    </div>
  );
}

function UserCard({ user, selected, onSelect }) {
  return (
    <div onClick={() => onSelect(user)} style={{
      padding: "14px 16px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 12,
      border: `1px solid ${selected ? "#c8a96e" : "rgba(200,169,110,0.15)"}`,
      background: selected ? "#faf8f4" : "white",
      boxShadow: selected ? "0 2px 12px rgba(200,169,110,0.15)" : "none",
      transition: "all .15s",
    }}>
      <Avatar nom={user.nom} prenom={user.prenom} size={38} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "#0f1e35" }}>
          {user.prenom} {user.nom}
        </p>
        <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
      </div>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
  );
}

const inpStyle = (err) => ({
  width: "100%", padding: "13px 16px",
  border: `1px solid ${err ? "rgba(220,38,38,0.3)" : "rgba(200,169,110,0.25)"}`,
  fontSize: 14, color: "#0f1e35", background: err ? "#fff8f8" : "#fdfcfa",
  boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", outline: "none",
  transition: "border-color .2s",
});

export default function CreerContrat() {
  const navigate = useNavigate();
  const location  = useLocation();

  const [step, setStep]       = useState(1);
  const [biens, setBiens]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [bienSel, setBienSel]         = useState(null);
  const [vendeurSel, setVendeurSel]   = useState(null);
  const [acheteurSel, setAcheteurSel] = useState(null);

  const [montant, setMontant]         = useState("");
  const [dateContrat, setDateContrat] = useState(new Date().toISOString().slice(0, 10));
  const [pdfFile, setPdfFile]         = useState(null);

  const [sBien, setSBien] = useState("");
  const [sA, setSA]       = useState("");

  const [submitting, setSubmitting]       = useState(false);
  const [signing, setSigning]             = useState(false);
  const [errors, setErrors]               = useState({});
  const [success, setSuccess]             = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [signErr, setSignErr]             = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    setLoading(true);
    if (currentUser?.id_user) setVendeurSel(currentUser);
    axios.get("/contrats/form-data")
      .then(({ data }) => {
        setBiens(Array.isArray(data?.biens) ? data.biens : []);
        setUsers(Array.isArray(data?.utilisateurs) ? data.utilisateurs : Array.isArray(data?.users) ? data.users : []);
        if (location.state?.bien) { const b = location.state.bien; setBienSel(b); setMontant(String(b.prix || "")); }
        if (location.state?.acheteur) setAcheteurSel(location.state.acheteur);
        if (location.state?.bien && location.state?.acheteur) setStep(3);
      })
      .catch(() => setLoadErr("Impossible de charger les données depuis l'API."))
      .finally(() => setLoading(false));
  }, []);

  const pickBien = (b) => { setBienSel(b); setMontant(String(b.prix || "")); };

  const canNext = () => {
    if (step === 1) return !!bienSel;
    if (step === 2) return !!vendeurSel && !!acheteurSel && vendeurSel.id_user !== acheteurSel.id_user;
    if (step === 3) return !!montant && parseFloat(montant) > 0 && !!dateContrat;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("id_bien",      bienSel.id_bien);
      fd.append("id_vendeur",   vendeurSel.id_user);
      fd.append("id_acheteur",  acheteurSel.id_user);
      fd.append("montant",      montant);
      fd.append("date_contrat", dateContrat);
      fd.append("statut",       "en_attente");
      if (pdfFile) fd.append("fichier_pdf", pdfFile);
      const { data } = await axios.post("/contrats", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(data); setStep(5);
    } catch (err) {
      const e = err.response?.data?.errors || {};
      if (err.response?.data?.message) e.global = err.response.data.message;
      setErrors(e);
    } finally { setSubmitting(false); }
  };

  const handleSign = async () => {
    if (!signatureData) { setSignErr("Veuillez signer avant de continuer."); return; }
    setSigning(true); setSignErr("");
    try {
      await axios.put(`/contrats/${success.id_contrat}/signer`, { role: "vendeur", signature: signatureData });
      setStep(6);
    } catch { setSignErr("Erreur lors de l'enregistrement de la signature."); }
    finally { setSigning(false); }
  };

  const reset = () => {
    setStep(1); setBienSel(null); setVendeurSel(null); setAcheteurSel(null);
    setMontant(""); setPdfFile(null); setSuccess(null); setErrors({});
    setSignatureData(null); setSignErr("");
  };

  const fBiens = (biens ?? []).filter((b) => b?.titre?.toLowerCase().includes(sBien.toLowerCase()));
  const fAchet = (users ?? []).filter((u) =>
    u?.id_role === 3 &&
    `${u?.nom ?? ""} ${u?.prenom ?? ""} ${u?.email ?? ""}`.toLowerCase().includes(sA.toLowerCase()) &&
    (!vendeurSel || u.id_user !== vendeurSel.id_user));

  const SectionTitle = ({ title, sub }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ width: 28, height: 2, background: "#c8a96e", marginBottom: 10 }} />
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>{title}</h2>
      {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>{sub}</p>}
    </div>
  );

  const SearchBox = ({ val, set, ph }) => (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        style={{ ...inpStyle(false), paddingLeft: 36 }} />
    </div>
  );

  const LabelField = ({ children }) => (
    <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>
      {children}
    </label>
  );

  const NavRow = ({ showPrev = true, nextLabel = "Suivant →", nextClick = () => setStep(s => s + 1), nextDisabled = !canNext() }) => (
    <div style={{ display: "flex", justifyContent: showPrev ? "space-between" : "flex-end",
      marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(200,169,110,0.1)" }}>
      {showPrev && (
        <button onClick={() => setStep(s => s - 1)} style={{
          padding: "14px 32px", background: "transparent", color: "#6b7280",
          border: "1px solid rgba(200,169,110,0.25)", fontFamily: "'DM Sans',sans-serif",
          fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s",
        }}>← Précédent</button>
      )}
      <button onClick={nextClick} disabled={nextDisabled} style={{
        padding: "14px 40px", background: nextDisabled ? "#f0ede8" : "#c8a96e",
        color: nextDisabled ? "#c4bfb8" : "white", border: "none",
        fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: "2px", textTransform: "uppercase",
        cursor: nextDisabled ? "not-allowed" : "pointer", transition: "all .2s",
      }}
        onMouseEnter={e => !nextDisabled && (e.currentTarget.style.background = "#b8955a")}
        onMouseLeave={e => !nextDisabled && (e.currentTarget.style.background = "#c8a96e")}
      >{nextLabel}</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #c8a96e !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.3); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=90" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 110px" }}>
          <button onClick={() => navigate("/vendeur/contrats")}
            style={{ background: "none", border: "none", color: "rgba(200,169,110,0.7)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 18, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
            ← Retour
          </button>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", marginBottom: 10, display: "block" }}>
            Espace vendeur
          </span>
          <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
            Créer un contrat
          </h1>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 100px" }}>

        {loadErr && (
          <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", padding: "14px 20px", marginBottom: 28, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
            {loadErr}
          </div>
        )}

        {/* ── Card principale ── */}
        <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 4px 32px rgba(10,20,40,0.06)" }}>

          {/* En-tête avec stepper */}
          <div style={{ padding: "36px 44px 0", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
            {step <= 5 && <StepBar current={step} />}
          </div>

          <div style={{ padding: "36px 44px 40px" }} className="fade-up">

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>Chargement des données...</p>
              </div>

            ) : step === 1 ? (
              <div>
                <SectionTitle title="Choisir le bien" sub="Sélectionnez un bien disponible dans votre portefeuille" />
                <SearchBox val={sBien} set={setSBien} ph="Rechercher un bien..." />
                {fBiens.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#c4bfb8" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px", display: "block" }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucun bien disponible</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14, maxHeight: 440, overflowY: "auto" }}>
                    {fBiens.map((b) => <BienCard key={b.id_bien} bien={b} selected={bienSel?.id_bien === b.id_bien} onSelect={pickBien} />)}
                  </div>
                )}
                <NavRow showPrev={false} />
              </div>

            ) : step === 2 ? (
              <div>
                <SectionTitle title="Parties du contrat" sub="Le vendeur est rempli automatiquement — choisissez l'acheteur" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

                  {/* Vendeur */}
                  <div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#c8a96e", marginBottom: 12 }}>
                      Vendeur — vous
                    </div>
                    <div style={{ padding: "16px", border: "1px solid #c8a96e", background: "#faf8f4", display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>
                          {vendeurSel?.prenom} {vendeurSel?.nom}
                        </p>
                        <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>{vendeurSel?.email}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", marginTop: 8, fontStyle: "italic" }}>
                      Rempli automatiquement depuis votre compte
                    </p>
                  </div>

                  {/* Acheteur */}
                  <div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 12 }}>
                      Acheteur — clients uniquement
                    </div>
                    <SearchBox val={sA} set={setSA} ph="Rechercher un client..." />
                    {fAchet.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#c4bfb8" }}>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0 }}>Aucun client trouvé</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                        {fAchet.map((u) => (
                          <UserCard key={u.id_user} user={u} selected={acheteurSel?.id_user === u.id_user} onSelect={setAcheteurSel} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <NavRow />
              </div>

            ) : step === 3 ? (
              <div>
                <SectionTitle title="Informations du contrat" sub="Montant et date d'entrée en vigueur" />

                {/* Mini récap bien */}
                <div style={{ background: "#0f1e35", padding: "16px 20px", marginBottom: 28, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 56, height: 44, overflow: "hidden", flexShrink: 0, background: "#1a2d4a" }}>
                    {bienSel?.images?.[0]?.url_image
                      ? <img src={`http://127.0.0.1:8000/storage/${bienSel.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(200,169,110,0.4)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white" }}>{bienSel?.titre}</p>
                    <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{bienSel?.surface}m² · {bienSel?.nb_pieces} pièces</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={26} />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,110,0.5)" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <Avatar nom={acheteurSel?.nom} prenom={acheteurSel?.prenom} size={26} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 560 }}>
                  <div>
                    <LabelField>Montant (MAD) *</LabelField>
                    <input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)}
                      placeholder="Ex : 850 000" style={inpStyle(errors.montant)} />
                    {errors.montant && <span style={{ fontFamily: "'DM Sans',sans-serif", color: "#dc2626", fontSize: 11, marginTop: 4, display: "block" }}>{errors.montant[0]}</span>}
                  </div>
                  <div>
                    <LabelField>Date du contrat *</LabelField>
                    <input type="date" value={dateContrat} onChange={(e) => setDateContrat(e.target.value)} style={inpStyle(errors.date_contrat)} />
                    {errors.date_contrat && <span style={{ fontFamily: "'DM Sans',sans-serif", color: "#dc2626", fontSize: 11, marginTop: 4, display: "block" }}>{errors.date_contrat[0]}</span>}
                  </div>
                </div>

                {errors.global && (
                  <div style={{ marginTop: 20, background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", padding: "12px 16px", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                    {errors.global}
                  </div>
                )}
                <NavRow nextLabel="Voir le résumé →" nextClick={() => setStep(4)} />
              </div>

            ) : step === 4 ? (
              <div>
                <SectionTitle title="Confirmer le contrat" sub="Vérifiez les informations avant d'enregistrer" />

                {/* Grande carte récap */}
                <div style={{ border: "1px solid rgba(200,169,110,0.15)", overflow: "hidden", marginBottom: 24 }}>
                  <div style={{ height: 160, position: "relative", overflow: "hidden", background: "#0f1e35" }}>
                    {bienSel?.images?.[0]?.url_image
                      ? <img src={`http://127.0.0.1:8000/storage/${bienSel.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                      : null}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,40,0.9), rgba(10,20,40,0.4))" }} />
                    <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                      <p style={{ margin: "0 0 4px", fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "white" }}>{bienSel?.titre}</p>
                      <div style={{ display: "inline-block", background: bienSel?.type_bien === "vente" ? "#0f1e35" : "#c8a96e", color: "white", padding: "3px 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                        {bienSel?.type_bien === "vente" ? "Vente" : "Location"}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                      {[
                        { label: "Vendeur",  value: `${vendeurSel?.prenom} ${vendeurSel?.nom}`,   sub: vendeurSel?.email },
                        { label: "Acheteur", value: `${acheteurSel?.prenom} ${acheteurSel?.nom}`, sub: acheteurSel?.email },
                        { label: "Montant",  value: fmt(montant), gold: true },
                        { label: "Date",     value: new Date(dateContrat).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) },
                        { label: "Document", value: pdfFile ? pdfFile.name : "Aucun fichier joint" },
                      ].map((r) => (
                        <div key={r.label} style={{ borderLeft: "2px solid rgba(200,169,110,0.2)", paddingLeft: 14 }}>
                          <p style={{ margin: "0 0 4px", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{r.label}</p>
                          <p style={{ margin: 0, fontFamily: r.gold ? "'Cormorant Garamond',serif" : "'DM Sans',sans-serif", fontSize: r.gold ? 20 : 13, fontWeight: 700, color: r.gold ? "#c8a96e" : "#0f1e35" }}>{r.value}</p>
                          {r.sub && <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>{r.sub}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <NavRow
                  nextLabel={submitting ? "Enregistrement..." : "Créer le contrat →"}
                  nextClick={handleSubmit}
                  nextDisabled={submitting}
                />
              </div>

            ) : step === 5 ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#0f1e35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ width: 28, height: 1, background: "#c8a96e", margin: "0 auto 14px" }} />
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#0f1e35", margin: "0 0 8px" }}>Signature du vendeur</h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>
                    Contrat N° {String(success?.id_contrat || "").padStart(5, "0")} — signez pour valider
                  </p>
                </div>

                {/* Mini récap */}
                <div style={{ background: "#0f1e35", padding: "14px 20px", marginBottom: 24, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white" }}>{bienSel?.titre}</p>
                    <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c8a96e" }}>{fmt(montant)}</p>
                  </div>
                  <div style={{ width: 1, height: 36, background: "rgba(200,169,110,0.2)" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={28} />
                    <div>
                      <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Vendeur</p>
                      <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "white" }}>{vendeurSel?.prenom} {vendeurSel?.nom}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Avatar nom={acheteurSel?.nom} prenom={acheteurSel?.prenom} size={28} />
                    <div>
                      <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Acheteur</p>
                      <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "white" }}>{acheteurSel?.prenom} {acheteurSel?.nom}</p>
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{ background: "rgba(200,169,110,0.15)", color: "#c8a96e", border: "1px solid rgba(200,169,110,0.3)", padding: "4px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                      En attente
                    </span>
                  </div>
                </div>

                {/* Canvas signature */}
                <div style={{ background: "white", border: "1px solid rgba(200,169,110,0.15)", padding: "24px", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={36} />
                    <div>
                      <p style={{ margin: "0 0 2px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#0f1e35" }}>{vendeurSel?.prenom} {vendeurSel?.nom}</p>
                      <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>Signature électronique du vendeur</p>
                    </div>
                  </div>
                  <SignatureCanvas onSigned={setSignatureData} onClear={() => setSignatureData(null)} signed={!!signatureData} />
                </div>

                {/* Info acheteur */}
                <div style={{ background: "#faf8f4", border: "1px solid rgba(200,169,110,0.2)", padding: "14px 18px", marginBottom: 20 }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    Après votre signature, <strong style={{ color: "#0f1e35" }}>{acheteurSel?.prenom} {acheteurSel?.nom}</strong> devra se connecter pour signer à son tour.
                  </p>
                </div>

                {signErr && (
                  <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", padding: "12px 16px", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 16 }}>
                    {signErr}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid rgba(200,169,110,0.1)" }}>
                  <button onClick={() => navigate("/vendeur/contrats")} style={{
                    padding: "14px 28px", background: "transparent", color: "#6b7280",
                    border: "1px solid rgba(200,169,110,0.25)", fontFamily: "'DM Sans',sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
                  }}>Signer plus tard</button>
                  <button onClick={handleSign} disabled={!signatureData || signing} style={{
                    padding: "14px 40px",
                    background: !signatureData || signing ? "#f0ede8" : "#c8a96e",
                    color: !signatureData || signing ? "#c4bfb8" : "white",
                    border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: "2px", textTransform: "uppercase",
                    cursor: !signatureData || signing ? "not-allowed" : "pointer", transition: "all .2s",
                  }}>
                    {signing ? "Enregistrement..." : "Valider la signature"}
                  </button>
                </div>
              </div>

            ) : step === 6 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 28px" }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)" }} />
                  <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "#0f1e35", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
                <div style={{ width: 32, height: 1, background: "#c8a96e", margin: "0 auto 16px" }} />
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#0f1e35", margin: "0 0 8px" }}>Contrat signé</h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 14, margin: "0 0 4px" }}>
                  N° {String(success?.id_contrat || "").padStart(5, "0")} — {bienSel?.titre}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#c8a96e", fontSize: 20, fontWeight: 700, margin: "0 0 32px" }}>{fmt(montant)}</p>

                {/* Statut signatures */}
                <div style={{ display: "inline-flex", gap: 0, border: "1px solid rgba(200,169,110,0.15)", marginBottom: 36, overflow: "hidden" }}>
                  <div style={{ padding: "14px 24px", borderRight: "1px solid rgba(200,169,110,0.15)" }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Vendeur</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#0f6e56" }}>Signé</div>
                  </div>
                  <div style={{ padding: "14px 24px" }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Acheteur</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#c8a96e" }}>En attente</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                  <button onClick={reset} style={{ padding: "14px 28px", background: "white", color: "#0f1e35", border: "1px solid rgba(200,169,110,0.25)", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                    + Nouveau contrat
                  </button>
                  <button onClick={() => navigate("/vendeur/contrats")} style={{ padding: "14px 36px", background: "#c8a96e", color: "white", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                    Voir les contrats →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}