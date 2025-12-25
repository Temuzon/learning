<script>
  const items = document.querySelectorAll(".item");

  items.forEach(item => {
    item.addEventListener("click", () => {

      
      items.forEach(i => i.classList.remove("active"));

      
      item.classList.add("active");

    });
  });
</script>
