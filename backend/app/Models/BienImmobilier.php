<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BienImmobilier extends Model
{
    protected $table = 'bien_immobilier';
    protected $primaryKey = 'id_bien';
    public $timestamps = false;

    protected $fillable = [
        'titre',
        'description',
        'surface',
        'prix',
        'type_bien',
        'nb_pieces',
        'statut',
        'id_vendeur'
    ];

    public function vendeur() {
        return $this->belongsTo(Utilisateur::class, 'id_vendeur');
    }

    public function images() {
        return $this->hasMany(ImageImmobilier::class, 'id_bien');
    }

    public function contrats() {
        return $this->hasMany(Contrat::class, 'id_bien');
    }
}