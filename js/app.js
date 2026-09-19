/**
 * ============================================================================
 * THE DAILY BUGLE - APP BOOTSTRAP (js/app.js)
 * Ponto de entrada da aplicação. Inicializa Model, View e Controller
 * quando o DOM estiver completamente carregado.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa o Model (gerenciador de estado e dados das edições)
  const model = new NewspaperModel();

  // 2. Inicializa a View (gerenciador de renderização do DOM e UI)
  const view = new NewspaperView();

  // 3. Inicializa o Controller (mediador de eventos e sintetizador de áudio)
  const controller = new NewspaperController(model, view);

  // Disponibiliza no escopo global para inspeção ou testes se necessário
  window.dailyBugleApp = {
    model,
    view,
    controller
  };

  console.log('🗞️ The Daily Bugle MVC App inicializado com sucesso! Edição: ENOUGH!');
});
