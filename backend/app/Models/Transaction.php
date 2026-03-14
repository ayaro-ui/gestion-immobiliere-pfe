<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table      = 'transaction';
    protected $primaryKey = 'id_transaction';
    public    $timestamps = false;

    protected $fillable = [
        'type_transaction',
        'montant',
        'date_transaction',
        'description',
        'id_bien',
        'id_client',
        'id_proprietaire',
    ];

    public function bien() {
        return $this->belongsTo(BienImmobilier::class, 'id_bien', 'id_bien')
                    ->with('images');
    }

    public function client() {
        return $this->belongsTo(Utilisateur::class, 'id_client', 'id_user');
    }

    public function proprietaire() {
        return $this->belongsTo(Utilisateur::class, 'id_proprietaire', 'id_user');
    }
}