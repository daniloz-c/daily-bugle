/**
 * ============================================================================
 * THE DAILY BUGLE - MODEL (js/models/NewspaperModel.js)
 * Gerencia o estado completo do jornal estilo PressReader:
 * - Conteúdo de matérias completas em colunas ("letras miúdas" 100% legíveis)
 * - Múltiplas imagens (incluindo as duas enviadas pelo usuário)
 * - Estado de navegação e câmera: Pan (X, Y), Zoom (0.35x a 3.5x), Modo Leitura
 * ============================================================================
 */

class NewspaperModel {
  constructor() {
    this.subscribers = [];

    // Estado da Câmera / Navegador PressReader
    this.viewport = {
      zoom: 1.0,
      minZoom: 0.35,
      maxZoom: 3.5,
      panX: 0,
      panY: 0,
      isDragging: false,
      activeArticleId: null
    };

    // Filtro e Som
    this.currentFilter = 'vintage';
    this.soundEnabled = true;

    // Metadados do Jornal
    this.metadata = {
      paperName: 'DAILY BUGLE',
      tagline: "New York's Favorite Newspaper Since 1932",
      editionType: 'MORNING EDITION',
      date: 'SEPTEMBER 18, 2026',
      city: 'NEW YORK, N.Y.',
      price: '50¢',
      weather: 'Partly Cloudy / High 68°F',
      weatherPage: 'Weather: Page 28',
      website: 'www.dailybugle.com',
      established: 'Since 1932',
      sashBadge: 'SPECIAL EDITION'
    };

    // Teasers de topo
    this.teasers = {
      left: {
        line1: 'New Clues Foreshadow',
        line2: 'SPIDEY, GOBLIN ATTACKS',
        page: 'PAGE 3'
      },
      right: {
        line1: 'Police: New Leads In Solving',
        line2: 'SPIDER-MAN CRIME SPREE',
        page: 'PAGE 8'
      }
    };

    // Matérias e Colunas completas (Letras miúdas que mantêm nitidez ao dar zoom)
    this.articles = {
      hero: {
        id: 'hero',
        category: 'MANCHETE PRINCIPAL',
        headline: 'ENOUGH!',
        subheadline: "Citizens Call for Wall-Crawler's Arrest",
        deck: "Rising public alarm over masked vigilante actions sweeps through City Hall and Manhattan precincts. Officials demand immediate surrender.",
        byline: 'BY BETTY BRANT & RON SACCO',
        dateline: 'NEW YORK — Sept. 18',
        photo: {
          url: 'assets/images/spiderman_enough_hd.png',
          credit: 'PHOTO BY PETER PARKER',
          caption: "SUSPECT CAUGHT ON FILM: The costumed vigilante known as Spider-Man is photographed prowling upon glass skylights overlooking central Manhattan. Moments later, he fled into the city shadows."
        },
        paragraphs: [
          "The debate that has polarized New York City for weeks reached a fever pitch yesterday as civic groups, shopkeepers, and community leaders banded together outside One Police Plaza to demand decisive action against the masked figure known as Spider-Man.",
          "What began as sporadic sightings of a bizarre acrobat swinging from Manhattan suspension bridges has metastasized into a full-scale vigilante crisis. Eyewitnesses across four boroughs recount unauthorized interventions, damaged masonry, and harrowing confrontations that leave citizens questioning whether they are witnessing a savior or a menace.",
          "'He operates outside any constitutional oversight,' declared City Council representative Arthur Vance during a fiery press briefing. 'Who sanctioned this individual to enforce his own brand of street justice? How can our men and women in uniform maintain public safety when an anonymous acrobat drops from the clouds without accountability?'",
          "Police Commissioner George Stacy confirmed that specialized task units have been mobilized to track the suspect's movements. Authorities urge citizens not to approach the costumed figure, warning that despite unconfirmed reports of thwarted muggings, the legal liability and public endangerment posed by unauthorized vigilantism cannot be tolerated.",
          "Meanwhile, inside the buzzing newsroom of The Daily Bugle, calls continue to flood the editorial desk, with eyewitnesses reporting sightings from Hell's Kitchen to Queens Boulevard. As night falls, the question echoes louder than ever across the metropolis: Who will hold the Wall-Crawler to account?"
        ]
      },

      nypd_cops: {
        id: 'nypd_cops',
        category: 'NOTÍCIAS POLICIAIS',
        headline: 'POLICE BAFFLED: Suspect Strung Up on Lamp Post',
        subheadline: 'Officers arrive to find armed suspect hanging 20 feet in the air outside Fifth Ave jewelry district.',
        byline: 'BY EDDIE BROCK | POLICE BEAT',
        dateline: 'MIDTOWN —',
        photo: {
          url: 'assets/images/spiderman_nypd_cops.png',
          credit: 'PHOTO BY PETER PARKER',
          caption: "BEWILDERED OFFICERS: Three NYPD patrolmen gaze upward in astonishment as Spider-Man secures a fleeing carjacker to a lamppost before vanishing into the alleyways."
        },
        paragraphs: [
          "Patrolmen from the 18th Precinct were greeted by a surreal spectacle at 11:42 p.m. last evening. Responding to a silent alarm triggered during an attempted vehicle heist, officers arrived at 53rd Street only to find the armed suspect dangling upside down like a cocoon.",
          "Witnesses reported that the suspect, identified as 34-year-old Dennis Carradine, was attempting to hotwire a luxury sedan when a red-and-blue figure dropped from the fire escape above. Within forty-five seconds, Carradine was bound in an unidentified white adhesive substance and hoisted toward the fixture.",
          "'We pulled up with sirens blazing, and there he was,' remarked Officer O'Hanlon, one of the first responders on the scene. 'The guy was hollering for us to cut him down, and right above on the lamppost, the masked freak was just perched there, staring at us with those blank white eyes.'",
          "Forensic experts from the NYPD Crime Lab are currently analyzing the bizarre adhesive webbing, which officers noted began dissolving into harmless dust approximately two hours after application. The District Attorney's office cautioned that without a sworn arresting officer, securing an indictment against the suspect may present unprecedented constitutional hurdles."
        ]
      },

      sky_acrobat: {
        id: 'sky_acrobat',
        category: 'AERONÁUTICA E METRÓPOLE',
        headline: 'HIGH-FLYING SPECTACLE: Wall-Crawler Vaults Skyline',
        subheadline: 'Aviation authorities express grave concerns over high-speed maneuvers near skyscraper flight corridors.',
        byline: 'BY NED LEEDS | METRO DESK',
        dateline: 'DOWNTOWN —',
        photo: {
          url: 'assets/images/spiderman_skyscrapers_leap.png',
          credit: 'PHOTO BY PETER PARKER',
          caption: "AERIAL DAREDEVIL: A stunning high-altitude capture showing the costumed vigilante executing an acrobatic dive hundreds of feet above downtown skyscrapers."
        },
        paragraphs: [
          "Commuters peering from the upper decks of the Staten Island Ferry and office workers in the Financial District were treated to a jaw-dropping aerial display yesterday afternoon when the city's self-appointed protector was seen traversing the skyline at dizzying speeds.",
          "Federal Aviation Administration spokespersons voiced grave concern regarding the unregulated trajectory of the acrobat, who reportedly passed within fifty yards of a traffic-monitoring helicopter near the Brooklyn Bridge.",
          "'The structural tensile strength required to propel a human body across these chasms is scientifically staggering,' remarked Dr. Curt Connors, professor of biophysics at Empire State University. 'Whoever this individual is, the kinetic forces and spatial awareness exhibited surpass any Olympic-level gymnast by orders of magnitude.'",
          "Despite the public fascination, building superintendents have lodged multiple complaints regarding severed radio antennas and residue left on penthouse observation decks."
        ]
      },

      editorial: {
        id: 'editorial',
        category: 'EDITORIAL DA REDAÇÃO',
        headline: 'PUBLIC MENACE NUMBER ONE',
        subheadline: 'Why New York Must Reject the Masked Menace',
        byline: 'BY J. JONAH JAMESON | PUBLISHER & EDITOR-IN-CHIEF',
        dateline: 'NEW YORK —',
        photo: null,
        paragraphs: [
          "Let me get something straight with the fine citizens of this great city. In my thirty years running this newspaper, I've seen politicians, showmen, and street hoods come and go. But I have never seen a spectacle as dangerous and deceitful as this so-called 'Spider-Man.'",
          "Ask yourself one simple question: What kind of man wears a mask? An honest doctor? A courageous firefighter? A sworn police officer? No! Criminals wear masks! Cowards who don't want anyone to see their guilty faces wear masks!",
          "The bleeding hearts call him a hero because he ties a thief to a lamppost. I call him a menace! Who pays when his circus antics smash a shopkeeper's window? Who protects our children when a psychopath on a glider decides to throw pumpkin bombs into a crowd to flush him out?",
          "The Daily Bugle will not rest until this masked freak takes off that costume and faces a court of law. And to this Spider-Man, if you're reading this: turn yourself in! New York City has had ENOUGH!"
        ]
      },

      oscorp_brief: {
        id: 'oscorp_brief',
        category: 'CIÊNCIA & NEGÓCIOS',
        headline: 'OSCORP ANNOUNCES AEROSPACE ADVANCEMENT',
        subheadline: 'Dr. Norman Osborn addresses shareholders amidst soaring defense department interest.',
        byline: 'BY SPECIAL CORRESPONDENT',
        dateline: 'MIDTOWN —',
        photo: null,
        paragraphs: [
          "Oscorp Industries held an emergency investor briefing yesterday morning at its midtown headquarters. Chief Executive Norman Osborn assured board members that the conglomerate's proprietary human-performance enhancers and combat glider systems are proceeding through military trials with extraordinary success.",
          "'We stand on the threshold of an unprecedented evolutionary epoch,' Dr. Osborn proclaimed with fierce intensity. 'Oscorp technology will guarantee that civilization remains shielded from any chaotic elements, whether conventional or otherwise.'"
        ]
      }
    };

    // Barra inferior
    this.bottomBanner = "INSIDE: EXCLUSIVE BUGLE PICS CAPTURE SPIDER-MAN'S MISDEEDS — FULL 12-PAGE DOSSIER";
    this.tickerText = 'JAMESON GRITA: "PARKER! CADÊ AS FOTOS DO HOMEM-ARANHA?!" • POLÍCIA DE NY INVESTIGA PARADEIRO DO DUENDE VERDE • CRIME DIMINUI MAS CLARIM EXIGE RESPOSTAS!';
  }

  // Observer Pattern
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(event = 'update') {
    const state = this.getState();
    this.subscribers.forEach(fn => fn(state, event));
  }

  getState() {
    return {
      viewport: { ...this.viewport },
      metadata: { ...this.metadata },
      teasers: { ...this.teasers },
      articles: { ...this.articles },
      bottomBanner: this.bottomBanner,
      tickerText: this.tickerText,
      filter: this.currentFilter,
      soundEnabled: this.soundEnabled
    };
  }

  /* --------------------------------------------------------------------------
     CONTROLES DE CÂMERA E ZOOM (PressReader)
     -------------------------------------------------------------------------- */
  setZoom(zoomLevel, focusX = null, focusY = null) {
    const oldZoom = this.viewport.zoom;
    const clampedZoom = Math.min(Math.max(zoomLevel, this.viewport.minZoom), this.viewport.maxZoom);
    
    if (focusX !== null && focusY !== null && oldZoom !== clampedZoom) {
      // Zoom direcionado para a coordenada do cursor
      const ratio = clampedZoom / oldZoom;
      this.viewport.panX = focusX - (focusX - this.viewport.panX) * ratio;
      this.viewport.panY = focusY - (focusY - this.viewport.panY) * ratio;
    }

    this.viewport.zoom = clampedZoom;
    this.notify('viewport_changed');
  }

  zoomIn(step = 0.25) {
    this.setZoom(this.viewport.zoom + step);
  }

  zoomOut(step = 0.25) {
    this.setZoom(this.viewport.zoom - step);
  }

  setPan(x, y) {
    this.viewport.panX = x;
    this.viewport.panY = y;
    this.notify('viewport_changed');
  }

  panBy(dx, dy) {
    this.viewport.panX += dx;
    this.viewport.panY += dy;
    this.notify('viewport_changed');
  }

  fitToPage(containerWidth, containerHeight, sheetWidth = 1000, sheetHeight = 1450) {
    const scaleX = (containerWidth - 60) / sheetWidth;
    const scaleY = (containerHeight - 60) / sheetHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.0);

    this.viewport.zoom = Math.max(fitScale, 0.45);
    this.viewport.panX = (containerWidth - sheetWidth * this.viewport.zoom) / 2;
    this.viewport.panY = 20; // Pequeno respiro no topo
    this.notify('viewport_changed');
  }

  resetZoom() {
    this.viewport.zoom = 1.0;
    this.viewport.panX = 0;
    this.viewport.panY = 0;
    this.notify('viewport_changed');
  }

  // Leitura de artigo
  openArticle(articleId) {
    if (this.articles[articleId]) {
      this.viewport.activeArticleId = articleId;
      this.notify('article_opened');
    }
  }

  closeArticle() {
    this.viewport.activeArticleId = null;
    this.notify('article_closed');
  }

  // Filtros de papel
  setFilter(filterName) {
    this.currentFilter = filterName;
    this.notify('filter_changed');
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_toggled');
    return this.soundEnabled;
  }

  // Atualização personalizada de manchete
  updateHeadline(newHeadline, newSubheadline) {
    if (this.articles.hero) {
      this.articles.hero.headline = newHeadline.toUpperCase();
      if (newSubheadline) this.articles.hero.subheadline = newSubheadline;
      this.notify('headline_updated');
    }
  }
}
