<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use App\Models\BienImmobilier;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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
            'statut'       => 'in:en_attente,signe_vendeur,signe_complet,annule',
            'fichier_pdf'  => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->hasFile('fichier_pdf')) {
            $validated['fichier_pdf'] = $request->file('fichier_pdf')
                                                 ->store('contrats', 'public');
        }

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
        $contrat = Contrat::findOrFail($id);

        $validated = $request->validate([
            'statut'       => 'sometimes|in:en_attente,signe_vendeur,signe_complet,annule',
            'montant'      => 'sometimes|numeric|min:1',
            'date_contrat' => 'sometimes|date',
            'id_bien'      => 'sometimes|exists:bien_immobilier,id_bien',
            'id_vendeur'   => 'sometimes|exists:utilisateur,id_user',
            'id_acheteur'  => 'sometimes|exists:utilisateur,id_user',
            'fichier_pdf'  => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->hasFile('fichier_pdf')) {
            if ($contrat->fichier_pdf) {
                Storage::disk('public')->delete($contrat->fichier_pdf);
            }
            $validated['fichier_pdf'] = $request->file('fichier_pdf')
                                                 ->store('contrats', 'public');
        }

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
            // ✅ tous les statuts inclus
            'biens' => BienImmobilier::with(['images', 'vendeur'])
                                     ->whereIn('statut', ['disponible', 'reserve', 'vendu'])
                                     ->get(),
            'utilisateurs' => Utilisateur::select('id_user', 'nom', 'prenom', 'email', 'telephone')
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
            $contrat->signature_vendeur = $request->signature;
            $contrat->statut            = 'signe_vendeur';
        } else {
            $contrat->signature_acheteur = $request->signature;
            $contrat->statut             = 'signe_complet';
        }

        $contrat->save();

        return response()->json(
            $contrat->load(['bien.images', 'vendeur', 'acheteur'])
        );
    }

    // ── GET /api/contrats/vendeur/{id_vendeur} ────────────────────────────────
    public function byVendeur(int $id_vendeur): JsonResponse
    {
        $contrats = Contrat::with(['bien.images', 'vendeur', 'acheteur'])
                           ->where('id_vendeur', $id_vendeur)
                           ->orderByDesc('id_contrat')
                           ->get();

        return response()->json($contrats);
    }

    // ── GET /api/contrats/acheteur/{id_acheteur} ──────────────────────────────
    public function byAcheteur(int $id_acheteur): JsonResponse
    {
        $contrats = Contrat::with(['bien.images', 'vendeur', 'acheteur'])
                           ->where('id_acheteur', $id_acheteur)
                           ->orderByDesc('id_contrat')
                           ->get();

        return response()->json($contrats);
    }
}