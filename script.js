// border de los itmes activados cuando estan activos


const items = document.querySelectorAll(".item");

  items.forEach(item => {
    item.addEventListener("click", () => {

      
      items.forEach(i => i.classList.remove("active"));

      
      item.classList.add("active");

    });
  });


// barra de navegacion flexible


const boton = document.querySelector(
  ".boton-de-ensanche-de-barra-de-navegacion"
);
const barra = document.querySelector(".barra-de-navegacion");

boton.addEventListener("click", () => {
  barra.classList.toggle("expandida");
});


// Guarda secciones 


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

  window.scrollTo({ top: 0, behavior: "instant" });
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
