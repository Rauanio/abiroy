// Собственные стили: Tailwind, глобальные, компонентные (раздельные файлы)
import "./tailwind.css";
import "./global.css";
import "./style.css";

// Плагины — стили вынесены в отдельные бандлы (swiper.css / fancybox.css)
import Swiper from "swiper";
import { FreeMode, Mousewheel, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

// Просмотр документов/сертификатов в увеличенном формате
Fancybox.bind('[data-fancybox]', {});

// Маска телефона: поле хранит 10 цифр после префикса +7 (например +7 705 707 78 60).
// Если вставили код страны (7 или 8) — отбрасываем его.
document.querySelectorAll('input[type="tel"]').forEach((input) => {
  const format = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 10 && (digits[0] === "7" || digits[0] === "8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
      .filter(Boolean)
      .join(" ");
  };

  input.addEventListener("input", () => {
    input.value = format(input.value);
  });
});

// Слайдеры (услуги, сертификаты) — свайп мышью / тачем
document.querySelectorAll(".drag-swiper").forEach((el) => {
  new Swiper(el, {
    modules: [FreeMode, Mousewheel],
    slidesPerView: "auto",
    spaceBetween: 14,
    grabCursor: true,
    // freeMode: true,
    mousewheel: { forceToAxis: true },
  });
});

document.querySelectorAll(".params-swiper").forEach((el) => {
  new Swiper(el, {
    modules: [FreeMode, Mousewheel],
    slidesPerView: "auto",
    spaceBetween: 30,
    grabCursor: true,
    // freeMode: true,
    mousewheel: { forceToAxis: true },
  });
});

// Слайдер кейсов — центрированный, с пагинацией и блюром боковых
const casesEl = document.querySelector(".cases-swiper");
if (casesEl) {
  new Swiper(casesEl, {
    modules: [Pagination],
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    spaceBetween: 24,
    grabCursor: true,
    slideToClickedSlide: true,
    pagination: {
      el: casesEl.querySelector(".swiper-pagination"),
      clickable: true,
    },
  });

  // Клик по боковому слайду — переключаем слайдер, а не переходим по ссылке.
  // Переход по ссылке работает только для активного (центрального) слайда.
  casesEl.addEventListener("click", (e) => {
    const slide = e.target.closest(".swiper-slide");
    if (!slide) return;
    if (!slide.classList.contains("swiper-slide-active")) {
      e.preventDefault();
    }
  });
}

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

// Товары: выпадающий фильтр категорий (страница goods)
const goodsFilter = document.querySelector("[data-goods-filter]");
if (goodsFilter) {
  const toggle = goodsFilter.querySelector("[data-goods-toggle]");
  const menu = goodsFilter.querySelector("[data-goods-menu]");
  const arrow = goodsFilter.querySelector("[data-goods-arrow]");
  const label = goodsFilter.querySelector("[data-goods-label]");
  const form = goodsFilter.closest("[data-goods-form]") || goodsFilter;
  const valueInput = form.querySelector("[data-goods-value]");

  const setOpen = (open) => {
    menu?.classList.toggle("hidden", !open);
    toggle?.setAttribute("aria-expanded", String(open));
    arrow?.classList.toggle("rotate-180", open);
  };

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(menu?.classList.contains("hidden"));
  });

  goodsFilter.querySelectorAll("[data-goods-option]").forEach((opt) => {
    opt.addEventListener("click", () => {
      const value = opt.textContent.trim();
      if (label) label.textContent = value;
      if (valueInput) valueInput.value = value;
      setOpen(false);
      // Выбор опции отправляет форму
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.submit();
    });
  });

  document.addEventListener("click", (e) => {
    if (!goodsFilter.contains(e.target)) setOpen(false);
  });
}

// Галерея товара — слайдер со стрелками (страница goods-details)
const galleryEl = document.querySelector(".gallery-swiper");
if (galleryEl) {
  const wrap = galleryEl.parentElement;
  new Swiper(galleryEl, {
    modules: [Navigation],
    slidesPerView: 1,
    grabCursor: true,
    navigation: {
      prevEl: wrap.querySelector("[data-gallery-prev]"),
      nextEl: wrap.querySelector("[data-gallery-next]"),
    },
  });
}

// Drawer «Условия оплаты и доставки» (страница goods-details)
const deliveryDrawer = document.querySelector("[data-delivery-drawer]");
if (deliveryDrawer) {
  const panel = deliveryDrawer.querySelector("[data-delivery-panel]");
  const backdrop = deliveryDrawer.querySelector("[data-delivery-backdrop]");
  const openBtn = document.querySelector("[data-delivery-open]");
  const closeBtn = deliveryDrawer.querySelector("[data-delivery-close]");

  const openDrawer = () => {
    deliveryDrawer.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    requestAnimationFrame(() => {
      panel?.classList.remove("translate-x-full");
      backdrop?.classList.remove("opacity-0");
    });
  };

  const closeDrawer = () => {
    panel?.classList.add("translate-x-full");
    backdrop?.classList.add("opacity-0");
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => deliveryDrawer.classList.add("hidden"), 300);
  };

  openBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !deliveryDrawer.classList.contains("hidden")) closeDrawer();
  });
}

// Мобильное меню
const burger = document.querySelector("[data-burger]");
const menu = document.querySelector("[data-menu]");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");
const menuClose = document.querySelector("[data-menu-close]");

function openMenu() {
  menu?.classList.remove("hidden");
  menuBackdrop?.classList.remove("hidden");
  burger?.setAttribute("aria-expanded", "true");
  document.body.classList.add("overflow-hidden");
}

function closeMenu() {
  menu?.classList.add("hidden");
  menuBackdrop?.classList.add("hidden");
  burger?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("overflow-hidden");
}

burger?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);
menuBackdrop?.addEventListener("click", closeMenu);
menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Выпадающий список языка
document.querySelectorAll("[data-lang-dropdown]").forEach((dd) => {
  const toggle = dd.querySelector("[data-lang-toggle]");
  const menuEl = dd.querySelector("[data-lang-menu]");
  const arrow = dd.querySelector("[data-lang-arrow]");
  const current = dd.querySelector("[data-lang-current]");

  const setOpen = (open) => {
    menuEl?.classList.toggle("hidden", !open);
    toggle?.setAttribute("aria-expanded", String(open));
    arrow?.classList.toggle("rotate-90", !open);
    arrow?.classList.toggle("-rotate-90", open);
  };

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(menuEl?.classList.contains("hidden"));
  });

  dd.querySelectorAll("[data-lang-option]").forEach((opt) => {
    opt.addEventListener("click", () => {
      if (current) current.textContent = opt.dataset.langOption;
      setOpen(false);
    });
  });

  document.addEventListener("click", (e) => {
    if (!dd.contains(e.target)) setOpen(false);
  });
});

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
  backdrop?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !requestModal.classList.contains("hidden")) closeModal();
  });
}

// Подсветка активной ссылки в навигации
const path = window.location.pathname.replace(/\/$/, "") || "/index.html";
document.querySelectorAll("[data-nav] a").forEach((link) => {
  const href = new URL(link.href).pathname;
  if (href === path || (path === "/index.html" && href.endsWith("index.html"))) {
    link.classList.remove("text-[#666666]", "text-white");
    link.classList.add("text-[#64b6ff]", "font-semibold");
  }
});

// Подсветка активной ссылки в подвале
document.querySelectorAll("[data-footer-nav] a").forEach((link) => {
  const href = new URL(link.href).pathname;
  const isActive = href === path || (path === "/index.html" && href.endsWith("index.html"));
  link.classList.toggle("text-white", isActive);
  link.classList.toggle("font-semibold", isActive);
  link.classList.toggle("text-[#666666]", !isActive);
  link.classList.toggle("font-medium", !isActive);
});

console.log("Abiroy site loaded ✨");
