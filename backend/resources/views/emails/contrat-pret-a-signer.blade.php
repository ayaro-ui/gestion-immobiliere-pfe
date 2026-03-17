<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrat prêt à signer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #f5f0eb;
      padding: 48px 16px;
    }
    .wrapper { max-width: 520px; margin: 0 auto; }
    .card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(10,20,40,.08);
      border: 1px solid #ece8df;
    }

    /* ── Header ── */
    .header {
      background: #0f1e35;
      padding: 40px 44px 36px;
      position: relative; overflow: hidden;
    }
    .header::before {
      content: ''; position: absolute;
      top: -60px; right: -60px;
      width: 180px; height: 180px;
      border-radius: 50%;
      border: 1px solid rgba(200,169,110,.12);
    }
    .header::after {
      content: ''; position: absolute;
      top: -30px; right: -30px;
      width: 100px; height: 100px;
      border-radius: 50%;
      border: 1px solid rgba(200,169,110,.08);
    }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 8px;
      background: rgba(200,169,110,.12);
      border: 1px solid rgba(200,169,110,.25);
      display: flex; align-items: center; justify-content: center;
    }
    .brand-name {
      font-size: 13px; font-weight: 700;
      color: #fff; letter-spacing: 2.5px; text-transform: uppercase;
    }
    .gold-line { width: 28px; height: 2px; background: #c8a96e; margin-bottom: 16px; }
    .header-tag {
      font-size: 10px; font-weight: 700;
      color: rgba(200,169,110,.6);
      text-transform: uppercase; letter-spacing: 3px;
      margin-bottom: 12px; display: block;
    }
    .header-title {
      font-size: 24px; font-weight: 700;
      color: #fff; line-height: 1.3;
      font-family: Georgia, serif;
    }
    .header-title span { color: #c8a96e; }
    .header-sub {
      font-size: 13px; color: rgba(255,255,255,.4);
      margin-top: 10px; line-height: 1.6;
    }

    /* ── Body ── */
    .body { padding: 40px 44px; }
    .intro {
      font-size: 14px; color: #555; line-height: 1.85;
      padding-bottom: 28px; margin-bottom: 28px;
      border-bottom: 1px solid #f0ece5;
    }

    /* ── Carte contrat ── */
    .contrat-card {
      background: #fdfaf5;
      border: 1px solid rgba(200,169,110,.2);
      border-left: 3px solid #c8a96e;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .contrat-label {
      font-size: 9px; font-weight: 700;
      color: rgba(200,169,110,.7);
      text-transform: uppercase; letter-spacing: 2px;
      margin-bottom: 10px; display: block;
    }
    .contrat-titre {
      font-size: 16px; font-weight: 700;
      color: #0f1e35; margin-bottom: 6px;
      font-family: Georgia, serif;
    }
    .contrat-vendeur {
      font-size: 12px; color: #888;
      display: flex; align-items: center; gap: 6px;
    }

    /* ── Alerte ── */
    .alert-box {
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
      border-left: 3px solid #3b82f6;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 32px;
      font-size: 13px; color: #1e3a5f; line-height: 1.65;
    }
    .alert-box strong { color: #0f1e35; }

    /* ── Séparateur ── */
    .sep { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
    .sep-line { flex: 1; height: 1px; background: #f0ece5; }
    .sep-dot { width: 5px; height: 5px; border-radius: 50%; background: #c8a96e; opacity: .5; }

    /* ── CTA ── */
    .cta { text-align: center; margin-bottom: 28px; }
    .cta-btn {
      display: inline-block;
      background: #c8a96e; color: #0f1e35;
      text-decoration: none;
      padding: 15px 48px; border-radius: 10px;
      font-size: 13px; font-weight: 700; letter-spacing: 1px;
      box-shadow: 0 4px 18px rgba(200,169,110,.35);
    }
    .cta-sub { font-size: 11px; color: #aaa; margin-top: 10px; }

    /* ── Email ── */
    .email-row {
      display: flex; align-items: center;
      justify-content: center; gap: 8px;
      padding-top: 24px; border-top: 1px solid #f0ece5;
      font-size: 12px; color: #aaa;
    }
    .email-row strong { color: #0f1e35; font-weight: 600; }

    /* ── Footer ── */
    .footer {
      background: #f8f6f2; padding: 20px 44px;
      border-top: 1px solid #ece8df;
      display: flex; justify-content: space-between; align-items: center; gap: 16px;
    }
    .footer-brand { font-size: 11px; font-weight: 700; color: #c8a96e; letter-spacing: 2px; text-transform: uppercase; }
    .footer-copy { font-size: 10px; color: #bbb; text-align: right; line-height: 1.8; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="brand-name">ImmoExpert</span>
      </div>
      <div class="gold-line"></div>
      <span class="header-tag">Signature requise</span>
      <div class="header-title">
        Votre signature<br>
        <span>est attendue</span>
      </div>
      <p class="header-sub">Bonjour {{ $acheteur->prenom }} {{ $acheteur->nom }}, un contrat attend votre signature.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <p class="intro">
        Le vendeur <strong>{{ $vendeur->prenom }} {{ $vendeur->nom }}</strong> a signé le contrat immobilier.
        Il ne manque plus que <strong>votre signature</strong> pour finaliser la transaction.
      </p>

      <!-- Détails contrat -->
      <div class="contrat-card">
        <span class="contrat-label">Contrat N° {{ str_pad($contrat->id_contrat, 5, '0', STR_PAD_LEFT) }}</span>
        <div class="contrat-titre">{{ $contrat->bien->titre ?? 'Bien immobilier' }}</div>
        <div class="contrat-vendeur">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Vendeur : {{ $vendeur->prenom }} {{ $vendeur->nom }}
        </div>
      </div>

      <!-- Info -->
      <div class="alert-box">
        Connectez-vous à la plateforme ImmoExpert et rendez-vous dans
        <strong>Mes Contrats</strong> pour apposer votre signature électronique.
      </div>

      <div class="sep">
        <div class="sep-line"></div>
        <div class="sep-dot"></div>
        <div class="sep-line"></div>
      </div>

      <!-- CTA -->
      <div class="cta">
        <a href="http://localhost:5173/client/mes-contrats" class="cta-btn">
          Signer le contrat
        </a>
        <div class="cta-sub">Accédez à vos contrats · Signature sécurisée</div>
      </div>

      <div class="email-row">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        <strong>{{ $acheteur->email }}</strong>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="footer-brand">ImmoExpert</span>
      <span class="footer-copy">
        © 2026 ImmoExpert · Tous droits réservés<br>
        Email automatique — merci de ne pas répondre
      </span>
    </div>

  </div>
</div>
</body>
</html>