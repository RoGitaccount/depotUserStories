# Étape 1 : construction de l'app React (avec Vite)
FROM node:18 AS build
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Construire le projet pour la production
RUN npm run build

# Étape 2 : serveur Nginx pour héberger les fichiers
FROM nginx:alpine

# Copier les fichiers buildés depuis l’étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la config Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 (par défaut pour Nginx)
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
