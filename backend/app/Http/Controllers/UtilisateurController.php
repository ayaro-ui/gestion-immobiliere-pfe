<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;

class UtilisateurController extends Controller
{
    public function index() {
        return Utilisateur::all();
    }

    public function store(Request $request) {
        $utilisateur = Utilisateur::create($request->all());
        return response()->json($utilisateur, 201);
    }

    public function show($id) {
        return Utilisateur::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update($request->all());
        return response()->json($utilisateur, 200);
    }

    public function destroy($id) {
        Utilisateur::destroy($id);
        return response()->json(null, 204);
    }
}
