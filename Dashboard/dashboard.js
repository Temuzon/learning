(function() {
            // ──────────────────────────────────────
            // 1. REFERENCIAS DEL DOM
            // ──────────────────────────────────────
            const emptyState = document.getElementById('emptyState');
            const seccionActividad = document.getElementById('actividad');
            const seccionCarrusel = document.getElementById('carrusel');

            const navButtons = document.querySelectorAll('.icon-nav[data-section]');
            const allSections = [emptyState, seccionActividad, seccionCarrusel];

            // ──────────────────────────────────────
            // 2. FUNCIONES DE NAVEGACIÓN
            // ──────────────────────────────────────
            function resetSections() {
                allSections.forEach(sec => {
                    sec.classList.add('section-hidden');
                    sec.classList.remove('section-visible');
                });
            }

            function showSection(sectionId) {
                resetSections();
                const target = document.getElementById(sectionId);
                if (target) {
                    target.classList.remove('section-hidden');
                    // Forzar reflow para reiniciar animación
                    void target.offsetWidth;
                    target.classList.add('section-visible');
                }
            }

            function showEmptyState() {
                resetSections();
                emptyState.classList.remove('section-hidden');
                void emptyState.offsetWidth;
                emptyState.classList.add('section-visible');
            }

            function updateNavActive(activeSectionId) {
                navButtons.forEach(btn => {
                    const section = btn.getAttribute('data-section');
                    if (section === activeSectionId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            function clearNavActive() {
                navButtons.forEach(btn => btn.classList.remove('active'));
            }

            // Estado actual: qué sección está visible (null = empty-state)
            let currentActiveSection = null;

            function handleNavClick(sectionId, clickedButton) {
                if (currentActiveSection === sectionId) {
                    // Toggle off → volver a empty-state
                    currentActiveSection = null;
                    showEmptyState();
                    clearNavActive();
                } else {
                    // Activar nueva sección
                    currentActiveSection = sectionId;
                    showSection(sectionId);
                    updateNavActive(sectionId);
                    // Si es carrusel, disparar detección de card activa tras el renderizado
                    if (sectionId === 'carrusel') {
                        setTimeout(updateActiveCard, 100);
                    }
                }
            }

            // ──────────────────────────────────────
            // 3. EVENT LISTENERS PARA SIDEBAR
            // ──────────────────────────────────────
            navButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const sectionId = btn.getAttribute('data-section');
                    handleNavClick(sectionId, btn);
                });
            });

            // ──────────────────────────────────────
            // 4. CARRUSEL: LÓGICA COMPLETA
            // ──────────────────────────────────────
            const track = document.getElementById('track');
            const cards = document.querySelectorAll('.card');
            const btnLeft = document.getElementById('carouselLeft');
            const btnRight = document.getElementById('carouselRight');

            function updateActiveCard() {
                if (!track || cards.length === 0) return;
                const trackRect = track.getBoundingClientRect();
                const center = trackRect.left + trackRect.width / 2;

                let closestCard = null;
                let closestDistance = Infinity;

                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    const distance = Math.abs(center - cardCenter);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCard = card;
                    }
                });

                cards.forEach(card => card.classList.remove('active'));
                if (closestCard) {
                    closestCard.classList.add('active');
                }
            }

            // Escuchar scroll en el track
            if (track) {
                track.addEventListener('scroll', () => {
                    requestAnimationFrame(updateActiveCard);
                });
            }

            // Click en card → centrar
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Evitar que el click en el botón interno dispare el scroll
                    if (e.target.tagName === 'BUTTON') return;
                    card.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest'
                    });
                });
            });

            // Botones laterales del carrusel
            function getActiveCardIndex() {
                let activeIndex = -1;
                cards.forEach((card, index) => {
                    if (card.classList.contains('active')) {
                        activeIndex = index;
                    }
                });
                // Fallback: si no hay active, buscar la más cercana al centro
                if (activeIndex === -1 && cards.length > 0) {
                    const trackRect = track.getBoundingClientRect();
                    const center = trackRect.left + trackRect.width / 2;
                    let minDist = Infinity;
                    cards.forEach((card, index) => {
                        const rect = card.getBoundingClientRect();
                        const cardCenter = rect.left + rect.width / 2;
                        const dist = Math.abs(center - cardCenter);
                        if (dist < minDist) {
                            minDist = dist;
                            activeIndex = index;
                        }
                    });
                }
                return activeIndex;
            }

            function scrollToCard(index) {
                if (index >= 0 && index < cards.length) {
                    cards[index].scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest'
                    });
                }
            }

            if (btnLeft) {
                btnLeft.addEventListener('click', () => {
                    const currentIndex = getActiveCardIndex();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                    scrollToCard(prevIndex);
                });
            }

            if (btnRight) {
                btnRight.addEventListener('click', () => {
                    const currentIndex = getActiveCardIndex();
                    const nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : cards.length -
                        1;
                    scrollToCard(nextIndex);
                });
            }

            // Inicializar detección de card activa al cargar
            window.addEventListener('load', () => {
                updateActiveCard();
            });

            // Recalcular si la ventana cambia de tamaño
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateActiveCard, 150);
            });

            // ──────────────────────────────────────
            // 5. TECLAS DE ACCESO RÁPIDO (OPCIONAL)
            // ──────────────────────────────────────
            document.addEventListener('keydown', (e) => {
                // Solo si el foco no está en un input
                if (document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA') return;

                if (e.key === '1') {
                    handleNavClick('actividad', document.querySelector('[data-section="actividad"]'));
                } else if (e.key === '2') {
                    handleNavClick('carrusel', document.querySelector('[data-section="carrusel"]'));
                } else if (e.key === 'Escape' || e.key === '0') {
                    currentActiveSection = null;
                    showEmptyState();
                    clearNavActive();
                }
            });

            console.log('✅ Dashboard SPA unificado listo.');
            console.log('   Secciones: Empty-state | Actividad | Carrusel');
            console.log('   Atajos: tecla 1 = Actividad | tecla 2 = Carrusel | Esc = Inicio');
        })();


// Exponer función global para re-inicializar el carrusel
window.stxReinitCarousel = function() {
  const track = document.getElementById('track');
  if (!track) return;

  const newCards = document.querySelectorAll('#track .card');

  newCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      card.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    });
  });

  updateActiveCard();
};
