import Swiper from "swiper";
import { FreeMode, Mousewheel } from "swiper/modules";

// Решения: один слайдер, контент которого меняется при переключении вкладок
const solutionsSection = document.querySelector("[data-solutions]");
if (solutionsSection) {
  const wrapper = solutionsSection.querySelector("[data-solutions-wrapper]");
  const slider = solutionsSection.querySelector(".solutions-swiper");
  const buttons = solutionsSection.querySelectorAll("[data-solutions-filter]");

  // Наборы слайдов из <template> по группам
  const groups = {};
  solutionsSection.querySelectorAll("template[data-solutions-group]").forEach((tpl) => {
    groups[tpl.dataset.solutionsGroup] = tpl.innerHTML;
  });

  const swiper = new Swiper(slider, {
    modules: [FreeMode, Mousewheel],
    slidesPerView: "auto",
    spaceBetween: 24,
    grabCursor: true,
    mousewheel: { forceToAxis: true },
  });

  const render = (group) => {
    if (!wrapper || !(group in groups)) return;
    wrapper.innerHTML = groups[group];
    swiper.update();
    swiper.slideTo(0, 0);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Подсветка активной кнопки
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-[#0160b1]", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("font-semibold", active);
        b.classList.toggle("bg-white", !active);
        b.classList.toggle("text-[#999999]", !active);
      });

      render(btn.dataset.solutionsFilter);
    });
  });

  // Стартовый набор — первая вкладка (или «industry»)
  render(buttons[0]?.dataset.solutionsFilter || "industry");
}
