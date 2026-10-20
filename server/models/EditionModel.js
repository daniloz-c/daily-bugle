const db = require('../database/db');

class EditionModel {
  /**
   * Busca edição completa de uma data específica (YYYY-MM-DD)
   */
  static getByDate(dateStr) {
    return db.prepare('SELECT * FROM daily_editions WHERE edition_date = ?').get(dateStr);
  }

  /**
   * Conta quantas edições já foram registradas (para numeração do jornal)
   */
  static countAll() {
    const res = db.prepare('SELECT COUNT(*) as count FROM daily_editions').get();
    return res ? res.count : 0;
  }

  /**
   * Cria uma nova edição consolidada para uma data
   */
  static create({ edition_date, edition_number, edition_title, spider_news_id, real_news_ids, weather_text, price_text }) {
    const stmt = db.prepare(`
      INSERT INTO daily_editions (
        edition_date, edition_number, edition_title, spider_news_id, real_news_ids, weather_text, price_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      edition_date,
      edition_number || (this.countAll() + 42380),
      edition_title || 'MORNING FINAL',
      spider_news_id,
      JSON.stringify(real_news_ids || []),
      weather_text || 'Partly Cloudy / High 68°F',
      price_text || '50¢'
    );

    return db.prepare('SELECT * FROM daily_editions WHERE id = ?').get(result.lastInsertRowid);
  }

  /** Atualiza os IDs das notícias associadas a uma edição já existente. */
  static updateRealNewsIds(id, real_news_ids) {
    db.prepare('UPDATE daily_editions SET real_news_ids = ? WHERE id = ?')
      .run(JSON.stringify(real_news_ids || []), id);
  }

  /**
   * Deleta uma edição específica (usado em force-refresh)
   */
  static deleteByDate(dateStr) {
    return db.prepare('DELETE FROM daily_editions WHERE edition_date = ?').run(dateStr);
  }

  /**
   * Lista todas as edições existentes ordenadas por data descrescente
   */
  static listAll(limit = 30) {
    return db.prepare('SELECT * FROM daily_editions ORDER BY edition_date DESC LIMIT ?').all(limit);
  }
}

module.exports = EditionModel;
