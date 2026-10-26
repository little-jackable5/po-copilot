require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(express.json({ limit: '40kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const MAX_TEXT = 12000;
const kinds = new Set(['User story', 'Bug', 'Demande d’évolution', 'Tâche technique', 'Cas de test', 'Critères d’acceptation']);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'collez_votre_cle_api_ici') });
});

app.post('/api/generate', async (req, res) => {
  const data = req.body || {};
  const kind = String(data.kind || 'User story');
  const description = String(data.description || '').trim();
  if (!kinds.has(kind)) return res.status(400).json({ error: 'Type de ticket non reconnu.' });
  if (description.length < 12) return res.status(400).json({ error: 'Décris le besoin en au moins 12 caractères.' });
  for (const field of ['title', 'description', 'context', 'expected', 'constraints']) {
    if (String(data[field] || '').length > MAX_TEXT) return res.status(400).json({ error: 'Un champ est trop long. Réduis le texte puis réessaie.' });
  }
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'collez_votre_cle_api_ici') {
    return res.status(503).json({ error: 'La clé API n’est pas configurée. Suis le guide README pour créer le fichier .env.' });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const detail = ['Synthétique', 'Standard', 'Détaillé'].includes(data.detail) ? data.detail : 'Standard';
  const format = data.format === 'Description simple' ? 'Description simple' : 'Jira';
  const prompt = `Tu es PO Copilot, un assistant expert en rédaction de tickets Jira pour une équipe produit/logiciel. Rédige en français, clairement, sans inventer d'information.

RÈGLES GÉNÉRALES
- Utilise uniquement les faits fournis. Ne transforme pas une hypothèse en règle métier et n'invente ni comportement technique, ni écran, ni rôle, ni résultat attendu.
- Si une information manque, écris « À préciser » ou ajoute-la dans « Points à clarifier ».
- Critères d'acceptation : concrets, testables, concis, alignés sur la demande. N'ajoute pas de critères génériques non justifiés.
- Ton professionnel, compréhensible par un PO, un développeur et un interlocuteur non technique.
- Niveau de détail demandé : ${detail}.
- Format demandé : ${format}.

FORMAT SELON LE TYPE
- User story : commencer par le contexte, puis utiliser exactement « En tant que », « Je veux », « Afin de », puis « Critères d’acceptation » et « Points à clarifier ». Ne devine pas le rôle ; indique « À préciser » si absent.
- Bug : contexte, anomalie constatée, résultat attendu uniquement s'il est fourni, étapes de reproduction si elles sont fournies, critères de validation si utiles, points à clarifier. Ne rédige pas de User Story. N'ajoute jamais de « Definition of Done ».
- Demande d'évolution : contexte, besoin, valeur utilisateur si connue, critères d'acceptation, points à clarifier.
- Tâche technique : contexte, objectif, travaux attendus uniquement s'ils sont connus, critères de validation, points à clarifier.
- Cas de test : préconditions si connues, étapes, résultat attendu. Si le ticket source ne permet pas de les déterminer, le signaler.
- Critères d’acceptation : liste de critères vérifiables et points à clarifier.
- N'inclus pas de lignes décoratives de séparation. Pas d'emojis.
- Réponds uniquement avec le contenu final du ticket, prêt à copier dans Jira. Pas de commentaire introductif.

DONNÉES FOURNIES
Type : ${kind}
Titre : ${String(data.title || '').trim() || 'À proposer à partir de la demande'}
Description du besoin :
${description}
Contexte :
${String(data.context || '').trim() || 'Non fourni'}
Résultat attendu / valeur ajoutée :
${String(data.expected || '').trim() || 'Non fourni'}
Règles et contraintes :
${String(data.constraints || '').trim() || 'Non fournies'}
Format Jira sélectionné : ${format}`;

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: detail === 'Détaillé' ? 1800 : 1200
    });
    const content = String(response.output_text || '').trim();
    if (!content) return res.status(502).json({ error: 'L’IA n’a pas renvoyé de texte. Réessaie avec une demande plus précise.' });
    res.json({ content, model: process.env.OPENAI_MODEL || 'gpt-4.1-mini' });
  } catch (error) {
    console.error('Erreur API OpenAI:', error.status || error.name || 'Erreur');
    if (error.status === 401) return res.status(502).json({ error: 'La clé API a été refusée. Vérifie OPENAI_API_KEY dans le fichier .env.' });
    if (error.status === 429) return res.status(429).json({ error: 'Limite API atteinte ou crédits insuffisants. Vérifie la facturation et les limites de ton compte API.' });
    res.status(502).json({ error: 'Impossible de joindre le service IA. Vérifie la connexion, le modèle configuré et réessaie.' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`PO Copilot v0.3 disponible sur http://127.0.0.1:${PORT}`);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'collez_votre_cle_api_ici') {
    console.log('Étape restante : configurer OPENAI_API_KEY dans le fichier .env.');
  }
});
