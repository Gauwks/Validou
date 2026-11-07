const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { naoEncontrado, tratarErros } = require('./middleware/erros');

const app = express();
const origens = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors(origens.length ? { origin: origens } : undefined));
app.use(express.json());
app.use('/api', routes);
app.use(naoEncontrado);
app.use(tratarErros);

module.exports = app;
