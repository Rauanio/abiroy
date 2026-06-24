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
