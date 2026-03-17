<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContratPretASigner extends Mailable
{
    use Queueable, SerializesModels;

    public $contrat;
    public $acheteur;
    public $vendeur;

    public function __construct($contrat, $acheteur, $vendeur)
    {
        $this->contrat  = $contrat;
        $this->acheteur = $acheteur;
        $this->vendeur  = $vendeur;
    }

    public function build()
    {
        return $this
            ->subject('📝 Un contrat attend votre signature — ImmoExpert')
            ->view('emails.contrat-pret-a-signer');
    }
}