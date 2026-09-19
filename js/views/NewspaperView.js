/**
 * ============================================================================
 * THE DAILY BUGLE - VIEW (js/views/NewspaperView.js)
 * Manipula a renderização visual do leitor PressReader:
 * - Aceleração gráfica do palco com transform: translate3d(...) scale(...)
 * - Sincronização em tempo real do mini-mapa navegador e lente da câmera
 * - Atualização do indicador de zoom e botões de preset
 * - Exibição do painel de leitura de artigo (Smart Article Drawer)
 * ============================================================================
 */

class NewspaperView {
  constructor() {
    this.elements = {
      body: document.body,
      appContainer: document.querySelector('.pressreader-app-container'),
      
      // Viewport e Estágio
      viewport: document.getElementById('reader-viewport'),
      stage: document.getElementById('newspaper-stage'),
      sheet: document.getElementById('newspaper-sheet'),

      // Barra de Ferramentas
      btnZoomOut: document.getElementById('btn-zoom-out'),
      btnZoomIn: document.getElementById('btn-zoom-in'),
      zoomIndicator: document.getElementById('zoom-indicator'),
      btnZoomFit: document.getElementById('btn-zoom-fit'),
      btnZoom100: document.getElementById('btn-zoom-100'),
      btnZoomReading: document.getElementById('btn-zoom-reading'),
      filterSelect: document.getElementById('filter-select'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      soundIcon: document.getElementById('sound-icon'),
      btnPrint: document.getElementById('btn-print'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      fullscreenIcon: document.getElementById('fullscreen-icon'),

      // Efeito de Flash na Foto
      heroPhotoFigure: document.getElementById('hero-photo-figure'),
      cameraFlashFx: document.getElementById('camera-flash-fx'),

      // Mini-Mapa Navegador
      pressNavigator: document.getElementById('press-navigator'),
      navigatorPreview: document.getElementById('navigator-preview'),
      navigatorLens: document.getElementById('navigator-lens'),
      btnToggleNav: document.getElementById('btn-toggle-nav'),

      // Gaveta de Leitura de Artigo
      articleDrawer: document.getElementById('article-drawer'),
      btnCloseDrawer: document.getElementById('btn-close-drawer'),
      drawerCategory: document.getElementById('drawer-category'),
      drawerHeadline: document.getElementById('drawer-headline'),
      drawerSubheadline: document.getElementById('drawer-subheadline'),
      drawerByline: document.getElementById('drawer-byline'),
      drawerDate: document.getElementById('drawer-date'),
      drawerFigure: document.getElementById('drawer-figure'),
      drawerImage: document.getElementById('drawer-image'),
      drawerCaption: document.getElementById('drawer-caption'),
      drawerParagraphs: document.getElementById('drawer-paragraphs'),
      btnDrawerListen: document.getElementById('btn-drawer-listen'),
      btnDrawerPrint: document.getElementById('btn-drawer-print'),

      // Botões e Blocos Clicáveis de Artigos
      articleBlocks: document.querySelectorAll('[data-article-id], [data-article-target], .btn-read-article')
    };

    // Dimensões base da folha do jornal para cálculo proporcional
    this.sheetBaseWidth = 1080;
    this.sheetBaseHeight = 1560;
  }

  /**
   * Renderiza as transformações de câmera e atualizações do leitor
   */
  render(state, eventType) {
    if (!state) return;

    // 1. Atualiza Transformação do Estágio (Pan & Zoom)
    this.updateTransform(state.viewport.zoom, state.viewport.panX, state.viewport.panY);

    // 2. Atualiza Indicador de Zoom e Estados dos Botões
    this.updateZoomUI(state.viewport.zoom);

    // 3. Atualiza Mini-Mapa Navegador
    this.updateNavigator(state.viewport.zoom, state.viewport.panX, state.viewport.panY);

    // 4. Filtro de Impressão
    this.elements.body.className = `theme-${state.filter}`;
    if (this.elements.filterSelect) {
      this.elements.filterSelect.value = state.filter;
    }

    // 5. Ícone de Som
    if (this.elements.soundIcon) {
      this.elements.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    }

    // 6. Painel de Artigo Ativo
    if (eventType === 'article_opened' && state.viewport.activeArticleId) {
      const article = state.articles[state.viewport.activeArticleId];
      if (article) this.openArticleDrawer(article);
    } else if (eventType === 'article_closed') {
      this.closeArticleDrawer();
    }
  }

  /**
   * Aplica a matriz de transformação 2D acelerada por hardware (GPU)
   */
  updateTransform(zoom, panX, panY) {
    if (!this.elements.stage) return;
    this.elements.stage.style.transform = `translate3d(${panX}px, ${panY}px, 0px) scale(${zoom})`;
  }

  /**
   * Atualiza o indicador numérico e os botões de escala ativa
   */
  updateZoomUI(zoom) {
    const percent = Math.round(zoom * 100);
    if (this.elements.zoomIndicator) {
      this.elements.zoomIndicator.textContent = `${percent}%`;
    }

    // Marca o botão correspondente como ativo
    this.elements.btnZoom100?.classList.toggle('active', Math.abs(zoom - 1.0) < 0.05);
    this.elements.btnZoomReading?.classList.toggle('active', Math.abs(zoom - 2.0) < 0.05);
  }

  /**
   * Atualiza a posição e tamanho do retângulo vermelho (lente) no mini-mapa
   */
  updateNavigator(zoom, panX, panY) {
    if (!this.elements.navigatorLens || !this.elements.navigatorPreview || !this.elements.viewport) return;

    const navPreview = this.elements.navigatorPreview;
    const navW = navPreview.clientWidth;
    const navH = navPreview.clientHeight;

    const vpW = this.elements.viewport.clientWidth;
    const vpH = this.elements.viewport.clientHeight;

    const paperW = this.sheetBaseWidth * zoom;
    const paperH = this.sheetBaseHeight * zoom;

    // Proporção de escala do mini-mapa em relação ao jornal base
    const scaleNavX = (navW - 16) / this.sheetBaseWidth;
    const scaleNavY = (navH - 12) / this.sheetBaseHeight;

    // Dimensões visíveis na lente do navegador
    const lensW = Math.min(Math.max((vpW / paperW) * (navW - 16), 14), navW - 16);
    const lensH = Math.min(Math.max((vpH / paperH) * (navH - 12), 14), navH - 12);

    // Posição proporcional
    const normX = -panX / (paperW);
    const normY = -panY / (paperH);

    const lensX = 8 + Math.max(0, Math.min(normX * (navW - 16), (navW - 16) - lensW));
    const lensY = 6 + Math.max(0, Math.min(normY * (navH - 12), (navH - 12) - lensH));

    this.elements.navigatorLens.style.width = `${lensW}px`;
    this.elements.navigatorLens.style.height = `${lensH}px`;
    this.elements.navigatorLens.style.transform = `translate(${lensX}px, ${lensY}px)`;
  }

  /**
   * Flash fotográfico de Peter Parker
   */
  triggerCameraFlash() {
    if (!this.elements.cameraFlashFx) return;
    this.elements.cameraFlashFx.classList.remove('flash-active');
    void this.elements.cameraFlashFx.offsetWidth;
    this.elements.cameraFlashFx.classList.add('flash-active');
  }

  /**
   * Abre o leitor lateral de matérias com formatação confortável
   */
  openArticleDrawer(article) {
    if (!this.elements.articleDrawer) return;

    this.elements.drawerCategory.textContent = article.category || 'NOTÍCIA DO CLARIM';
    this.elements.drawerHeadline.textContent = article.headline;
    this.elements.drawerSubheadline.textContent = article.subheadline || '';
    this.elements.drawerByline.textContent = article.byline || 'REDAÇÃO DO BUGLE';
    this.elements.drawerDate.textContent = article.dateline || 'NEW YORK';

    // Imagem do artigo se houver
    if (article.photo && article.photo.url) {
      this.elements.drawerFigure.style.display = 'block';
      this.elements.drawerImage.src = article.photo.url;
      this.elements.drawerImage.alt = article.headline;
      this.elements.drawerCaption.textContent = article.photo.caption || '';
    } else {
      this.elements.drawerFigure.style.display = 'none';
    }

    // Parágrafos
    this.elements.drawerParagraphs.innerHTML = '';
    article.paragraphs.forEach(p => {
      const pEl = document.createElement('p');
      pEl.textContent = p;
      this.elements.drawerParagraphs.appendChild(pEl);
    });

    this.elements.articleDrawer.classList.add('open');
    this.elements.articleDrawer.setAttribute('aria-hidden', 'false');
  }

  /**
   * Fecha o leitor lateral
   */
  closeArticleDrawer() {
    if (!this.elements.articleDrawer) return;
    this.elements.articleDrawer.classList.remove('open');
    this.elements.articleDrawer.setAttribute('aria-hidden', 'true');
  }

  /**
   * Obter as dimensões do viewport do usuário
   */
  getViewportDimensions() {
    return {
      width: this.elements.viewport.clientWidth,
      height: this.elements.viewport.clientHeight
    };
  }

  /* --------------------------------------------------------------------------
     BINDS DE EVENTOS DA INTERFACE (Chamados pelo Controller)
     -------------------------------------------------------------------------- */
  bindZoomIn(handler) {
    this.elements.btnZoomIn?.addEventListener('click', handler);
  }

  bindZoomOut(handler) {
    this.elements.btnZoomOut?.addEventListener('click', handler);
  }

  bindZoomFit(handler) {
    this.elements.btnZoomFit?.addEventListener('click', handler);
  }

  bindZoom100(handler) {
    this.elements.btnZoom100?.addEventListener('click', handler);
  }

  bindZoomReading(handler) {
    this.elements.btnZoomReading?.addEventListener('click', handler);
  }

  bindFilterChange(handler) {
    this.elements.filterSelect?.addEventListener('change', (e) => handler(e.target.value));
  }

  bindToggleSound(handler) {
    this.elements.btnToggleSound?.addEventListener('click', handler);
  }

  bindPrint(handler) {
    this.elements.btnPrint?.addEventListener('click', handler);
  }

  bindFullscreen(handler) {
    this.elements.btnFullscreen?.addEventListener('click', handler);
  }

  bindHeroPhotoClick(handler) {
    this.elements.heroPhotoFigure?.addEventListener('click', handler);
  }

  bindToggleNavigator(handler) {
    this.elements.btnToggleNav?.addEventListener('click', handler);
  }

  bindNavigatorClick(handler) {
    this.elements.navigatorPreview?.addEventListener('click', (e) => {
      const rect = this.elements.navigatorPreview.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;
      handler(normX, normY);
    });
  }

  bindCloseDrawer(handler) {
    this.elements.btnCloseDrawer?.addEventListener('click', handler);
  }

  bindArticleClick(handler) {
    // Clique em qualquer matéria ou botão de ler
    document.querySelectorAll('[data-article-id], [data-article-target], .btn-read-article').forEach(el => {
      el.addEventListener('click', (e) => {
        // Evita disparar se estiver clicando no flash da foto principal
        if (e.target.closest('#hero-photo-figure')) return;
        
        const targetId = el.getAttribute('data-article-id') || 
                         el.getAttribute('data-article-target') || 
                         el.getAttribute('data-article');
        if (targetId) {
          e.stopPropagation();
          handler(targetId);
        }
      });
    });
  }

  bindViewportPanAndZoom(handlers) {
    const vp = this.elements.viewport;
    if (!vp) return;

    // Zoom pela roda do mouse com foco no cursor
    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      handlers.onWheelZoom(delta, cursorX, cursorY);
    }, { passive: false });

    // Drag / Pan com Mouse
    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let hasMoved = false;

    vp.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Apenas botão esquerdo
      // Se clicou na gaveta ou no mini-mapa, ignora
      if (e.target.closest('#article-drawer') || e.target.closest('#press-navigator')) return;

      isMouseDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      vp.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      startX = e.clientX;
      startY = e.clientY;
      handlers.onPan(dx, dy);
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        vp.classList.remove('is-dragging');
      }
    });

    // Touch Support (Pinch to Zoom e Touch Drag para mobile/touchpads)
    let initialTouchDist = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    vp.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialTouchDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    vp.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        handlers.onPan(dx, dy);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const diff = (dist - initialTouchDist) * 0.005;
        initialTouchDist = dist;

        const rect = vp.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        handlers.onWheelZoom(diff, midX, midY);
      }
    }, { passive: true });
  }
}
