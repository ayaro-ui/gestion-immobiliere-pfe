<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bien_immobilier', function (Blueprint $table) {
             $table->engine = 'InnoDB';
            $table->id('id_bien');
            $table->string('titre', 100);
            $table->text('description')->nullable();
            $table->decimal('surface', 10, 2);
            $table->decimal('prix', 15, 2);
            $table->enum('type_bien', ['vente', 'location']);
            $table->integer('nb_pieces');
            $table->string('statut', 20);
            $table->unsignedBigInteger('id_vendeur');

            $table->foreign('id_vendeur')->references('id_user')->on('utilisateur')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('bien_immobilier');
    }
};
