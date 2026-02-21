<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('utilisateur', function (Blueprint $table) {
              $table->engine = 'InnoDB';
            $table->id('id_user');
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('email', 100)->unique();
            $table->string('mot_de_passe');
            $table->string('telephone', 20)->nullable();
            $table->date('date_inscription')->default(DB::raw('CURRENT_DATE'));
            $table->unsignedBigInteger('id_role');

            $table->foreign('id_role')->references('id_role')->on('role')->onDelete('cascade');
             $table->timestamps();
            });
    }

    public function down(): void {
        Schema::dropIfExists('utilisateur');
    }
};

