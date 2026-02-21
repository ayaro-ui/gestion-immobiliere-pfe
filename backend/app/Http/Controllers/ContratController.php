<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use Illuminate\Http\Request;

class ContratController extends Controller
{
    public function index() {
        return Contrat::all();
    }

    public function store(Request $request) {
        $contrat = Contrat::create($request->all());
        return response()->json($contrat, 201);
    }

    public function show($id) {
        return Contrat::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $contrat = Contrat::findOrFail($id);
        $contrat->update($request->all());
        return response()->json($contrat, 200);
    }

    public function destroy($id) {
        Contrat::destroy($id);
        return response()->json(null, 204);
    }
}
