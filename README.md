🔥 Flammes UP

Node.jsMongoDBGraphQLLicense

    Le réseau social Low-Data hyper-local dédié aux étudiants de l'Université de Parakou.

Flammes UP est une PWA (Progressive Web App) conçue pour briser les barrières de la connectivité. Léger, rapide et dynamique, il permet aux étudiants de rester connectés, d'échanger des cours et de partager des moments, même avec une connexion mobile limitée.
📖 À propos

Dans un contexte où la donnée mobile coûte cher et les réseaux peuvent être instables, Flammes UP optimise chaque octet envoyé. C'est le "Facebook du campus" allégé, axé sur l'oral, le texte et l'essentiel.
🎯 Objectifs

    Accessibilité : Fonctionne même sur les connexions 2G/3G lentes.
    Inclusion : Mode hors-ligne (Queueing) pour ne jamais perdre une interaction.
    Utilité : Intégration d'une marketplace pour la vie étudiante (cours, covoiturage, annonces).

✨ Fonctionnalités Clés

    📱 PWA (Progressive Web App) : Une expérience application native directement depuis le navigateur, sans installation lourde.
    💸 Mode Éco (Low Data) :
        Utilisation de GraphQL pour éviter le surchargement de données (Over-fetching).
        Compression automatique des images (WebP).
        Chargement différé des médias.
    🎙️ Audio-First : Partage de notes vocales优先itaires (moins de data que la vidéo, plus d'émotion que le texte).
    🕶️ Mode Confessions : Un espace pour partager des pensées anonymes en toute sécurité.
    🛍️ Marketplace Campus : Vente et achat de livres, covoiturage, et services entre étudiants.
    🔄 Offline-First : Liké ou commenté sans réseau ? L'action est mise en file d'attente et synchronisée dès le retour de la connexion.
    🎨 Design "Flammes" : Interface dominée par le Rouge, épurée et lisible en plein soleil.

🛠 Stack Technique

    Frontend : PWA (React / Next.js / Vite - À définir)
    Backend : Node.js
    API : GraphQL (Apollo Server)
    Base de données : MongoDB (NoSQL)
    Authentification : JWT / OTP (Téléphone)

🚀 Installation et Démarrage

Ce projet est divisé en deux parties principales : le serveur (API) et le client (PWA).
Prérequis

    Node.js (v18 ou supérieur)
    MongoDB (Local ou Atlas Cloud)
    npm ou yarn

1. Cloner le dépôt

git clone https://github.com/votre-pseudo/flammes-up.gitcd flammes-up

 
2. Configuration du Serveur (Backend) 
bash
 
  
 
 
 
 

Créer un fichier .env à la racine du dossier server : 
env
 
  
 
 
 
 

Lancer le serveur : 
bash
 
  
 
 
 
 

L'API GraphQL sera accessible sur http://localhost:4000/graphql. 
3. Configuration du Client (PWA) 

(À remplir une fois le frontend initialisé) 
bash
 
  
 
 
 
 

L'application sera accessible sur http://localhost:3000. 
📂 Structure du Projet 
text
 
  
 
 
 
 
🗺 Roadmap 

     Conception de l'architecture et de la base de données
     Initialisation du serveur Node.js et GraphQL
     Création des modèles MongoDB (User, Post)
     Développement de l'interface PWA (Design Rouge)
     Implémentation du mode Offline (Service Workers)
     Module "Confessions" et "Marketplace"
     

🤝 Contribution 

Les contributions sont les bienvenues ! Si tu veux améliorer Flammes UP : 

    Fork le projet. 
    Crée une branche pour ta fonctionnalité (git checkout -b feature/NouvelleFonction). 
    Commit tes changements (git commit -m 'Ajout de NouvelleFonction'). 
    Push vers la branche (git push origin feature/NouvelleFonction). 
    Ouvre une Pull Request. 

📜 Licence 

Ce projet est sous licence MIT - voir le fichier LICENSE  pour les détails. 
