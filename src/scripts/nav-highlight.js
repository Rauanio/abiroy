// Подсветка активной ссылки в навигации и подвале
const path = window.location.pathname.replace(/\/$/, "") || "/index.html";

document.querySelectorAll("[data-nav] a").forEach((link) => {
  const href = new URL(link.href).pathname;
  if (href === path || (path === "/index.html" && href.endsWith("index.html"))) {
    link.classList.remove("text-[#666666]", "text-white");
    link.classList.add("text-[#64b6ff]", "font-semibold");
  }
});

document.querySelectorAll("[data-footer-nav] a").forEach((link) => {
  const href = new URL(link.href).pathname;
  const isActive = href === path || (path === "/index.html" && href.endsWith("index.html"));
  link.classList.toggle("text-white", isActive);
  link.classList.toggle("font-semibold", isActive);
  link.classList.toggle("text-[#666666]", !isActive);
  link.classList.toggle("font-medium", !isActive);
});
