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
