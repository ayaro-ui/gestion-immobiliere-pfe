<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = Transaction::with(['bien.images', 'client', 'proprietaire'])
            ->orderByDesc('date_transaction')
            ->get();

        return response()->json($transactions);
    }

    public function byVendeur(int $id): JsonResponse
    {
        $transactions = Transaction::with(['bien.images', 'client', 'proprietaire'])
            ->where('id_proprietaire', $id)
            ->orderByDesc('date_transaction')
            ->get();

        return response()->json($transactions);
    }

    public function byClient(int $id): JsonResponse
    {
        $transactions = Transaction::with(['bien.images', 'client', 'proprietaire'])
            ->where('id_client', $id)
            ->orderByDesc('date_transaction')
            ->get();

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $transaction = Transaction::create($request->all());
        return response()->json(
            $transaction->load(['bien.images', 'client', 'proprietaire']),
            201
        );
    }

    public function show($id): JsonResponse
    {
        return response()->json(
            Transaction::with(['bien.images', 'client', 'proprietaire'])->findOrFail($id)
        );
    }

    public function destroy($id): JsonResponse
    {
        Transaction::destroy($id);
        return response()->json(null, 204);
    }
}