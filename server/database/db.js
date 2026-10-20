const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'dailybugle.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');
const seedsPath = path.resolve(__dirname, 'seeds', 'spiderNews.json');

// Inicializa a conexão SQLite nativa síncrona
const db = new DatabaseSync(dbPath);

// Cria as tabelas caso não existam
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

// Popula o acervo de histórias do Homem-Aranha caso a tabela esteja vazia
const countResult = db.prepare('SELECT COUNT(*) as count FROM spider_news').get();
if (countResult && countResult.count === 0) {
  console.log('📰 Populando acervo inicial de notícias do Homem-Aranha no Clarim...');
  if (fs.existsSync(seedsPath)) {
    const seeds = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));
    const insertStmt = db.prepare(`
      INSERT INTO spider_news (
        title, subtitle, content, author, image_url, image_caption,
        category, headline_type, editorial_quote, badge_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of seeds) {
      insertStmt.run(
        item.title,
        item.subtitle || '',
        item.content,
        item.author || 'Peter Parker',
        item.image_url,
        item.image_caption || '',
        item.category || 'CRIME',
        item.headline_type || 'HERO',
        item.editorial_quote || '',
        item.badge_text || 'EXCLUSIVO'
      );
    }
    console.log(`✅ ${seeds.length} matérias do Homem-Aranha cadastradas com sucesso!`);
  }
}

module.exports = db;
