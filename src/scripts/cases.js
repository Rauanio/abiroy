import Swiper from "swiper";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";

// Кейсы: фильтрация выпадающими списками + слайдер со стрелками
const casesSection = document.querySelector("[data-cases]");
if (casesSection) {
  const track = casesSection.querySelector("[data-cases-track]");
  const cards = Array.from(casesSection.querySelectorAll("[data-case]"));
  const emptyState = casesSection.querySelector("[data-cases-empty]");
  const prevBtn = casesSection.querySelector("[data-cases-prev]");
  const nextBtn = casesSection.querySelector("[data-cases-next]");
  const form = casesSection.querySelector("[data-cases-form]");

  const activeFilters = { industry: "", technology: "", solution: "" };

  // Слайдер кейсов — как в solution: slidesPerView auto + free drag + колесо,
  // слайды выходят за пределы контейнера (swiper !overflow-visible).
  const swiper = track
    ? new Swiper(track, {
        modules: [FreeMode, Mousewheel, Navigation],
        slidesPerView: "auto",
        spaceBetween: 20,
        grabCursor: true,
        mousewheel: { forceToAxis: true },
        navigation: { prevEl: prevBtn, nextEl: nextBtn },
      })
    : null;

  const applyFilters = () => {
    let visible = 0;
    cards.forEach((card) => {
      const match = Object.entries(activeFilters).every(
        ([key, value]) => !value || card.dataset[key] === value
      );
      card.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    emptyState?.classList.toggle("hidden", visible > 0);
    swiper?.update();
    swiper?.slideTo(0, 0);
  };

  // Выпадающие списки
  casesSection.querySelectorAll("[data-filter-dropdown]").forEach((dd) => {
    const key = dd.dataset.filterKey;
    const toggle = dd.querySelector("[data-filter-toggle]");
    const menu = dd.querySelector("[data-filter-menu]");
    const arrow = dd.querySelector("[data-filter-arrow]");
    const label = dd.querySelector("[data-filter-label]");
    const defaultLabel = label?.textContent ?? "";

    const setOpen = (open) => {
      menu?.classList.toggle("hidden", !open);
      toggle?.setAttribute("aria-expanded", String(open));
      arrow?.classList.toggle("rotate-180", open);
    };

    // Отметить выбранный пункт (синяя радиокнопка) и сбросить остальные
    const markSelected = (value) => {
      dd.querySelectorAll("[data-filter-option]").forEach((o) =>
        o.setAttribute("aria-checked", String(o.dataset.filterOption === value))
      );
    };

    // Восстановить состояние из параметров URL после отправки формы
    const initial = new URLSearchParams(window.location.search).get(key) || "";
    activeFilters[key] = initial;
    if (label) label.textContent = initial || defaultLabel;
    toggle?.classList.toggle("!border-[#0160b1]", Boolean(initial));
    markSelected(initial);

    toggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = menu?.classList.contains("hidden");
      // Закрыть остальные
      casesSection
        .querySelectorAll("[data-filter-menu]")
        .forEach((m) => m !== menu && m.classList.add("hidden"));
      setOpen(willOpen);
    });

    dd.querySelectorAll("[data-filter-option]").forEach((opt) => {
      opt.addEventListener("click", () => {
        const value = opt.dataset.filterOption;
        activeFilters[key] = value;
        if (label) label.textContent = value || defaultLabel;
        toggle?.classList.toggle("!border-[#0160b1]", Boolean(value));
        markSelected(value);
        setOpen(false);

        // Выбор пункта записывается в скрытое поле и отправляет форму
        if (form) {
          const field = form.querySelector(`[name="${key}"]`);
          if (field) field.value = value;
          if (typeof form.requestSubmit === "function") form.requestSubmit();
          else form.submit();
        } else {
          applyFilters();
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target)) setOpen(false);
    });
  });

  // Применить восстановленные из URL фильтры к карточкам
  applyFilters();
}
