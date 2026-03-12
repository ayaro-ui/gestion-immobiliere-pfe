<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request) {
        return Favori::with(['bien.images'])->get();
    }

    public function store(Request $request) {
        $request->validate([
            'id_bien' => 'required|integer',
            'id_user' => 'required|integer',
        ]);

        // Éviter les doublons
        $existing = Favori::where('id_bien', $request->id_bien)
                          ->where('id_user', $request->id_user)
                          ->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $favori = Favori::create([
            'id_bien'    => $request->id_bien,
            'id_user'    => $request->id_user,
            'date_ajout' => now()->toDateString(),
        ]);

        return response()->json($favori->load('bien.images'), 201);
    }

    public function destroy($id) {
        Favori::destroy($id);
        return response()->json(null, 204);
    }
}