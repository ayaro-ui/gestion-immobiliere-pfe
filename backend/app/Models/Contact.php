<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $table = 'contact';
    protected $primaryKey = 'id_contact';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'email',
        'message',
        'statut',
        'id_bien',
        'id_client',
        'date_envoi',
    ];

    // Relation avec le bien
    public function bien()
    {
        return $this->belongsTo(BienImmobilier::class, 'id_bien', 'id_bien');
    }

    // Relation avec le client
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'id_client', 'id_user');
    }
}