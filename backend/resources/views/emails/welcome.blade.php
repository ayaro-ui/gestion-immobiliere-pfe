<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a5f, #4F46E5); padding: 50px 30px; text-align: center; }
    .header h1 { color: white; margin: 0 0 8px; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.8); margin: 0; font-size: 15px; }
    .body { padding: 40px 36px; }
    .body h2 { color: #0f172a; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #475569; font-size: 15px; line-height: 1.8; margin: 0 0 14px; }
    .role-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px; margin: 10px 0 20px; }
    .features { background: #f8faff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
    .features h3 { color: #0f172a; font-size: 16px; margin: 0 0 16px; }
    .feature-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .feature-item span { color: #475569; font-size: 14px; }
    .btn { display: block; width: fit-content; margin: 24px auto; padding: 16px 40px; background: linear-gradient(135deg, #4F46E5, #0891B2); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; }
    .footer { background: #f8faff; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">

    <div class="header">
      <h1>🏠 ImmoExpert</h1>
      <p>Plateforme de gestion immobilière au Maroc</p>
    </div>

    <div class="body">
      <h2>Bienvenue {{ $user->prenom }} {{ $user->nom }} ! 🎉</h2>

      <p>Votre compte a été créé avec succès. Nous sommes ravis de vous accueillir sur <strong>ImmoExpert</strong>.</p>

      @if($user->id_role == 2)
        <div class="role-badge" style="background:#EEF2FF; color:#4F46E5;">🏡 Compte Vendeur</div>
        <div class="features">
          <h3>Avec votre compte vendeur vous pouvez :</h3>
          <div class="feature-item"><span>✅ Publier et gérer vos biens immobiliers</span></div>
          <div class="feature-item"><span>✅ Recevoir des demandes de clients intéressés</span></div>
          <div class="feature-item"><span>✅ Créer et gérer vos contrats</span></div>
          <div class="feature-item"><span>✅ Suivre vos paiements et transactions</span></div>
        </div>
      @elseif($user->id_role == 3)
        <div class="role-badge" style="background:#ECFDF5; color:#059669;">🤝 Compte Client</div>
        <div class="features">
          <h3>Avec votre compte client vous pouvez :</h3>
          <div class="feature-item"><span>✅ Explorer tous les biens disponibles</span></div>
          <div class="feature-item"><span>✅ Contacter les vendeurs directement</span></div>
          <div class="feature-item"><span>✅ Sauvegarder vos biens favoris</span></div>
          <div class="feature-item"><span>✅ Suivre vos contrats et paiements</span></div>
        </div>
      @else
        <div class="role-badge" style="background:#FEF3C7; color:#D97706;">⚙️ Compte Administrateur</div>
      @endif

      <p>Vous pouvez dès maintenant vous connecter et commencer à utiliser la plateforme.</p>

      <a href="http://localhost:5173/login" class="btn">
        🚀 Accéder à ImmoExpert
      </a>

      <p style="font-size:13px; color:#94a3b8; text-align:center;">
        📧 {{ $user->email }}
      </p>
    </div>

    <div class="footer">
      <p>© 2026 <strong>ImmoExpert</strong> — Tous droits réservés</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>

  </div>
</body>
</html>