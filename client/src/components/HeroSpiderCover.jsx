import React from 'react';
import { playCameraShutterSound, playPageFlipSound } from '../utils/audioEffects';

export default function HeroSpiderCover({ spiderHero, onArticleClick, soundEnabled }) {
  if (!spiderHero) return null;

  const {
    id,
    title = 'VIGILANTE EVADES POLICE!',
    subtitle = '',
    content = '',
    author = 'Peter Parker',
    image_url = '/assets/images/spiderman_nypd_cops.png',
    image_caption = '',
    category = 'POLICE PURSUIT',
    editorial_quote = '',
    badge_text = 'BUGLE EXCLUSIVE'
  } = spiderHero;
  const headline = title.trim().toUpperCase();
  const isCoverHeadline = headline === 'VIGILANTE EVADES POLICE!';

  const handlePhotoClick = (e) => {
    e.stopPropagation();
    playCameraShutterSound(soundEnabled);
  };

  const handleOpenArticle = () => {
    playPageFlipSound(soundEnabled);
    onArticleClick?.({
      id: `spider-${id}`,
      title,
      subtitle,
      content,
      author: `By ${author} (Exclusive Photographer)`,
      source_name: 'The Daily Bugle Investigations',
      category,
      image_url,
      image_caption,
      editorial_quote,
      isSpider: true
    });
  };

  return (
    <article
      className="hero-spider-cover-section"
      onClick={handleOpenArticle}
      title="Click to read the full cover story"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleOpenArticle(); }}
    >
      <h2 className="hero-main-headline">
        {isCoverHeadline ? 'VIGILANTE' : title}
      </h2>
      <div className="hero-body-grid">
        <div className="hero-headline-column">
          {isCoverHeadline && (
            <h3 className="hero-secondary-headline">
              <span>EVADES</span>
              <span>POLICE!</span>
            </h3>
          )}
          <div className="mayor-quote-panel">
            <span>“FORCE MUST</span>
            <span>NET THE BUG”</span>
            <span>SAYS MAYOR</span>
          </div>
          <p className="hero-report-label">Blow-by-Blow<br />Bugle Report</p>
        </div>

        <figure className="hero-photo-figure" onClick={handlePhotoClick}>
          <div className="hero-photo-frame">
            <img
              src={image_url}
              alt="Spider-Man evading police between New York City buildings"
              className="hero-spider-img"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/spiderman_skyscrapers_leap.png';
              }}
            />
          </div>
        </figure>
      </div>
    </article>
  );
}
