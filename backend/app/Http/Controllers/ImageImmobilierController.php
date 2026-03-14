<?php

namespace App\Http\Controllers;

use App\Models\ImageImmobilier;
use Illuminate\Http\Request;

class ImageImmobilierController extends Controller
{
    // 🔹 GET toutes les images
    public function index()
    {
        return response()->json(ImageImmobilier::all(), 200);
    }

    // 🔹 POST upload image
    public function store(Request $request)
    {
        // ✅ validation
        $request->validate([
            'image'       => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'id_bien'     => 'required|exists:bien_immobilier,id_bien',
            'description' => 'nullable|string|max:255',
        ]);

        // ✅ stockage fichier
        $path = $request->file('image')->store('biens', 'public');

        // ✅ sauvegarde base de données
        $image = ImageImmobilier::create([
            'id_bien'     => $request->id_bien,
            'url_image'   => $path,
            'description' => $request->description,
            'date_ajout'  => now(),
        ]);

        return response()->json($image, 201);
    }

    // 🔹 GET une image
    public function show($id)
    {
        return response()->json(ImageImmobilier::findOrFail($id), 200);
    }

    // 🔹 DELETE image
    public function destroy($id)
    {
        $image = ImageImmobilier::findOrFail($id);
        $image->delete();

        return response()->json([
            'message' => 'Image supprimée'
        ], 200);
    }
}