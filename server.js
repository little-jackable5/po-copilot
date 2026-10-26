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

// Route API universelle et tolérante aux différents formats front-end
app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body || {};
    const promptText = body.prompt || body.description || body.text || body.besoin || "Générer un ticket de backlog";
    const typeLivrable = body.type || body.livrable || 'User story';
    const detailsLivrable = body.details || body.contexte || {};
    const formatSortie = body.format || 'Jira';
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Tu es un Product Owner senior expert en rédaction de tickets de backlog (User Stories, Bugs, Critères d'acceptation Gherkin). Tu réponds en français avec une structure claire, professionnelle et markdown." 
        },
        { 
          role: "user", 
          content: `Type de livrable: ${typeLivrable}\nBesoin: ${promptText}\nDétails: ${JSON.stringify(detailsLivrable)}\nFormat de sortie: ${formatSortie}` 
        }
      ],
      temperature: 0.7,
    });

    const resultText = completion.choices[0].message.content;
    
    // On renvoie TOUTES les clés possibles pour garantir que le front-end trouve son bonheur
    res.json({ 
      success: true, 
      result: resultText, 
      ticket: resultText, 
      content: resultText, 
      text: resultText, 
      output: resultText 
    });
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('PO Copilot v0.3 en écoute sur le port ' + PORT);
});
