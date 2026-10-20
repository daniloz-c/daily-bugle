import React, { useState } from 'react';

export default function NavigatorMap({ zoom, panX, panY, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`pressreader-navigator-widget no-print ${collapsed ? 'collapsed' : ''}`}>
      <div className="navigator-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="nav-title">🗺️ BROADSHEET MINI MAP</span>
        <button className="nav-toggle-btn" title="Collapse or expand mini map">
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <div className="navigator-body">
          <div className="mini-paper-preview">
            <div className="mini-header-block"></div>
            <div className="mini-hero-block">
              <div className="mini-photo"></div>
              <div className="mini-lines"></div>
            </div>
            <div className="mini-columns-block">
              <div className="mini-col"></div>
              <div className="mini-col"></div>
              <div className="mini-col"></div>
            </div>
            <div
              className="mini-viewport-box"
              style={{
                transform: `translate(${-panX * 0.05}px, ${-panY * 0.05}px) scale(${Math.max(0.2, 1 / zoom)})`
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
