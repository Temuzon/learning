// playground.js
// Tabs reales, auto-save localStorage, live preview y consola básica.

(() => {
  const elHtml = document.getElementById("editor-html");
  const elCss = document.getElementById("editor-css");
  const elJs = document.getElementById("editor-js");
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const preview = document.getElementById("preview");
  const consolePanel = document.getElementById("console");
  const btnReset = document.getElementById("btn-reset");

  // Si no estamos en curso.html, salir silenciosamente.
  if (!elHtml || !elCss || !elJs || !preview) return;

  const LS_KEY = "getux_playground_v1";

  const defaults = {
    html: `<main style="padding:20px;font-family:system-ui"><h1>Hola, Statux</h1><p>Empieza a construir aquí.</p></main>`,
    css: `body { margin:0; background:#f7f9ff; color:#1b2b44; }\nh1 { color:#1a5dab; }`,
    js: `console.log('Playground listo ✅');`
  };

  function appendConsole(line) {
    const now = new Date().toLocaleTimeString();
    consolePanel.textContent += `[${now}] ${line}\n`;
    consolePanel.scrollTop = consolePanel.scrollHeight;
  }

  function save() {
    const payload = {
      html: elHtml.value,
      css: elCss.value,
      js: elJs.value
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }

  function load() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaults };

    try {
      const parsed = JSON.parse(raw);
      return {
        html: parsed.html ?? defaults.html,
        css: parsed.css ?? defaults.css,
        js: parsed.js ?? defaults.js
      };
    } catch {
      return { ...defaults };
    }
  }

  function buildSrcdoc(html, css, js) {
    // Capturamos errores y console.log en el iframe y los enviamos al padre.
    return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    (function () {
      var oldLog = console.log;
      console.log = function () {
        var text = Array.from(arguments).map(String).join(' ');
        parent.postMessage({ type: 'playground-log', payload: text }, '*');
        oldLog.apply(console, arguments);
      };

      window.onerror = function (msg, src, line, col) {
        parent.postMessage({
          type: 'playground-error',
          payload: String(msg) + ' (L' + line + ':' + col + ')'
        }, '*');
      };
    })();
  <\/script>
  <script>
    try {
      ${js}
    } catch (e) {
      parent.postMessage({ type: 'playground-error', payload: e.message }, '*');
    }
  <\/script>
</body>
</html>`;
  }

  function renderPreview() {
    const html = elHtml.value;
    const css = elCss.value;
    const js = elJs.value;

    preview.srcdoc = buildSrcdoc(html, css, js);
  }

  function switchTab(tabName) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
    elHtml.classList.toggle("hidden", tabName !== "html");
    elCss.classList.toggle("hidden", tabName !== "css");
    elJs.classList.toggle("hidden", tabName !== "js");
  }

  // Inicialización
  const initial = load();
  elHtml.value = initial.html;
  elCss.value = initial.css;
  elJs.value = initial.js;
  switchTab("html");
  renderPreview();

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      save(); // guarda al cambiar de tab
      switchTab(tab.dataset.tab);
    });
  });

  [elHtml, elCss, elJs].forEach(editor => {
    editor.addEventListener("input", () => {
      save();
      renderPreview(); // live update al escribir
    });
  });

  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "playground-log") {
      appendConsole(`LOG: ${data.payload}`);
    }
    if (data.type === "playground-error") {
      appendConsole(`ERROR: ${data.payload}`);
    }
  });

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      localStorage.removeItem(LS_KEY);
      elHtml.value = defaults.html;
      elCss.value = defaults.css;
      elJs.value = defaults.js;
      consolePanel.textContent = "";
      renderPreview();
      appendConsole("Proyecto reiniciado.");
    });
  }
})();
