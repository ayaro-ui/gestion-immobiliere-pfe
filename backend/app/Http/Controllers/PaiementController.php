<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function index() {
        return Paiement::all();
    }

    public function store(Request $request) {
        $paiement = Paiement::create($request->all());
        return response()->json($paiement, 201);
    }

    public function show($id) {
        return Paiement::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $paiement = Paiement::findOrFail($id);
        $paiement->update($request->all());
        return response()->json($paiement, 200);
    }

    public function destroy($id) {
        Paiement::destroy($id);
        return response()->json(null, 204);
    }
}
