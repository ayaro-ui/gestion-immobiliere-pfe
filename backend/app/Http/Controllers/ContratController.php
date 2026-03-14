<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use App\Models\BienImmobilier;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class ContratController extends Controller
{
    // ── GET /api/contrats ─────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        return response()->json(
            Contrat::with(['bien.images', 'vendeur', 'acheteur'])
                   ->orderByDesc('id_contrat')
                   ->get()
        );
    }

    // ── POST /api/contrats ────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_bien'      => 'required|exists:bien_immobilier,id_bien',
            'id_vendeur'   => 'required|exists:utilisateur,id_user',
            'id_acheteur'  => 'required|exists:utilisateur,id_user|different:id_vendeur',
            'montant'      => 'required|numeric|min:1',
            'date_contrat' => 'required|date',
            'statut'       => 'nullable|in:en_attente,signe_vendeur,signe_complet,annule',
        ]);

        $validated['statut'] = $validated['statut'] ?? 'en_attente';

        $contrat = Contrat::create($validated);

        return response()->json(
            $contrat->load(['bien.images', 'vendeur', 'acheteur']),
            201
        );
    }

    // ── GET /api/contrats/{id} ────────────────────────────────────────────────
    public function show($id): JsonResponse
    {
        return response()->json(
            Contrat::with(['bien.images', 'vendeur', 'acheteur'])->findOrFail($id)
        );
    }

    // ── PUT /api/contrats/{id} ────────────────────────────────────────────────
    public function update(Request $request, $id): JsonResponse
    {
        $contrat   = Contrat::findOrFail($id);

        $validated = $request->validate([
            'statut'       => 'sometimes|in:en_attente,signe_vendeur,signe_complet,annule',
            'montant'      => 'sometimes|numeric|min:1',
            'date_contrat' => 'sometimes|date',
            'id_bien'      => 'sometimes|exists:bien_immobilier,id_bien',
            'id_vendeur'   => 'sometimes|exists:utilisateur,id_user',
            'id_acheteur'  => 'sometimes|exists:utilisateur,id_user',
        ]);

        $contrat->update($validated);

        return response()->json(
            $contrat->load(['bien.images', 'vendeur', 'acheteur'])
        );
    }

    // ── DELETE /api/contrats/{id} ─────────────────────────────────────────────
    public function destroy($id): JsonResponse
    {
        $contrat = Contrat::findOrFail($id);

        if ($contrat->fichier_pdf) {
            Storage::disk('public')->delete($contrat->fichier_pdf);
        }

        $contrat->delete();

        return response()->json(null, 204);
    }

    // ── GET /api/contrats/form-data ───────────────────────────────────────────
    public function formData(): JsonResponse
    {
        return response()->json([
            'biens' => BienImmobilier::with(['images', 'vendeur'])
                                     ->whereIn('statut', ['disponible', 'reserve', 'vendu'])
                                     ->get(),
            'utilisateurs' => Utilisateur::select('id_user', 'nom', 'prenom', 'email', 'telephone', 'id_role')
                                          ->orderBy('nom')
                                          ->get(),
        ]);
    }

    // ── PUT /api/contrats/{id}/signer ─────────────────────────────────────────
    public function signer(Request $request, int $id): JsonResponse
    {
        $contrat = Contrat::findOrFail($id);

        $request->validate([
            'role'      => 'required|in:vendeur,acheteur',
            'signature' => 'required|string',
        ]);

        if ($request->role === 'vendeur') {

            if (in_array($contrat->statut, ['signe_vendeur', 'signe_complet'])) {
                return response()->json(['message' => 'Le vendeur a déjà signé ce contrat.'], 422);
            }

            $contrat->signature_vendeur = $request->signature;
            $contrat->statut            = 'signe_vendeur';
            $contrat->save();

        } else {

            if ($contrat->statut !== 'signe_vendeur') {
                return response()->json(['message' => 'Le vendeur doit signer en premier.'], 422);
            }

            $contrat->signature_acheteur = $request->signature;
            $contrat->statut             = 'signe_complet';
            $contrat->save();

            // ── Mettre à jour le statut du bien ──────────────────────────────
            $bien = BienImmobilier::find($contrat->id_bien);
            if ($bien) {
                $bien->statut = $bien->type_bien === 'location' ? 'loue' : 'vendu';
                $bien->save();
            }

            // ── Générer le PDF automatiquement ───────────────────────────────
            $contrat->load(['bien.images', 'vendeur', 'acheteur']);

            try {
                $pdf      = Pdf::loadView('contrats.pdf', ['contrat' => $contrat]);
                $filename = 'contrats/contrat_' . $contrat->id_contrat . '.pdf';
                Storage::disk('public')->put($filename, $pdf->output());
                $contrat->fichier_pdf = $filename;
                $contrat->save();
            } catch (\Exception $e) {
                // PDF non bloquant — le contrat est quand même signé
                \Log::error('PDF generation failed: ' . $e->getMessage());
            }
        }

        return response()->json(
            $contrat->load(['bien.images', 'vendeur', 'acheteur'])
        );
    }

    // ── GET /api/contrats/vendeur/{id_vendeur} ────────────────────────────────
    public function byVendeur(int $id_vendeur): JsonResponse
    {
        return response()->json(
            Contrat::with(['bien.images', 'vendeur', 'acheteur'])
                   ->where('id_vendeur', $id_vendeur)
                   ->orderByDesc('id_contrat')
                   ->get()
        );
    }

    // ── GET /api/contrats/acheteur/{id_acheteur} ──────────────────────────────
    public function byAcheteur(int $id_acheteur): JsonResponse
    {
        return response()->json(
            Contrat::with(['bien.images', 'vendeur', 'acheteur'])
                   ->where('id_acheteur', $id_acheteur)
                   ->orderByDesc('id_contrat')
                   ->get()
        );
    }
}