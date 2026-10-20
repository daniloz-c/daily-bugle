import React, { useState, useEffect } from 'react';

export default function ArticleModal({ article, onClose }) {
  const [fontSize, setFontSize] = useState(18);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [onClose]);

  if (!article) return null;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${article.title}. ${article.subtitle || ''}. ${article.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="article-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="article-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-toolbar">
          <div className="modal-badge-info">
            <span className="modal-cat-tag">{article.category || 'NEWS'}</span>
            <span className="modal-source-tag">{article.source_name || 'Daily Bugle'}</span>
          </div>

          <div className="modal-tools">
            <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="modal-tool-btn" title="Decrease font size">
              A-
            </button>
            <button onClick={() => setFontSize((f) => Math.min(28, f + 2))} className="modal-tool-btn" title="Increase font size">
              A+
            </button>

            {'speechSynthesis' in window && (
              <button
                onClick={handleSpeak}
                className={`modal-tool-btn ${isSpeaking ? 'active' : ''}`}
                title={isSpeaking ? 'Stop speaking' : 'Read article aloud'}
              >
                {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
              </button>
            )}

            <button onClick={onClose} className="modal-close-btn" title="Close reader (Esc)" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="modal-scroll-body">
          <h2 className="modal-title">{article.title}</h2>
          {article.subtitle && <p className="modal-subtitle">{article.subtitle}</p>}

          <div className="modal-meta-row">
            <span className="modal-byline">{article.author}</span>
            {article.source_url && article.source_url !== '#' && (
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="modal-source-link">
                View original story ↗
              </a>
            )}
          </div>

          {article.image_url && (
            <figure className="modal-figure">
              <img src={article.image_url} alt={article.title} className="modal-image" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              {article.image_caption && <figcaption className="modal-caption">{article.image_caption}</figcaption>}
            </figure>
          )}

          {article.editorial_quote && (
            <blockquote className="modal-jjj-editorial">
              <span className="quote-label">EDITOR'S NOTE (J. JONAH JAMESON):</span>
              <p>{article.editorial_quote}</p>
            </blockquote>
          )}

          <div className="modal-text-content" style={{ fontSize: `${fontSize}px` }}>
            {article.content.split('\n\n').map((par, i) => <p key={i}>{par}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
