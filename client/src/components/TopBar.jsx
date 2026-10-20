import React from 'react';

export default function TopBar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoom100,
  onZoomReading,
  filter,
  onFilterChange,
  soundEnabled,
  onToggleSound,
  currentDate,
  onDateChange,
  onTodayClick,
  onForceRefresh,
  loading,
  archiveList = []
}) {
  const zoomPercent = Math.round(zoom * 100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="pressreader-topbar no-print" role="toolbar" aria-label="Reader controls">
      <div className="topbar-left">
        <div className="bugle-brand-badge">
          <span className="brand-name">DAILY BUGLE</span>
          <span className="brand-edition">BROADSHEET MVC</span>
        </div>
        <div className="reading-hint">
          <span className="hint-icon">🔍</span>
          <span className="hint-text">Scroll the <strong>mouse wheel</strong> or drag to read the fine print</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="zoom-controls-cluster">
          <button onClick={onZoomOut} className="reader-tool-btn" title="Zoom out" aria-label="Zoom out">
            <span>−</span>
          </button>
          <span className="zoom-indicator-text" title="Current zoom level">{zoomPercent}%</span>
          <button onClick={onZoomIn} className="reader-tool-btn" title="Zoom in" aria-label="Zoom in">
            <span>+</span>
          </button>
          <span className="toolbar-divider"></span>
          <button onClick={onZoomFit} className="reader-preset-btn" title="Fit the full page on screen">
            Fit page
          </button>
          <button
            onClick={onZoom100}
            className={`reader-preset-btn ${zoomPercent === 100 ? 'active' : ''}`}
            title="Actual size (100%)"
          >
            100%
          </button>
          <button
            onClick={onZoomReading}
            className={`reader-preset-btn ${zoomPercent >= 180 ? 'active' : ''}`}
            title="Zoom to 200% for easier reading"
          >
            Reading mode
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <div className="edition-nav-group">
          <button onClick={onTodayClick} className="edition-today-btn" title="Load today's edition">
            📅 Today
          </button>
          <input
            type="date"
            value={currentDate || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="edition-date-picker"
            title="Choose an edition date"
          />
          <button
            onClick={onForceRefresh}
            className={`edition-refresh-btn ${loading ? 'loading' : ''}`}
            title="Refresh local news and the cover story"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '⚡ Refresh'}
          </button>
        </div>

        <span className="toolbar-divider"></span>

        <div className="filter-select-wrapper">
          <label htmlFor="filter-select" className="sr-only">Visual theme</label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="reader-select"
            title="Choose a newspaper color theme"
          >
            <option value="vintage">Vintage paper</option>
            <option value="bw">Black &amp; white (noir)</option>
            <option value="modern">Fresh ink</option>
          </select>
        </div>

        <button
          onClick={onToggleSound}
          className={`reader-tool-btn sound-toggle-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
          title={soundEnabled ? 'Turn paper and camera sounds off' : 'Turn paper and camera sounds on'}
          aria-label="Toggle sound"
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
        </button>

        <button onClick={toggleFullscreen} className="reader-tool-btn" title="Toggle full screen" aria-label="Full screen">
          <span>⛶</span>
        </button>
      </div>
    </header>
  );
}
