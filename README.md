# Système de Gestion Immobilière

> Projet de Fin d'Études — DUT Informatique  
> Application web de gestion immobilière développée avec Laravel et MySQL

---

## Description

Ce projet est une plateforme web de gestion immobilière permettant aux propriétaires de publier des annonces, aux clients de rechercher et d'acquérir des biens, et aux administrateurs de superviser l'ensemble des opérations. Il couvre le cycle complet d'une transaction immobilière : de la publication d'une annonce jusqu'à la génération et la signature du contrat.

---

##  Fonctionnalités principales

###  Gestion des utilisateurs
- Inscription et authentification (Client, Propriétaire, Administrateur)
- Gestion des rôles et des droits d'accès
- Modification du profil et changement de mot de passe sécurisé

### Gestion des biens immobiliers
- Publication, modification et suppression d'annonces
- Galerie d'images par bien
- Recherche et filtrage par type (vente/location), prix et surface
- Gestion du statut : disponible, vendu, loué
- Ajout aux favoris

###  Gestion des contrats et paiements
- Génération automatique des contrats de vente et de location
- Signature et téléchargement au format PDF
- Enregistrement des paiements (cash, virement, chèque)
- Suivi du statut des contrats : en attente, signé, annulé

###  Historique des transactions
- Enregistrement complet de toutes les opérations
- Consultation par utilisateur et par bien
- Traçabilité complète (vente, location, paiement, annulation)

---

##  Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Backend | PHP / Laravel (MVC) |
| Base de données | MySQL |
| Frontend | react |
| Modélisation | UML (cas d'utilisation, classes, séquence) |
| Gestion de version | Git / GitHub |
| Environnement local | XAMPP (Apache + MySQL + PHP) |
| Éditeur | Visual Studio Code |

---

## Structure de la base de données

La base de données comprend **9 tables normalisées** :

```
ROLE · UTILISATEUR · BIEN_IMMOBILIER · IMAGE_IMMOBILIER
CONTRAT · PAIEMENT · TRANSACTION · FAVORI · CONTACT
```

---

## Installation et lancement

### Prérequis
- PHP >= 8.1
- Composer
- MySQL
- XAMPP (ou tout autre serveur local)

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/ayaro-ui/gestion-immobiliere.git ou
git clone https://github.com/HibaChafir/gestion-immobiliere.git 
cd gestion-immobiliere

# 2. Installer les dépendances PHP
composer install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Générer la clé de l'application
php artisan key:generate

# 5. Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=immobiliere_db
DB_USERNAME=root
DB_PASSWORD=

# 6. Exécuter les migrations
php artisan migrate

# 7. (Optionnel) Insérer les données de test
php artisan db:seed

# 8. Lancer le serveur de développement
php artisan serve
```

L'application sera accessible à l'adresse : **http://localhost:8000**

---

## Architecture du projet

```
gestion-immobiliere/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Contrôleurs (MVC)
│   │   
│   └── Models/                 # Modèles Eloquent
├── database/
│   ├── migrations/             # Structure de la BDD
│   └── seeders/                # Données initiales
├── resources/
│   ├── views/                  # Vues Blade (HTML)
│   └── css/ js/                # Assets frontend
├── routes/
│   └── web.php                 # Définition des routes
└── public/                     # Point d'entrée public
```

---

## Auteurs

Projet réalisé en binôme dans le cadre du **Projet de Fin d'Études — DUT Informatique**.

---

##  Perspectives d'évolution

-  Messagerie interne entre clients et propriétaires
-  Module de visite et prise de rendez-vous
-  Paiement en ligne (Stripe / PayPal)
-  Application mobile (React Native / Flutter)
-  Déploiement Cloud (AWS / Azure)
-  Internationalisation (français, arabe, anglais)

---

##  Licence

Ce projet est réalisé à des fins académiques dans le cadre d'un DUT Informatique.
