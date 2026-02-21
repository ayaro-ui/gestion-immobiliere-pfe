<?php

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'transaction';
    protected $primaryKey = 'id_transaction';
    public $timestamps = false;

    public function bien() {
        return $this->belongsTo(BienImmobilier::class, 'id_bien');
    }

    public function client() {
        return $this->belongsTo(Utilisateur::class, 'id_client');
    }

    public function proprietaire() {
        return $this->belongsTo(Utilisateur::class, 'id_proprietaire');
    }
}
