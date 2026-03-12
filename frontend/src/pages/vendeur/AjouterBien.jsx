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
    titre: "",
    description: "",
    surface: "",
    prix: "",
    type_bien: "vente",
    nb_pieces: "",
    adresse: "",
    statut: "disponible",
    garage: false,
    piscine: false,
    jardin: false,
    meuble: false,
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
      file: f,
      name: f.name,
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
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError("");

    try {
      const user  = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      // ── 1️⃣ Envoyer le bien ──────────────────────────────────
      const response = await fetch("http://127.0.0.1:8000/api/biens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre:       form.titre,
          description: form.description,
          surface:     parseFloat(form.surface),
          prix:        parseFloat(form.prix),
          type_bien:   form.type_bien,
          nb_pieces:   parseInt(form.nb_pieces),
          statut:      form.statut,
          adresse:     form.adresse,
          id_vendeur:  user?.id_user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const laravelErrors = {};
          Object.keys(data.errors).forEach((key) => {
            laravelErrors[key] = data.errors[key][0];
          });
          setErrors(laravelErrors);
          setStep(1);
        } else {
          setApiError(data.message || "Une erreur est survenue");
        }
        setSubmitting(false);
        return;
      }

      const bienId = data.id_bien;
      console.log("✅ Bien créé avec id:", bienId);

      // ── 2️⃣ Envoyer les images ────────────────────────────────
      if (images.length > 0) {
        for (const img of images) {
          const formData = new FormData();
          formData.append("image", img.file);   // ✅ "image" = nom attendu par Laravel
          formData.append("id_bien", bienId);
          formData.append("description", img.name);

          const imgResponse = await fetch("http://127.0.0.1:8000/api/images", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
              // ⚠️ PAS de Content-Type ici — le browser le met automatiquement avec boundary
            },
            body: formData,
          });

          const imgData = await imgResponse.json();
          console.log("🖼️ Image response:", imgData);

          if (!imgResponse.ok) {
            console.error("❌ Erreur image:", imgData);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/vendeur/mes-biens"), 2000);

    } catch (err) {
      console.error("Erreur:", err);
      setApiError("Impossible de contacter le serveur. Vérifiez que Laravel tourne.");
    }

    setSubmitting(false);
  };

  const inp = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    onFocus: (e) => (e.target.style.borderColor = "#f59e0b"),
    onBlur:  (e) => (e.target.style.borderColor = errors[name] ? "#ef4444" : "#e2e8f0"),
    style: {
      width: "100%", padding: "12px 16px", borderRadius: 12,
      border: `1.5px solid ${errors[name] ? "#ef4444" : "#e2e8f0"}`,
      fontSize: 14, color: "#0f172a", outline: "none",
      fontFamily: "'DM Sans', sans-serif", background: "#fafafa",
      boxSizing: "border-box", transition: "border-color 0.2s",
    },
  });

  const Label = ({ children }) => (
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </label>
  );

  const Err = ({ name }) => errors[name]
    ? <span style={{ color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" }}>⚠ {errors[name]}</span>
    : null;

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingLeft: 260, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 24, padding: "60px 80px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 24px" }}>✅</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0f172a", margin: "0 0 10px" }}>Bien publié avec succès !</h2>
        <p style={{ color: "#64748b", fontSize: 15 }}>Redirection vers vos biens...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", paddingLeft: 260 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <main style={{ padding: "36px 40px", maxWidth: 860 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <button onClick={() => navigate("/vendeur/mes-biens")}
            style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 18, color: "#475569" }}>
            ←
          </button>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0f172a", margin: 0 }}>Ajouter un bien</h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>Remplissez les informations de votre bien immobilier</p>
          </div>
        </div>

        {/* Erreur API */}
        {apiError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "#dc2626", fontSize: 14, fontWeight: 500 }}>
            ❌ {apiError}
          </div>
        )}

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36, maxWidth: 500 }}>
          {[{ num: 1, label: "Informations" }, { num: 2, label: "Détails" }, { num: 3, label: "Images" }].map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                onClick={() => step > s.num && setStep(s.num)}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: step === s.num ? "linear-gradient(135deg, #f59e0b, #ef4444)" : step > s.num ? "#16a34a" : "#e2e8f0",
                  color: step >= s.num ? "#fff" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, transition: "all 0.3s",
                }}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span style={{ fontSize: 11, marginTop: 6, color: step === s.num ? "#f59e0b" : "#94a3b8", fontWeight: step === s.num ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <div style={{ height: 2, flex: 1, background: step > s.num ? "#16a34a" : "#e2e8f0", margin: "0 8px 22px", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a", margin: "0 0 28px" }}>Informations générales</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Titre de l'annonce *</Label>
                  <input {...inp("titre")} placeholder="Ex: Villa moderne avec piscine" />
                  <Err name="titre" />
                </div>
                <div>
                  <Label>Type de transaction *</Label>
                  <select {...inp("type_bien")} style={{ ...inp("type_bien").style, cursor: "pointer" }}>
                    <option value="vente">Vente</option>
                    <option value="location">Location</option>
                  </select>
                </div>
                <div>
                  <Label>Statut *</Label>
                  <select {...inp("statut")} style={{ ...inp("statut").style, cursor: "pointer" }}>
                    <option value="disponible">Disponible</option>
                    <option value="vendu">Vendu</option>
                    <option value="loue">Loué</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Adresse</Label>
                  <input {...inp("adresse")} placeholder="Ex: 12 Rue Hassan II, Casablanca" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Description *</Label>
                  <textarea {...inp("description")} placeholder="Décrivez votre bien..." rows={4}
                    style={{ ...inp("description").style, resize: "vertical", lineHeight: 1.6 }} />
                  <Err name="description" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a", margin: "0 0 28px" }}>Détails du bien</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <Label>Surface (m²) *</Label>
                  <input {...inp("surface")} type="number" placeholder="Ex: 150" />
                  <Err name="surface" />
                </div>
                <div>
                  <Label>Nombre de pièces *</Label>
                  <input {...inp("nb_pieces")} type="number" placeholder="Ex: 4" />
                  <Err name="nb_pieces" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Prix {form.type_bien === "location" ? "(MAD/mois)" : "(MAD)"} *</Label>
                  <input {...inp("prix")} type="number" placeholder="Ex: 850000" />
                  <Err name="prix" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Équipements</Label>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                    {[
                      { name: "garage",  label: "🚗 Garage"  },
                      { name: "piscine", label: "🏊 Piscine" },
                      { name: "jardin",  label: "🌿 Jardin"  },
                      { name: "meuble",  label: "🛋️ Meublé"  },
                    ].map((eq) => (
                      <label key={eq.name} style={{
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                        background: form[eq.name] ? "#fef3c7" : "#f8fafc",
                        border: `1.5px solid ${form[eq.name] ? "#f59e0b" : "#e2e8f0"}`,
                        borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 500,
                        transition: "all 0.2s",
                      }}>
                        <input type="checkbox" name={eq.name} checked={form[eq.name]} onChange={handleChange} style={{ display: "none" }} />
                        {eq.label}
                        {form[eq.name] && <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a", margin: "0 0 28px" }}>Photos du bien</h2>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#f59e0b" : "#cbd5e1"}`,
                  borderRadius: 16, padding: "48px 24px", textAlign: "center",
                  background: dragOver ? "#fef3c7" : "#fafafa",
                  cursor: "pointer", transition: "all 0.2s", marginBottom: 24,
                }}
              >
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }}
                  onChange={(e) => addImages(e.target.files)} />
                <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
                <p style={{ color: "#475569", fontWeight: 600, margin: "0 0 6px", fontSize: 15 }}>Glissez vos photos ici</p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  ou <span style={{ color: "#f59e0b", fontWeight: 600 }}>cliquez pour sélectionner</span> — JPG, PNG
                </p>
              </div>
              {images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
                  {images.map((img) => (
                    <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={(e) => { e.stopPropagation(); setImages((p) => p.filter((i) => i.id !== img.id)); }}
                        style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>
                        ✕
                      </button>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, padding: "4px 8px" }}>
                        {img.size} KB
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" }}>Aucune photo ajoutée (optionnel)</p>
              )}
            </div>
          )}

          {/* Boutons navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
            <button
              onClick={() => step > 1 ? setStep((s) => s - 1) : navigate("/vendeur/mes-biens")}
              style={{ padding: "12px 28px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {step === 1 ? "← Annuler" : "← Précédent"}
            </button>

            {step < 3 ? (
              <button onClick={goNext}
                style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Suivant →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: submitting ? "#94a3b8" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8 }}
              >
                {submitting ? "⏳ Publication..." : "✅ Publier le bien"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}