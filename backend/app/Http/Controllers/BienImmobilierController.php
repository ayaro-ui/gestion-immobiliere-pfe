<?php

namespace App\Http\Controllers;

use App\Models\BienImmobilier;
use Illuminate\Http\Request;

class BienImmobilierController extends Controller
{
    // 🔹 GET : tous les biens
    public function index()
    {
        return response()->json(
            BienImmobilier::with('images')->get(),
            200
        );
    }

    // 🔹 POST : ajouter un bien
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre'       => 'required|string|max:255',
            'description' => 'required|string',
            'surface'     => 'required|numeric',
            'prix'        => 'required|numeric',
            'type_bien'   => 'required|in:vente,location',
            'nb_pieces'   => 'required|integer',
            'statut'      => 'required|string',
            'adresse'     => 'nullable|string|max:255', // ✅ ajouté
            'id_vendeur'  => 'required|exists:utilisateur,id_user',
        ]);

        $bien = BienImmobilier::create($validated);

        return response()->json($bien, 201);
    }

    // 🔹 GET : un seul bien
    public function show($id)
    {
        $bien = BienImmobilier::with('images')->findOrFail($id);
        return response()->json($bien, 200);
    }

    // 🔹 PUT : modifier un bien
    public function update(Request $request, $id)
    {
        $bien = BienImmobilier::findOrFail($id);

        $validated = $request->validate([
            'titre'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'surface'     => 'sometimes|numeric',
            'prix'        => 'sometimes|numeric',
            'type_bien'   => 'sometimes|in:vente,location',
            'nb_pieces'   => 'sometimes|integer',
            'statut'      => 'sometimes|string',
            'adresse'     => 'nullable|string|max:255', // ✅ ajouté
            'id_vendeur'  => 'sometimes|exists:utilisateur,id_user',
        ]);

        $bien->update($validated);

        return response()->json($bien, 200);
    }

    // 🔹 DELETE : supprimer un bien
    public function destroy($id)
    {
        $bien = BienImmobilier::findOrFail($id);
        $bien->delete();

        return response()->json([
            'message' => 'Bien supprimé avec succès'
        ], 200);
    }
}