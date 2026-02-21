<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index() {
        return User::all();
    }

    public function store(Request $request) {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);
        return response()->json($user, 201);
    }

    public function show($id) {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        if ($request->password) {
            $request->merge(['password' => bcrypt($request->password)]);
        }
        $user->update($request->all());
        return response()->json($user, 200);
    }

    public function destroy($id) {
        User::destroy($id);
        return response()->json(null, 204);
    }
}
