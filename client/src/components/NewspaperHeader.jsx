import React from 'react';

export default function NewspaperHeader({ edition }) {
  if (!edition) return null;

  const {
    formattedDate = 'MONDAY, OCTOBER 19, 2026',
    editionNumber = 42385,
    editionTitle = 'MORNING FINAL',
    weatherText = 'Partly cloudy / High 68°F',
    priceText = '50¢',
    city = 'NEW YORK, N.Y.',
    website = 'www.dailybugle.com',
    tagline = "NEW YORK'S FAVORITE NEWSPAPER SINCE 1898",
    teasers = {}
  } = edition;

  return (
    <header className="newspaper-masthead-section" role="banner">
      <div className="teasers-row">
        <div className="teaser-box teaser-left">
          <span className="teaser-kicker">{teasers.left?.tag || 'A HARD SEASON FOR'}</span>
          <p className="teaser-headline">{teasers.left?.headline || "NEW YORK'S HOMELESS"}</p>
          <span className="teaser-page">{teasers.left?.page || 'CARDBOARD LIVING • PAGE 11'}</span>
        </div>
        <div className="teaser-box teaser-right">
          <span className="teaser-kicker">{teasers.right?.tag || 'INDIVIDUAL RIGHTS'}</span>
          <p className="teaser-headline">{teasers.right?.headline || 'GOING UP IN SMOKE'}</p>
          <span className="teaser-page">{teasers.right?.page || 'THE LAST WORD • PAGE 14'}</span>
        </div>
      </div>

      <div className="tagline-banner">
        <span className="tagline-text">{tagline}</span>
      </div>

      <div className="masthead-red-box">
        <div className="masthead-inner-border">
          <div className="bugle-brand-row">
            <span className="brand-word-daily">DAILY</span>
            <img
              src="/assets/images/bugle-emblem.svg"
              alt="Daily Bugle emblem"
              className="brand-emblem"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="brand-word-bugle">BUGLE</span>
          </div>
        </div>
      </div>

      <div className="dateline-bar">
        <div className="dateline-edition-meta">
          <strong>{editionTitle}</strong>
          <span>{city}</span>
          <span>{formattedDate}</span>
          <span className="dateline-weather">{weatherText}</span>
        </div>
        <div className="dateline-publication-meta">
          <span className="price-tag">{priceText}</span>
          <span>{website}</span>
          <span className="edition-volume">VOL. CXXXVIII NO. {editionNumber}</span>
        </div>
      </div>
    </header>
  );
}
