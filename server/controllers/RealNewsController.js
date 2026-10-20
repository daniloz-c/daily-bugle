const RealNewsModel = require('../models/RealNewsModel');
const NewsApiService = require('../services/NewsApiService');

class RealNewsController {
  /**
   * Retorna as notícias mais recentes salvas no cache
   */
  static getLatest(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const news = RealNewsModel.getLatest(limit);
      return res.json({ success: true, data: news });
    } catch (err) {
      console.error('Erro ao buscar notícias reais:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Força uma nova busca na API externa e atualiza o cache
   */
  static async refresh(req, res) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const freshNews = await NewsApiService.fetchDailyNews();
      const ids = RealNewsModel.saveBatch(freshNews, todayStr);
      const saved = RealNewsModel.getByIds(ids);
      return res.json({ success: true, count: saved.length, data: saved });
    } catch (err) {
      console.error('Erro ao atualizar notícias reais:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = RealNewsController;
