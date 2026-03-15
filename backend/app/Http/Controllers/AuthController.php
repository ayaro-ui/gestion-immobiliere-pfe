<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'        => 'required|email',
            'mot_de_passe' => 'required'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mot_de_passe, $user->makeVisible('mot_de_passe')->mot_de_passe)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom'          => 'required|string',
            'prenom'       => 'required|string',
            'email'        => 'required|email|unique:utilisateur,email',
            'mot_de_passe' => 'required|min:6',
            'telephone'    => 'nullable|string',
            'id_role'      => 'required|exists:role,id_role'
        ]);

        // ── Créer l'utilisateur ───────────────────────────────────────────────
        $user = Utilisateur::create([
            'nom'               => $request->nom,
            'prenom'            => $request->prenom,
            'email'             => $request->email,
            'mot_de_passe'      => Hash::make($request->mot_de_passe),
            'telephone'         => $request->telephone,
            'id_role'           => $request->id_role,
            'date_inscription'  => now()
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // ── Email de bienvenue ────────────────────────────────────────────────
        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Ne pas bloquer l'inscription si email échoue
        }
        // ─────────────────────────────────────────────────────────────────────

        return response()->json([
            'token' => $token,
            'user'  => $user
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }
}