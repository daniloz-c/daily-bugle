const db = require('../database/db');
const LOCAL_NEWS_SOURCE = 'NY1';

class RealNewsModel {
  /**
   * Busca notícias do mundo real cacheadas para uma determinada data
   */
  static getByDate(dateStr) {
    return db.prepare('SELECT * FROM real_news_cache WHERE fetch_date = ? AND source_name = ? ORDER BY id ASC').all(dateStr, LOCAL_NEWS_SOURCE);
  }

  /**
   * Busca notícias do mundo real por array de IDs
   */
  static getByIds(idsArray) {
    if (!idsArray || idsArray.length === 0) return [];
    const placeholders = idsArray.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM real_news_cache WHERE source_name = ? AND id IN (${placeholders})`);
    return stmt.all(LOCAL_NEWS_SOURCE, ...idsArray);
  }

  /**
   * Salva uma lista de notícias da API externa no cache do SQLite
   */
  static saveBatch(newsItems, fetchDate) {
    const insertStmt = db.prepare(`
      INSERT INTO real_news_cache (
        title, summary, content, source_name, source_url, image_url, category, published_at, fetch_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertedIds = [];
    for (const item of newsItems) {
      const res = insertStmt.run(
        item.title,
        item.summary || item.description || '',
        item.content || item.summary || '',
        item.source_name || item.source || 'Associated Press',
        item.source_url || item.url || '#',
        item.image_url || item.urlToImage || '',
        item.category || 'GENERAL',
        item.published_at || new Date().toISOString(),
        fetchDate
      );
      insertedIds.push(res.lastInsertRowid);
    }

    return insertedIds;
  }

  /**
   * Retorna as notícias mais recentes salvas no cache (independente da data)
   */
  static getLatest(limit = 10) {
    return db.prepare('SELECT * FROM real_news_cache WHERE source_name = ? ORDER BY id DESC LIMIT ?').all(LOCAL_NEWS_SOURCE, limit);
  }
}

module.exports = RealNewsModel;
