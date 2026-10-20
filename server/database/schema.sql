-- Schema do Banco de Dados SQLite do Daily Bugle

-- 1. Matérias do Homem-Aranha (Acervo para rotação de capa)
CREATE TABLE IF NOT EXISTS spider_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Peter Parker',
  image_url TEXT NOT NULL,
  image_caption TEXT,
  category TEXT DEFAULT 'CRIME & HEROICS',
  headline_type TEXT DEFAULT 'HERO', -- HERO, MENACE, MYSTERY, CRISIS
  editorial_quote TEXT,              -- Comentário raivoso do J. Jonah Jameson
  badge_text TEXT DEFAULT 'EXCLUSIVE',
  times_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cache de Notícias do Mundo Real (da API de notícias)
CREATE TABLE IF NOT EXISTS real_news_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT,
  source_url TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'GENERAL',   -- WORLD, TECH, BUSINESS, POLICE, SCIENCE
  published_at TEXT,
  fetch_date DATE NOT NULL,          -- YYYY-MM-DD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Registro de Edições Diárias (Consolidação da data atual)
CREATE TABLE IF NOT EXISTS daily_editions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edition_date DATE UNIQUE NOT NULL, -- YYYY-MM-DD
  edition_number INTEGER NOT NULL,
  edition_title TEXT DEFAULT 'MORNING EDITION',
  spider_news_id INTEGER NOT NULL,
  real_news_ids TEXT NOT NULL,       -- JSON array de IDs de notícias reais [1, 2, 3...]
  weather_text TEXT DEFAULT 'Partly Cloudy / High 68°F',
  price_text TEXT DEFAULT '50¢',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spider_news_id) REFERENCES spider_news(id)
);
