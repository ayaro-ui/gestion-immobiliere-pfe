<?php

use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    protected $table = 'favori';
    protected $primaryKey = 'id_favori';
    public $timestamps = false;

    public function utilisateur() {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }

    public function bien() {
        return $this->belongsTo(BienImmobilier::class, 'id_bien');
    }
}
