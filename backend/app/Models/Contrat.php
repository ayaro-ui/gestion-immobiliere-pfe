<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $table      = 'contrat';
    protected $primaryKey = 'id_contrat';
    public    $timestamps = false;

    protected $fillable = [
        'montant',
        'date_contrat',
        'fichier_pdf',
        'statut',
        'id_bien',
        'id_vendeur',
        'id_acheteur',
    ];

    protected $casts = [
        'montant'      => 'decimal:2',
        'date_contrat' => 'date:Y-m-d',
    ];

    public function bien()
    {
        return $this->belongsTo(BienImmobilier::class, 'id_bien', 'id_bien')
                    ->with('images');
    }

    public function vendeur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_vendeur', 'id_user');
    }

    public function acheteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_acheteur', 'id_user');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class, 'id_contrat', 'id_contrat');
    }
}