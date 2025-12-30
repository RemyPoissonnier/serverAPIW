# On part d'une version légère de Node
FROM node:18-alpine

# On crée un dossier de travail dans le conteneur
WORKDIR /app

# On copie les fichiers de configuration
COPY package*.json ./

# On installe les outils nécessaires
RUN npm install firebase-admin @polar-sh/sdk express cors dotenv

# On copie le reste de ton code
COPY . .

# On ouvre le port 3000
EXPOSE 3000

# On lance le serveur
CMD ["npm", "start"]
