<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('paiement', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id('id_paiement');
            $table->date('date_paiement');
            $table->decimal('montant', 15, 2);
            $table->string('mode_paiement', 50);

            $table->unsignedBigInteger('id_contrat');

            $table->foreign('id_contrat')
                  ->references('id_contrat')
                  ->on('contrat')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('paiement');
    }
};
