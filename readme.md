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