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

// Route API pour la génération de tickets par l'IA
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type, details, format } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Tu es un Product Owner senior expert en rédaction de tickets de backlog (User Stories, Bugs, Critères d'acceptation Gherkin). Tu réponds en français avec une structure claire et professionnelle." 
        },
        { 
          role: "user", 
          content: `Type de livrable: ${type || 'User story'}\nBesoin: ${prompt}\nDétails additionnels: ${JSON.stringify(details || {})}\nFormat de sortie: ${format || 'Jira'}` 
        }
      ],
      temperature: 0.7,
    });

    const resultText = completion.choices[0].message.content;
    res.json({ success: true, result: resultText });
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('PO Copilot v0.3 en écoute sur le port ' + PORT);
});
