<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BienImmobilierController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\ImageImmobilierController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AuthController;

// ─── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ─── Routes PUBLIQUES (visiteurs non connectés) ───────────────────────────────
Route::get('/biens',      [BienImmobilierController::class, 'index']);
Route::get('/biens/{id}', [BienImmobilierController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // ─── Users ───────────────────────────────────────────────────────────
    Route::apiResource('users', UserController::class);

    // ─── Roles ───────────────────────────────────────────────────────────
    Route::apiResource('roles', RoleController::class);

    // ─── Utilisateurs ────────────────────────────────────────────────────
    Route::apiResource('utilisateurs', UtilisateurController::class);

    // ─── Biens (create, update, delete nécessitent auth) ─────────────────
    Route::post('/biens',        [BienImmobilierController::class, 'store']);
    Route::put('/biens/{id}',    [BienImmobilierController::class, 'update']);
    Route::delete('/biens/{id}', [BienImmobilierController::class, 'destroy']);

    // ─── Images Immobilier ───────────────────────────────────────────────
    Route::apiResource('images', ImageImmobilierController::class);

    // ─── Contrats ────────────────────────────────────────────────────────
    Route::get('contrats/form-data',              [ContratController::class, 'formData']);
    Route::get('contrats/vendeur/{id_vendeur}',   [ContratController::class, 'byVendeur']);
    Route::get('contrats/acheteur/{id_acheteur}', [ContratController::class, 'byAcheteur']);
    Route::put('contrats/{id}/signer',            [ContratController::class, 'signer']);
    Route::apiResource('contrats', ContratController::class);

    // ─── Paiements ───────────────────────────────────────────────────────
    Route::apiResource('paiements', PaiementController::class);

    // ─── Transactions ────────────────────────────────────────────────────
    Route::apiResource('transactions', TransactionController::class);

    // ─── Favoris ─────────────────────────────────────────────────────────
    Route::apiResource('favoris', FavoriController::class);

    // ─── Contacts ────────────────────────────────────────────────────────
    Route::get('contacts/vendeur/{id_vendeur}', [ContactController::class, 'byVendeur']);
    Route::apiResource('contacts', ContactController::class);
});

// ─── Test ─────────────────────────────────────────────────────────────────────
Route::get('/hello', function () {
    return response()->json(['message' => 'API Laravel fonctionne !']);
});