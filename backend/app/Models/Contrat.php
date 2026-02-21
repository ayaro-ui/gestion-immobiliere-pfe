<?php

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $table = 'contrat';
    protected $primaryKey = 'id_contrat';
    public $timestamps = false;

    public function bien() {
        return $this->belongsTo(BienImmobilier::class, 'id_bien');
    }

    public function vendeur() {
        return $this->belongsTo(Utilisateur::class, 'id_vendeur');
    }

    public function acheteur() {
        return $this->belongsTo(Utilisateur::class, 'id_acheteur');
    }

    public function paiements() {
        return $this->hasMany(Paiement::class, 'id_contrat');
    }
}
