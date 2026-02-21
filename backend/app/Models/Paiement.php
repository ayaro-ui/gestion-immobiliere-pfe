<?php
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $table = 'paiement';
    protected $primaryKey = 'id_paiement';
    public $timestamps = false;

    public function contrat() {
        return $this->belongsTo(Contrat::class, 'id_contrat');
    }
}
