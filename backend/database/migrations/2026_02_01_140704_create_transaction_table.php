<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transaction', function (Blueprint $table) {
            $table->id('id_transaction');
            $table->string('type_transaction', 30);
            $table->decimal('montant', 15, 2);
            $table->date('date_transaction');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('id_bien');
            $table->unsignedBigInteger('id_client');
            $table->unsignedBigInteger('id_proprietaire');

            $table->foreign('id_bien')->references('id_bien')->on('bien_immobilier');
            $table->foreign('id_client')->references('id_user')->on('utilisateur');
            $table->foreign('id_proprietaire')->references('id_user')->on('utilisateur');
        });
    }

    public function down(): void {
        Schema::dropIfExists('transaction');
    }
};
