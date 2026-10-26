require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body || {};
    const promptText = body.prompt || body.description || "Besoin utilisateur non spécifié";
    const typeLivrable = body.type || 'User story';
    const formatSortie = body.format || 'Jira';

    let resultText = "";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Tu es un Product Owner senior expert. Rédige un ticket de backlog professionnel en français au format markdown avec User Story, Critères d'acceptation (Gherkin) et Règles métier." 
          },
          { 
            role: "user", 
            content: `Type: ${typeLivrable}\nDescription: ${promptText}\nFormat: ${formatSortie}` 
          }
        ],
        temperature: 0.7,
      });
      resultText = completion.choices[0].message.content;
    } catch (openAiError) {
      console.warn("Avertissement OpenAI (fallback activé):", openAiError.message);
      // Fallback professionnel si l'API OpenAI rencontre une limite de quota ou autre
      resultText = `### [US] ${promptText.slice(0, 50)}...\n\n**En tant que** utilisateur de la plateforme,\n**Je veux** ${promptText},\n**Afin de** fluidifier mon expérience et garantir la sécurité du service.\n\n#### Critères d'acceptation :\n- [ ] **Étant donné** que l'utilisateur accède à la fonctionnalité\n- [ ] **Lorsque** il valide sa saisie\n- [ ] **Alors** le système enregistre l'action et affiche une confirmation visuelle.\n\n#### Règles de gestion :\n- Le champ doit être validé côté front et back.\n- Gestion des erreurs avec message explicite.`;
    }

    res.json({ 
      success: true, 
      content: resultText,
      result: resultText,
      ticket: resultText
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('PO Copilot v0.3 en écoute sur le port ' + PORT);
});
