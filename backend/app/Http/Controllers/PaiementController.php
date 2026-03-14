<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Transaction;
use App\Models\Contrat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaiementController extends Controller
{
    public function index(): JsonResponse
    {
        $paiements = Paiement::with([
            'contrat:id_contrat,montant,statut,id_bien,id_vendeur,id_acheteur',
            'contrat.bien:id_bien,titre,type_bien',
            'contrat.vendeur:id_user,nom,prenom',
            'contrat.acheteur:id_user,nom,prenom',
        ])->orderByDesc('date_paiement')->get();

        return response()->json($paiements);
    }

    public function byAcheteur(int $id): JsonResponse
    {
        $paiements = Paiement::with([
            'contrat:id_contrat,montant,statut,id_bien,id_vendeur,id_acheteur',
            'contrat.bien:id_bien,titre,type_bien',
            'contrat.vendeur:id_user,nom,prenom',
            'contrat.acheteur:id_user,nom,prenom',
        ])
        ->whereHas('contrat', fn($q) => $q->where('id_acheteur', $id))
        ->orderByDesc('date_paiement')
        ->get();

        return response()->json($paiements);
    }

    public function byVendeur(int $id): JsonResponse
    {
        $paiements = Paiement::with([
            'contrat:id_contrat,montant,statut,id_bien,id_vendeur,id_acheteur',
            'contrat.bien:id_bien,titre,type_bien',
            'contrat.vendeur:id_user,nom,prenom',
            'contrat.acheteur:id_user,nom,prenom',
        ])
        ->whereHas('contrat', fn($q) => $q->where('id_vendeur', $id))
        ->orderByDesc('date_paiement')
        ->get();

        return response()->json($paiements);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_paiement' => 'required|date',
            'montant'       => 'required|numeric|min:1',
            'mode_paiement' => 'required|string|max:50',
            'id_contrat'    => 'required|exists:contrat,id_contrat',
        ]);

        $paiement = Paiement::create($validated);

        // ── Créer automatiquement une transaction ──
        $contrat = Contrat::with('bien')->find($validated['id_contrat']);

        if ($contrat && $contrat->bien) {
            Transaction::create([
                'type_transaction' => $contrat->bien->type_bien ?? 'vente',
                'montant'          => $validated['montant'],
                'date_transaction' => $validated['date_paiement'],
                'description'      => "Paiement via {$validated['mode_paiement']} — {$contrat->bien->titre}",
                'id_bien'          => $contrat->id_bien,
                'id_client'        => $contrat->id_acheteur,
                'id_proprietaire'  => $contrat->id_vendeur,
            ]);
        }
        // ──────────────────────────────────────────

        return response()->json(
            $paiement->load('contrat.bien', 'contrat.vendeur', 'contrat.acheteur'),
            201
        );
    }

    public function show($id): JsonResponse
    {
        return response()->json(Paiement::findOrFail($id));
    }

    public function update(Request $request, $id): JsonResponse
    {
        $paiement = Paiement::findOrFail($id);
        $paiement->update($request->all());
        return response()->json($paiement);
    }

    public function destroy(int $id): JsonResponse
    {
        Paiement::findOrFail($id)->delete();
        return response()->json(['message' => 'Paiement supprimé.']);
    }
}