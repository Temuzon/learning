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
const boton = document.querySelector(".boton-de-ensanche-de-barra-de-navegacion");
const barra = document.querySelector(".barra-de-navegacion");

if (boton && barra) {
  boton.addEventListener("click", () => {
    barra.classList.toggle("expandida");
  });
}

// ============================
// Estado: bloqueo de navegación cuando un ebootux/getux está abierto
// ============================
let navigationLocked = false; // true cuando un ebootux/getux está activo

function showNavigationLockedModal() {
  // mensaje indicado por el usuario
  mostrarModal(
    "Navegación desactivada",
    "La navegación está desactivada mientras este contenido esté abierto. Sal para continuar.",
    true // autoCerrar: true para que no quede fijo
  );
}

// ============================
// 🔀 FUNCIÓN: ORDEN ALEATORIO POR SECCIÓN
// ============================
function mezclarCardsEnSeccion(seccion) {
  if (!seccion) return;

  // selección robusta: cualquier elemento cuya clase contenga "contenedor-de-todos-"
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
    if (targetId === id) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function showSection(id) {
  // si la navegación está bloqueada, prevenir cambios desde llamadas externas
  // (siempre que no sea para forzar Home al salir del ebootux - ese caso gestionamos explícitamente)
  // Nota: las llamadas internas legítimas (como forzar Home) deben pasar por showSection("Home") desde el exit handler.
  sections.forEach(section => {
    section.classList.remove("active-section");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active-section");
    mezclarCardsEnSeccion(target);
  }

  // actualizar estado visual de los items de navegación
  updateNavActiveForSection(id);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Interceptar clicks sobre navItems y mostrar mensaje si navegación bloqueada
navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = item.getAttribute("href")?.replace("#", "");
    if (!targetId) return;

    if (navigationLocked) {
      // Si el usuario intenta navegar mientras un ebootux/getux está abierto:
      showNavigationLockedModal();
      return;
    }

    showSection(targetId);
  });
});

// sección inicial
showSection("Home");

// ============================
// MODAL PREVIEW (GETUX / EBOOTUX)
// ============================
const previewModal = document.getElementById("preview-modal");
const previewTitle = previewModal?.querySelector(".head-box h2");
const previewImage = previewModal?.querySelector(".preview-multimedia");
const previewYes = previewModal?.querySelector(".preview-si");
const previewNo = previewModal?.querySelector(".preview-no");
const previewBuyBtn = previewModal?.querySelector(".btn-de-compra");
const previewDescription = previewModal?.querySelector(".preview-description");
const closeBtn = previewModal?.querySelector(".logout-btn");

if (closeBtn && previewModal) {
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    previewModal.classList.remove("active");
  });
}

document.querySelectorAll(".btn-de-vista-previa").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    if (!previewModal) return;

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
  });
});

// ============================
// BUSCADOR POR SECCIÓN (SÓLO EN SU SECCIÓN)
// ============================
document.querySelectorAll(".buscador-seccion").forEach(buscador => {
  const section = buscador.closest(".app-section");
  if (!section) return;

  // Elegir el selector de cards según la sección (ajusta si cambias nombres)
  let selector;
  switch ((section.id || "").toLowerCase()) {
    case "ebootux":
    case "getux":         // Getux usa .ebootux-cards en tu HTML actual
      selector = ".ebootux-cards";
      break;
    case "plantitux":
      selector = ".plantitux-cards";
      break;
    case "tracktux":
      selector = ".tracktux-cards";
      break;
    case "mindtux":
      selector = ".mindtux-cards";
      break;
    case "soundtux":
      selector = ".soundtux-cards";
      break;
    case "movitux":
      selector = ".movitux-cards";
      break;
    default:
      // fallback: cualquier card dentro de la sección
      selector = ".ebootux-cards, .plantitux-cards, .tracktux-cards, .mindtux-cards, .soundtux-cards, .movitux-cards";
  }

  const cards = section.querySelectorAll(selector);

  let emptyMsg = section.querySelector(".mensaje-vacio");
  if (!emptyMsg) {
    emptyMsg = document.createElement("p");
    emptyMsg.className = "mensaje-vacio";
    emptyMsg.textContent = "No hay coincidencias con ese nombre.";
    emptyMsg.style.display = "none";
    section.appendChild(emptyMsg);
  }

  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();
    let encontrados = 0;

    cards.forEach(card => {
      const titulo = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const match = titulo.includes(texto);
      card.style.display = match ? "flex" : "none";
      if (match) encontrados++;
    });

    emptyMsg.style.display = encontrados === 0 ? "block" : "none";
  });
});

// ===============================
// MODAL PERSONALIZADO
// ===============================
function mostrarModal(titulo, mensaje, autoCerrar = false) {
  const modal = document.getElementById("modal-ebootux");
  const modalTitle = document.getElementById("modal-ebootux-title");
  const modalMessage = document.getElementById("modal-ebootux-message");
  const modalClose = document.getElementById("modal-ebootux-close");

  if (!modal || !modalTitle || !modalMessage || !modalClose) {
    // fallback leve: si el modal no existe, usamos alert como último recurso
    try { alert(`${titulo}\n\n${mensaje}`); } catch (e) {}
    return;
  }

  modalTitle.textContent = titulo;
  modalMessage.textContent = mensaje;

  modal.classList.remove("hidden");

  if (autoCerrar) {
    modalClose.style.display = "none";
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 2600);
  } else {
    modalClose.style.display = "inline-block";
    modalClose.onclick = () => {
      modal.classList.add("hidden");
    };
  }
}

// ===============================
// CONTROL DE ACCESO + MOSTRAR PLANTILLA (GETUX / EBOOTUX)
// ===============================
document.addEventListener("click", function (e) {
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
});

// ===============================
// EVITAR FLASH DE CONTENIDO
// ===============================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ===============================
// CARGA DE DATOS AL EBOOTUX
// ===============================
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
      if (title) {
        h2.textContent = title;
        h2.style.display = "block";
      } else {
        h2.style.display = "none";
      }
    }

    const textos = [text1, text2, text3, text4, text5];
    pTags.forEach((p, idx) => {
      if (textos[idx]) {
        p.innerHTML = textos[idx].replace(/\n/g, "<br>");
        p.style.display = "block";
      } else {
        p.style.display = "none";
      }
    });

    let hayMedia = false;

    if (imgTag && img) {
      imgTag.src = img;
      imgTag.style.display = "block";
      hayMedia = true;
    } else if (imgTag) {
      imgTag.style.display = "none";
    }

    if (videoTag && video) {
      videoTag.src = video;
      videoTag.style.display = "block";
      hayMedia = true;
    } else if (videoTag) {
      videoTag.style.display = "none";
    }

    if (mediaContainer) {
      mediaContainer.hidden = !hayMedia;
    }

    content.appendChild(clone);
  }
}

// ===============================
// ENTRAR AL EBOOTUX (OCULTA TODO LO DEMÁS)
// ===============================
function entrarEnEbootux() {
  const ebootux = document.querySelector(".ebootux-template");
  const appSections = document.querySelectorAll(".app-section");

  // ocultar secciones de app y quitar active en nav
  appSections.forEach(section => section.classList.remove("active-section"));
  navItems.forEach(item => item.classList.remove("active"));

  if (ebootux) {
    ebootux.classList.remove("hidden");
    ebootux.classList.add("active");
  }

  // bloquear navegación
  navigationLocked = true;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// SALIR DEL EBOOTUX
// ===============================
document.addEventListener("click", function (e) {
  if (e.target.closest(".ebootux-exit-btn")) {
    const ebootux = document.querySelector(".ebootux-template");
    if (!ebootux) return;

    ebootux.classList.add("hidden");
    ebootux.classList.remove("active");

    // desbloquear navegación
    navigationLocked = false;

    // al salir, mostrar Home y activar su borde en la navegación
    showSection("Home");
  }
});

// ===============================
// PREVIEW MULTIMEDIA PLANTITUX / MOVITUX
// ===============================
const plantituxPreviewModal = document.getElementById("plantitux-preview-modal");
const plantituxPreviewImg = document.getElementById("plantitux-preview-img");
const plantituxPreviewVideo = document.getElementById("plantitux-preview-video");
const plantituxPreviewTitle = document.getElementById("plantitux-preview-title");
const plantituxPreviewBuy = document.getElementById("plantitux-preview-buy");
const plantituxPreviewClose = document.getElementById("plantitux-preview-close");

document.querySelectorAll(".btn-de-vista-previa-plantitux").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const card = btn.closest(".plantitux-cards");
    if (!card) return;

    const img = card.dataset.previewImg || "";
    const video = card.dataset.previewVideo || "";
    const title = card.dataset.title || "";
    const price = card.dataset.price || "";
    const link = card.dataset.link || "#";

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

    if (plantituxPreviewModal) plantituxPreviewModal.classList.add("active");
  });
});

if (plantituxPreviewClose && plantituxPreviewModal) {
  plantituxPreviewClose.addEventListener("click", () => {
    plantituxPreviewModal.classList.remove("active");
  });
}

// ===============================
// CONTROL DE ACCESO + MOSTRAR PROMPT
// ===============================
document.addEventListener("click", function (e) {
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
});

// ===============================
// ABRIR MODAL PROMPT
// ===============================
const promptModal = document.getElementById("prompt-modal");
const promptTextarea = document.getElementById("prompt-textarea");
const promptClose = document.getElementById("prompt-modal-close");

// elements related to copy button
const copyPromptBtn = document.getElementById("copy-prompt-btn");
const copyFeedback = document.querySelector(".copy-feedback");
const miniModal = document.querySelector(".mini-modal");

let _copyTimeoutId = null;

// helper: create inline check SVG if needed (so we never show a broken image)
function createInlineCheckIcon() {
  const span = document.createElement("span");
  span.className = "icon-check";
  // simple check-circle SVG markup (keeps styling via CSS)
  span.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="none" fill="#00ffdd"/>
      <path d="M7 12.5L10 15.5L17 8.5" stroke="#012" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  span.style.display = "none";
  span.style.width = "24px";
  span.style.height = "24px";
  span.style.lineHeight = "0";
  return span;
}

// reset copy button to initial state (copy icon visible)
function resetCopyButtonState() {
  if (!copyPromptBtn) return;

  // remove class
  copyPromptBtn.classList.remove("copied");

  // show copy icon if exists
  const iconCopy = copyPromptBtn.querySelector(".icon-copy");
  if (iconCopy) iconCopy.style.display = "inline-block";

  // hide any icon-check (img or inline)
  const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
  if (iconCheckImg) iconCheckImg.style.display = "none";

  // also handle inline-created check
  const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
  if (inlineCheck) inlineCheck.style.display = "none";

  // restore button text (if you choose to change it elsewhere)
  const btnText = copyPromptBtn.querySelector(".btn-text");
  if (btnText) btnText.textContent = "Copiar";

  // clear timeout if pending
  if (_copyTimeoutId) {
    clearTimeout(_copyTimeoutId);
    _copyTimeoutId = null;
  }
}

// open prompt from card and set contents; reset copy button state each time modal opens
function abrirPromptDesdeCard(card) {
  const prompt = card.dataset.prompt || "";
  if (!promptModal || !promptTextarea) return;
  promptTextarea.value = prompt;

  // ensure copy button icons exist and initial state
  if (copyPromptBtn) {
    // if copy icon missing, try to create a minimal fallback (text-only button will still work)
    const iconCopy = copyPromptBtn.querySelector(".icon-copy");
    if (!iconCopy) {
      // create a simple inline copy SVG inside an <span> to avoid broken images
      const span = document.createElement("span");
      span.className = "icon-copy";
      span.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="9" height="9" fill="#777" rx="1"/>
          <rect x="6" y="6" width="9" height="9" fill="#222" rx="1" opacity="0.9"/>
        </svg>
      `;
      span.style.display = "inline-block";
      span.style.width = "24px";
      span.style.height = "24px";
      copyPromptBtn.insertBefore(span, copyPromptBtn.firstChild);
    }

    // prepare check icon: if there's no <img class="icon-check">, create inline one
    const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
    const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
    if (!iconCheckImg && !inlineCheck) {
      const created = createInlineCheckIcon();
      // append before the button text (if exists)
      const btnText = copyPromptBtn.querySelector(".btn-text");
      if (btnText) copyPromptBtn.insertBefore(created, btnText);
      else copyPromptBtn.appendChild(created);
    }

    // finally reset visuals
    resetCopyButtonState();
  }

  promptModal.classList.add("active");
  if (miniModal) miniModal.style.height = miniModal.scrollHeight + "px";
}

// close prompt: reset copy state so on reopen it's fresh
if (promptClose) {
  promptClose.addEventListener("click", () => {
    if (promptModal) promptModal.classList.remove("active");
    // reset immediately when closed
    resetCopyButtonState();
  });
}

// also reset when modal is removed by any other means (safety)
if (promptModal) {
  const observer = new MutationObserver(() => {
    if (!promptModal.classList.contains("active")) {
      resetCopyButtonState();
    }
  });
  observer.observe(promptModal, { attributes: true, attributeFilter: ["class"] });
}

// ===============================
// COPIAR PROMPT + ANIMACIÓN + HEIGHT SUAVE
// ===============================
if (copyPromptBtn && promptTextarea) {
  copyPromptBtn.addEventListener("click", () => {
    const prompt = promptTextarea.value || "";

    // copy to clipboard (with fallback)
    const doCopiedUI = () => {
      // hide copy icon (img or inline)
      const iconCopy = copyPromptBtn.querySelector(".icon-copy");
      if (iconCopy) iconCopy.style.display = "none";

      // show check icon (img or inline)
      const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
      if (iconCheckImg) {
        iconCheckImg.style.display = "inline-block";
      } else {
        const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
        if (inlineCheck) inlineCheck.style.display = "inline-block";
      }

      // visual state
      copyPromptBtn.classList.add("copied");
      const btnText = copyPromptBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Copiado";

      // ensure mini modal height adapts
      if (miniModal) miniModal.style.height = miniModal.scrollHeight + "px";

      // auto-revert after 2s (keeps behavior consistent)
      if (_copyTimeoutId) clearTimeout(_copyTimeoutId);
      _copyTimeoutId = setTimeout(() => {
        resetCopyButtonState();
      }, 2000);
    };

    if (!navigator.clipboard) {
      // fallback: select and execCommand
      try {
        promptTextarea.select();
        const ok = document.execCommand('copy');
        if (ok) doCopiedUI();
        else {
          console.warn("Fallback copy failed");
        }
      } catch (err) {
        console.warn('Copiado no soportado', err);
      }
      return;
    }

    navigator.clipboard.writeText(prompt).then(() => {
      doCopiedUI();
    }).catch(err => {
      console.warn("Error copiando al portapapeles:", err);
      // still try UI feedback
      doCopiedUI();
    });
  });
}
// ===============================
// Inicialización
fetchAndRenderCards().finally(() => {
  attachPreviewListeners();
  attachPlantituxPreviewListeners();
});
