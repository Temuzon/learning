// auth.js
// Maneja el login por código y la protección de curso.html.

(() => {
  const ACCESS_KEY = "getux_access";
  const ACCESS_VALUE = "granted";
  const VALID_CODE = "GETUX-HTMLCSS"; // cambia este valor cuando quieras.

  const isIndex = location.pathname.endsWith("index.html") || location.pathname.endsWith("/getux-html-css/") || location.pathname.endsWith("/getux-html-css");
  const isCurso = location.pathname.endsWith("curso.html");

  // Protección interna: si intentan abrir curso.html sin acceso, vuelven al index.
  if (isCurso && sessionStorage.getItem(ACCESS_KEY) !== ACCESS_VALUE) {
    location.replace("index.html");
    return;
  }

  if (isIndex) {
    const input = document.getElementById("codigo");
    const btn = document.getElementById("btn-entrar");
    const msg = document.getElementById("auth-msg");

    if (!input || !btn) return;

    const entrar = () => {
      const code = input.value.trim();

      if (code === VALID_CODE) {
        sessionStorage.setItem(ACCESS_KEY, ACCESS_VALUE);
        msg.textContent = "Acceso concedido. Entrando...";
        msg.style.color = "#c1e8ff";
        setTimeout(() => location.href = "curso.html", 300);
        return;
      }

      msg.textContent = "Código incorrecto. Verifica e intenta de nuevo.";
      msg.style.color = "#ffb3b3";
    };

    btn.addEventListener("click", entrar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") entrar();
    });
  }

  // Botón salir en el curso.
  const salir = document.getElementById("btn-salir");
  if (salir) {
    salir.addEventListener("click", () => {
      sessionStorage.removeItem(ACCESS_KEY);
      location.href = "index.html";
    });
  }
})();
