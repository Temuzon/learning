const items = document.querySelectorAll(".item");

  items.forEach(item => {
    item.addEventListener("click", () => {

      
      items.forEach(i => i.classList.remove("active"));

      
      item.classList.add("active");

    });
  });

const boton = document.querySelector(
  ".boton-de-ensanche-de-barra-de-navegacion"
);
const barra = document.querySelector(".barra-de-navegacion");

boton.addEventListener("click", () => {
  barra.classList.toggle("expandida");
});
