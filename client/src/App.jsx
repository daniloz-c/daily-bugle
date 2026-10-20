import React, { useEffect, useState } from 'react';
import NewspaperHeader from './components/NewspaperHeader';
import HeroSpiderCover from './components/HeroSpiderCover';
import WorldNewsGrid from './components/WorldNewsGrid';
import ArticleModal from './components/ArticleModal';
import { fetchTodayEdition } from './services/api';

import './styles/style.css';
import './styles/newspaper.css';
import './styles/bugle-mvc.css';

export default function App() {
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    let active = true;
    fetchTodayEdition()
      .then((data) => {
        if (active) setEdition(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not connect to the Daily Bugle servers.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="pressreader-app-container theme-vintage">
      <main className="bugle-site-main">
        {loading ? (
          <div className="bugle-loading-screen">
            <div className="rotary-press-spinner"></div>
            <h2 className="loading-title">THE DAILY BUGLE PRESSES ARE ROLLING...</h2>
            <p className="loading-desc">Preparing today's cover and New York City news.</p>
          </div>
        ) : error ? (
          <div className="bugle-error-screen">
            <h2 className="error-title">PRESSROOM BREAKDOWN!</h2>
            <p className="error-desc">{error}</p>
            <button className="error-retry-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : (
          <div className="newspaper-page-stack">
            <section className="newspaper-broadsheet-sheet cover-page" aria-label="Daily Bugle front page">
              <NewspaperHeader edition={edition} />
              <HeroSpiderCover
                spiderHero={edition?.spiderHero}
                onArticleClick={setActiveArticle}
                soundEnabled={false}
              />
              <footer className="newspaper-broadsheet-footer">
                <div className="footer-content">
                  <span>POLICE CHIEF SPEAKS OUT: PAGE 2</span>
                </div>
              </footer>
            </section>

            {edition?.worldNews?.length > 0 && (
              <section className="newspaper-broadsheet-sheet news-page" aria-label="Page two: New York City news">
                <h2 className="news-page-title">INSIDE: CITY NEWS</h2>
                <WorldNewsGrid
                  worldNews={edition.worldNews}
                  onArticleClick={setActiveArticle}
                  soundEnabled={false}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {activeArticle && (
        <ArticleModal article={activeArticle} onClose={() => setActiveArticle(null)} />
      )}
    </div>
  );
}
