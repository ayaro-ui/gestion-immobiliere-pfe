<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    protected $table      = 'favori';
    protected $primaryKey = 'id_favori';
    public    $timestamps = false;

    protected $fillable = ['id_bien', 'id_user', 'date_ajout'];

    public function bien() {
        return $this->belongsTo(BienImmobilier::class, 'id_bien', 'id_bien');
    }

    public function utilisateur() {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}