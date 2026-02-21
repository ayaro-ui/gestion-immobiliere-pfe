<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('image_immobilier', function (Blueprint $table) {
            $table->id('id_image');
            $table->string('url_image');
            $table->string('description')->nullable();
            $table->date('date_ajout')->default(DB::raw('CURRENT_DATE'));
            $table->unsignedBigInteger('id_bien');

            $table->foreign('id_bien')->references('id_bien')->on('bien_immobilier');
        });
    }

    public function down(): void {
        Schema::dropIfExists('image_immobilier');
    }
};
