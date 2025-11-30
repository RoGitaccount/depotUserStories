FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

# copie le reste du code sans les variables d'environnement (.env declaré dans le .dockerignore)
COPY . .

EXPOSE 8001

CMD [ "npm", "start"]
