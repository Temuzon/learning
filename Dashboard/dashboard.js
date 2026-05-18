(function() {
    // ──────────────────────────────────────
    // 1. REFERENCIAS DEL DOM
    // ──────────────────────────────────────
    const emptyState = document.getElementById('emptyState');
    const seccionActividad = document.getElementById('actividad');
    const seccionCarrusel = document.getElementById('carrusel');
    const allSections = [emptyState, seccionActividad, seccionCarrusel];

    // Pills de navegación (reemplazan al sidebar)
    const navPills = document.querySelectorAll('.dash-pill[data-section]');

    // ──────────────────────────────────────
    // 2. FUNCIONES DE NAVEGACIÓN
    // ──────────────────────────────────────
    function resetSections() {
        allSections.forEach(sec => {
            if (!sec) return;
            sec.classList.add('section-hidden');
            sec.classList.remove('section-visible');
        });
    }

    function showDashSection(sectionId) {
        resetSections();
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.remove('section-hidden');
            void target.offsetWidth;
            target.classList.add('section-visible');
        }
    }

    function showEmptyState() {
        resetSections();
        if (!emptyState) return;
        emptyState.classList.remove('section-hidden');
        void emptyState.offsetWidth;
        emptyState.classList.add('section-visible');
    }

    function updatePillActive(activeSectionId) {
        navPills.forEach(pill => {
            const section = pill.getAttribute('data-section');
            pill.classList.toggle('active', section === activeSectionId);
        });
    }

    function clearPillActive() {
        navPills.forEach(pill => pill.classList.remove('active'));
    }

    // ──────────────────────────────────────
    // 3. ESTADO Y EVENTOS
    // ──────────────────────────────────────
    let currentActiveSection = null;

    function handlePillClick(sectionId) {
        if (currentActiveSection === sectionId) {
            currentActiveSection = null;
            showEmptyState();
            clearPillActive();
        } else {
            currentActiveSection = sectionId;
            showDashSection(sectionId);
            updatePillActive(sectionId);
            if (sectionId === 'carrusel') {
                setTimeout(updateActiveCard, 100);
            }
        }
    }

    navPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const sectionId = pill.getAttribute('data-section');
            handlePillClick(sectionId);
        });
    });

    // ──────────────────────────────────────
    // 4. CARRUSEL: usa querySelectorAll dinámico
    // ──────────────────────────────────────
    const track = document.getElementById('track');
    const btnLeft = document.getElementById('carouselLeft');
    const btnRight = document.getElementById('carouselRight');

    // Obtener cards dinámicamente (no una sola vez)
    function getCards() {
        return track ? Array.from(track.querySelectorAll('.card')) : [];
    }

    function updateActiveCard() {
        if (!track) return;
        const cards = getCards();
        if (cards.length === 0) return;

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
        if (closestCard) closestCard.classList.add('active');
    }

    if (track) {
        track.addEventListener('scroll', () => {
            requestAnimationFrame(updateActiveCard);
        });

        // Drag para scroll táctil/mouse
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => { isDown = false; });
        track.addEventListener('mouseup', () => { isDown = false; });
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
    }

    function getActiveCardIndex() {
        const cards = getCards();
        let activeIndex = cards.findIndex(card => card.classList.contains('active'));
        if (activeIndex === -1 && cards.length > 0 && track) {
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
        const cards = getCards();
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
            const current = getActiveCardIndex();
            scrollToCard(current > 0 ? current - 1 : 0);
        });
    }

    if (btnRight) {
        btnRight.addEventListener('click', () => {
            const cards = getCards();
            const current = getActiveCardIndex();
            scrollToCard(current < cards.length - 1 ? current + 1 : cards.length - 1);
        });
    }

    // ──────────────────────────────────────
    // 5. FUNCIÓN GLOBAL PARA RE-INICIALIZAR
    // ──────────────────────────────────────
    window.stxReinitCarousel = function() {
        if (!track) return;
        const cards = getCards();
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            });
        });
        updateActiveCard();
    };

    // ──────────────────────────────────────
    // 6. TECLADO
    // ──────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA') return;

        const dashSection = document.getElementById('Dashboard');
        if (!dashSection?.classList.contains('active-section')) return;

        if (e.key === '1') handlePillClick('actividad');
        else if (e.key === '2') handlePillClick('carrusel');
        else if (e.key === 'Escape' || e.key === '0') {
            currentActiveSection = null;
            showEmptyState();
            clearPillActive();
        }
    });

    // ──────────────────────────────────────
    // 7. RESIZE
    // ──────────────────────────────────────
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateActiveCard, 150);
    });

    console.log('✅ Dashboard listo con pills de navegación.');
})();


// ──────────────────────────────────────
// MODAL CREAR CARD
// ──────────────────────────────────────
(function() {
    const createBtn = document.getElementById('dashCreateCardBtn');
    const createModal = document.getElementById('dashCreateModal');
    const createClose = document.getElementById('dashCreateClose');
    const createConfirm = document.getElementById('dashCreateConfirm');
    const createName = document.getElementById('dashCreateName');
    const createUrl = document.getElementById('dashCreateUrl');
    const previewImg = document.getElementById('dashCreatePreviewImg');

    if (!createBtn || !createModal) return;

    function openCreateModal() {
        createModal.classList.add('dash-create-active');
        createModal.setAttribute('aria-hidden', 'false');
        setTimeout(() => createName?.focus(), 100);
    }

    function closeCreateModal() {
        createModal.classList.remove('dash-create-active');
        createModal.setAttribute('aria-hidden', 'true');
        if (createName) createName.value = '';
        if (createUrl) createUrl.value = '';
        if (previewImg) previewImg.src = 'Statux-logo(SVG).svg';
    }

    function saveCustomCard() {
        const name = (createName?.value || '').trim();
        const url = (createUrl?.value || '').trim();

        if (!name) {
            createName?.focus();
            return;
        }

        const id = `custom::${name.toLowerCase().replace(/\s+/g, '-')}::${Date.now()}`;

        const cardData = {
            id,
            title: name,
            type: 'custom',
            image: 'Statux-logo(SVG).svg',
            courseUrl: url,
            prompt: '',
            code: '',
            dataAttrs: {
                'data-title': name,
                'data-course-url': url
            }
        };

        const raw = localStorage.getItem('stx_dashboard_cards');
        let cards = [];
        try { cards = JSON.parse(raw) || []; } catch { cards = []; }
        cards.push(cardData);
        localStorage.setItem('stx_dashboard_cards', JSON.stringify(cards));

        closeCreateModal();

        if (typeof stxRenderDashboardCards === 'function') {
            stxRenderDashboardCards();
        }

        const carruselPill = document.querySelector('.dash-pill[data-section="carrusel"]');
        if (carruselPill) carruselPill.click();
    }

    createBtn.addEventListener('click', openCreateModal);
    createClose?.addEventListener('click', closeCreateModal);
    createModal.addEventListener('click', (e) => {
        if (e.target === createModal) closeCreateModal();
    });
    createConfirm?.addEventListener('click', saveCustomCard);

    createName?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createUrl?.focus();
    });

    createUrl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveCustomCard();
    });
})();
