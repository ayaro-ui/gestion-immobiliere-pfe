import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ModifierBien() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileRef = useRef();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [apiError, setApiError]     = useState("");
  const [images, setImages]         = useState([]);
  const [newImages, setNewImages]   = useState([]);
  const [dragOver, setDragOver]     = useState(false);

  const [form, setForm] = useState({
    titre: "", description: "", surface: "", prix: "",
    type_bien: "vente", nb_pieces: "", adresse: "",
    statut: "disponible", garage: false, piscine: false,
    jardin: false, meuble: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          titre: data.titre || "", description: data.description || "",
          surface: data.surface || "", prix: data.prix || "",
          type_bien: data.type_bien || "vente", nb_pieces: data.nb_pieces || "",
          adresse: data.adresse || "", statut: data.statut || "disponible",
          garage: data.garage || false, piscine: data.piscine || false,
          jardin: data.jardin || false, meuble: data.meuble || false,
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
      url: URL.createObjectURL(f), file: f,
      name: f.name, size: (f.size / 1024).toFixed(1),
    }));
    setNewImages((p) => [...p, ...imgs]);
  };

  const deleteExistingImage = async (imgId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://127.0.0.1:8000/api/images/${imgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setImages((p) => p.filter((i) => i.id_image !== imgId));
    } catch { setApiError("Erreur lors de la suppression de l'image."); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setApiError("");
    const e = {};
    if (!form.titre.trim())       e.titre       = "Le titre est obligatoire";
    if (!form.description.trim()) e.description = "La description est obligatoire";
    if (!form.prix || +form.prix <= 0)       e.prix     = "Prix invalide";
    if (!form.surface || +form.surface <= 0) e.surface  = "Surface invalide";
    if (!form.nb_pieces || +form.nb_pieces <= 0) e.nb_pieces = "Nombre de pièces invalide";
    if (Object.keys(e).length) { setErrors(e); setSubmitting(false); return; }

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titre: form.titre, description: form.description,
          surface: parseFloat(form.surface), prix: parseFloat(form.prix),
          type_bien: form.type_bien, nb_pieces: parseInt(form.nb_pieces),
          statut: form.statut, adresse: form.adresse, id_vendeur: user?.id_user,
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
      for (const img of newImages) {
        const fd = new FormData();
        fd.append("image", img.file); fd.append("id_bien", id); fd.append("description", img.name);
        await fetch("http://127.0.0.1:8000/api/images", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          body: fd,
        });
      }
      setSuccess(true);
      setTimeout(() => navigate("/vendeur/mes-biens"), 2000);
    } catch { setApiError("Impossible de contacter le serveur."); }
    setSubmitting(false);
  };

  // ── Shared input style ──
  const inputStyle = (name) => ({
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: `1px solid ${errors[name] ? "#ef4444" : "rgba(200,169,110,0.25)"}`,
    fontSize: 13, color: "#0f1e35", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    background: errors[name] ? "#fef2f2" : "#fdfcfa",
    boxSizing: "border-box", transition: "border-color 0.2s",
  });

  const Label = ({ children }) => (
    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#9ca3af", marginBottom: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>
      {children}
    </label>
  );

  const Err = ({ name }) => errors[name]
    ? <span style={{ color: "#ef4444", fontSize: 11, marginTop: 5, display: "block", fontFamily: "'DM Sans',sans-serif" }}>⚠ {errors[name]}</span>
    : null;

  const Card = ({ children, style = {} }) => (
    <div style={{ background: "white", borderRadius: 24, padding: "32px 36px", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)", marginBottom: 20, ...style }}>
      {children}
    </div>
  );

  const CardTitle = ({ children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 10 }} />
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#0f1e35", margin: 0 }}>
        {children}
      </h2>
    </div>
  );

  // ── Success screen ──
  if (success) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ background: "white", borderRadius: 28, padding: "60px 80px", textAlign: "center", border: "1px solid rgba(200,169,110,0.2)", boxShadow: "0 20px 60px rgba(10,20,40,0.12)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0f1e35", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#0f1e35", margin: "0 0 10px" }}>Bien modifié avec succès</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>Redirection vers vos biens...</p>
      </div>
    </div>
  );

  // ── Loading screen ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement du bien...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        input:focus, textarea:focus, select:focus { border-color: #c8a96e !important; outline: none; }
        input::placeholder, textarea::placeholder { color: #c4bfb8; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: 72, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Espace vendeur
            </span>
            <h1 style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>
              Modifier le bien
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Mettez à jour les informations de votre annonce
            </p>
          </div>
          <button
            onClick={() => navigate("/vendeur/mes-biens")}
            style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 40px 80px" }} className="fade-up">

        {/* API Error */}
        {apiError && (
          <div style={{ background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#991b1b", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
            {apiError}
          </div>
        )}

        {/* ── Informations générales ── */}
        <Card>
          <CardTitle>Informations générales</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Titre de l'annonce *</Label>
              <input name="titre" value={form.titre} onChange={handleChange}
                placeholder="Ex: Villa moderne avec piscine" style={inputStyle("titre")} />
              <Err name="titre" />
            </div>
            <div>
              <Label>Type de transaction *</Label>
              <select name="type_bien" value={form.type_bien} onChange={handleChange}
                style={{ ...inputStyle("type_bien"), cursor: "pointer" }}>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div>
              <Label>Statut *</Label>
              <select name="statut" value={form.statut} onChange={handleChange}
                style={{ ...inputStyle("statut"), cursor: "pointer" }}>
                <option value="disponible">Disponible</option>
                <option value="vendu">Vendu</option>
                <option value="loue">Loué</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Adresse</Label>
              <input name="adresse" value={form.adresse} onChange={handleChange}
                placeholder="Ex: 12 Rue Hassan II, Casablanca" style={inputStyle("adresse")} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Description *</Label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4} placeholder="Décrivez votre bien..."
                style={{ ...inputStyle("description"), resize: "vertical", lineHeight: 1.7 }} />
              <Err name="description" />
            </div>
          </div>
        </Card>

        {/* ── Détails du bien ── */}
        <Card>
          <CardTitle>Détails du bien</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <Label>Surface (m²) *</Label>
              <input name="surface" value={form.surface} onChange={handleChange}
                type="number" placeholder="Ex: 150" style={inputStyle("surface")} />
              <Err name="surface" />
            </div>
            <div>
              <Label>Nombre de pièces *</Label>
              <input name="nb_pieces" value={form.nb_pieces} onChange={handleChange}
                type="number" placeholder="Ex: 4" style={inputStyle("nb_pieces")} />
              <Err name="nb_pieces" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Prix {form.type_bien === "location" ? "(MAD/mois)" : "(MAD)"} *</Label>
              <input name="prix" value={form.prix} onChange={handleChange}
                type="number" placeholder="Ex: 850000" style={inputStyle("prix")} />
              <Err name="prix" />
            </div>

            {/* Équipements */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Label>Équipements</Label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                {[
                  { name: "garage",  label: "Garage",  icon: "🚗" },
                  { name: "piscine", label: "Piscine",  icon: "🏊" },
                  { name: "jardin",  label: "Jardin",   icon: "🌿" },
                  { name: "meuble",  label: "Meublé",   icon: "🛋️" },
                ].map((eq) => (
                  <label key={eq.name} style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    background: form[eq.name] ? "#0f1e35" : "#fdfcfa",
                    border: `1px solid ${form[eq.name] ? "#c8a96e" : "rgba(200,169,110,0.25)"}`,
                    borderRadius: 99, padding: "9px 18px",
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600,
                    color: form[eq.name] ? "#c8a96e" : "#9ca3af",
                    transition: "all 0.2s", letterSpacing: "0.3px",
                  }}>
                    <input type="checkbox" name={eq.name} checked={form[eq.name]} onChange={handleChange} style={{ display: "none" }} />
                    <span>{eq.icon}</span>
                    {eq.label}
                    {form[eq.name] && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Photos ── */}
        <Card>
          <CardTitle>Photos du bien</CardTitle>

          {/* Existing images */}
          {images.length > 0 && (
            <>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>
                Photos actuelles
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                {images.map((img) => (
                  <div key={img.id_image} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(200,169,110,0.15)", boxShadow: "0 2px 12px rgba(10,20,40,0.08)" }}>
                    <img src={`http://127.0.0.1:8000/storage/${img.url_image}`} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => deleteExistingImage(img.id_image)} style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(8,16,34,0.75)", color: "white",
                      border: "1px solid rgba(200,169,110,0.3)", borderRadius: "50%",
                      width: 26, height: 26, cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(4px)",
                    }}>×</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Drop zone */}
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 12 }}>
            Ajouter de nouvelles photos
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addNewImages(e.dataTransfer.files); }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `1px dashed ${dragOver ? "#c8a96e" : "rgba(200,169,110,0.35)"}`,
              borderRadius: 18, padding: "40px 24px", textAlign: "center",
              background: dragOver ? "rgba(200,169,110,0.05)" : "#fdfcfa",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
            }}
          >
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }}
              onChange={(e) => addNewImages(e.target.files)} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0f1e35", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#0f1e35", margin: "0 0 4px" }}>
              Glissez vos photos ici
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>
              ou <span style={{ color: "#c8a96e", fontWeight: 700 }}>cliquez pour sélectionner</span>
            </p>
          </div>

          {/* New images preview */}
          {newImages.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {newImages.map((img) => (
                <div key={img.id} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(200,169,110,0.2)", boxShadow: "0 2px 12px rgba(10,20,40,0.08)" }}>
                  <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={(e) => { e.stopPropagation(); setNewImages((p) => p.filter((i) => i.id !== img.id)); }} style={{
                    position: "absolute", top: 6, right: 6,
                    background: "rgba(8,16,34,0.75)", color: "white",
                    border: "1px solid rgba(200,169,110,0.3)", borderRadius: "50%",
                    width: 26, height: 26, cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}>×</button>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(8,16,34,0.75), transparent)", color: "rgba(200,169,110,0.9)", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, padding: "8px 10px" }}>
                    {img.size} KB
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Actions ── */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            onClick={() => navigate("/vendeur/mes-biens")}
            style={{ padding: "13px 28px", borderRadius: 14, border: "1px solid rgba(200,169,110,0.25)", background: "white", color: "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.5px", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.25)"}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: "13px 36px", borderRadius: 14, border: "none", background: submitting ? "#9ca3af" : "#0f1e35", color: submitting ? "white" : "#c8a96e", fontSize: 12, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", letterSpacing: "1px", textTransform: "uppercase", boxShadow: submitting ? "none" : "0 4px 20px rgba(15,30,53,0.3)", transition: "all .2s", display: "flex", alignItems: "center", gap: 10 }}
          >
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Enregistrement...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Vendeur</span>
      </div>
    </div>
  );
}