require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();

if (!process.env.PORT) { process.env.PORT = 3000; }
app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log('PO Copilot v0.3 en écoute sur le port ' + process.env.PORT);
});
