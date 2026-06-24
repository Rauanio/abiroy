// Модалка «Получить расчёт» — открывается по кнопкам «Получить расчет»
const requestModal = document.querySelector("[data-request-modal]");
if (requestModal) {
  const panel = requestModal.querySelector("[data-request-panel]");
  const backdrop = requestModal.querySelector("[data-request-backdrop]");
  const closeBtn = requestModal.querySelector("[data-request-close]");

  const openModal = () => {
    requestModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    requestAnimationFrame(() => {
      backdrop?.classList.remove("opacity-0");
      panel?.classList.remove("opacity-0", "scale-95");
    });
  };

  const closeModal = () => {
    backdrop?.classList.add("opacity-0");
    panel?.classList.add("opacity-0", "scale-95");
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => requestModal.classList.add("hidden"), 300);
  };

  // Триггеры: явный data-атрибут + все кнопки/ссылки с текстом «Получить расчет»
  const triggers = new Set(document.querySelectorAll("[data-request-open]"));
  document.querySelectorAll("a, button").forEach((el) => {
    if (el.textContent.trim() === "Получить расчет") triggers.add(el);
  });
  triggers.forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    })
  );

  closeBtn?.addEventListener("click", closeModal);
  // Клик вне панели (по фону или области центрирования над ним) — закрываем
  requestModal.addEventListener("click", (e) => {
    if (!panel?.contains(e.target)) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !requestModal.classList.contains("hidden")) closeModal();
  });
}
