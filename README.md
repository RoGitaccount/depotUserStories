![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)

# Projet de Gestion des User Stories

Ce projet est une application web complète pour la gestion des user stories, composée d'un front-end et d'un back-end. Il est dédié à un projet de Bachelor.

## Structure du Projet

```
.
├── front-end/          # Application React
├── back-end/           # Serveur Node.js avec framework (Express.js)
├── package.json        # Configuration principale du projet
├── docker-compose.yml  # Fichier Docker Compose
└── .gitignore          # Fichiers ignorés par Git
```

## Prérequis

* Node.js (version recommandée : 18.x ou supérieure)
* npm (généralement installé avec Node.js)
* Docker et Docker Compose si vous souhaitez utiliser la méthode Docker

## :package: Installation

### Méthode classique (Node.js + npm)

1. Cloner le repository :

```bash
git clone https://github.com/RoGitaccount/depotUserStories
cd depotUserStories
```

2. Installer les dépendances du projet principal :

```bash
npm install
```

3. Installer les dépendances du front-end :

```bash
cd front-end
npm install
```

4. Installer les dépendances du back-end :

```bash
cd ../back-end
npm install
```

### Méthode via Docker (images publiques)

Vous pouvez également lancer le projet directement avec Docker en utilisant les images disponibles sur Docker Hub :

* Front-end : [rodockaccount/dsp-frontend](https://hub.docker.com/r/rodockaccount/dsp-frontend)
* Back-end : [rodockaccount/dsp-backend](https://hub.docker.com/r/rodockaccount/dsp-backend)

#### Étapes :

1. Cloner le repository :

```bash
git clone https://github.com/RoGitaccount/depotUserStories
cd depotUserStories
```

2. Créer un fichier `docker-compose.yml` à la racine du projet (si pas déjà présent) :

```yaml
version: '3.8'

services:
  backend:
    image: rodockaccount/dsp-backend:latest
    container_name: dsp-backend
    ports:
      - "8001:8001"
    environment:
      - NODE_ENV=production
    depends_on:
      - db

  frontend:
    image: rodockaccount/dsp-frontend:latest
    container_name: dsp-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  db:
    image: mysql:8.0
    container_name: dsp-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: dsp
      MYSQL_USER: dspuser
      MYSQL_PASSWORD: dsppassword
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

3. Lancer tous les services avec Docker Compose :

```bash
docker-compose up -d
```

4. Vérifier que les conteneurs fonctionnent :

```bash
docker ps
```

5. Accéder à l’application :

* Front-end : [http://localhost:5173](http://localhost:5173)
* API Back-end : [http://localhost:8001/api-docs](http://localhost:8001/api-docs)

---

## Démarrage (Node.js)

* Démarrage complet (front-end + back-end)

```bash
npm run dev
```

* Démarrage du serveur uniquement

```bash
npm run server
```

* Démarrage du client uniquement

```bash
npm run client
```

---

## Fonctionnalités

* Gestion des user stories
* Interface utilisateur moderne et responsive
* API RESTful
* Base de données intégrée

---

## :tools: Technologies utilisées

### Front-end

* :atom: [React](https://reactjs.org/)

### Back-end

* :green_circle: [Node.js](https://nodejs.org/)
* :rocket: [Express](https://expressjs.com/)

### Base de données

* :dolphin: [MySQL](https://www.mysql.com/)

---

## Référence de l'API

[Documentation de l'API](http://localhost:8001/api-docs/)

## Documentation

[Documentation du projet](https://docs.google.com/document/d/1b7uuVyRgr8lK8Bb7MmUneEHy8vj8_pv4kxLboGslGMo/edit?pli=1&tab=t.0)

## Auteurs

* [@RoGitaccount](https://www.github.com/RoGitaccount)
* [@Kanoox](https://www.github.com/Kanoox)
