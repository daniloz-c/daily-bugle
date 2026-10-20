const db = require('../database/db');

class SpiderNewsModel {
  /**
   * Retorna todas as notícias do Aranha cadastradas
   */
  static getAll() {
    return db.prepare('SELECT * FROM spider_news ORDER BY id ASC').all();
  }

  /**
   * Busca matéria por ID
   */
  static getById(id) {
    return db.prepare('SELECT * FROM spider_news WHERE id = ?').get(id);
  }

  /**
   * Seleciona a notícia do dia com base em rotação determinística pela data (YYYY-MM-DD)
   * Garante que o mesmo dia receba sempre a mesma matéria até que o dia mude.
   */
  static getRotatingNewsForDate(dateStr) {
    const all = this.getAll();
    if (!all || all.length === 0) return null;

    // Converte a string de data (ex: '2026-10-02') em um número pseudo-hash
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash * 31 + dateStr.charCodeAt(i)) % 2147483647;
    }
    const index = Math.abs(hash) % all.length;
    return all[index];
  }

  /**
   * Cadastra uma nova matéria do Homem-Aranha
   */
  static create({ title, subtitle, content, author, image_url, image_caption, category, headline_type, editorial_quote, badge_text }) {
    const stmt = db.prepare(`
      INSERT INTO spider_news (
        title, subtitle, content, author, image_url, image_caption,
        category, headline_type, editorial_quote, badge_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      subtitle || '',
      content,
      author || 'Peter Parker',
      image_url || '/assets/images/spiderman_skyscrapers_leap.png',
      image_caption || '',
      category || 'CRIME',
      headline_type || 'HERO',
      editorial_quote || '',
      badge_text || 'EXCLUSIVO'
    );

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Incrementa contador de destaque da notícia
   */
  static incrementFeatured(id) {
    db.prepare('UPDATE spider_news SET times_featured = times_featured + 1 WHERE id = ?').run(id);
  }
}

module.exports = SpiderNewsModel;
