/*
  Funcionalidad incluida:
  - Carga dinámica desde /data/cards.json y render de cards en contenedores.
  - Bloqueo de navegación cuando un ebootux/getux está abierto.
  - Modal de preview (genérico) y preview específico para Plantitux.
  - Control de acceso por código (Entrar) y apertura de ebootux/prompt.
  - Copiar prompt, animación visual y fallback.
  - Compatibilidad con cards estáticos si el JSON no está presente.
*/

// ============================
// Utiles
// ============================
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $all(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
function escapeAttr(s) { if (s === undefined || s === null) return ''; return String(s).replace(/"/g, '&quot;').replace(/\n/g, ' '); }

// ============================
// BORDES ACTIVOS DE ITEMS
// ============================
const items = document.querySelectorAll(".item");
items.forEach(item => {
  item.addEventListener("click", () => {
    items.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

// ============================
// BARRA DE NAVEGACIÓN FLEXIBLE
// ============================
const boton = $(".boton-de-ensanche-de-barra-de-navegacion");
const barra = $(".barra-de-navegacion");
if (boton && barra) {
  boton.addEventListener("click", () => {
    barra.classList.toggle("expandida");
  });
}

// ============================
// Estado: bloqueo de navegación cuando un ebootux/getux está abierto
// ============================
let navigationLocked = false;

function showNavigationLockedModal() {
  mostrarModal(
    "Navegación desactivada",
    "La navegación está desactivada mientras este contenido esté abierto. Sal para continuar.",
    true
  );
}

// ============================
// Mezclar cards en sección
// ============================
function mezclarCardsEnSeccion(seccion) {
  if (!seccion) return;
  const contenedores = seccion.querySelectorAll('[class*="contenedor-de-todos-"]');
  contenedores.forEach(container => {
    const cards = Array.from(container.children || []);
    if (cards.length > 1) {
      cards.sort(() => Math.random() - 0.5);
      cards.forEach(card => container.appendChild(card));
    }
  });
}

// ============================
// NAVEGACIÓN ENTRE SECCIONES
// ============================
const sections = document.querySelectorAll(".app-section");
const navItems = document.querySelectorAll(".item");

function updateNavActiveForSection(id) {
  navItems.forEach(item => {
    const href = item.getAttribute("href") || "";
    const targetId = href.replace("#", "");
    if (targetId === id) item.classList.add("active");
    else item.classList.remove("active");
  });
}

function showSection(id) {
  sections.forEach(section => section.classList.remove("active-section"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active-section");
    mezclarCardsEnSeccion(target);
  }
  updateNavActiveForSection(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Intercept nav clicks si navegación bloqueada
navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = item.getAttribute("href")?.replace("#", "");
    if (!targetId) return;
    if (navigationLocked) {
      showNavigationLockedModal();
      return;
    }
    showSection(targetId);
  });
});

// sección inicial
showSection("Home");

// ============================
// CARGA DINÁMICA DE CARDS DESDE JSON
// ============================
async function fetchAndRenderCards() {
  try {
    const res = await fetch('/data/cards.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('no-data');
    const json = await res.json();
    if (!Array.isArray(json.products)) return;

    json.products.forEach(product => {
      if (!product.section) return;
      const container = document.querySelector(`.contenedor-de-todos-${product.section}`);
      if (!container) return;

      const article = document.createElement('article');
      // clase según tipo
      if ((product.type || '').toLowerCase() === 'plantitux') {
        article.className = 'plantitux-cards';
      } else {
        article.className = 'ebootux-cards';
      }

      // datos
      if (product.type && product.type.toLowerCase() === 'ebootux') {
        article.dataset.ebootuxTitle = product.title || '';
        article.dataset.ebootuxSubtitle = product.subtitle || '';
      } else {
        article.dataset.title = product.title || '';
      }

      if (product.code) article.dataset.code = product.code;
      if (product.price) article.dataset.price = product.price;
      if (product.image) article.dataset.image = product.image;
      if (product.description) article.dataset.description = product.description;
      if (product.prompt) article.dataset.prompt = product.prompt;
      if (product.link) article.dataset.link = product.link;
      if (product.yes) article.dataset.yes = product.yes;
      if (product.no) article.dataset.no = product.no;

      if (Array.isArray(product.blocks)) {
        product.blocks.forEach((b, idx) => {
          const n = idx + 1;
          if (b.title) article.dataset[`block${n}Title`] = b.title;
          if (b.text1) article.dataset[`block${n}Text1`] = b.text1;
          if (b.text2) article.dataset[`block${n}Text2`] = b.text2;
          if (b.img) article.dataset[`block${n}Img`] = b.img;
          if (b.video) article.dataset[`block${n}Video`] = b.video;
        });
      }

      // innerHTML acorde a tu markup
      article.innerHTML = `
        <header class="${product.type === 'plantitux' ? 'header-plantitux-cards' : 'header-ebootux-cards'}">
          <img src="${product.image || 'portadas/placeholder.jpeg'}" alt="${(product.title||'').replace(/"/g,'')}" />
        </header>

        <div class="contenedor-de-codigo">
          <h3>${product.title || ''}</h3>
          <img src="candado.svg" alt="candado">
          <input type="text" class="${product.type === 'plantitux' ? 'input-codigo-plantitux' : 'input-codigo-ebootux'}" placeholder="${product.type === 'plantitux' ? 'Ingresa tu código...' : 'Ingresa el código...'}">
          <button class="${product.type === 'plantitux' ? 'btn-acceder-plantitux' : 'btn-acceder-ebootux'}">Entrar</button>
        </div>

        <div class="contenedor-de-btn-de-compra">
          <a href="#" class="${product.type === 'plantitux' ? 'btn-de-vista-previa-plantitux' : 'btn-de-vista-previa'}"
             data-title="${escapeAttr(product.title)}"
             data-price="${escapeAttr(product.price)}"
             data-image="${escapeAttr(product.image)}"
             data-description="${escapeAttr(product.description)}"
             data-yes="${escapeAttr(product.yes || '')}"
             data-no="${escapeAttr(product.no || '')}"
             data-link="${escapeAttr(product.link || '')}">
            <img src="visibility_24dp_777777_FILL0_wght400_GRAD0_opsz24.svg" class="img-de-vista-previa" alt="vista previa">
          </a>

          <a href="${product.link ? escapeAttr(product.link) : '#'}" class="btn-de-compra" ${product.link ? 'target="_blank"' : ''}>
            <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra" alt="comprar"/>${product.price || '—'}
          </a>
        </div>
      `;

      container.appendChild(article);
    });

    // listeners para elementos dinámicos
    attachPreviewListeners();
    attachPlantituxPreviewListeners();

  } catch (err) {
    console.info('cards.json no cargado o no disponible, se usan cards estáticos si existen.');
  }
}

// ============================
// PREVIEW (dinámico) - attach after render
// ============================
function attachPreviewListeners() {
  $all(".btn-de-vista-previa").forEach(btn => {
    btn.removeEventListener('click', previewClickHandler);
    btn.addEventListener("click", previewClickHandler);
  });

  // close del preview modal
  const previewModal = $("#preview-modal");
  const closeBtn = previewModal?.querySelector(".logout-btn");
  if (closeBtn && previewModal) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      previewModal.classList.remove("active");
    });
  }
}

function previewClickHandler(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const previewModal = document.getElementById("preview-modal");
  const previewTitle = previewModal?.querySelector(".head-box h2");
  const previewImage = previewModal?.querySelector(".preview-multimedia");
  const previewYes = previewModal?.querySelector(".preview-si");
  const previewNo = previewModal?.querySelector(".preview-no");
  const previewBuyBtn = previewModal?.querySelector(".btn-de-compra");
  const previewDescription = previewModal?.querySelector(".preview-description");

  if (!previewModal) {
    alert(`${btn.dataset.title || ''}\n\n${btn.dataset.description || ''}`);
    return;
  }

  const title = btn.dataset.title || "";
  const price = btn.dataset.price || "";
  const image = btn.dataset.image || "";
  const description = btn.dataset.description || "";
  const yesList = (btn.dataset.yes || "").split(",");
  const noList = (btn.dataset.no || "").split(",");
  const link = btn.dataset.link || "#";

  if (previewTitle) previewTitle.textContent = title;
  if (previewImage && image) previewImage.src = image;
  if (previewDescription) previewDescription.textContent = description;

  if (previewBuyBtn) {
    previewBuyBtn.innerHTML = `
      <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>
      $${price}
    `;
    previewBuyBtn.href = link;
    previewBuyBtn.target = "_blank";
  }

  if (previewYes) {
    previewYes.innerHTML = "";
    yesList.forEach(item => {
      if (item.trim()) {
        const li = document.createElement("li");
        li.textContent = item.trim();
        previewYes.appendChild(li);
      }
    });
  }

  if (previewNo) {
    previewNo.innerHTML = "";
    noList.forEach(item => {
      if (item.trim()) {
        const li = document.createElement("li");
        li.textContent = item.trim();
        previewNo.appendChild(li);
      }
    });
  }

  previewModal.classList.add("active");
}

// ============================
// PLANTITUX preview listeners
// ============================
function attachPlantituxPreviewListeners() {
  $all(".btn-de-vista-previa-plantitux").forEach(btn => {
    btn.removeEventListener('click', plantPreviewClickHandler);
    btn.addEventListener("click", plantPreviewClickHandler);
  });

  const plantituxPreviewClose = $("#plantitux-preview-close");
  const plantituxPreviewModal = $("#plantitux-preview-modal");
  if (plantituxPreviewClose && plantituxPreviewModal) {
    plantituxPreviewClose.addEventListener("click", () => {
      plantituxPreviewModal.classList.remove("active");
    });
  }
}

function plantPreviewClickHandler(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const card = btn.closest(".plantitux-cards");
  const plantituxPreviewModal = document.getElementById("plantitux-preview-modal");
  const plantituxPreviewImg = document.getElementById("plantitux-preview-img");
  const plantituxPreviewVideo = document.getElementById("plantitux-preview-video");
  const plantituxPreviewTitle = document.getElementById("plantitux-preview-title");
  const plantituxPreviewBuy = document.getElementById("plantitux-preview-buy");

  if (!plantituxPreviewModal) {
    alert(`${btn.dataset.title || ''}\n\n${btn.dataset.description || ''}`);
    return;
  }

  const img = card?.dataset.previewImg || card?.dataset.image || "";
  const video = card?.dataset.previewVideo || "";
  const title = card?.dataset.title || "";
  const price = card?.dataset.price || "";
  const link = card?.dataset.link || "#";

  if (plantituxPreviewTitle) plantituxPreviewTitle.textContent = title;

  if (video && plantituxPreviewVideo) {
    plantituxPreviewVideo.src = video;
    plantituxPreviewVideo.classList.remove("hidden");
    if (plantituxPreviewImg) plantituxPreviewImg.classList.add("hidden");
  } else if (img && plantituxPreviewImg) {
    plantituxPreviewImg.src = img;
    plantituxPreviewImg.classList.remove("hidden");
    if (plantituxPreviewVideo) plantituxPreviewVideo.classList.add("hidden");
  }

  if (plantituxPreviewBuy) {
    plantituxPreviewBuy.innerHTML = `
      <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>
      $${price}
    `;
    plantituxPreviewBuy.href = link;
    plantituxPreviewBuy.target = "_blank";
  }

  plantituxPreviewModal.classList.add("active");
}

// ===============================
// MODAL PERSONALIZADO (usado para navegación bloqueada y mensajes)
function mostrarModal(titulo, mensaje, autoCerrar = false) {
  const modal = document.getElementById("modal-ebootux");
  const modalTitle = document.getElementById("modal-ebootux-title");
  const modalMessage = document.getElementById("modal-ebootux-message");
  const modalClose = document.getElementById("modal-ebootux-close");

  if (!modal || !modalTitle || !modalMessage || !modalClose) {
    try { alert(`${titulo}\n\n${mensaje}`); } catch (e) {}
    return;
  }

  modalTitle.textContent = titulo;
  modalMessage.textContent = mensaje;

  modal.classList.remove("hidden");

  if (autoCerrar) {
    modalClose.style.display = "none";
    setTimeout(() => { modal.classList.add("hidden"); }, 2600);
  } else {
    modalClose.style.display = "inline-block";
    modalClose.onclick = () => { modal.classList.add("hidden"); };
  }
}

// ===============================
// CONTROL DE ACCESO + MOSTRAR PLANTILLA (GETUX / EBOOTUX)
// Delegación para botones dinámicos y estáticos
document.addEventListener("click", function (e) {
  // ACCEDER EBOOTUX
  if (e.target.classList.contains("btn-acceder-ebootux")) {
    const card = e.target.closest(".ebootux-cards");
    if (!card) return;
    const input = card.querySelector(".input-codigo-ebootux");
    const plantilla = document.querySelector(".ebootux-template");
    if (!input || !plantilla) return;
    const codigoCorrecto = card.dataset.code || "";
    const codigoIngresado = input.value.trim();
    if (codigoIngresado === codigoCorrecto) {
      cargarEbootuxDesdeCard(card);
      plantilla.classList.remove("hidden");
      entrarEnEbootux();
    } else {
      mostrarModal("Código incorrecto ❌", "Verifica tu código e inténtalo de nuevo.");
      input.value = "";
      input.focus();
    }
  }

  // ACCEDER PLANTITUX (abrir prompt)
  if (e.target.classList.contains("btn-acceder-plantitux")) {
    const card = e.target.closest(".plantitux-cards");
    if (!card) return;
    const input = card.querySelector(".input-codigo-plantitux");
    if (!input) return;
    const codigoCorrecto = card.dataset.code || "";
    const codigoIngresado = input.value.trim();
    if (codigoIngresado === codigoCorrecto) {
      abrirPromptDesdeCard(card);
    } else {
      mostrarModal("Código incorrecto ❌", "Verifica tu código e inténtalo de nuevo.");
      input.value = "";
      input.focus();
    }
  }

  // SALIR EBOOTUX mediante botón
  if (e.target.closest(".ebootux-exit-btn")) {
    const ebootux = document.querySelector(".ebootux-template");
    if (!ebootux) return;
    ebootux.classList.add("hidden");
    ebootux.classList.remove("active");

    // desbloquear navegación
    navigationLocked = false;

    // forzar Home activo y borde
    showSection("Home");
  }
});

// ===============================
// EVITAR FLASH
window.addEventListener("load", () => { document.body.classList.add("loaded"); });

// ===============================
// CARGA DE DATOS AL EBOOTUX (reusa la lógica original)
function cargarEbootuxDesdeCard(card) {
  const ebootux = document.querySelector(".ebootux-template");
  const content = document.getElementById("ebootux-content");
  const template = document.getElementById("ebootux-block-template");
  if (!ebootux || !content || !template || !card) return;

  const h1 = ebootux.querySelector("[data-ebootux-h1]");
  const subtitle = ebootux.querySelector("[data-ebootux-subtitle]");

  if (h1) h1.textContent = card.dataset.ebootuxTitle || "";
  if (subtitle) subtitle.textContent = card.dataset.ebootuxSubtitle || "";

  content.innerHTML = "";

  const blockNumbers = Object.keys(card.dataset)
    .map(key => {
      const match = key.match(/^block(\d+)(Title|Text1|Text2|Text3|Text4|Text5|Img|Video)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(n => n !== null);

  const totalBlocks = blockNumbers.length ? Math.max(...blockNumbers) : 0;

  for (let i = 1; i <= totalBlocks; i++) {
    const clone = template.content.cloneNode(true);

    const title = card.dataset[`block${i}Title`];
    const text1 = card.dataset[`block${i}Text1`];
    const text2 = card.dataset[`block${i}Text2`];
    const text3 = card.dataset[`block${i}Text3`];
    const text4 = card.dataset[`block${i}Text4`];
    const text5 = card.dataset[`block${i}Text5`];
    const img = card.dataset[`block${i}Img`];
    const video = card.dataset[`block${i}Video`];

    const h2 = clone.querySelector("[data-block-title]");
    const pTags = clone.querySelectorAll("[data-block-text]");
    const mediaContainer = clone.querySelector("[data-media-container]");
    const imgTag = clone.querySelector("[data-media-img]");
    const videoTag = clone.querySelector("[data-media-video]");

    if (h2) {
      if (title) { h2.textContent = title; h2.style.display = "block"; }
      else h2.style.display = "none";
    }

    const textos = [text1, text2, text3, text4, text5];
    pTags.forEach((p, idx) => {
      if (textos[idx]) { p.innerHTML = textos[idx].replace(/\n/g, "<br>"); p.style.display = "block"; }
      else p.style.display = "none";
    });

    let hayMedia = false;
    if (imgTag && img) { imgTag.src = img; imgTag.style.display = "block"; hayMedia = true; } else if (imgTag) imgTag.style.display = "none";
    if (videoTag && video) { videoTag.src = video; videoTag.style.display = "block"; hayMedia = true; } else if (videoTag) videoTag.style.display = "none";
    if (mediaContainer) mediaContainer.hidden = !hayMedia;

    content.appendChild(clone);
  }
}

// ===============================
// ENTRAR EN EBOOTUX (ocultar app y bloquear navegación)
function entrarEnEbootux() {
  const ebootux = document.querySelector(".ebootux-template");
  const appSections = document.querySelectorAll(".app-section");

  appSections.forEach(section => section.classList.remove("active-section"));
  navItems.forEach(item => item.classList.remove("active"));

  if (ebootux) {
    ebootux.classList.remove("hidden");
    ebootux.classList.add("active");
  }

  navigationLocked = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// PROMPT / COPIAR (Plantitux) — similar al original
const promptModal = document.getElementById("prompt-modal");
const promptTextarea = document.getElementById("prompt-textarea");
const promptClose = document.getElementById("prompt-modal-close");
const copyPromptBtn = document.getElementById("copy-prompt-btn");
const miniModal = document.querySelector(".mini-modal");
let _copyTimeoutId = null;

function createInlineCheckIcon() {
  const span = document.createElement("span");
  span.className = "icon-check";
  span.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="none" fill="#00ffdd"/>
      <path d="M7 12.5L10 15.5L17 8.5" stroke="#012" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  span.style.display = "none";
  return span;
}

function resetCopyButtonState() {
  if (!copyPromptBtn) return;
  copyPromptBtn.classList.remove("copied");
  const iconCopy = copyPromptBtn.querySelector(".icon-copy");
  if (iconCopy) iconCopy.style.display = "inline-block";
  const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
  if (iconCheckImg) iconCheckImg.style.display = "none";
  const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
  if (inlineCheck) inlineCheck.style.display = "none";
  const btnText = copyPromptBtn.querySelector(".btn-text");
  if (btnText) btnText.textContent = "Copiar";
  if (_copyTimeoutId) { clearTimeout(_copyTimeoutId); _copyTimeoutId = null; }
}

function abrirPromptDesdeCard(card) {
  const prompt = card.dataset.prompt || "";
  if (!promptModal || !promptTextarea) return;
  promptTextarea.value = prompt;

  if (copyPromptBtn) {
    const iconCopy = copyPromptBtn.querySelector(".icon-copy");
    if (!iconCopy) {
      const span = document.createElement("span");
      span.className = "icon-copy";
      span.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="9" height="9" fill="#777" rx="1"/>
          <rect x="6" y="6" width="9" height="9" fill="#222" rx="1" opacity="0.9"/>
        </svg>`;
      copyPromptBtn.insertBefore(span, copyPromptBtn.firstChild);
    }

    const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
    const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
    if (!iconCheckImg && !inlineCheck) {
      const created = createInlineCheckIcon();
      const btnText = copyPromptBtn.querySelector(".btn-text");
      if (btnText) copyPromptBtn.insertBefore(created, btnText);
      else copyPromptBtn.appendChild(created);
    }

    resetCopyButtonState();
  }

  promptModal.classList.add("active");
  if (miniModal) miniModal.style.height = miniModal.scrollHeight + "px";
}

if (promptClose) {
  promptClose.addEventListener("click", () => {
    if (promptModal) promptModal.classList.remove("active");
    resetCopyButtonState();
  });
}

if (promptModal) {
  const observer = new MutationObserver(() => {
    if (!promptModal.classList.contains("active")) resetCopyButtonState();
  });
  observer.observe(promptModal, { attributes: true, attributeFilter: ["class"] });
}

if (copyPromptBtn && promptTextarea) {
  copyPromptBtn.addEventListener("click", () => {
    const prompt = promptTextarea.value || "";
    const doCopiedUI = () => {
      const iconCopy = copyPromptBtn.querySelector(".icon-copy");
      if (iconCopy) iconCopy.style.display = "none";
      const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
      if (iconCheckImg) iconCheckImg.style.display = "inline-block";
      else {
        const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
        if (inlineCheck) inlineCheck.style.display = "inline-block";
      }
      copyPromptBtn.classList.add("copied");
      const btnText = copyPromptBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Copiado";
      if (miniModal) miniModal.style.height = miniModal.scrollHeight + "px";
      if (_copyTimeoutId) clearTimeout(_copyTimeoutId);
      _copyTimeoutId = setTimeout(() => resetCopyButtonState(), 2000);
    };

    if (!navigator.clipboard) {
      try {
        promptTextarea.select();
        const ok = document.execCommand('copy');
        if (ok) doCopiedUI();
      } catch (err) { console.warn('Copiado no soportado', err); }
      return;
    }

    navigator.clipboard.writeText(prompt).then(() => doCopiedUI()).catch(err => { console.warn("Error copiando:", err); doCopiedUI(); });
  });
}

// ===============================
// Inicialización
fetchAndRenderCards().finally(() => {
  attachPreviewListeners();
  attachPlantituxPreviewListeners();
});
