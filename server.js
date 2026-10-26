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
            content: "Tu es un Product Owner senior expert. Rédige un ticket de backlog de très haute qualité en français au format markdown. Inclus obligatoirement : 1. La User Story (En tant que / Je veux / Afin de), 2. La priorisation MoSCoW, 3. Une estimation suggérée en Story Points, 4. Les critères d'acceptation au format Gherkin (Étant donné / Lorsque / Alors), 5. Les cas limites (Edge cases) et règles métier." 
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
      resultText = `### [US] ${promptText.slice(0, 50)}...\n\n**Priorité MoSCoW :** Must have\n**Estimation suggérée :** 3 Story Points\n\n**En tant que** utilisateur,\n**Je veux** ${promptText},\n**Afin de** optimiser mon parcours.\n\n#### Critères d'acceptation (Gherkin) :\n- **Étant donné** que l'utilisateur est sur la page\n- **Lorsque** il effectue l'action\n- **Alors** le système valide et confirme.\n\n#### Cas limites :\n- Gestion du timeout réseau.`;
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
