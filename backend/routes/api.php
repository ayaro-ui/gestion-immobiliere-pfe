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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// User (Laravel default)
Route::apiResource('users', UserController::class);

// Role
Route::apiResource('roles', RoleController::class);

// Utilisateur
Route::apiResource('utilisateurs', UtilisateurController::class);

// Bien Immobilier
Route::apiResource('biens', BienImmobilierController::class);

// Image Immobilier
Route::apiResource('images', ImageImmobilierController::class);

// Contrat
Route::apiResource('contrats', ContratController::class);

// Paiement
Route::apiResource('paiements', PaiementController::class);

// Transaction
Route::apiResource('transactions', TransactionController::class);

// Favori
Route::apiResource('favoris', FavoriController::class);

// Contact
Route::apiResource('contacts', ContactController::class);

// Exemple de route simple pour tester l'API
Route::get('/hello', function() {
    return response()->json(['message' => 'API Laravel fonctionne !']);
});
