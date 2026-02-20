// ============================
// UTILIDADES
// ============================
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $all(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
function escAttr(v) {
  if (v === undefined || v === null) return "";
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const CARDS_JSON_URL = "data/cards.json";

// ============================
// UI NAVEGACIÓN
// ============================
const items = $all(".item");
const navItems = $all(".item");
const sections = $all(".app-section");
let navigationLocked = false;

items.forEach(item => {
  item.addEventListener("click", () => {
    items.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

const boton = $(".boton-de-ensanche-de-barra-de-navegacion");
const barra = $(".barra-de-navegacion");
if (boton && barra) {
  boton.addEventListener("click", () => barra.classList.toggle("expandida"));
}

function showNavigationLockedModal() {
  mostrarModal(
    "Navegación desactivada",
    "La navegación está desactivada mientras este contenido esté abierto. Sal para continuar.",
    true
  );
}

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

showSection("Home");

// ============================
// RENDER DINÁMICO DESDE JSON
// ============================
function buildEbootuxLikeCard(product) {
  const blocks = Array.isArray(product.blocks) ? product.blocks : [];
  const hasCode = Boolean((product.code || "").trim());

  const blockData = blocks.map((b, i) => {
    const n = i + 1;
    return `
      data-block${n}-title="${escAttr(b.title || "")}" 
      data-block${n}-text1="${escAttr(b.text1 || "")}" 
      data-block${n}-text2="${escAttr(b.text2 || "")}" 
      data-block${n}-text3="${escAttr(b.text3 || "")}" 
      data-block${n}-text4="${escAttr(b.text4 || "")}" 
      data-block${n}-text5="${escAttr(b.text5 || "")}" 
      data-block${n}-img="${escAttr(b.img || "")}" 
      data-block${n}-video="${escAttr(b.video || "")}"`;
  }).join(" ");

  return `
    <article class="ebootux-cards"
      data-ebootux-title="${escAttr(product.title || "")}" 
      data-ebootux-subtitle="${escAttr(product.subtitle || "")}" 
      data-code="${escAttr(product.code || "")}" 
      data-course-url="${escAttr(product.courseUrl || "")}"
      ${blockData}>

      <header class="header-ebootux-cards">
        <img src="${escAttr(product.image || "Statux-logo(SVG).svg")}" alt="${escAttr(product.title || "Producto")}">
      </header>

      <div class="contenedor-de-codigo">
        <h3>${escAttr(product.title || "Producto")}</h3>
        <img src="candado.svg" alt="candado">
        ${hasCode ? `<input type="password" class="input-codigo-ebootux" placeholder="Ingresa el código...">` : ""}
                <button class="btn-acceder-ebootux">Entrar</button>
      </div>

      <div class="contenedor-de-btn-de-compra">
        <a href="#" class="btn-de-vista-previa"
          data-title="${escAttr(product.title || "")}" 
          data-price="${escAttr(product.price || "")}" 
          data-image="${escAttr(product.image || "")}" 
          data-description="${escAttr(product.description || "")}" 
          data-yes="${escAttr(product.yes || "")}" 
          data-no="${escAttr(product.no || "")}" 
          data-link="${escAttr(product.link || "")}">
          <img src="visibility_24dp_777777_FILL0_wght400_GRAD0_opsz24.svg" class="img-de-vista-previa" alt="vista previa">
        </a>
        <button class="btn-de-compra btn-acceder-ebootux" type="button">
          <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra" alt="comprar">${escAttr(product.price || "—")}
        </button>
      </div>
    </article>
  `;
}

function buildAssetCard(product) {
  const kind = (product.type || "").toLowerCase();
  const isMovitux = kind === "movitux";
  const hasCode = Boolean((product.code || "").trim());

  return `
    <article class="plantitux-cards ${isMovitux ? "movitux-cards" : ""}"
      data-title="${escAttr(product.title || "")}" 
      data-preview-img="${escAttr(product.image || "")}" 
      data-preview-video="${escAttr(product.previewVideo || "")}" 
      data-prompt="${escAttr(product.prompt || "")}" 
      data-code="${escAttr(product.code || "")}" 
      data-price="${escAttr(product.price || "")}">

      <header class="header-plantitux-cards">
        <img src="${escAttr(product.image || "Statux-logo(SVG).svg")}" alt="${escAttr(product.title || "Plantitux")}">
      </header>

      <div class="contenedor-de-codigo">
        <h3>${escAttr(product.title || (isMovitux ? "Movitux" : "Plantitux"))}</h3>
        <img src="candado.svg" alt="candado">
        ${hasCode ? `<input type="password" class="input-codigo-plantitux" placeholder="Ingresa tu código...">` : ""}
                <button class="btn-acceder-plantitux">Entrar</button>
      </div>

      <div class="contenedor-de-btn-de-compra">
        <a href="#" class="btn-de-vista-previa-plantitux">
          <img src="visibility_24dp_777777_FILL0_wght400_GRAD0_opsz24.svg" class="img-de-vista-previa" alt="vista previa">
        </a>
        <button class="btn-de-compra btn-acceder-plantitux" type="button">
          <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra" alt="comprar">${escAttr(product.price || "—")}
        </button>
      </div>
    </article>
  `;
}

function sectionContainer(section) {
  return $(`.contenedor-de-todos-los-${section}`) || $(`[data-json-section="${section}"]`);
}

function renderProducts(products) {
  const bySection = products.reduce((acc, p) => {
    const sec = (p.section || "").toLowerCase();
    if (!sec) return acc;
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(p);
    return acc;
  }, {});

  Object.entries(bySection).forEach(([section, list]) => {
    const container = sectionContainer(section);
    if (!container) return;

    container.innerHTML = list.map(product => {
      const type = (product.type || "").toLowerCase();
      if (type === "plantitux" || type === "movitux") return buildAssetCard(product);
      return buildEbootuxLikeCard(product);
    }).join("\n");
  });
}


function normalizarProductsDesdeJSON(json) {
  if (Array.isArray(json?.products)) {
    return json.products.map(p => {
      const type = String((p.type || p.section || "")).toLowerCase();
      const section = String((p.section || p.type || "")).toLowerCase();
      return { ...p, type, section };
    });
  }

  // Compatibilidad con formato por categorías: { ebootux:[], getux:[], plantitux:[], movitux:[] }
  const categorias = ["ebootux", "getux", "plantitux", "movitux"];
  const out = [];
  categorias.forEach(cat => {
    const arr = json?.[cat];
    if (!Array.isArray(arr)) return;
    arr.forEach(item => out.push({ ...item, type: String(item.type || cat).toLowerCase(), section: String(item.section || cat).toLowerCase() }));
  });
  return out;
}

async function fetchAndRenderCards() {
  const candidates = [CARDS_JSON_URL, `/${CARDS_JSON_URL}`];
  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`no-data:${res.status}`);
      const json = await res.json();
      const products = normalizarProductsDesdeJSON(json);
      if (!Array.isArray(products) || products.length === 0) throw new Error("invalid-json");
      renderProducts(products);
      return;
    } catch (err) {
      lastError = err;
    }
  }

  console.info("cards.json no disponible; se usan cards estáticas si existen.", lastError);
}

// ============================
// MODAL PREVIEW GENÉRICO
// ============================
const previewModal = $("#preview-modal");
const previewTitle = previewModal?.querySelector(".head-box h2");
const previewImage = previewModal?.querySelector(".preview-multimedia");
const previewYes = previewModal?.querySelector(".preview-si");
const previewNo = previewModal?.querySelector(".preview-no");
const previewBuyBtn = previewModal?.querySelector(".btn-de-compra");
const previewDescription = previewModal?.querySelector(".preview-description");

if (previewModal) {
  const closeBtn = previewModal.querySelector(".logout-btn");
  if (closeBtn) closeBtn.addEventListener("click", () => previewModal.classList.remove("active"));
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-de-vista-previa");
  if (!btn) return;
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
  if (previewImage) previewImage.src = image;
  if (previewDescription) previewDescription.textContent = description;

  if (previewBuyBtn) {
    previewBuyBtn.innerHTML = `<img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>$${price}`;
    previewBuyBtn.href = link;
    previewBuyBtn.target = "_blank";
  }

  if (previewYes) {
    previewYes.innerHTML = "";
    yesList.forEach(item => {
      if (!item.trim()) return;
      const li = document.createElement("li");
      li.textContent = item.trim();
      previewYes.appendChild(li);
    });
  }

  if (previewNo) {
    previewNo.innerHTML = "";
    noList.forEach(item => {
      if (!item.trim()) return;
      const li = document.createElement("li");
      li.textContent = item.trim();
      previewNo.appendChild(li);
    });
  }

  previewModal.classList.add("active");
});

// ============================
// PREVIEW PLANTITUX
// ============================
const plantituxPreviewModal = $("#plantitux-preview-modal");
const plantituxPreviewImg = $("#plantitux-preview-img");
const plantituxPreviewVideo = $("#plantitux-preview-video");
const plantituxPreviewTitle = $("#plantitux-preview-title");
const plantituxPreviewBuy = $("#plantitux-preview-buy");
const plantituxPreviewClose = $("#plantitux-preview-close");
if (plantituxPreviewClose && plantituxPreviewModal) {
  plantituxPreviewClose.addEventListener("click", () => plantituxPreviewModal.classList.remove("active"));
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-de-vista-previa-plantitux");
  if (!btn) return;
  e.preventDefault();

  const card = btn.closest(".plantitux-cards");
  if (!card || !plantituxPreviewModal) return;

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
  } else if (plantituxPreviewImg) {
    plantituxPreviewImg.src = img;
    plantituxPreviewImg.classList.remove("hidden");
    if (plantituxPreviewVideo) plantituxPreviewVideo.classList.add("hidden");
  }

  if (plantituxPreviewBuy) {
    plantituxPreviewBuy.innerHTML = `<img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>$${price}`;
    plantituxPreviewBuy.href = link;
    plantituxPreviewBuy.target = "_blank";
  }

  plantituxPreviewModal.classList.add("active");
});

// ============================
// BUSCADOR POR SECCIÓN
// ============================
$all(".buscador-seccion").forEach(buscador => {
  const section = buscador.closest(".app-section");
  if (!section) return;

  let selector = ".ebootux-cards, .plantitux-cards, .tracktux-cards, .mindtux-cards, .soundtux-cards, .movitux-cards";
  switch ((section.id || "").toLowerCase()) {
    case "ebootux":
    case "getux":
      selector = ".ebootux-cards";
      break;
    case "movitux":
      selector = ".movitux-cards";
      break;
    case "plantitux":
      selector = ".plantitux-cards";
      break;
  }

  let emptyMsg = section.querySelector(".mensaje-vacio");
  if (!emptyMsg) {
    emptyMsg = document.createElement("p");
    emptyMsg.className = "mensaje-vacio";
    emptyMsg.textContent = "No hay coincidencias con ese nombre.";
    emptyMsg.style.display = "none";
    section.appendChild(emptyMsg);
  }

  buscador.addEventListener("input", () => {
    const cards = section.querySelectorAll(selector);
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
// MODAL MENSAJES
// ===============================
function mostrarModal(titulo, mensaje, autoCerrar = false) {
  const modal = document.getElementById("modal-ebootux");
  const modalTitle = document.getElementById("modal-ebootux-title");
  const modalMessage = document.getElementById("modal-ebootux-message");

  if (!modal || !modalTitle || !modalMessage) {
    try { alert(`${titulo}

${mensaje}`); } catch (_) {}
    return;
  }

  modalTitle.textContent = titulo;
  modalMessage.textContent = mensaje;
  modal.classList.remove("hidden");

  const closeNow = () => {
    modal.classList.add("hidden");
    document.removeEventListener("pointerdown", onAnyClick, true);
  };

  const onAnyClick = (ev) => {
    if (!modal.classList.contains("hidden")) closeNow();
  };

  // Cierra por timeout (mínimo 5s) y también al tocar cualquier lugar.
  const timeoutMs = autoCerrar ? 2600 : 5000;
  setTimeout(() => {
    if (!modal.classList.contains("hidden")) closeNow();
  }, timeoutMs);

  // Listener global en captura para cerrar instantáneamente al click/tap.
  setTimeout(() => document.addEventListener("pointerdown", onAnyClick, true), 0);
}

// ===============================
// ACCESO + EBOOTUX
// ===============================
document.addEventListener("click", function (e) {
  const ebootuxAccessBtn = e.target.closest(".btn-acceder-ebootux");
  if (ebootuxAccessBtn) {
    const card = ebootuxAccessBtn.closest(".ebootux-cards");
    if (!card) return;

    const input = card.querySelector(".input-codigo-ebootux");
    const plantilla = document.querySelector(".ebootux-template");
    if (!plantilla) return;

    const codigoCorrecto = (card.dataset.code || "").trim();
    const codigoIngresado = (input?.value || "").trim();
    const codigoValido = !codigoCorrecto || codigoIngresado === codigoCorrecto;

    if (codigoValido) {
      const courseUrl = card.dataset.courseUrl || "";
      if (courseUrl) {
        window.location.href = courseUrl;
        return;
      }

      cargarEbootuxDesdeCard(card);
      plantilla.classList.remove("hidden");
      entrarEnEbootux();
    } else {
      mostrarModal("Código incorrecto ❌", "Verifica tu código e inténtalo de nuevo.");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }

  const assetAccessBtn = e.target.closest(".btn-acceder-plantitux");
  if (assetAccessBtn) {
    const card = assetAccessBtn.closest(".plantitux-cards, .movitux-cards");
    if (!card) return;

    const input = card.querySelector(".input-codigo-plantitux");
    const codigoCorrecto = (card.dataset.code || "").trim();
    const codigoIngresado = (input?.value || "").trim();
    const codigoValido = !codigoCorrecto || codigoIngresado === codigoCorrecto;

    if (codigoValido) {
      abrirPromptDesdeCard(card);
    } else {
      mostrarModal("Código incorrecto ❌", "Verifica tu código e inténtalo de nuevo.");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }


  if (e.target.closest(".ebootux-exit-btn")) {
    const ebootux = document.querySelector(".ebootux-template");
    if (!ebootux) return;

    ebootux.classList.add("hidden");
    ebootux.classList.remove("active");
    navigationLocked = false;
    showSection("Home");
  }
});

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

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
      else { h2.style.display = "none"; }
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

    if (mediaContainer) mediaContainer.hidden = !hayMedia;
    content.appendChild(clone);
  }
}

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
// PROMPT PLANTITUX
// ===============================
const promptModal = document.getElementById("prompt-modal");
const promptTextarea = document.getElementById("prompt-textarea");
const promptClose = document.getElementById("prompt-modal-close");
const copyPromptBtn = document.getElementById("copy-prompt-btn");
const miniModal = document.querySelector(".mini-modal");
const downloadReferenceBtn = document.getElementById("download-reference-btn");
let _copyTimeoutId = null;

function createInlineCheckIcon() {
  const span = document.createElement("span");
  span.className = "icon-check";
  span.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="none" fill="#00ffdd"/>
      <path d="M7 12.5L10 15.5L17 8.5" stroke="#012" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
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


  if (_copyTimeoutId) {
    clearTimeout(_copyTimeoutId);
    _copyTimeoutId = null;
  }
}

function abrirPromptDesdeCard(card) {
  const prompt = card.dataset.prompt || "";
  if (!promptModal || !promptTextarea) return;

  promptTextarea.value = prompt;

  const modalTitle = promptModal.querySelector(".head-box h2");
  if (modalTitle) {
    const isMovitux = card.classList.contains("movitux-cards");
    modalTitle.textContent = isMovitux ? "Prompt Movitux" : "Prompt Plantitux";
  }
  if (downloadReferenceBtn) {
    const imageUrl = card.dataset.previewImg || "";
    downloadReferenceBtn.href = imageUrl || "#";
    const fileName = (card.dataset.title || "referencia").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".jpg";
    downloadReferenceBtn.setAttribute("download", fileName);
  }

  if (copyPromptBtn) {
    let iconCopy = copyPromptBtn.querySelector(".icon-copy");
    if (!iconCopy) {
      iconCopy = document.createElement("span");
      iconCopy.className = "icon-copy";
      iconCopy.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="9" width="9" height="9" fill="#777" rx="1"/>
          <rect x="6" y="6" width="9" height="9" fill="#222" rx="1" opacity="0.9"/>
        </svg>
      `;
      copyPromptBtn.insertBefore(iconCopy, copyPromptBtn.firstChild);
    }

    const iconCheckImg = copyPromptBtn.querySelector("img.icon-check");
    const inlineCheck = copyPromptBtn.querySelector(".icon-check:not(img)");
    if (!iconCheckImg && !inlineCheck) {
      const created = createInlineCheckIcon();
      copyPromptBtn.appendChild(created);
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
      if (_copyTimeoutId) clearTimeout(_copyTimeoutId);
      _copyTimeoutId = setTimeout(() => resetCopyButtonState(), 2000);
    };

    if (!navigator.clipboard) {
      try {
        promptTextarea.select();
        const ok = document.execCommand("copy");
        if (ok) doCopiedUI();
      } catch (err) {
        console.warn("Copiado no soportado", err);
      }
      return;
    }

    navigator.clipboard.writeText(prompt)
      .then(() => doCopiedUI())
      .catch(err => {
        console.warn("Error copiando:", err);
        doCopiedUI();
      });
  });
}


// Permite usar Enter en inputs de código del sitio oficial.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const ebootuxInput = e.target.closest(".input-codigo-ebootux");
  if (ebootuxInput) {
    const card = ebootuxInput.closest(".ebootux-cards");
    const btn = card?.querySelector(".btn-acceder-ebootux");
    if (btn) {
      e.preventDefault();
      btn.click();
    }
    return;
  }

  const assetInput = e.target.closest(".input-codigo-plantitux");
  if (assetInput) {
    const card = assetInput.closest(".plantitux-cards, .movitux-cards");
    const btn = card?.querySelector(".btn-acceder-plantitux");
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  }
});

fetchAndRenderCards();
