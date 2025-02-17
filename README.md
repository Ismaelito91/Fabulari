# Fabulari 📚

Fabulari est une application mobile innovante qui transforme la lecture en une expérience sociale et interactive. Elle permet aux utilisateurs de créer des salles de lecture virtuelles où ils peuvent discuter et partager leurs impressions sur des livres en temps réel.

## 🚀 Technologies utilisées

### Backend

- Node.js avec Express
- PostgreSQL avec Sequelize
- Docker pour la conteneurisation
- TypeScript pour la sécurité du typage

### Frontend

- React Native avec Expo
- TypeScript
- React Navigation pour la navigation
- Styled Components pour le styling

## 🛠 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- Docker et Docker Compose
- npm ou yarn
- Git

### Étapes d'installation

1. Cloner le repository

2. Installation des dépendances

```bash
# Installation des dépendances du backend
cd back
npm install

# Installation des dépendances du frontend
cd ../front
npm install
```

3. Configuration de l'environnement

Créez un fichier `.env` dans le dossier `back` :

4. Démarrage avec Docker

```bash
# À la racine du projet
docker-compose up -d postgres  # Démarre uniquement la base de données
docker-compose ps             # Vérifie que le conteneur est bien démarré
```

5. Démarrage en développement

```bash
# Terminal 1 - Backend
cd back
npm run dev

# Terminal 2 - Frontend
cd front
npm start
```

## 🌳 Structure du projet

```
fabulari/
├── back/                  # Backend Node.js
│   ├── src/
│   │   ├── config/       # Configuration (DB, etc.)
│   │   ├── models/       # Modèles Sequelize
│   │   ├── routes/       # Routes API
│   │   └── server.js     # Point d'entrée
│   └── package.json
│
├── front/                 # Frontend React Native
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── screens/      # Écrans de l'application
│   │   ├── navigation/   # Configuration de la navigation
│   │   └── types/        # Types TypeScript
│   └── package.json
│
└── docker-compose.yml     # Configuration Docker
```

## 🔄 Workflow Git

1. Créez une nouvelle branche pour chaque fonctionnalité

```bash
git checkout -b feature/nom-de-la-feature
```

2. Faites vos modifications et commitez

```bash
git add .
git commit -m "feat: description de la fonctionnalité"
```

3. Poussez vos modifications

```bash
git push origin feature/nom-de-la-feature
```

4. Créez une Pull Request sur GitHub

## 📝 Conventions de code

- Utilisez TypeScript pour tout nouveau code
- Suivez les conventions ESLint
- Utilisez des guillemets doubles pour les chaînes
- Utilisez des points-virgules à la fin des lignes
- Préfixez les commits avec le type (feat, fix, docs, etc.)

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche de fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- [Votre nom] - Développeur principal
- [Autres membres de l'équipe]
