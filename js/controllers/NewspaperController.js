/**
 * ============================================================================
 * THE DAILY BUGLE - CONTROLLER (js/controllers/NewspaperController.js)
 * Coordena eventos de interação do leitor PressReader:
 * - Pan e Zoom suave acelerado via transformações matemáticas
 * - Sincronização de cliques no mini-mapa navegador
 * - Abertura e fechamento de artigos em modo de leitura
 * - Efeitos sonoros táteis de redação e obturador de câmera
 * ============================================================================
 */

class NewspaperController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.audioCtx = null;

    this.init();
  }

  init() {
    // 1. Model notifica a View sobre qualquer alteração
    this.model.subscribe((state, eventType) => {
      this.view.render(state, eventType);
    });

    // 2. Ajuste inicial do jornal para caber na tela do leitor
    setTimeout(() => {
      this.handleZoomFit();
    }, 100);

    // 3. Atualizar layout ao redimensionar a janela
    window.addEventListener('resize', () => {
      // Ajusta o mini-mapa
      const state = this.model.getState();
      this.view.render(state, 'resize');
    });

    // 4. Binds de Controles de Zoom
    this.view.bindZoomIn(this.handleZoomIn.bind(this));
    this.view.bindZoomOut(this.handleZoomOut.bind(this));
    this.view.bindZoomFit(this.handleZoomFit.bind(this));
    this.view.bindZoom100(this.handleZoom100.bind(this));
    this.view.bindZoomReading(this.handleZoomReading.bind(this));

    // 5. Binds de Pan & Wheel Zoom no Viewport
    this.view.bindViewportPanAndZoom({
      onWheelZoom: this.handleWheelZoom.bind(this),
      onPan: this.handlePan.bind(this)
    });

    // 6. Binds do Mini-Mapa
    this.view.bindToggleNavigator(this.handleToggleNavigator.bind(this));
    this.view.bindNavigatorClick(this.handleNavigatorClick.bind(this));

    // 7. Binds de Artigos
    this.view.bindArticleClick(this.handleArticleClick.bind(this));
    this.view.bindCloseDrawer(this.handleCloseDrawer.bind(this));

    // 8. Binds de Utilidades
    this.view.bindFilterChange(this.handleFilterChange.bind(this));
    this.view.bindToggleSound(this.handleToggleSound.bind(this));
    this.view.bindPrint(this.handlePrint.bind(this));
    this.view.bindFullscreen(this.handleFullscreen.bind(this));
    this.view.bindHeroPhotoClick(this.handleHeroPhotoClick.bind(this));

    // 9. Teclado: atalhos úteis
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.model.closeArticle();
      } else if (e.key === '+' || e.key === '=') {
        this.handleZoomIn();
      } else if (e.key === '-') {
        this.handleZoomOut();
      } else if (e.key === '0') {
        this.handleZoomFit();
      }
    });
  }

  /* --------------------------------------------------------------------------
     ÁUDIO SINTETIZADO (Web Audio API)
     -------------------------------------------------------------------------- */
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playCameraShutter() {
    if (!this.model.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start(now);
  }

  playPaperSound() {
    if (!this.model.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /* --------------------------------------------------------------------------
     TRATADORES DE PAN E ZOOM PRESSREADER
     -------------------------------------------------------------------------- */
  handleWheelZoom(delta, cursorX, cursorY) {
    const currentZoom = this.model.viewport.zoom;
    const newZoom = currentZoom + delta;
    this.model.setZoom(newZoom, cursorX, cursorY);
  }

  handlePan(dx, dy) {
    this.model.panBy(dx, dy);
  }

  handleZoomIn() {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    this.model.setZoom(this.model.viewport.zoom + 0.25, dims.width / 2, dims.height / 2);
  }

  handleZoomOut() {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    this.model.setZoom(this.model.viewport.zoom - 0.25, dims.width / 2, dims.height / 2);
  }

  handleZoomFit() {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    this.model.fitToPage(dims.width, dims.height, 1080, 1560);
  }

  handleZoom100() {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    const panX = (dims.width - 1080) / 2;
    this.model.setZoom(1.0);
    this.model.setPan(panX, 20);
  }

  handleZoomReading() {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    // Dá zoom de 200% focado no centro superior das matérias
    this.model.setZoom(2.0, dims.width / 2, 100);
  }

  handleToggleNavigator() {
    const nav = this.view.elements.pressNavigator;
    if (nav) nav.classList.toggle('collapsed');
  }

  handleNavigatorClick(normX, normY) {
    this.playPaperSound();
    const dims = this.view.getViewportDimensions();
    const paperW = 1080 * this.model.viewport.zoom;
    const paperH = 1560 * this.model.viewport.zoom;

    const targetPanX = dims.width / 2 - (normX * paperW);
    const targetPanY = dims.height / 2 - (normY * paperH);

    this.model.setPan(targetPanX, targetPanY);
  }

  /* --------------------------------------------------------------------------
     TRATADORES DE ARTIGOS E UI
     -------------------------------------------------------------------------- */
  handleArticleClick(articleId) {
    this.playPaperSound();
    this.model.openArticle(articleId);
  }

  handleCloseDrawer() {
    this.model.closeArticle();
  }

  handleHeroPhotoClick() {
    this.playCameraShutter();
    this.view.triggerCameraFlash();
  }

  handleFilterChange(filterName) {
    this.playPaperSound();
    this.model.setFilter(filterName);
  }

  handleToggleSound() {
    const enabled = this.model.toggleSound();
    if (enabled) this.playCameraShutter();
  }

  handlePrint() {
    this.playPaperSound();
    setTimeout(() => {
      window.print();
    }, 150);
  }

  handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (this.view.elements.fullscreenIcon) this.view.elements.fullscreenIcon.textContent = '🗗';
    } else {
      document.exitFullscreen().catch(() => {});
      if (this.view.elements.fullscreenIcon) this.view.elements.fullscreenIcon.textContent = '⛶';
    }
  }
}
