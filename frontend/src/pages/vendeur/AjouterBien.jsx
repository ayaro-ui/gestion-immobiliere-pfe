import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AjouterBien() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    titre: "", description: "", surface: "", prix: "",
    type_bien: "vente", nb_pieces: "", adresse: "",
    statut: "disponible", garage: false, piscine: false, jardin: false, meuble: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const addImages = (files) => {
    const newImgs = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      file: f, name: f.name,
      size: (f.size / 1024).toFixed(1),
    }));
    setImages((p) => [...p, ...newImgs]);
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre est obligatoire";
    if (!form.description.trim()) e.description = "La description est obligatoire";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.prix || isNaN(form.prix) || +form.prix <= 0) e.prix = "Prix invalide";
    if (!form.surface || isNaN(form.surface) || +form.surface <= 0) e.surface = "Surface invalide";
    if (!form.nb_pieces || isNaN(form.nb_pieces) || +form.nb_pieces <= 0) e.nb_pieces = "Nombre de pièces invalide";
    return e;
  };

  const goNext = () => {
    if (step === 1) { const e = validateStep1(); if (Object.keys(e).length) { setErrors(e); return; } }
    if (step === 2) { const e = validateStep2(); if (Object.keys(e).length) { setErrors(e); return; } }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setApiError("");
    try {
      const user  = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/biens", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          titre: form.titre, description: form.description,
          surface: parseFloat(form.surface), prix: parseFloat(form.prix),
          type_bien: form.type_bien, nb_pieces: parseInt(form.nb_pieces),
          statut: form.statut, adresse: form.adresse, id_vendeur: user?.id_user,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) { const le = {}; Object.keys(data.errors).forEach((k) => { le[k] = data.errors[k][0]; }); setErrors(le); setStep(1); }
        else { setApiError(data.message || "Une erreur est survenue"); }
        setSubmitting(false); return;
      }
      const bienId = data.id_bien;
      if (images.length > 0) {
        for (const img of images) {
          const fd = new FormData();
          fd.append("image", img.file); fd.append("id_bien", bienId); fd.append("description", img.name);
          await fetch("http://127.0.0.1:8000/api/images", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
            body: fd,
          });
        }
      }
      setSuccess(true);
      setTimeout(() => navigate("/vendeur/mes-biens"), 2500);
    } catch { setApiError("Impossible de contacter le serveur."); }
    setSubmitting(false);
  };

  const STEPS = [
    { num: 1, label: "Informations" },
    { num: 2, label: "Détails" },
    { num: 3, label: "Photos" },
  ];

  const LabelField = ({ children }) => (
    <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: "700", color: "#9ca3af", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
      {children}
    </label>
  );

  const ErrMsg = ({ name }) => errors[name]
    ? <span style={{ fontFamily: "'DM Sans',sans-serif", color: "#dc2626", fontSize: "11px", marginTop: "5px", display: "block" }}>{errors[name]}</span>
    : null;

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)" }} />
          <div style={{ position: "absolute", inset: "8px", borderRadius: "50%", background: "#0f1e35", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <div style={{ width: "32px", height: "1px", background: "#c8a96e", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#0f1e35", margin: "0 0 10px" }}>Bien publié avec succès</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: "14px", margin: 0 }}>Redirection vers vos biens...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .aj-input {
          width: 100%; padding: 13px 16px;
          border: 1px solid rgba(200,169,110,0.25);
          border-radius: 2px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #0f1e35; background: #fdfcfa;
          outline: none; transition: all 0.2s;
        }
        .aj-input:focus { border-color: #c8a96e; background: white; }
        .aj-input::placeholder { color: #c4bfb8; }
        .aj-input.err { border-color: rgba(220,38,38,0.4); background: #fff8f8; }

        .btn-gold {
          padding: 15px 40px; background: #c8a96e; color: white; border: none;
          border-radius: 2px; font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-gold:hover:not(:disabled) { background: #b8955a; transform: translateY(-2px); }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          padding: 15px 32px; background: transparent; color: #6b7280;
          border: 1px solid rgba(200,169,110,0.25); border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #c8a96e; color: #0f1e35; }

        .equip-tag {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          padding: 12px 20px; font-size: 13px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: all 0.2s; border-radius: 2px;
          border: 1px solid rgba(200,169,110,0.2);
        }
        .equip-tag.on  { background: #0f1e35; color: white; border-color: #0f1e35; }
        .equip-tag.off { background: #fdfcfa; color: #6b7280; }
        .equip-tag.off:hover { border-color: #c8a96e; color: #0f1e35; background: white; }

        .drop-zone {
          border: 1px dashed rgba(200,169,110,0.4);
          border-radius: 2px; padding: 52px 24px; text-align: center;
          cursor: pointer; transition: all 0.2s; background: #fdfcfa;
        }
        .drop-zone:hover, .drop-zone.over { border-color: #c8a96e; background: white; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 110px" }}>
          <button onClick={() => navigate("/vendeur/mes-biens")}
            style={{ background: "none", border: "none", color: "rgba(200,169,110,0.7)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }}>
            ← Retour
          </button>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", marginBottom: "10px", display: "block" }}>
            Espace vendeur
          </span>
          <h1 style={{ color: "white", fontSize: "40px", fontWeight: "700", lineHeight: 1.1, margin: 0 }}>
            Ajouter un bien
          </h1>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "70px", background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      {/* ── CONTENU CENTRÉ ── */}
      <main style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px 100px" }}>

        {apiError && (
          <div style={{ background: "#fef2f2", border: "1px solid rgba(220,38,38,0.2)", padding: "14px 20px", marginBottom: "32px", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>
            {apiError}
          </div>
        )}

        {/* ── Stepper ── */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div onClick={() => step > s.num && setStep(s.num)}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: step > s.num ? "pointer" : "default" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: step > s.num ? "#c8a96e" : step === s.num ? "#0f1e35" : "white",
                  border: step >= s.num ? "none" : "1px solid rgba(200,169,110,0.25)",
                  color: step >= s.num ? "white" : "#9ca3af",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: "700",
                  transition: "all 0.3s", flexShrink: 0,
                }}>
                  {step > s.num
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : s.num}
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: step === s.num ? "#c8a96e" : step > s.num ? "#6b7280" : "#c4bfb8" }}>
                    Étape {s.num}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "15px", fontWeight: "700", color: step === s.num ? "#0f1e35" : step > s.num ? "#6b7280" : "#c4bfb8" }}>
                    {s.label}
                  </div>
                </div>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: "1px", background: step > s.num ? "#c8a96e" : "rgba(200,169,110,0.15)", margin: "0 16px", transition: "background 0.4s" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Card formulaire ── */}
        <div className="fade-up" style={{ background: "white", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 4px 32px rgba(10,20,40,0.06)" }}>

          {/* En-tête */}
          <div style={{ padding: "28px 36px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
            <div style={{ width: "28px", height: "2px", background: "#c8a96e", marginBottom: "10px" }} />
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f1e35", margin: "0 0 4px" }}>
              {step === 1 ? "Informations générales" : step === 2 ? "Détails du bien" : "Photos du bien"}
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#9ca3af", margin: 0 }}>
              {step === 1 ? "Titre, description et localisation" : step === 2 ? "Surface, prix et équipements" : "Valorisez votre annonce avec des photos"}
            </p>
          </div>

          {/* Corps */}
          <div style={{ padding: "32px 36px" }}>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <LabelField>Titre de l'annonce *</LabelField>
                  <input className={`aj-input${errors.titre ? " err" : ""}`} name="titre" value={form.titre} onChange={handleChange} placeholder="Ex : Villa moderne avec piscine à Marrakech" />
                  <ErrMsg name="titre" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <LabelField>Type de transaction</LabelField>
                    <select className="aj-input" name="type_bien" value={form.type_bien} onChange={handleChange} style={{ cursor: "pointer" }}>
                      <option value="vente">Vente</option>
                      <option value="location">Location</option>
                    </select>
                  </div>
                  <div>
                    <LabelField>Statut</LabelField>
                    <select className="aj-input" name="statut" value={form.statut} onChange={handleChange} style={{ cursor: "pointer" }}>
                      <option value="disponible">Disponible</option>
                      <option value="vendu">Vendu</option>
                      <option value="loue">Loué</option>
                    </select>
                  </div>
                </div>

                <div>
                  <LabelField>Adresse</LabelField>
                  <input className="aj-input" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Ex : 12 Rue Hassan II, Casablanca" />
                </div>

                <div>
                  <LabelField>Description *</LabelField>
                  <textarea className={`aj-input${errors.description ? " err" : ""}`} name="description" value={form.description} onChange={handleChange}
                    placeholder="Décrivez votre bien en détail : emplacement, état, atouts..." rows={5}
                    style={{ resize: "vertical", lineHeight: "1.65" }} />
                  <ErrMsg name="description" />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <LabelField>Surface (m²) *</LabelField>
                    <input className={`aj-input${errors.surface ? " err" : ""}`} name="surface" value={form.surface} onChange={handleChange} type="number" placeholder="Ex : 150" />
                    <ErrMsg name="surface" />
                  </div>
                  <div>
                    <LabelField>Nombre de pièces *</LabelField>
                    <input className={`aj-input${errors.nb_pieces ? " err" : ""}`} name="nb_pieces" value={form.nb_pieces} onChange={handleChange} type="number" placeholder="Ex : 4" />
                    <ErrMsg name="nb_pieces" />
                  </div>
                </div>

                <div>
                  <LabelField>Prix {form.type_bien === "location" ? "(MAD / mois)" : "(MAD)"} *</LabelField>
                  <input className={`aj-input${errors.prix ? " err" : ""}`} name="prix" value={form.prix} onChange={handleChange} type="number" placeholder="Ex : 850 000" />
                  <ErrMsg name="prix" />
                </div>

                <div>
                  <LabelField>Équipements</LabelField>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      { name: "garage",  label: "Garage"  },
                      { name: "piscine", label: "Piscine" },
                      { name: "jardin",  label: "Jardin"  },
                      { name: "meuble",  label: "Meublé"  },
                    ].map((eq) => (
                      <label key={eq.name} className={`equip-tag ${form[eq.name] ? "on" : "off"}`}>
                        <input type="checkbox" name={eq.name} checked={form[eq.name]} onChange={handleChange} style={{ display: "none" }} />
                        {form[eq.name] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        {eq.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Récap visuel */}
                {(form.surface || form.prix || form.nb_pieces) && (
                  <div style={{ background: "#0f1e35", padding: "20px 24px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
                    {form.surface && (
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>Surface</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: "700", color: "#c8a96e" }}>{form.surface} m²</div>
                      </div>
                    )}
                    {form.nb_pieces && (
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>Pièces</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: "700", color: "#c8a96e" }}>{form.nb_pieces}</div>
                      </div>
                    )}
                    {form.prix && (
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>Prix</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "22px", fontWeight: "700", color: "#c8a96e" }}>{Number(form.prix).toLocaleString()} MAD</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div
                  className={`drop-zone${dragOver ? " over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
                  onClick={() => fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => addImages(e.target.files)} />
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: "700", color: "#0f1e35", margin: "0 0 6px" }}>
                    Glissez vos photos ici
                  </p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                    ou <span style={{ color: "#c8a96e", fontWeight: "600" }}>cliquez pour sélectionner</span> — JPG, PNG
                  </p>
                </div>

                {images.length > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af" }}>
                        {images.length} photo{images.length > 1 ? "s" : ""} sélectionnée{images.length > 1 ? "s" : ""}
                      </span>
                      <button onClick={() => setImages([])}
                        style={{ background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#c8a96e", cursor: "pointer", padding: 0 }}>
                        Tout supprimer
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                      {images.map((img) => (
                        <div key={img.id} style={{ position: "relative", aspectRatio: "1", border: "1px solid rgba(200,169,110,0.2)", overflow: "hidden" }}>
                          <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={(e) => { e.stopPropagation(); setImages((p) => p.filter((i) => i.id !== img.id)); }}
                            style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(8,16,34,0.75)", color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ✕
                          </button>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(8,16,34,0.6)", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: "10px", padding: "4px 8px" }}>
                            {img.size} KB
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {images.length === 0 && (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#c4bfb8", fontSize: "13px", textAlign: "center", marginTop: "14px" }}>
                    Aucune photo ajoutée (optionnel)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div style={{ padding: "24px 36px 32px", borderTop: "1px solid rgba(200,169,110,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn-ghost" onClick={() => step > 1 ? setStep((s) => s - 1) : navigate("/vendeur/mes-biens")}>
              {step === 1 ? "Annuler" : "← Précédent"}
            </button>
            {step < 3
              ? <button className="btn-gold" onClick={goNext}>Suivant →</button>
              : <button className="btn-gold" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Publication..." : "Publier le bien"}
                </button>
            }
          </div>
        </div>
      </main>
    </div>
  );
}