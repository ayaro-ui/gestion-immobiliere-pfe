<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index() {
        return Favori::with(['user','bien'])->get();
    }

    public function store(Request $request) {
        $favori = Favori::create($request->all());
        return response()->json($favori, 201);
    }

    public function show($id) {
        return Favori::with(['user','bien'])->findOrFail($id);
    }

    public function update(Request $request, $id) {
        $favori = Favori::findOrFail($id);
        $favori->update($request->all());
        return response()->json($favori, 200);
    }

    public function destroy($id) {
        Favori::destroy($id);
        return response()->json(null, 204);
    }
}
