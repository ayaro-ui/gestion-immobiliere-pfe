<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\BienImmobilier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * GET /api/contacts
     * Liste toutes les demandes avec relations
     */
    public function index(): JsonResponse
    {
        $contacts = Contact::with([
            'bien:id_bien,titre,type_bien,statut,prix,id_vendeur',
            'bien.images:id_image,url_image,id_bien',
            'client:id_user,nom,prenom,email,telephone',
        ])->orderByDesc('date_envoi')->get();

        return response()->json($contacts);
    }

    /**
     * POST /api/contacts
     * Client envoie une demande pour un bien
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'   => 'nullable|string|max:1000',
            'id_bien'   => 'required|exists:bien_immobilier,id_bien',
            'id_client' => 'required|exists:utilisateur,id_user',
        ]);

        // Récupérer les infos du client
        $client = \App\Models\Utilisateur::find($validated['id_client']);

        // Vérifier si demande déjà envoyée
        $exists = Contact::where('id_bien', $validated['id_bien'])
                         ->where('id_client', $validated['id_client'])
                         ->where('statut', 'en_attente')
                         ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Vous avez déjà envoyé une demande pour ce bien.'
            ], 422);
        }

        $contact = Contact::create([
            'nom'        => $client->prenom . ' ' . $client->nom,
            'email'      => $client->email,
            'message'    => $validated['message'] ?? '',
            'statut'     => 'en_attente',
            'id_bien'    => $validated['id_bien'],
            'id_client'  => $validated['id_client'],
            'date_envoi' => now()->toDateString(),
        ]);

        return response()->json(
            $contact->load(['bien', 'client']),
            201
        );
    }

    /**
     * PUT /api/contacts/{id}
     * Vendeur accepte ou refuse une demande
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_attente,accepte,refuse',
        ]);

        $contact->update(['statut' => $request->statut]);

        // Si accepté → mettre le bien en vendu/loué
        if ($request->statut === 'accepte') {
            $bien = BienImmobilier::find($contact->id_bien);
            if ($bien) {
                $bien->statut = $bien->type_bien === 'vente' ? 'vendu' : 'loue';
                $bien->save();
            }
        }

        return response()->json($contact->load(['bien', 'client']));
    }

    /**
     * DELETE /api/contacts/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json(['message' => 'Demande supprimée.']);
    }

    /**
     * GET /api/contacts/vendeur/{id_vendeur}
     * Demandes reçues par un vendeur spécifique
     */
    public function byVendeur(int $id_vendeur): JsonResponse
    {
        $contacts = Contact::with([
            'bien:id_bien,titre,type_bien,statut,prix,id_vendeur',
            'bien.images:id_image,url_image,id_bien',
            'client:id_user,nom,prenom,email,telephone',
        ])
        ->whereHas('bien', function ($q) use ($id_vendeur) {
            $q->where('id_vendeur', $id_vendeur);
        })
        ->orderByDesc('date_envoi')
        ->get();

        return response()->json($contacts);
    }
    
}