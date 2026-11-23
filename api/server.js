require('dotenv').config();
const app = require('./app');

const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log(`API de validade rodando em http://localhost:${porta}/api`));
