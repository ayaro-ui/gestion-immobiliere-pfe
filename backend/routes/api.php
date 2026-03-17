<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BienImmobilierController;
use App\Http\Controllers\ImageImmobilierController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\RoleController;

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::post('/login',                [AuthController::class, 'login']);
Route::post('/register',             [AuthController::class, 'register']);
Route::post('/check-email',          [AuthController::class, 'checkEmail']);
Route::post('/reset-password',       [AuthController::class, 'resetPassword']);
Route::post('/forgot-password',      [AuthController::class, 'forgotPassword']);
Route::post('/reset-password-token', [AuthController::class, 'resetPasswordToken']);

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/biens',      [BienImmobilierController::class, 'index']);
Route::get('/biens/{id}', [BienImmobilierController::class, 'show']);

Route::get('/hello', fn() => response()->json(['message' => 'API Laravel fonctionne !']));

// ── Authentifiées ─────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Utilisateurs
    Route::get('/utilisateur',          [UtilisateurController::class, 'index']);
    Route::post('/utilisateur',         [UtilisateurController::class, 'store']);
    Route::put('/utilisateur/{id}',     [UtilisateurController::class, 'update']);
    Route::delete('/utilisateur/{id}',  [UtilisateurController::class, 'destroy']);
    Route::apiResource('utilisateurs',  UtilisateurController::class);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Biens
    Route::post('/biens/predict',      [BienImmobilierController::class, 'predict']);
    Route::post('/biens',              [BienImmobilierController::class, 'store']);
    Route::put('/biens/{id}',          [BienImmobilierController::class, 'update']);
    Route::delete('/biens/{id}',       [BienImmobilierController::class, 'destroy']);
    Route::patch('/biens/{id}/statut', [BienImmobilierController::class, 'updateStatut']);
    Route::patch('/biens/{id}/valider',[BienImmobilierController::class, 'valider']);

    // Images
    Route::apiResource('images', ImageImmobilierController::class);

    // Contrats
    Route::get('contrats/form-data',              [ContratController::class, 'formData']);
    Route::get('contrats/vendeur/{id_vendeur}',   [ContratController::class, 'byVendeur']);
    Route::get('contrats/acheteur/{id_acheteur}', [ContratController::class, 'byAcheteur']);
    Route::get('contrats/{id}/pdf',               [ContratController::class, 'downloadPdf']);
    Route::put('contrats/{id}/signer',            [ContratController::class, 'signer']);
    Route::apiResource('contrats', ContratController::class);

    // Paiements
    Route::get('paiements/acheteur/{id}', [PaiementController::class, 'byAcheteur']);
    Route::get('paiements/vendeur/{id}',  [PaiementController::class, 'byVendeur']);
    Route::apiResource('paiements', PaiementController::class);

    // Transactions
    Route::get('transactions/vendeur/{id}', [TransactionController::class, 'byVendeur']);
    Route::get('transactions/client/{id}',  [TransactionController::class, 'byClient']);
    Route::apiResource('transactions', TransactionController::class);

    // Contacts
    Route::get('contacts/vendeur/{id_vendeur}', [ContactController::class, 'byVendeur']);
    Route::apiResource('contacts', ContactController::class);

    // Favoris
    Route::apiResource('favoris', FavoriController::class);
});