# README

## 3\. Les nouvelles commandes

  * **Pour tout lancer (Construire + Démarrer) :**

    ```bash
    docker compose up
    ```

    *Ton terminal va rester bloqué et afficher les logs (console.log). Pour arrêter, fais `Ctrl + C`.*

  * **Pour lancer en arrière-plan (Mode Détaché) :**

    ```bash
    docker compose up -d
    ```

  * **Pour mettre à jour après une modification du code :**

    ```bash
    docker compose up -d --build
    ```

    *Cette commande est géniale : elle détecte ce qui a changé, reconstruit l'image et relance le tout.*

  * **Pour tout éteindre et nettoyer :**

    ```bash
    docker compose down
    ```

Pour le test avec la sandbox 
```bash
npx ngrok http 3000
```

## Commande run docker
```bash
open -a Docker  

docker compose down -v ; docker compose up
docker compose down ; docker compose up -d --build
```


Si tu n'as actuellement que la branche main, voici comment créer la branche de développement :

Bash

# GIT 
## Se placer sur main et s'assurer d'être à jour
git checkout main
git pull origin main

## Créer la branche dev
git checkout -b dev

## Envoyer la branche dev sur GitHub
git push -u origin dev

4. Le workflow au quotidien
Désormais, ne travaille plus directement sur main.

Code tes fonctionnalités sur dev.

Fais tes tests.

Quand tu es prêt à publier :

Fusionne dev dans main 

git checkout main -> git merge dev

Push sur main.