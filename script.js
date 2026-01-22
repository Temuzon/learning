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
// NAVEGACIÓN ENTRE SECCIONES
// ============================
const sections = document.querySelectorAll(".app-section");
const navItems = document.querySelectorAll(".item");

function showSection(id) {
  sections.forEach(section => {
    section.classList.remove("active-section");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active-section");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = item.getAttribute("href")?.replace("#", "");
    if (targetId) showSection(targetId);
  });
});

// sección inicial
showSection("Home");

// ============================
// MODAL PREVIEW (ÚNICO SISTEMA)
// ============================
const previewModal = document.getElementById("preview-modal");
const previewTitle = previewModal?.querySelector(".head-box h2");
const previewImage = previewModal?.querySelector(".preview-multimedia");
const previewYes = previewModal?.querySelector(".preview-si");
const previewNo = previewModal?.querySelector(".preview-no");
const previewBuyBtn = previewModal?.querySelector(".btn-de-compra");
const previewDescription = previewModal?.querySelector(".preview-description");
const closeBtn = previewModal?.querySelector(".logout-btn");

document.querySelectorAll(".btn-de-vista-previa").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    
    if (closeBtn) {
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    previewModal.classList.remove("active");
  });
}



    if (!previewModal) return;

    const title = btn.dataset.title || "";
    const price = btn.dataset.price || "";
    const image = btn.dataset.image || "";
    const description = btn.dataset.description || "";
    const yesList = (btn.dataset.yes || "").split(",");
    const noList = (btn.dataset.no || "").split(",");
    const link = btn.dataset.link || "#"; // 👈 NUEVO

    previewTitle.textContent = title;
    previewImage.src = image;
    previewDescription.textContent = description;

    previewBuyBtn.innerHTML = `
      <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>
      $${price}
    `;
    previewBuyBtn.href = link; // 👈 CONECTA EL BOTÓN AL LINK
    previewBuyBtn.target = "_blank"; // opcional

    previewYes.innerHTML = "";
    yesList.forEach(item => {
      if (item.trim()) {
        const li = document.createElement("li");
        li.textContent = item.trim();
        previewYes.appendChild(li);
      }
    });

    previewNo.innerHTML = "";
    noList.forEach(item => {
      if (item.trim()) {
        const li = document.createElement("li");
        li.textContent = item.trim();
        previewNo.appendChild(li);
      }
    });

    previewModal.classList.add("active");
  });
});

// ============================
// Buscador
// ============================
document.querySelectorAll(".buscador-seccion").forEach(buscador => {
  const section = buscador.closest(".app-section");
  if (!section) return;

  const cards = section.querySelectorAll("article");

  let emptyMsg = section.querySelector(".mensaje-vacio");
  if (!emptyMsg) {
    emptyMsg = document.createElement("p");
    emptyMsg.className = "mensaje-vacio";
    emptyMsg.textContent = "No hay productos con ese nombre.";
    emptyMsg.style.display = "none";
    section.appendChild(emptyMsg);
  }

  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
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

  if (!modal || !modalTitle || !modalMessage || !modalClose) return;

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
// CONTROL DE ACCESO + MOSTRAR PLANTILLA
// ===============================
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-acceder-ebootux")) {
    const card = e.target.closest(".ebootux-cards");
    if (!card) return;

    const input = card.querySelector(".input-codigo-ebootux");
    const plantilla = document.querySelector(".ebootux-template");
    if (!input || !plantilla) return;

    const codigoCorrecto = card.dataset.code; 
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

  if (!ebootux || !content || !template) return;

  const h1 = ebootux.querySelector("[data-ebootux-h1]");
  const subtitle = ebootux.querySelector("[data-ebootux-subtitle]");

  if (h1) h1.textContent = card.dataset.ebootuxTitle || "";
  if (subtitle) subtitle.textContent = card.dataset.ebootuxSubtitle || "";

  // Limpia bloques anteriores
  content.innerHTML = "";

  // Detectar cuántos bloques hay realmente
  const blockNumbers = Object.keys(card.dataset)
    .map(key => {
      const match = key.match(/^block(\d+)(Title|Text1|Text2|Text3|Img|Video)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(n => n !== null);

  const totalBlocks = Math.max(...blockNumbers, 0);

  for (let i = 1; i <= totalBlocks; i++) {
    const clone = template.content.cloneNode(true);

    const title = card.dataset[`block${i}Title`];
    const text1 = card.dataset[`block${i}Text1`];
    const text2 = card.dataset[`block${i}Text2`];
    const text3 = card.dataset[`block${i}Text3`];
    const img = card.dataset[`block${i}Img`];
    const video = card.dataset[`block${i}Video`];

    const h2 = clone.querySelector("[data-block-title]");
    const pTags = clone.querySelectorAll("[data-block-text]");
    const mediaContainer = clone.querySelector("[data-media-container]");
    const imgTag = clone.querySelector("[data-media-img]");
    const videoTag = clone.querySelector("[data-media-video]");

    // TÍTULO
    if (h2) {
      if (title) {
        h2.textContent = title;
        h2.style.display = "block";
      } else {
        h2.style.display = "none";
      }
    }

    // TEXTOS
    const textos = [text1, text2, text3];
    pTags.forEach((p, idx) => {
      if (textos[idx]) {
        p.textContent = textos[idx];
        p.style.display = "block";
      } else {
        p.style.display = "none";
      }
    });

    // MEDIA
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

  appSections.forEach(section => section.classList.remove("active-section"));
  if (ebootux) {
    ebootux.classList.remove("hidden");
    ebootux.classList.add("active");
  }

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

    showSection("Home");
  }
});
