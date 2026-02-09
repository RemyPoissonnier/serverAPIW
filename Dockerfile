# 1. Image de base légère
FROM node:20-slim

# 2. Définition du dossier de travail
WORKDIR /app

# 3. Copie des fichiers de dépendances
# On copie package.json ET package-lock.json pour garantir les versions
COPY package*.json ./

# 4. Installation des dépendances
# On installe tout pour pouvoir compiler le TypeScript
RUN npm install

# 5. Installation des outils spécifiques nécessaires
# Note: Polar SDK et cookie-parser devraient normalement être dans ton package.json
RUN npm install -g tsx

# 6. Copie du reste du code source
COPY . .

# 7. Build du projet (si tu as un script build dans package.json)
# Si tu n'as pas de script build, tsx lancera le .ts directement (voir CMD)
# RUN npm run build 

# 8. Exposition du port
# Railway injecte la variable PORT, on expose par défaut 3000
EXPOSE 3000

# 9. Commande de démarrage
# On utilise 'tsx' pour lancer le serveur TypeScript directement. 
# On écoute sur 0.0.0.0 pour être accessible de l'extérieur.
CMD ["npx", "tsx", "src/server.ts", "--host", "0.0.0.0"]