# On part d'une version légère de Node
FROM node:18-alpine

# Création du dossier de travail
WORKDIR /app

# 1. On copie d'abord les fichiers de dépendances (cache Docker optimisé)
COPY package*.json ./

# 2. INSTALLATION
# 'npm install' installe TOUT (prod + dev) par défaut, sauf si NODE_ENV est 'production'.
# C'est ce qu'on veut ici pour avoir 'tsc', 'ts-node' et '@types/express'.
RUN npm install

# 3. On installe nodemon globalement (optionnel, mais pratique en dev)
RUN npm install -g nodemon tsx @polar-sh/sdk

# 4. On copie le reste du code
COPY . .

# 5. Commande de démarrage
# En DEV : On lance directement avec nodemon et ts-node (pas de build nécessaire)
CMD ["nodemon", "--exec", "tsx", "src/server.ts"]