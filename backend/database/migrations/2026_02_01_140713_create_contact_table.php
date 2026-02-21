<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('contact', function (Blueprint $table) {
            $table->id('id_contact');
            $table->string('nom', 100);
            $table->string('email', 100);
            $table->text('message');
            $table->date('date_envoi')->default(DB::raw('CURRENT_DATE'));
        });
    }

    public function down(): void {
        Schema::dropIfExists('contact');
    }
};
