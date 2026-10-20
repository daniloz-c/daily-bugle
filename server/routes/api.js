const express = require('express');
const router = express.Router();

const EditionController = require('../controllers/EditionController');
const SpiderNewsController = require('../controllers/SpiderNewsController');
const RealNewsController = require('../controllers/RealNewsController');

// Rotas de Edições Diárias
router.get('/edition/today', EditionController.getToday);
router.get('/edition/archive', EditionController.listArchive);
router.get('/edition/:date', EditionController.getByDate);
router.post('/edition/force-refresh', EditionController.forceRefresh);

// Rotas do Acervo do Homem-Aranha
router.get('/spider-news', SpiderNewsController.getAll);
router.get('/spider-news/:id', SpiderNewsController.getById);
router.post('/spider-news', SpiderNewsController.create);

// Rotas de Notícias do Mundo Real
router.get('/real-news/latest', RealNewsController.getLatest);
router.post('/real-news/refresh', RealNewsController.refresh);

module.exports = router;
