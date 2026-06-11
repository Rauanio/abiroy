import "./style.css";
import Swiper from "swiper";
import { FreeMode, Mousewheel, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
    pagination: {
      el: casesEl.querySelector(".swiper-pagination"),
      clickable: true,
    },
  });
}

// Решения: фильтры (по отраслям / по типам задач) + слайдеры
const solutionsSection = document.querySelector("[data-solutions]");
if (solutionsSection) {
  const sliders = {};
  solutionsSection.querySelectorAll(".solutions-swiper").forEach((el) => {
    sliders[el.dataset.group] = new Swiper(el, {
      modules: [FreeMode, Mousewheel],
      slidesPerView: "auto",
      spaceBetween: 24,
      grabCursor: true,
      mousewheel: { forceToAxis: true },
    });
  });

  const buttons = solutionsSection.querySelectorAll("[data-solutions-filter]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.solutionsFilter;

      // Подсветка активной кнопки
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("bg-[#0160b1]", active);
        b.classList.toggle("text-white", active);
        b.classList.toggle("font-semibold", active);
        b.classList.toggle("bg-white", !active);
        b.classList.toggle("text-[#999999]", !active);
      });

      // Переключение слайдеров
      solutionsSection.querySelectorAll(".solutions-swiper").forEach((track) => {
        const show = track.dataset.group === group;
        track.classList.toggle("hidden", !show);
        if (show) sliders[group]?.update();
      });
    });
  });
}

// Системы водоподготовки: аккордеон (страница solution-details)
// Превью справа статичное и не меняется при переключении пунктов.
const systemsSection = document.querySelector("[data-solution-systems]");
if (systemsSection) {
  const items = systemsSection.querySelectorAll("[data-system-item]");

  const setOpen = (item, open) => {
    const body = item.querySelector("[data-system-body]");
    body?.classList.toggle("grid-rows-[1fr]", open);
    body?.classList.toggle("grid-rows-[0fr]", !open);
    item.querySelector("[data-system-chevron]")?.classList.toggle("rotate-180", open);
  };

  items.forEach((it) => {
    it.querySelector("[data-system-toggle]")?.addEventListener("click", () => {
      const body = it.querySelector("[data-system-body]");
      const isOpen = body?.classList.contains("grid-rows-[1fr]");
      // Закрыть все, затем открыть выбранный (если он был закрыт) — открыт только один
      items.forEach((other) => setOpen(other, false));
      if (!isOpen) setOpen(it, true);
    });
  });
}

// Товары: выпадающий фильтр категорий (страница goods)
const goodsFilter = document.querySelector("[data-goods-filter]");
if (goodsFilter) {
  const toggle = goodsFilter.querySelector("[data-goods-toggle]");
  const menu = goodsFilter.querySelector("[data-goods-menu]");
  const arrow = goodsFilter.querySelector("[data-goods-arrow]");
  const label = goodsFilter.querySelector("[data-goods-label]");

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
      if (label) label.textContent = opt.textContent.trim();
      setOpen(false);
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

  const activeFilters = { industry: "", technology: "", solution: "" };

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
    if (track) track.scrollLeft = 0;
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
        setOpen(false);
        applyFilters();
      });
    });

    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target)) setOpen(false);
    });
  });

  // Навигация стрелками
  const scrollByCard = (dir) => {
    if (!track) return;
    const card = cards.find((c) => !c.classList.contains("hidden"));
    const step = card ? card.offsetWidth + 20 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  prevBtn?.addEventListener("click", () => scrollByCard(-1));
  nextBtn?.addEventListener("click", () => scrollByCard(1));
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
