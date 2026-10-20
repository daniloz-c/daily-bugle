const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir estáticos da pasta assets (imagens, logotipos, emblemas)
const assetsPath = path.resolve(__dirname, '..', 'assets');
app.use('/assets', express.static(assetsPath));

// Servir build do cliente React se existir
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Rotas da API MVC
app.use('/api', apiRoutes);

// Rota de status/healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'The Daily Bugle Press Server',
    editor: 'J. Jonah Jameson',
    time: new Date().toISOString()
  });
});

// Em produção, qualquer rota não-API serve o index.html do React
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Daily Bugle API server is online. Start the React client with npm run client.');
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🗞️ THE DAILY BUGLE SERVER ATIVO NA PORTA: ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📰 Edição de Hoje: http://localhost:${PORT}/api/edition/today`);
    console.log(`====================================================`);
  });
}

module.exports = app;
