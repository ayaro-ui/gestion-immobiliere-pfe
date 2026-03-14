<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = Utilisateur::with('role')->get();
        return response()->json($utilisateurs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom'          => 'required|string|max:50',
            'prenom'       => 'required|string|max:50',
            'email'        => 'required|email|unique:utilisateur,email',
            'mot_de_passe' => 'required|min:6',
            'telephone'    => 'nullable|string|max:20',
            'id_role'      => 'required|exists:role,id_role',
        ]);

        $user = Utilisateur::create([
            'nom'          => $request->nom,
            'prenom'       => $request->prenom,
            'email'        => $request->email,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'telephone'    => $request->telephone,
            'id_role'      => $request->id_role,
        ]);

        return response()->json($user->load('role'), 201);
    }

    public function show($id)
    {
        return response()->json(Utilisateur::with('role')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);

        $request->validate([
            'nom'       => 'required|string|max:50',
            'prenom'    => 'required|string|max:50',
            'email'     => 'required|email|unique:utilisateur,email,' . $id . ',id_user',
            'telephone' => 'nullable|string|max:20',
            'id_role'   => 'required|exists:role,id_role',
        ]);

        $user->update([
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
            'email'     => $request->email,
            'telephone' => $request->telephone,
            'id_role'   => $request->id_role,
        ]);

        if ($request->mot_de_passe) {
            $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);
        }

        return response()->json($user->load('role'));
    }

    public function destroy($id)
    {
        Utilisateur::findOrFail($id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function roles()
    {
        return response()->json(Role::all());
    }
}