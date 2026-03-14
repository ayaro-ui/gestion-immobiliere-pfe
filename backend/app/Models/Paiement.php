<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $table = 'paiement';
    protected $primaryKey = 'id_paiement';
    public $timestamps = false;

    protected $fillable = [
        'date_paiement',
        'montant',
        'mode_paiement',
        'id_contrat',
    ];

    public function contrat() {
        return $this->belongsTo(Contrat::class, 'id_contrat', 'id_contrat')
                    ->with(['bien:id_bien,titre,type_bien', 'vendeur:id_user,nom,prenom', 'acheteur:id_user,nom,prenom']);
    }
}