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
const closeBtn = previewModal.querySelector(".logout-btn");

document.querySelectorAll(".btn-de-vista-previa").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();

    const title = btn.dataset.title;
    const price = btn.dataset.price;
    const image = btn.dataset.image;
    const yesList = btn.dataset.yes.split(",");
    const noList = btn.dataset.no.split(",");

    previewTitle.textContent = title;
    previewImage.src = image;
    previewPrice.innerHTML = `
      <img src="https://statux.netlify.app/shopping_cart_24dp_777777.svg" class="img-de-carrito-de-compra"/>
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
