<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0f172a; background: #fff; }

    .header { background: #0f172a; color: #fff; padding: 28px 36px; }
    .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
    .header p  { font-size: 11px; color: #94a3b8; }

    .body { padding: 28px 36px; }

    .section-title {
      font-size: 11px; font-weight: bold; color: #4F46E5;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin: 20px 0 8px;
    }

    .box {
      background: #f8faff; border: 1px solid #e2e8f0;
      border-radius: 6px; padding: 14px 16px;
    }

    .bien-titre  { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
    .bien-detail { font-size: 11px; color: #64748b; }

    .parties { display: table; width: 100%; border-collapse: collapse; }
    .partie  { display: table-cell; width: 50%; padding-right: 12px; }
    .partie:last-child { padding-right: 0; padding-left: 12px; }

    .partie-label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
    .partie-nom   { font-size: 14px; font-weight: bold; color: #0f172a; }
    .partie-email { font-size: 11px; color: #94a3b8; margin-top: 2px; }

    .montant-box {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 6px; padding: 14px 16px;
    }
    .montant-value { font-size: 24px; font-weight: bold; color: #064e3b; }
    .montant-label { font-size: 11px; color: #059669; margin-bottom: 4px; }
    .montant-date  { font-size: 11px; color: #64748b; margin-top: 6px; }

    .clauses { background: #f8faff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; }
    .clause  { font-size: 10.5px; color: #475569; line-height: 1.7; margin-bottom: 2px; }

    .signatures { display: table; width: 100%; border-collapse: collapse; margin-top: 8px; }
    .sig-box {
      display: table-cell; width: 50%;
      border: 1px solid #e2e8f0; border-radius: 6px;
      padding: 12px 14px; background: #f8faff;
    }
    .sig-box:first-child { margin-right: 8px; }
    .sig-label { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
    .sig-img   { max-width: 100%; height: 60px; object-fit: contain; }
    .sig-ok    { font-size: 10px; color: #059669; font-weight: bold; margin-top: 6px; }
    .sig-wait  { font-size: 10px; color: #d97706; font-weight: bold; margin-top: 20px; }

    .separator { border: none; border-top: 1px solid #e2e8f0; margin: 18px 0; }

    .footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #f1f5f9; padding: 8px 36px;
      font-size: 9px; color: #94a3b8;
      display: flex; justify-content: space-between;
    }

    .badge {
      display: inline-block; background: #ecfdf5; color: #059669;
      border: 1px solid #6ee7b7; border-radius: 20px;
      padding: 3px 12px; font-size: 10px; font-weight: bold;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div class="header">
    <h1>CONTRAT IMMOBILIER</h1>
    <p>
      N° {{ str_pad($contrat->id_contrat, 5, '0', STR_PAD_LEFT) }}
      &nbsp;·&nbsp; {{ $contrat->bien->titre ?? '—' }}
      &nbsp;·&nbsp; Généré le {{ now()->format('d/m/Y') }}
    </p>
  </div>

  <div class="body">

    <span class="badge">✓ CONTRAT ENREGISTRÉ</span>

    <!-- Bien immobilier -->
    <div class="section-title">🏠 Bien Immobilier</div>
    <div class="box">
      <div class="bien-titre">{{ $contrat->bien->titre ?? '—' }}</div>
      <div class="bien-detail">
        Surface : {{ $contrat->bien->surface ?? '—' }} m²
        &nbsp;·&nbsp; Pièces : {{ $contrat->bien->nb_pieces ?? '—' }}
        &nbsp;·&nbsp; Type : {{ $contrat->bien->type_bien === 'vente' ? 'Vente' : 'Location' }}
        @if($contrat->bien->adresse)
          &nbsp;·&nbsp; {{ $contrat->bien->adresse }}
        @endif
      </div>
    </div>

    <hr class="separator">

    <!-- Parties -->
    <div class="section-title">👥 Parties du contrat</div>
    <table style="width:100%; border-collapse:separate; border-spacing: 0 0;">
      <tr>
        <td style="width:50%; padding-right:8px;">
          <div class="box">
            <div class="partie-label">Vendeur / Propriétaire</div>
            <div class="partie-nom">{{ $contrat->vendeur->prenom ?? '' }} {{ $contrat->vendeur->nom ?? '—' }}</div>
            <div class="partie-email">{{ $contrat->vendeur->email ?? '' }}</div>
            @if($contrat->vendeur->telephone)
              <div class="partie-email">{{ $contrat->vendeur->telephone }}</div>
            @endif
          </div>
        </td>
        <td style="width:50%; padding-left:8px;">
          <div class="box">
            <div class="partie-label">Acheteur / Locataire</div>
            <div class="partie-nom">{{ $contrat->acheteur->prenom ?? '' }} {{ $contrat->acheteur->nom ?? '—' }}</div>
            <div class="partie-email">{{ $contrat->acheteur->email ?? '' }}</div>
            @if($contrat->acheteur->telephone)
              <div class="partie-email">{{ $contrat->acheteur->telephone }}</div>
            @endif
          </div>
        </td>
      </tr>
    </table>

    <hr class="separator">

    <!-- Montant -->
    <div class="section-title">💰 Détails financiers</div>
    <div class="montant-box">
      <div class="montant-label">Montant total</div>
      <div class="montant-value">
        {{ number_format($contrat->montant, 0, ',', ' ') }} MAD
      </div>
      <div class="montant-date">
        Date du contrat :
        {{ \Carbon\Carbon::parse($contrat->date_contrat)->isoFormat('D MMMM YYYY') }}
      </div>
    </div>

    <hr class="separator">

    <!-- Clauses -->
    <div class="section-title">📋 Conditions générales</div>
    <div class="clauses">
      <div class="clause">1. Le vendeur garantit être le seul propriétaire du bien et avoir le droit de le vendre ou louer.</div>
      <div class="clause">2. L'acheteur/locataire reconnaît avoir visité le bien et l'accepter en l'état.</div>
      <div class="clause">3. Le paiement du montant convenu sera effectué selon les modalités agréées entre les parties.</div>
      <div class="clause">4. Tout litige sera soumis à la juridiction compétente du ressort du lieu du bien.</div>
      <div class="clause">5. Le présent contrat est régi par la législation marocaine en vigueur.</div>
    </div>

    <hr class="separator">

    <!-- Signatures -->
    <div class="section-title">✍️ Signatures électroniques</div>
    <table style="width:100%; border-collapse:separate; border-spacing:0;">
      <tr>
        <td style="width:50%; padding-right:8px; vertical-align:top;">
          <div class="box">
            <div class="sig-label">Signature du vendeur</div>
            @if($contrat->signature_vendeur)
              <img src="{{ $contrat->signature_vendeur }}" class="sig-img" alt="Signature vendeur" />
              <div class="sig-ok">✓ Signé électroniquement</div>
            @else
              <div class="sig-wait">⏳ En attente</div>
            @endif
          </div>
        </td>
        <td style="width:50%; padding-left:8px; vertical-align:top;">
          <div class="box">
            <div class="sig-label">Signature de l'acheteur</div>
            @if($contrat->signature_acheteur)
              <img src="{{ $contrat->signature_acheteur }}" class="sig-img" alt="Signature acheteur" />
              <div class="sig-ok">✓ Signé électroniquement</div>
            @else
              <div class="sig-wait">⏳ En attente</div>
            @endif
          </div>
        </td>
      </tr>
    </table>

  </div>

  <!-- Pied de page -->
  <div class="footer">
    <span>Ce document a été généré automatiquement par la Plateforme de Gestion Immobilière.</span>
    <span>Contrat N° {{ str_pad($contrat->id_contrat, 5, '0', STR_PAD_LEFT) }}</span>
  </div>

</body>
</html>