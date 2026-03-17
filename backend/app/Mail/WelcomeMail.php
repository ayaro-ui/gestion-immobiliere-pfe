<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public Utilisateur $user;

    public function __construct(Utilisateur $user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: ' Bienvenue sur ImmoExpert !',
            from: new Address('achrafchafir@gmail.com', 'ImmoExpert'),
            replyTo: [
                new Address('achrafchafir@gmail.com', 'ImmoExpert')
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            text:'emails.welcome_texte',
            with: [
                'user' => $this->user,
            ],
        );
    }
}