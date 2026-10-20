import React from 'react';
import { playPageFlipSound } from '../utils/audioEffects';

export default function WorldNewsGrid({ worldNews = [], onArticleClick, soundEnabled }) {
  if (!worldNews || worldNews.length === 0) return null;

  const handleArticleClick = (item) => {
    playPageFlipSound(soundEnabled);
    onArticleClick?.({
      id: `world-${item.id}`,
      title: item.title,
      subtitle: `Source: ${item.source_name || 'NY1'} • Published: ${item.published_at ? new Date(item.published_at).toLocaleDateString('en-US') : 'Today'}`,
      content: item.content || item.summary || '',
      author: item.source_name || 'NY1',
      source_name: item.source_name || 'NY1',
      source_url: item.source_url || '#',
      category: item.category || 'NEW YORK CITY',
      image_url: item.image_url || '',
      isSpider: false
    });
  };

  const topColumns = worldNews.slice(0, 3);
  const bottomColumns = worldNews.slice(3, 9);

  return (
    <section className="world-news-section" aria-label="New York City news">
      <div className="section-header-rule">
        <h3 className="section-title-label"><span>NEW YORK CITY NEWS • NY1</span></h3>
        <span className="section-subtitle-tag">COVERAGE FROM ALL FIVE BOROUGHS</span>
      </div>

      <div className="world-news-trio-grid">
        {topColumns.map((item, idx) => (
          <article
            key={item.id || idx}
            className="world-news-card"
            onClick={() => handleArticleClick(item)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleArticleClick(item); }}
            title="Open local NY1 story"
          >
            <div className="card-top-tag">
              <span className="card-category-badge">{item.category || 'NEW YORK CITY'}</span>
              <span className="card-source">{item.source_name || 'NY1'}</span>
            </div>
            <h4 className="card-headline">{item.title}</h4>
            {item.image_url && (
              <div className="card-thumb-wrapper">
                <img src={item.image_url} alt={item.title} className="card-thumb-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
            <p className="card-snippet">
              <strong className="dateline-prefix">NEW YORK CITY — </strong>
              {item.summary || item.content}
            </p>
            <div className="card-footer-action"><span className="card-read-label">Read more ➔</span></div>
          </article>
        ))}
      </div>

      {bottomColumns.length > 0 && (
        <div className="world-news-lower-deck">
          <div className="deck-header-bar"><span>MORE NEWS FROM NEW YORK CITY</span></div>
          <div className="lower-columns-grid">
            {bottomColumns.map((item, idx) => (
              <div
                key={item.id || idx}
                className="deck-mini-article"
                onClick={() => handleArticleClick(item)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleArticleClick(item); }}
              >
                <div className="mini-badge-row">
                  <span className="mini-cat">{item.category || 'NEW YORK CITY'}</span>
                  <span className="mini-time">{item.source_name || 'NY1'}</span>
                </div>
                <h5 className="mini-headline">{item.title}</h5>
                <p className="mini-snippet">{item.summary?.substring(0, 140)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
