const SpiderNewsModel = require('../models/SpiderNewsModel');

class SpiderNewsController {
  /**
   * Lista todas as matérias cadastradas do Homem-Aranha
   */
  static getAll(req, res) {
    try {
      const news = SpiderNewsModel.getAll();
      return res.json({ success: true, data: news });
    } catch (err) {
      console.error('Erro ao buscar matérias do Aranha:', err);
      return res.status(500).json({ success: false, error: 'Erro interno ao consultar acervo do Aranha' });
    }
  }

  /**
   * Busca matéria por ID
   */
  static getById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const article = SpiderNewsModel.getById(id);
      if (!article) {
        return res.status(404).json({ success: false, error: 'Matéria não encontrada' });
      }
      return res.json({ success: true, data: article });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Cadastra nova matéria temática
   */
  static create(req, res) {
    try {
      const { title, subtitle, content, author, image_url, category, headline_type, editorial_quote, badge_text } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Título e conteúdo são obrigatórios' });
      }

      const created = SpiderNewsModel.create({
        title,
        subtitle,
        content,
        author,
        image_url,
        category,
        headline_type,
        editorial_quote,
        badge_text
      });

      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = SpiderNewsController;
