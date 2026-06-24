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
