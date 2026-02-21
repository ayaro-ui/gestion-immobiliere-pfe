<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImageImmobilier extends Model
{
    protected $table = 'image_immobilier';
    protected $primaryKey = 'id_image';
    public $timestamps = false;

    protected $fillable = [
        'id_bien',
        'url_image',
        'description',
        'date_ajout'
    ];

    public function bien()
    {
        return $this->belongsTo(BienImmobilier::class, 'id_bien', 'id_bien');
    }
}
