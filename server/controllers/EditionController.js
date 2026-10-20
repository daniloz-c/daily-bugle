const EditionModel = require('../models/EditionModel');
const SpiderNewsModel = require('../models/SpiderNewsModel');
const RealNewsModel = require('../models/RealNewsModel');
const NewsApiService = require('../services/NewsApiService');

function formatDateToBugleHeader(dateStr) {
  // Converte YYYY-MM-DD para formato de imprensa do Daily Bugle
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${day}, ${year}`;
  } catch {
    return dateStr;
  }
}

class EditionController {
  /**
   * Garante e retorna a edição de uma determinada data (se não existir, cria sob demanda)
   */
  static async getOrCreateEdition(targetDate) {
    let edition = EditionModel.getByDate(targetDate);

    if (!edition) {
      console.log(`🗞️ Gerando nova edição do Clarim Diário para a data: ${targetDate}...`);

      // 1. Rotação diária do Homem-Aranha
      let spiderNews = SpiderNewsModel.getRotatingNewsForDate(targetDate);
      if (!spiderNews) {
        // Fallback caso não haja matérias
        spiderNews = { id: 1 };
      } else {
        SpiderNewsModel.incrementFeatured(spiderNews.id);
      }

      // 2. Busca notícias reais atualizadas da API externa
      const freshRealNews = await NewsApiService.fetchDailyNews();
      const realNewsIds = RealNewsModel.saveBatch(freshRealNews, targetDate);

      // 3. Cria a nova edição persistida no SQLite
      const count = EditionModel.countAll();
      edition = EditionModel.create({
        edition_date: targetDate,
        edition_number: 42380 + count + 1,
        edition_title: 'FINAL HOME EDITION',
        spider_news_id: spiderNews.id,
        real_news_ids: realNewsIds,
        weather_text: 'Partly Cloudy / High 68°F (Page 28)',
        price_text: '50¢'
      });
    }

    // Carrega dados completos relacionados
    const spiderNews = SpiderNewsModel.getById(edition.spider_news_id);
    let realNewsIds = [];
    try {
      realNewsIds = JSON.parse(edition.real_news_ids);
    } catch {
      realNewsIds = [];
    }
    
    let worldNews = RealNewsModel.getByIds(realNewsIds);
    if (!worldNews || worldNews.length === 0) {
      worldNews = RealNewsModel.getByDate(targetDate);
      if (!worldNews || worldNews.length === 0) {
        worldNews = RealNewsModel.getLatest(6);
      }
    }

    // Migra edições antigas cujo cache não contém notícias da fonte local atual.
    const today = new Date().toISOString().split('T')[0];
    if (worldNews.length === 0 && targetDate === today) {
      try {
        const freshLocalNews = await NewsApiService.fetchDailyNews();
        const refreshedIds = RealNewsModel.saveBatch(freshLocalNews, targetDate);
        if (refreshedIds.length > 0) {
          EditionModel.updateRealNewsIds(edition.id, refreshedIds);
          worldNews = RealNewsModel.getByIds(refreshedIds);
        }
      } catch (err) {
        console.warn('Não foi possível atualizar as notícias locais de hoje:', err.message);
      }
    }

    return {
      id: edition.id,
      editionDate: edition.edition_date,
      formattedDate: formatDateToBugleHeader(edition.edition_date),
      editionNumber: edition.edition_number,
      editionTitle: 'MORNING FINAL',
      weatherText: edition.weather_text,
      priceText: edition.price_text,
      city: 'NEW YORK, N.Y.',
      website: 'www.dailybugle.com',
      tagline: "NEW YORK'S FAVORITE NEWSPAPER SINCE 1898",
      teasers: {
        left: {
          tag: 'A HARD SEASON FOR',
          headline: "NEW YORK'S HOMELESS",
          page: 'CARDBOARD LIVING • PAGE 11'
        },
        right: {
          tag: 'INDIVIDUAL RIGHTS',
          headline: 'GOING UP IN SMOKE',
          page: 'THE LAST WORD • PAGE 14'
        }
      },
      spiderHero: spiderNews,
      worldNews: worldNews
    };
  }

  /**
   * Retorna a edição de hoje
   */
  static async getToday(req, res) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const data = await EditionController.getOrCreateEdition(todayStr);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Erro ao obter edição de hoje:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Retorna a edição de uma data específica (ex.: /api/edition/2026-10-02)
   */
  static async getByDate(req, res) {
    try {
      const { date } = req.params;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const data = await EditionController.getOrCreateEdition(date);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Erro ao obter edição por data:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Força atualização da edição de hoje (re-busca na API de notícias)
   */
  static async forceRefresh(req, res) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      EditionModel.deleteByDate(todayStr);
      const data = await EditionController.getOrCreateEdition(todayStr);
      return res.json({ success: true, message: 'Edition refreshed successfully.', data });
    } catch (err) {
      console.error('Erro ao forçar refresh:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Lista histórico de edições disponíveis
   */
  static listArchive(req, res) {
    try {
      const editions = EditionModel.listAll(30);
      return res.json({ success: true, data: editions });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = EditionController;
