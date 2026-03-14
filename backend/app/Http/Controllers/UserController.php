<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:255',
            'prenom'       => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'mot_de_passe' => 'required|string|min:6',
            'telephone'    => 'required|string|max:20',
            'id_role'      => 'required|integer',
        ]);

        $user = User::create([
            'nom'          => $validated['nom'],
            'prenom'       => $validated['prenom'],
            'email'        => $validated['email'],
            'mot_de_passe' => Hash::make($validated['mot_de_passe']),
            'telephone'    => $validated['telephone'],
            'id_role'      => $validated['id_role'],
        ]);

        return response()->json([
            'success' => true,
            'user'    => $user
        ], 201);
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->password) {
            $request->merge(['password' => bcrypt($request->password)]);
        }

        $user->update($request->all());
        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        User::destroy($id);
        return response()->json(null, 204);
    }
}