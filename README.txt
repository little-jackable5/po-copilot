PO COPILOT v0.3 — PREMIÈRE CONNEXION À UNE IA
================================================

Cette version lance l'application dans un petit serveur local et appelle l'API OpenAI côté serveur. La clé API ne doit jamais être ajoutée au HTML.

PRÉREQUIS
- Un Mac avec Node.js installé (https://nodejs.org/). Une version LTS récente est recommandée.
- Une clé API OpenAI et une facturation API configurée si nécessaire. L'abonnement ChatGPT et la facturation API sont distincts.

ÉTAPE 1 — Ouvrir le dossier
Décompresse l'archive, puis ouvre le dossier « po-copilot-v0.3 » dans le Finder.

ÉTAPE 2 — Créer la clé API
Crée une clé dans la plateforme API OpenAI : https://platform.openai.com/api-keys
Ne la partage avec personne et ne la colle pas dans le fichier HTML ni dans une capture d'écran.

ÉTAPE 3 — Configurer le fichier secret
Dans le dossier « po-copilot-v0.3 », duplique le fichier « .env.example » et nomme la copie « .env » (sans extension supplémentaire).
Ouvre le fichier .env dans un éditeur de texte et remplace la valeur OPENAI_API_KEY par ta clé réelle.
Le fichier .env est exclu du contrôle de version via .gitignore.

ÉTAPE 4 — Démarrer l'application
Ouvre l'application Terminal sur le Mac. Tape « cd » suivi d'une espace, puis fais glisser le dossier « po-copilot-v0.3 » dans la fenêtre Terminal et appuie sur Entrée.
Exécute ensuite :
  npm install
Puis :
  npm start
Garde cette fenêtre Terminal ouverte pendant l'utilisation de PO Copilot.

ÉTAPE 5 — Ouvrir PO Copilot
Dans le navigateur, ouvre : http://127.0.0.1:3000
Génère un ticket de test. La génération utilisera l'IA lorsque la clé API est correctement configurée.

ARRÊTER L'APPLICATION
Dans Terminal, appuie sur Ctrl + C.

EN CAS DE PROBLÈME
- « La clé API n’est pas configurée » : vérifie que le fichier s'appelle bien .env et qu'il est dans le dossier principal, au même niveau que server.js.
- Erreur 401 : la clé est incorrecte, révoquée ou mal copiée.
- Erreur 429 : vérifie les crédits, la facturation et les limites API.
- Erreur de modèle : modifie OPENAI_MODEL dans .env pour un modèle disponible sur ton compte.
- Si « npm » est introuvable, installe Node.js LTS puis ferme et rouvre Terminal.

SÉCURITÉ ET LIMITES
- Le serveur écoute uniquement sur l'ordinateur local (127.0.0.1), pas sur le réseau public.
- Ne partage pas la clé API, le fichier .env ou une archive qui le contiendrait.
- L'historique reste dans le stockage local du navigateur ; ce prototype n'a pas encore de comptes utilisateurs, base de données cloud ni paiement.
- Les appels API peuvent être facturés séparément de ChatGPT. Surveille l'usage dans la plateforme API.
