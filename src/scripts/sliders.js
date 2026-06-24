import Swiper from "swiper";
import { FreeMode, Mousewheel, Pagination, Navigation } from "swiper/modules";

// Слайдеры (услуги, сертификаты) — свайп мышью / тачем
document.querySelectorAll(".drag-swiper").forEach((el) => {
  new Swiper(el, {
    modules: [FreeMode, Mousewheel],
    slidesPerView: "auto",
    spaceBetween: 14,
    grabCursor: true,
    mousewheel: { forceToAxis: true },
  });
});

document.querySelectorAll(".params-swiper").forEach((el) => {
  new Swiper(el, {
    modules: [FreeMode, Mousewheel],
    slidesPerView: "auto",
    spaceBetween: 30,
    grabCursor: true,
    mousewheel: { forceToAxis: true },
  });
});

// Слайдер кейсов на главной — центрированный, с пагинацией и блюром боковых
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
