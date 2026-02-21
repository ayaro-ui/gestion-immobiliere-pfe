<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Role;
use App\Models\BienImmobilier;
use App\Models\Contrat;
use App\Models\Favori;

class Utilisateur extends Model
{
    protected $table = 'utilisateur'; // 👈 sans s
    protected $primaryKey = 'id_user';
    public $timestamps = false;
 
   protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'telephone',
        'date_inscription',
        'id_role'
    ];
    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role');
    }

    public function biens()
    {
        return $this->hasMany(BienImmobilier::class, 'id_vendeur');
    }

    public function contratsAcheteur()
    {
        return $this->hasMany(Contrat::class, 'id_acheteur');
    }

    public function contratsVendeur()
    {
        return $this->hasMany(Contrat::class, 'id_vendeur');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class, 'id_user');
    }
}
