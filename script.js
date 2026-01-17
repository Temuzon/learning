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

boton.addEventListener("click", () => {
  barra.classList.toggle("expandida");
});

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
    const targetId = item.getAttribute("href").replace("#", "");
    showSection(targetId);
  });
});

// sección inicial
showSection("Home");

// ============================
// MODAL PREVIEW (ÚNICO SISTEMA)
// ============================
const previewModal = document.getElementById("preview-modal");
const previewTitle = previewModal.querySelector(".head-box h2");
const previewImage = previewModal.querySelector(".preview-multimedia");
const previewYes = previewModal.querySelector(".preview-si");
const previewNo = previewModal.querySelector(".preview-no");
const previewPrice = previewModal.querySelector(".btn-de-compra");
const previewDescription = previewModal.querySelector(".preview-description");
const closeBtn = previewModal.querySelector(".logout-btn");

document.querySelectorAll(".btn-de-vista-previa").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();

    const title = btn.dataset.title;
    const price = btn.dataset.price;
    const image = btn.dataset.image;
    const description = btn.dataset.description;
    const yesList = btn.dataset.yes.split(",");
    const noList = btn.dataset.no.split(",");

    previewTitle.textContent = title;
    previewImage.src = image;
    previewDescription.textContent = description;

    previewPrice.innerHTML = `
      <img src="shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>
      $${price}
    `;

    previewYes.innerHTML = "";
    yesList.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.trim();
      previewYes.appendChild(li);
    });

    previewNo.innerHTML = "";
    noList.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.trim();
      previewNo.appendChild(li);
    });

    previewModal.classList.add("active");
  });
});

closeBtn.addEventListener("click", () => {
  previewModal.classList.remove("active");
});

// ============================
// Buscador
// ============================

document.querySelectorAll(".buscador-seccion").forEach(buscador => {
  const section = buscador.closest(".app-section");
  const cards = section.querySelectorAll("article");

  // Crear mensaje vacío si no existe
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


// ============================
// Codigo de cards
// ============================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-acceder-ebootux")) {
      const card = e.target.closest(".ebootux-cards");
      const input = card.querySelector(".input-codigo-ebootux");
      const codigoCorrecto = card.dataset.code;
      const codigoIngresado = input.value.trim();

      if (codigoIngresado === codigoCorrecto) {
        // Aquí activas la sección del ebootux
        document.getElementById("ebootux-citas").classList.add("active");
        alert("Acceso concedido 🔓");
      } else {
        alert("Código incorrecto ❌");
        input.value = "";
        input.focus();
      }
    }
  });
