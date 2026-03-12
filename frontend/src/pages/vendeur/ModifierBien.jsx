import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ModifierBien() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileRef = useRef();

  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState("");
  const [images, setImages]       = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [dragOver, setDragOver]   = useState(false);

  const [form, setForm] = useState({
    titre: "", description: "", surface: "", prix: "",
    type_bien: "vente", nb_pieces: "", adresse: "",
    statut: "disponible", garage: false, piscine: false,
    jardin: false, meuble: false,
  });

  // ── Charger le bien existant ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          titre:       data.titre       || "",
          description: data.description || "",
          surface:     data.surface     || "",
          prix:        data.prix        || "",
          type_bien:   data.type_bien   || "vente",
          nb_pieces:   data.nb_pieces   || "",
          adresse:     data.adresse     || "",
          statut:      data.statut      || "disponible",
          garage:  data.garage  || false,
          piscine: data.piscine || false,
          jardin:  data.jardin  || false,
          meuble:  data.meuble  || false,
        });
        setImages(data.images || []);
      })
      .catch(() => setApiError("Impossible de charger le bien."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const addNewImages = (files) => {
    const imgs = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      file: f, name: f.name,
      size: (f.size / 1024).toFixed(1),
    }));
    setNewImages((p) => [...p, ...imgs]);
  };

  const deleteExistingImage = async (imgId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://127.0.0.1:8000/api/images/${imgId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      setImages((p) => p.filter((i) => i.id_image !== imgId));
    } catch { setApiError("Erreur lors de la suppression de l'image."); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setApiError("");

    // Validation
    const e = {};
    if (!form.titre.trim())       e.titre       = "Le titre est obligatoire";
    if (!form.description.trim()) e.description = "La description est obligatoire";
    if (!form.prix || +form.prix <= 0) e.prix   = "Prix invalide";
    if (!form.surface || +form.surface <= 0) e.surface = "Surface invalide";
    if (!form.nb_pieces || +form.nb_pieces <= 0) e.nb_pieces = "Nombre de pièces invalide";

    if (Object.keys(e).length) { setErrors(e); setSubmitting(false); return; }

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user"));

    try {
      // ── 1️⃣ Modifier le bien ──
      const res = await fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
        method: "PUT",
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

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const le = {};
          Object.keys(data.errors).forEach((k) => { le[k] = data.errors[k][0]; });
          setErrors(le);
        } else { setApiError(data.message || "Une erreur est survenue"); }
        setSubmitting(false); return;
      }

      // ── 2️⃣ Uploader les nouvelles images ──
      for (const img of newImages) {
        const fd = new FormData();
        fd.append("image", img.file);
        fd.append("id_bien", id);
        fd.append("description", img.name);
        await fetch("http://127.0.0.1:8000/api/images", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
          body: fd,
        });
      }

      setSuccess(true);
      setTimeout(() => navigate("/vendeur/mes-biens"), 2000);
    } catch { setApiError("Impossible de contacter le serveur."); }

    setSubmitting(false);
  };

  const inp = (name) => ({
    name, value: form[name], onChange: handleChange,
    style: {
      width: "100%", padding: "12px 16px", borderRadius: 12,
      border: `1.5px solid ${errors[name] ? "#ef4444" : "#e2e8f0"}`,
      fontSize: 14, color: "#0f172a", outline: "none",
      fontFamily: "'DM Sans', sans-serif", background: errors[name] ? "#fef2f2" : "#fafafa",
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
      <div style={{ background: "#fff", borderRadius: 24, padding: "60px 80px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 24px" }}>✅</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0f172a", margin: "0 0 10px" }}>Bien modifié avec succès !</h2>
        <p style={{ color: "#64748b", fontSize: 15 }}>Redirection vers vos biens...</p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingLeft: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Chargement du bien...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", paddingLeft: 260 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <main style={{ padding: "36px 40px", maxWidth: 860 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <button onClick={() => navigate("/vendeur/mes-biens")} style={{
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
            padding: "8px 14px", cursor: "pointer", fontSize: 18, color: "#475569",
          }}>←</button>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Modifier le bien
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
              Modifiez les informations de votre bien immobilier
            </p>
          </div>
        </div>

        {apiError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 20px", marginBottom: 24, color: "#dc2626", fontSize: 14, fontWeight: 500 }}>
            ❌ {apiError}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0f172a", margin: "0 0 24px" }}>
            Informations générales
          </h2>
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
              <textarea {...inp("description")} rows={4} placeholder="Décrivez votre bien..."
                style={{ ...inp("description").style, resize: "vertical", lineHeight: 1.6 }} />
              <Err name="description" />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0f172a", margin: "0 0 24px" }}>
            Détails du bien
          </h2>
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

        {/* Images existantes */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0f172a", margin: "0 0 24px" }}>
            Photos du bien
          </h2>

          {images.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>Photos actuelles :</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
                {images.map((img) => (
                  <div key={img.id_image} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <img src={`http://127.0.0.1:8000/storage/${img.url_image}`} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => deleteExistingImage(img.id_image)} style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(220,38,38,0.85)", color: "#fff",
                      border: "none", borderRadius: "50%", width: 26, height: 26,
                      cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>Ajouter de nouvelles photos :</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addNewImages(e.dataTransfer.files); }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? "#f59e0b" : "#cbd5e1"}`,
              borderRadius: 16, padding: "36px 24px", textAlign: "center",
              background: dragOver ? "#fef3c7" : "#fafafa",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
            }}
          >
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }}
              onChange={(e) => addNewImages(e.target.files)} />
            <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
            <p style={{ color: "#475569", fontWeight: 600, margin: "0 0 4px", fontSize: 14 }}>Glissez vos photos ici</p>
            <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
              ou <span style={{ color: "#f59e0b", fontWeight: 600 }}>cliquez pour sélectionner</span>
            </p>
          </div>

          {newImages.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
              {newImages.map((img) => (
                <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={(e) => { e.stopPropagation(); setNewImages((p) => p.filter((i) => i.id !== img.id)); }} style={{
                    position: "absolute", top: 6, right: 6,
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    border: "none", borderRadius: "50%", width: 24, height: 24,
                    cursor: "pointer", fontSize: 12,
                  }}>✕</button>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, padding: "4px 8px" }}>
                    {img.size} KB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button onClick={() => navigate("/vendeur/mes-biens")} style={{
            padding: "13px 28px", borderRadius: 12, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>← Annuler</button>

          <button onClick={handleSubmit} disabled={submitting} style={{
            padding: "13px 36px", borderRadius: 12, border: "none",
            background: submitting ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #ef4444)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: submitting ? "none" : "0 4px 14px rgba(245,158,11,0.35)",
          }}>
            {submitting ? "⏳ Enregistrement..." : "✅ Enregistrer les modifications"}
          </button>
        </div>
      </main>
    </div>
  );
}