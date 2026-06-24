// Собственные стили: Tailwind, глобальные, компонентные (раздельные файлы)
import "./tailwind.css";
import "./global.css";
import "./style.css";

// Стили плагинов — вынесены в отдельные бандлы (swiper.css / fancybox.css)
import "swiper/css";
import "swiper/css/pagination";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

// Скрипты по фичам (раздельные файлы, как и стили)
import "./scripts/fancybox.js";
import "./scripts/phone-mask.js";
import "./scripts/sliders.js";
import "./scripts/solutions.js";
import "./scripts/solution-systems.js";
import "./scripts/goods-filter.js";
import "./scripts/delivery-drawer.js";
import "./scripts/header.js";
import "./scripts/cases.js";
import "./scripts/request-modal.js";
import "./scripts/nav-highlight.js";

console.log("Abiroy site loaded ✨");
