// Системы водоподготовки (страница solution-details):
// выбор пункта слева меняет превью справа (фото, бейдж, описание).
const systemsSection = document.querySelector("[data-solution-systems]");
if (systemsSection) {
  const items = systemsSection.querySelectorAll("[data-system-item]");
  const image = systemsSection.querySelector("[data-system-image]");
  const badge = systemsSection.querySelector("[data-system-badge]");
  const desc = systemsSection.querySelector("[data-system-desc]");

  const select = (item) => {
    items.forEach((it) => it.classList.toggle("is-active", it === item));
    if (image) image.src = item.dataset.img;
    if (badge) badge.textContent = item.dataset.title;
    if (desc) desc.textContent = item.dataset.desc;
  };

  items.forEach((item) => {
    item.addEventListener("click", () => select(item));
  });

  // Инициализируем превью из активного пункта (или первого)
  const initial = systemsSection.querySelector("[data-system-item].is-active") || items[0];
  if (initial) select(initial);
}
