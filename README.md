# Abiroy

Многостраничный сайт на **Vite + Tailwind CSS v4 + Handlebars + чистый JavaScript**.

## Запуск

```bash
npm install      # установить зависимости
npm run dev      # дев-сервер с горячей перезагрузкой
npm run build    # production-сборка в папку dist/
npm run preview  # просмотр собранного сайта
```

## Структура

```
.
├── index.html          # Главная
├── about.html          # О нас
├── contact.html        # Контакты (с формой)
├── src/
│   ├── main.js         # общий JS (меню, активная ссылка)
│   ├── style.css       # Tailwind + свои компоненты (.btn, .container-page)
│   └── partials/
│       ├── header.html # общая шапка с навигацией
│       └── footer.html # общий подвал
└── vite.config.js      # многостраничная сборка + партиалы + данные сайта
```

## Как добавить страницу

1. Создай `services.html` в корне (скопируй любую существующую страницу).
2. Добавь её в `build.rollupOptions.input` в `vite.config.js`.
3. Добавь ссылку в массив `nav` в `vite.config.js` — она появится в меню на всех страницах.

Общие данные (название сайта, меню, год) лежат в `siteData` в `vite.config.js`
и доступны во всех шаблонах через `{{ siteName }}`, `{{#each nav}}` и т.д.
