(function () {
  const SELECTOR_BLOQUEADO = "[data-bloqueado]";
  const PREVIEW_ICON = "visibility_24dp_777777_FILL0_wght400_GRAD0_opsz24.svg";

  const isEmbeddedIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const isPreview = (() => {
    try { return new URLSearchParams(window.location.search).has("stx_return"); } catch { return false; }
  })();

  if (isEmbeddedIframe || isPreview) {
    document.addEventListener("click", (e) => {
      const el = e.target.closest(SELECTOR_BLOQUEADO);
      if (!el) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      triggerBloqueoUX(el);
    }, true);

    document.addEventListener("submit", (e) => {
      const el = e.target.closest(SELECTOR_BLOQUEADO);
      if (!el) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      triggerBloqueoUX(el);
    }, true);
  }

  function triggerBloqueoUX(elemento) {
    mostrarModalBloqueo();
    elemento.classList.add("stx-bloqueado-feedback");
    setTimeout(() => elemento.classList.remove("stx-bloqueado-feedback"), 260);
  }

  function mostrarModalBloqueo() {
    let modal = document.getElementById("stx-modal-bloqueo");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "stx-modal-bloqueo";
      modal.innerHTML = `<div class="stx-overlay"><div class="stx-modal"><p class="stx-title">Acceso restringido</p><p class="stx-sub">Desbloquea el Systux completo</p><button class="stx-btn">Entendido</button></div></div>`;
      document.body.appendChild(modal);
      modal.querySelector(".stx-overlay")?.addEventListener("click", (e) => { if (e.target.classList.contains("stx-overlay")) modal.remove(); });
      modal.querySelector(".stx-btn")?.addEventListener("click", () => modal.remove());
    }
  }

  if (isEmbeddedIframe || isPreview) return;

  const previewModal = document.getElementById("preview-modal");
  if (!previewModal) return;

  let previewUrl = "";
  let triggerBtn = previewModal.querySelector(".preview-trigger");
  if (!triggerBtn) {
    triggerBtn = document.createElement("button");
    triggerBtn.type = "button";
    triggerBtn.className = "preview-trigger";
    triggerBtn.setAttribute("aria-label", "Abrir vista previa del Systux");
    triggerBtn.innerHTML = `<img src="${PREVIEW_ICON}" class="img-de-vista-previa" alt="Vista previa">`;
    const head = previewModal.querySelector(".box-preview .head-box");
    if (head) head.appendChild(triggerBtn);
  }

  const frameModal = document.getElementById("stx-preview-frame-modal");
  const frame = document.getElementById("stx-preview-frame-iframe");
  const frameClose = document.getElementById("stx-preview-frame-close");
  if (!frameModal || !frame || !frameClose) return;

  document.addEventListener("click", (e) => {
    const previewBtn = e.target.closest(".btn-de-vista-previa");
    if (!previewBtn) return;
    const card = previewBtn.closest(".ebootux-cards, .getux-cards");
    const url = String(card?.dataset.courseUrl || "").trim();
    previewUrl = url;
    previewModal.classList.toggle("has-course-preview", Boolean(url));
  });

  triggerBtn.addEventListener("click", () => {
    if (!previewUrl) return;
    const target = new URL(previewUrl, window.location.href);
    const activeSectionId = document.querySelector(".app-section.active-section")?.id || "Home";
    const returnUrl = `${window.location.origin}${window.location.pathname}#${activeSectionId}`;
    target.searchParams.set("stx_return", returnUrl);
    frame.src = target.toString();
    frameModal.classList.add("active");
  });

  const closeFrame = () => {
    frameModal.classList.remove("active");
    frame.src = "";
  };

  frameClose.addEventListener("click", closeFrame);
  frameModal.addEventListener("click", (e) => { if (e.target === frameModal) closeFrame(); });
})();
