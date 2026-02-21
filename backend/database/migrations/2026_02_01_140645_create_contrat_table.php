<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('contrat', function (Blueprint $table) {
            $table->id('id_contrat');
            $table->decimal('montant', 15, 2);
            $table->date('date_contrat');
            $table->string('fichier_pdf')->nullable();
            $table->string('statut', 30);
            $table->unsignedBigInteger('id_bien');
            $table->unsignedBigInteger('id_vendeur');
            $table->unsignedBigInteger('id_acheteur');

            $table->foreign('id_bien')->references('id_bien')->on('bien_immobilier');
            $table->foreign('id_vendeur')->references('id_user')->on('utilisateur');
            $table->foreign('id_acheteur')->references('id_user')->on('utilisateur');
        });
    }

    public function down(): void {
        Schema::dropIfExists('contrat');
    }
};
