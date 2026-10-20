# 🗞️ The Daily Bugle — Especificação do Projeto e Diretrizes do Agente

> **Documento de Requisitos, Arquitetura e Diretrizes de Desenvolvimento**  
> **Tema:** Jornal Digital Interativo inspirado no *The Daily Bugle* (Clarim Diário) do universo do Homem-Aranha.  
> **Padrão Arquitetural:** MVC (Model-View-Controller)  
> **Stack Tecnológica:** Node.js, Express, React, SQLite, News API externa.

---

## 1. Visão Geral do Projeto

O **The Daily Bugle** é uma aplicação web de jornal digital que recria com alta fidelidade a estética e o formato clássico de um jornal impresso novaiorquino (*Broadsheet*), contextualizado no universo do Homem-Aranha e do editor J. Jonah Jameson.

### Proposta de Valor e Conceito Central
- **Capa Icônica do Clarim Diário:** A matéria principal de capa (*Hero Story*) é sempre voltada a um feito, polêmica, batalha ou aparição do **Homem-Aranha** (ex.: *"Homem-Aranha Desistiu?"*, *"Ameaça ou Salvador?"*, *"Aranha é Visto no Central Park"*), acompanhada de fotos clássicas de Peter Parker e manchetes sensacionalistas.
- **Rotação Diária da Capa:** A cada novo dia, a capa é alterada automaticamente para uma nova matéria temática do Homem-Aranha.
- **Notícias do Mundo Real:** Todas as matérias e colunas ao redor da capa principal são alimentadas dinamicamente através de uma **API de notícias reais** (atualizadas diariamente), mesclando a narrativa ficcional do Homem-Aranha com o noticiário factual do mundo contemporâneo.
- **Experiência de Leitura Imersiva:** Diagramação clássica em colunas, tipografia de imprensa, controles de zoom/leitura e textura de papel envelhecido.

---

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)

| ID | Requisito | Descrição |
| :--- | :--- | :--- |
| **RF-01** | **Manchete de Capa Temática** | Exibir obrigatoriamente como destaque de capa uma notícia sobre o Homem-Aranha com título chamativo, subtítulo, autor (ex: Peter Parker / Betty Brant), editorial assinado (J. Jonah Jameson) e fotografia em estilo retrô. |
| **RF-02** | **Rotação Diária da Capa** | Trocar automaticamente a matéria de capa do Homem-Aranha a cada novo dia (baseado na data atual), selecionando do acervo no banco de dados SQLite. |
| **RF-03** | **Integração com API de Notícias** | Consumir uma API externa de notícias (ex.: NewsAPI, GNews, Currents ou feed RSS público) para popular as matérias secundárias, colunas laterais, esportes, economia e rodapé com notícias do mundo real. |
| **RF-04** | **Cache e Persistência Diária** | Salvar e cachear as notícias do dia no SQLite para evitar estouro de limite de requisições da API externa e garantir consistência na edição do dia. |
| **RF-05** | **Navegação e Leitor Dinâmico** | Permitir ao leitor navegar na página do jornal com controles de Zoom (ajuste de tela, 100%, modo leitura em alta resolução), arrasto (Pan) e clique para ler a matéria completa em modal. |
| **RF-06** | **Arquivo Histórico de Edições** | Permitir consultar edições de dias anteriores através de seletor de data ou calendário no cabeçalho. |
| **RF-07** | **Modo de Contingência (Fallback)** | Caso a API de notícias esteja sem conexão ou com cota excedida, o sistema deve servir notícias cacheadas ou um lote de matérias de contingência sem quebrar a interface. |

### 2.2 Requisitos Não Funcionais (RNF)

| ID | Requisito | Descrição |
| :--- | :--- | :--- |
| **RNF-01** | **Padrão Arquitetural MVC** | Separação estrita entre Model (SQLite + Regras de dados), View (Interface React) e Controller (Rotas Express + Controladores de Aplicação). |
| **RNF-02** | **Desempenho e Otimização** | Carregamento rápido da edição diária, com renderização eficiente de colunas e textos sem degradação visual. |
| **RNF-03** | **Fidelidade Visual & Estética** | Manter a identidade visual vintage do *Daily Bugle*: fontes clássicas de imprensa (*Anton*, *Playfair Display*, *Libre Baskerville*, *Courier Prime*), separadores, vinhetas, retículas e efeito papel jornal. |
| **RNF-04** | **Responsividade** | Adaptabilidade para desktops (visão broadsheet completa) e dispositivos móveis (leitura vertical adaptativa com preservação do layout). |

---

## 3. Arquitetura do Sistema (MVC)

O projeto adota o padrão **Model-View-Controller (MVC)** dividido entre Backend (Node.js/Express + SQLite) e Frontend (React):

```
+-------------------------------------------------------------------------+
|                               VIEW (React)                              |
|  - Layout Broadsheet (Header, Hero Cover, Columns, Ticker, Footer)      |
|  - Controles de Leitor (Zoom In/Out, Pan, Fit, Modo Leitura)             |
|  - Modal de Notícia Completa / Seletor de Edição Diária                 |
+------------------------------------+------------------------------------+
                                     | Requisições HTTP (REST API)
                                     v
+-------------------------------------------------------------------------+
|                        CONTROLLER (Node.js / Express)                   |
|  - EditionController: Orquestra a edição do dia e histórico             |
|  - SpiderNewsController: Gerencia histórias e rotação do Aranha         |
|  - WorldNewsController: Comunica com a News API externa e gerencia cache|
+------------------------------------+------------------------------------+
                                     | Leitura e Escrita
                                     v
+-------------------------------------------------------------------------+
|                         MODEL (SQLite + DAO / ORM)                      |
|  - SpiderNews: Notícias do Aranha (Títulos, Imagens, Textos)            |
|  - RealNewsCache: Notícias reais cacheadas por data e categoria        |
|  - DailyEditions: Vínculo entre data, capa do Aranha e notícias reais   |
+-------------------------------------------------------------------------+
```

### 3.1 Model (Camada de Dados & Persistência)
Localizado no backend com **SQLite**:
- Responsável pela integridade, persistência e consulta dos dados.
- Estrutura de dados para o acervo de histórias do Aranha, edições e cache das notícias da API externa.

### 3.2 View (Camada de Apresentação)
Desenvolvido em **React**:
- Componentes funcionais e reativos para montar a página do jornal.
- Gerenciamento de estado de visualização (zoom, pan, matéria ativa, tema).
- Consumo transparente dos endpoints fornecidos pelos Controllers.

### 3.3 Controller (Camada de Lógica e Orquestração)
Desenvolvido com **Express (Node.js)**:
- Roteamento e tratamento de requisições (`/api/...`).
- Orquestrador da edição diária: ao receber `GET /api/edition/today`, verifica se já existe uma edição gerada para hoje no SQLite. Se não houver, busca as notícias reais na API externa, sorteia a matéria do Aranha do dia e cria a nova edição persistida.

---

## 4. Modelagem do Banco de Dados (SQLite)

### Diagrama Entidade-Relacionamento (Conceitual)

```
+-----------------------+          +-----------------------+
|      spider_news      |          |    real_news_cache    |
+-----------------------+          +-----------------------+
| id (PK)               |          | id (PK)               |
| title                 |          | title                 |
| headline_type         |          | summary               |
| content               |          | content               |
| author                |          | source_name           |
| image_url             |          | source_url            |
| image_caption         |          | image_url             |
| category              |          | category              |
| times_featured        |          | published_at          |
| created_at            |          | fetch_date            |
+-----------+-----------+          +-----------+-----------+
            |                                  |
            +----------------+  +--------------+
                             |  |
                     +-------v--v------------+
                     |    daily_editions     |
                     +-----------------------+
                     | id (PK)               |
                     | edition_date (UNIQUE) |
                     | spider_news_id (FK)   |
                     | real_news_ids (JSON)  |
                     | weather_info          |
                     | created_at            |
                     +-----------------------+
```

### 4.1 Schema DDL Recomendado

```sql
-- Acervo de Notícias e Feitos do Homem-Aranha
CREATE TABLE IF NOT EXISTS spider_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Peter Parker',
  image_url TEXT NOT NULL,
  image_caption TEXT,
  category TEXT DEFAULT 'CRIME',
  headline_type TEXT DEFAULT 'HERO', -- HERO, MENACE, MYSTERY
  editorial_quote TEXT,              -- Comentário raivoso do J. Jonah Jameson
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cache de Notícias do Mundo Real da API Externa
CREATE TABLE IF NOT EXISTS real_news_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT,
  source_url TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'GENERAL',   -- WORLD, TECH, BUSINESS, SPORTS
  published_at TEXT,
  fetch_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registro da Edição Diária Consolidada
CREATE TABLE IF NOT EXISTS daily_editions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edition_date DATE UNIQUE NOT NULL, -- Formato: YYYY-MM-DD
  edition_number INTEGER NOT NULL,
  spider_news_id INTEGER NOT NULL,
  real_news_ids TEXT NOT NULL,       -- Lista de IDs em JSON [1, 2, 3, ...]
  weather_text TEXT,
  price_text TEXT DEFAULT '50¢',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spider_news_id) REFERENCES spider_news(id)
);
```

---

## 5. Estratégia de Rotação Diária e Integração de APIs

### 5.1 Algoritmo da Edição Diária (`Edition Service`)
1. **Verificação de Existência:** Quando o usuário acessa o jornal, o frontend solicita `GET /api/edition/today`.
2. **Hit no Banco:** Se existir registro em `daily_editions` para a data atual (`YYYY-MM-DD`), retorna a edição armazenada com as matérias já associadas.
3. **Miss (Novo Dia):**
   - **Manchete do Aranha:** Seleciona uma matéria de `spider_news` que ainda não foi exibida recentemente (rotação baseada na data ou índice cíclico).
   - **Notícias do Mundo Real:** Consulta a API de Notícias (ex.: NewsAPI / GNews) buscando os destaques mais recentes.
   - **Persistência:** Salva as notícias reais em `real_news_cache` e cria um novo registro em `daily_editions`.
   - **Retorno:** Retorna o pacote completo e montado para a View.

### 5.2 APIs de Notícias Compatíveis
- **Opção 1:** [NewsAPI.org](https://newsapi.org/) (Notícias globais e por país, suporte a categorias).
- **Opção 2:** [GNews.io](https://gnews.io/) (Alternativa leve e rápida com plano gratuito).
- **Opção 3:** [Currents API](https://currentsapi.services/) ou feeds RSS abertos de jornais públicos.
- **Camada de Fallback:** Se a API externa falhar ou atingir cota, o serviço busca automaticamente as últimas notícias salvas no cache do SQLite.

---

## 6. Endpoints da API REST (Express Controller)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/edition/today` | Retorna a edição completa de hoje (capa do Aranha + notícias reais). |
| `GET` | `/api/edition/:date` | Retorna a edição de uma data específica (`YYYY-MM-DD`). |
| `GET` | `/api/spider-news` | Lista todas as matérias temáticas do Aranha no acervo. |
| `POST` | `/api/spider-news` | Cadastra uma nova matéria do Homem-Aranha no acervo. |
| `GET` | `/api/real-news/latest` | Retorna notícias do mundo real mais recentes do cache. |
| `POST` | `/api/edition/force-refresh` | Força a atualização da edição de hoje com nova consulta à API externa. |

---

## 7. Estrutura de Diretórios Recomendada

```
daily-bugle/
├── agent.md                    # Este documento de especificação e governança
├── package.json                # Gerenciador de dependências raiz ou backend
├── server/                     # BACKEND (Node.js + Express + SQLite)
│   ├── database/
│   │   ├── db.js               # Conexão SQLite (better-sqlite3 ou sqlite3)
│   │   ├── schema.sql          # Criação das tabelas
│   │   └── seeds/              # Matérias iniciais do Homem-Aranha e edições
│   │       └── spiderNews.json
│   ├── models/                 # MODEL
│   │   ├── SpiderNewsModel.js
│   │   ├── RealNewsModel.js
│   │   └── EditionModel.js
│   ├── controllers/            # CONTROLLER
│   │   ├── EditionController.js
│   │   ├── SpiderNewsController.js
│   │   └── RealNewsController.js
│   ├── services/
│   │   └── NewsApiService.js   # Integração externa com API de notícias + fallback
│   ├── routes/
│   │   └── api.js              # Rotas Express
│   └── app.js                  # Inicialização do servidor Express
│
├── client/                     # FRONTEND (React + Vite)
│   ├── public/
│   │   └── assets/             # Imagens, recortes, texturas de papel, ícones
│   ├── src/
│   │   ├── components/         # VIEW (Componentes React)
│   │   │   ├── layout/
│   │   │   │   ├── NewspaperHeader.jsx
│   │   │   │   ├── NewspaperFooter.jsx
│   │   │   │   └── TopTeasers.jsx
│   │   │   ├── newspaper/
│   │   │   │   ├── HeroSpiderCover.jsx  # Manchete de capa do Homem-Aranha
│   │   │   │   ├── WorldNewsColumn.jsx  # Colunas de notícias reais
│   │   │   │   ├── ArticleCard.jsx      # Card de artigo individual
│   │   │   │   └── JJonahEditorial.jsx  # Coluna de opinião de J. Jonah Jameson
│   │   │   ├── reader/
│   │   │   │   ├── ZoomControls.jsx     # Ferramentas de zoom e pan
│   │   │   │   └── ArticleModal.jsx     # Modal de leitura aprofundada
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useEdition.js   # Hook para busca da edição diária
│   │   │   └── usePanZoom.js   # Controle de navegação e ampliação
│   │   ├── services/
│   │   │   └── api.js          # Cliente HTTP (fetch / axios) para o backend
│   │   ├── styles/             # Folhas de estilo modulares
│   │   │   ├── newspaper.css   # Tipografia e estética de jornal broadsheet
│   │   │   └── reader.css      # Estilos do visualizador interativo
│   │   ├── App.jsx             # Componente raiz
│   │   └── main.jsx            # Ponto de entrada React
│
└── README.md                   # Instruções de instalação e execução
```

---

## 8. Roteiro de Implementação (Roadmap)

### Fase 1: Fundação do Backend MVC (Node + Express + SQLite)
- [ ] Inicializar o ambiente Node.js com Express e SQLite (`better-sqlite3`).
- [ ] Criar schemas do banco e scripts de *seeds* com no mínimo 10 matérias variadas do Homem-Aranha (feitos heróicos, acusações de J. Jonah Jameson, fuga de vilões, fotos de Peter Parker).
- [ ] Implementar os Models e Controllers para `spider_news` e `daily_editions`.

### Fase 2: Integração com API de Notícias & Rotação Diária
- [ ] Configurar serviço de chamada para a News API com suporte a chave de ambiente (`.env`).
- [ ] Implementar mecanismo de cache e verificação de virada de data (`YYYY-MM-DD`).
- [ ] Criar lógica de contingência caso a API externa fique indisponível.

### Fase 3: Migração e Construção do Frontend React (View)
- [ ] Criar a aplicação React (via Vite) aproveitando os estilos CSS consolidados (`newspaper.css`, fontes Google Fonts de jornal).
- [ ] Componentizar a interface:
  - Header clássico do Daily Bugle com data do dia, preço e previsão do tempo.
  - Seção Hero de Capa com a manchete do Homem-Aranha em destaque.
  - Grid jornalístico em colunas para as notícias do mundo real.
  - Controles de Pan & Zoom para leitura das letrinhas miúdas.
  - Modal de leitura para abrir matérias em tamanho legível.

### Fase 4: Integração, Testes e Refinamento
- [ ] Conectar o React ao backend Express consumindo `/api/edition/today`.
- [ ] Testar a troca automática de data simulando diferentes dias.
- [ ] Otimizar tempos de carregamento, estados de *loading* temáticos (ex: *"IMPRIMINDO A EDIÇÃO DE HOJE..."*) e tratamento de erros.

---

## 9. Diretrizes para o Agente de IA

Ao executar qualquer tarefa neste repositório, o agente deve seguir rigorosamente:
1. **Respeitar a Arquitetura MVC:** Manter a separação estrita entre Model (dados/banco), View (componentes React) e Controller (lógica de rotas e orquestração).
2. **Preservar o Tema e a Estética:** Nunca utilizar layouts genéricos ou cores padrão sem contexto. O Daily Bugle deve ter visual de jornal clássico, vintage e sensacionalista dos quadrinhos do Homem-Aranha.
3. **Segurança de APIs:** Nunca expor chaves de API externas diretamente no código do cliente; todo consumo da News API deve passar pelo backend Express via variáveis de ambiente (`.env`).
4. **Resiliência:** Garantir sempre dados mockados ou em cache para que a aplicação nunca abra em tela branca ou quebrada caso a API de notícias atinja o limite de requisições.