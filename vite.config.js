import { defineConfig } from 'vite'
import { resolve, join } from 'path'
import { readdirSync, renameSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { build as esbuildBuild } from 'esbuild'
import handlebars from 'vite-plugin-handlebars'
import tailwindcss from '@tailwindcss/vite'

const IMAGE_EXT = /\.(png|svg|jpe?g|webp|gif|ico|avif)$/i

// esbuild-плагин: импорты css в main.js игнорируем — стили уже подключены
// отдельными <link> (css/*.css), в js-бандл их класть не нужно.
const ignoreCssPlugin = {
  name: 'ignore-css',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, (args) => ({ path: args.path, namespace: 'ignore-css' }))
    build.onLoad({ filter: /.*/, namespace: 'ignore-css' }, () => ({ contents: '' }))
  },
}

// После сборки раскладываем dist по папкам: css / js / images, при этом
// html остаётся в корне dist. JS пересобираем в один classic-бандл js/app.js
// (не ES-модуль), чтобы dist открывался двойным кликом по file:// без сервера.
function organizeDist(outDir) {
  return {
    name: 'organize-dist',
    async closeBundle() {
      const dist = resolve(__dirname, outDir)
      const imagesDir = join(dist, 'images')
      const jsDir = join(dist, 'js')
      mkdirSync(imagesDir, { recursive: true })
      mkdirSync(jsDir, { recursive: true })

      // 0. Собираем JS отдельными classic-бандлами: swiper.js, fancybox.js, app.js.
      //    Каждый — самодостаточный IIFE (включает свои зависимости), без
      //    type="module" => нет CORS на file://. Группы не пересекаются по
      //    зависимостям, поэтому дублирования кода нет.
      const JS_ENTRIES = [
        { entry: 'src/entries/swiper.js', out: 'swiper.js' },
        { entry: 'src/entries/fancybox.js', out: 'fancybox.js' },
        { entry: 'src/entries/app.js', out: 'app.js' },
      ]
      for (const { entry, out } of JS_ENTRIES) {
        await esbuildBuild({
          entryPoints: [resolve(__dirname, entry)],
          bundle: true,
          minify: true,
          format: 'iife',
          target: 'es2018',
          outfile: join(jsDir, out),
          plugins: [ignoreCssPlugin],
          logLevel: 'silent',
        })
      }

      // Удаляем модульные js-чанки Vite (с хешами) — весь код теперь в наших бандлах.
      const keep = new Set(JS_ENTRIES.map((e) => e.out))
      for (const f of readdirSync(jsDir)) {
        if (!keep.has(f)) unlinkSync(join(jsDir, f))
      }

      const entries = readdirSync(dist, { withFileTypes: true })

      // 1. Переносим изображения из корня dist (файлы из public/) в dist/images
      for (const entry of entries) {
        if (entry.isFile() && IMAGE_EXT.test(entry.name)) {
          renameSync(join(dist, entry.name), join(imagesDir, entry.name))
        }
      }

      // 2. HTML остаётся в корне dist, абсолютные пути -> относительные
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.html')) continue
        const src = join(dist, entry.name)
        let html = readFileSync(src, 'utf8')

        // Атрибут crossorigin форсит CORS-запрос, который под file:// (origin null)
        // блокируется браузером — убираем его, чтобы css грузился по двойному клику.
        html = html.replace(/\s+crossorigin(=("[^"]*"|'[^']*'))?/g, '')
        // modulepreload-подсказки не нужны для file:// и только шумят ошибками
        html = html.replace(/\s*<link\b[^>]*rel="modulepreload"[^>]*>/g, '')
        // Убираем модульные <script type="module" src="js/...">
        html = html.replace(/\s*<script\b[^>]*type="module"[^>]*><\/script>/g, '')
        // Подключаем classic-бандлы перед </head> (defer = после парсинга DOM)
        html = html.replace(
          /<\/head>/i,
          '    <script src="js/swiper.js" defer></script>\n' +
            '    <script src="js/fancybox.js" defer></script>\n' +
            '    <script src="js/app.js" defer></script>\n  </head>'
        )

        // css / assets / images лежат в подпапках рядом с html
        html = html.replace(/(src|href)="\/(js|css|assets|images)\//g, '$1="$2/')
        // изображения из public (в корне dist) -> images/...
        // src/href + data-* атрибуты (напр. data-img, которые JS кладёт в .src)
        html = html.replace(
          /(src|href|data-[\w-]+)="\/([^"/]+\.(?:png|svg|jpe?g|webp|gif|ico|avif))"/gi,
          '$1="images/$2"'
        )
        // ссылки между страницами лежат в той же папке
        html = html.replace(/(src|href)="\/([a-z0-9-]+\.html)"/gi, '$1="$2"')
        // фоновые картинки в инлайн-стилях: url('/x.png') -> url('images/x.png')
        html = html.replace(
          /url\((['"]?)\/([^"')]+\.(?:png|svg|jpe?g|webp|gif|ico|avif))\1\)/gi,
          'url($1images/$2$1)'
        )

        writeFileSync(src, html)
      }

      // 3. В CSS (напр. tailwind bg-[url(...)]) пути к public-картинкам:
      //    url(/x.png) -> url(../images/x.png) (css лежит в dist/css/)
      const cssDir = join(dist, 'css')
      try {
        for (const f of readdirSync(cssDir)) {
          if (!f.endsWith('.css')) continue
          const p = join(cssDir, f)
          const css = readFileSync(p, 'utf8').replace(
            /url\((['"]?)\/([^"')]+\.(?:png|svg|jpe?g|webp|gif|ico|avif))\1\)/gi,
            'url($1../images/$2$1)'
          )
          writeFileSync(p, css)
        }
      } catch {}
    },
  }
}

// Общие данные, доступные во всех шаблонах
const siteData = {
  siteName: 'Abiroy',
  year: new Date().getFullYear(),
  nav: [
    { href: '/index.html', label: 'Главная' },
    { href: '/solution.html', label: 'Решения' },
    { href: '/technologies.html', label: 'Технологии' },
    { href: '/products.html', label: 'Продукция' },
    { href: '/services.html', label: 'Услуги' },
    { href: '/cases.html', label: 'Кейсы и Клиенты' },
    { href: '/about.html', label: 'О компании' },
    { href: '/contact.html', label: 'Контакты' },
  ],
  products: [
    {
      img: '/product-1.png',
      code: 'U1013CABDVCR',
      name: 'Обратный осмос RO-750.',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
    {
      img: '/product-2.png',
      code: 'U1013CABDVCR',
      name: 'ABIROY RO –250/RO–1000',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
    {
      img: '/product-3.png',
      code: 'U1013CABDVCR',
      name: 'ABIROY RO –1/RO-10',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
    {
      img: '/product-4.png',
      code: 'U1013CABDVCR',
      name: 'Wasser Line',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
    {
      img: '/product-ro.png',
      code: 'U1013CABDVCR',
      name: 'Мембраны обратного осмоса',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
    {
      img: '/product-6.png',
      code: 'U1013CABDVCR',
      name: 'Корпуса мембран обратного осмоса',
      flow: '1.2 m³/h',
      people: 'Для 3 чел.',
      price: '9 990 KZT',
      popular: true,
    },
  ],
  services: [
    {
      img: '/service-1.png',
      desc: 'Система очистки воды, установленная в транспортном контейнере, недорога в транспортировке и проста в применении. Кроме того, модульность позволяет комбинировать разные технологические решения, так же используя данную методику возможно сформировать системы большой производительности.',
      title: 'Станций водоподготовки блок-модульного типа.',
      brand: 'ECOSOFT',
    },
    {
      img: '/service-2.png',
      desc: 'Мы возьмём на себя все заботы — приедем на Ваш объект, заполним техническое задание, отберем пробу воды, сделаем подробный химический анализ в лаборатории, подберем самое качественное и надежное оборудование для очистки воды в частном доме, учтем все Ваши требования и пожелания, смонтируем и возьмём на обслуживание систему водоподготовки.',
      title: 'Профессиональный подбор и монтаж оборудования очистки воды.',
      brand: 'ECOSOFT',
    },
    {
      img: '/service-3.png',
      desc: 'Обратный осмос — самый стабильный энергоэффективный метод обессоливания воды в промышленной водоподготовке. Применение промышленных установок обратного осмоса – очистка воды (деионизация воды) для технологических целей предприятия и производство питьевой воды во многих отраслях промышленности.',
      title: 'Производство промышленных систем обратного осмоса производительностью от 0,25м3/час до 30 м3/час.',
      brand: 'ECOSOFT',
    },
    {
      img: '/product-ro.png',
      desc: 'Компания Aburoy Group предоставляет услуги по замене картриджей, ремонту и установки фильтров для воды. Выезд и диагностика в черте города Нур Султан бесплатно.',
      title: 'Ремонт, замена, установка фильтров для воды.',
      brand: 'ECOSOFT',
    },
  ],
  certificates: ['/cert-1.png', '/cert-2.png', '/cert-3.png', '/cert-4.png'],
  solutionsIndustry: [
    { title: 'Энергетика', img: '/solution-energy.png', desc: 'Подготовка воды для котельных, ТЭЦ и энергетических объектов.' },
    { title: 'Промышленность', img: '/solution-energy.png', desc: 'Технологическая вода для производственных линий и оборудования.' },
    { title: 'Пищевая промышленность', img: '/solution-energy.png', desc: 'Очистка и подготовка воды для пищевых производств и розлива.' },
    { title: 'Строительство', img: '/solution-energy.png', desc: 'Системы водоподготовки для объектов и инженерных сетей.' },
    { title: 'ЖКХ и инфраструктура', img: '/solution-energy.png', desc: 'Водоподготовка для коммунальных и инфраструктурных объектов.' },
  ],
  solutionsTask: [
    { title: 'Умягчение воды', img: '/solution-energy.png', desc: 'Удаление солей жесткости и защита оборудования от накипи.' },
    { title: 'Обессоливание', img: '/solution-energy.png', desc: 'Деминерализация воды методом обратного осмоса и EDI.' },
    { title: 'Обезжелезивание', img: '/solution-energy.png', desc: 'Удаление железа, марганца и сероводорода из воды.' },
    { title: 'Механическая фильтрация', img: '/solution-energy.png', desc: 'Удаление взвесей, песка и механических примесей.' },
    { title: 'Дозирование реагентов', img: '/solution-energy.png', desc: 'Коррекция pH, ингибирование накипи и обеззараживание.' },
  ],
  waterSystems: [
    {
      title: 'Системы умягчения воды',
      img: '/hero.png',
      desc: 'Удаление солей жесткости методом ионного обмена. Защищают котлы, теплообменники и трубопроводы от накипи и продлевают срок службы оборудования.',
    },
    {
      title: 'Установки обратного осмоса RO',
      img: '/case-2.png',
      desc: 'Полный технологический комплекс: механическая очистка, умягчение, RO, дозирование и автоматизация. Подходят для объектов с высокими требованиями к надежности и непрерывной работе.',
      active: true,
    },
    {
      title: 'Системы дозирования реагентов',
      img: '/hero.png',
      desc: 'Точное пропорциональное дозирование реагентов для коррекции pH, ингибирования накипи и обеззараживания. Полная автоматизация процесса под режим объекта.',
    },
    {
      title: 'Блочно-модульные станции водоподготовки',
      img: '/case-2.png',
      desc: 'Готовое решение в транспортном контейнере: быстрый монтаж, мобильность и возможность масштабирования под требуемую производительность объекта.',
    },
    {
      title: 'Комплексные системы водоподготовки',
      img: '/hero.png',
      desc: 'Комплексные инженерные решения под состав воды, нагрузку и режим объекта — от механической очистки до финишной деминерализации и автоматизации.',
    },
  ],
  techCatalog: [
    {
      metric: '0,01–0,1 мкм',
      metricSub: 'размер пор мембраны',
      tag: 'мембранная очистка',
      title: 'Ультрафильтрация',
      img: '/hero.png',
    },
    {
      metric: 'До 99%',
      metricSub: 'удаление растворенных солей',
      tag: 'деминерализованная',
      title: 'Системы обратного осмоса',
      img: '/hero.png',
    },
    {
      metric: 'От 1 контейнера',
      metricSub: 'готовая станция водоподготовки',
      tag: 'модульное решение',
      title: 'Контейнерные станции',
      img: '/hero.png',
    },
    {
      metric: 'До 18 МОм·см',
      metricSub: 'удельное сопротивление воды',
      tag: 'очистка после RO',
      title: 'Электродеионизация',
      img: '/hero.png',
    },
  ],
  aboutText:
    'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
  faqText:
    'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
  faq: [
    {
      q: 'Вопрос',
      a: 'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
    },
    {
      q: 'Системы Обратного Осмоса',
      a: 'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
      open: true,
    },
    {
      q: 'Вопрос',
      a: 'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
    },
    {
      q: 'Вопрос',
      a: 'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
    },
    {
      q: 'Вопрос',
      a: 'Непрерывно повышающиеся требования, предъявляемые в последнее время к качеству пищевой продукции (особенно в той части, где основным компонентом является вода)',
    },
  ],
  caseDesc:
    'Приоритетным направлением в развитии энергетической отрасли становится необходимость ввода новых и реконструкции существующих мощностей.',
  cases: [
    {
      img: '/hero.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Энергетика',
      technology: 'Обратный осмос',
      solution: 'Промышленные системы',
    },
    {
      img: '/case-2.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Промышленность',
      technology: 'Ультрафильтрация',
      solution: 'Контейнерные станции',
    },
    {
      img: '/hero.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Строительство',
      technology: 'EDI',
      solution: 'Модульные системы',
    },
    {
      img: '/case-2.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Энергетика',
      technology: 'Ультрафильтрация',
      solution: 'Контейнерные станции',
    },
    {
      img: '/hero.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Промышленность',
      technology: 'Обратный осмос',
      solution: 'Промышленные системы',
    },
    {
      img: '/case-2.png',
      company: 'Название компании',
      title: 'Название кейса',
      industry: 'Строительство',
      technology: 'EDI',
      solution: 'Модульные системы',
    },
  ],
  productCatalog: [
    { title: 'Промышленные установки обратного осмоса', img: '/product-ro.png' },
    { title: 'Промышленные обратноосмотические мембраны и корпуса', img: '/product-ro.png' },
    { title: 'Фильтрующие материалы', img: '/product-ro.png' },
    { title: 'Корпуса колонных фильтров', img: '/product-ro.png' },
    { title: 'Комплектующие для фильтров колонного типа', img: '/product-ro.png' },
    { title: 'Клапана управления для фильтров колонного типа', img: '/product-ro.png' },
    { title: 'Насосы повышения давления', img: '/product-ro.png' },
    { title: 'Насос дозаторы для систем водоподготовки', img: '/product-ro.png' },
    { title: 'Комплектующие для систем обратного осмоса', img: '/product-ro.png' },
    { title: 'Локальные станции очистки воды', img: '/product-ro.png' },
    { title: 'Умягчители воды', img: '/product-ro.png' },
    { title: 'Обезжелезователи воды колонного типа', img: '/product-ro.png' },
  ],
  stepDesc: 'Приоритетным направлением в развитии энергетической отрасли становится',
  steps: [
    { n: '01', title: 'Запрос' },
    { n: '02', title: 'Анализ воды' },
    { n: '03', title: 'Тех. задание' },
    { n: '04', title: 'Коммерческое Предложение' },
    { n: '05', title: 'Поставка' },
    { n: '06', title: 'Монтаж/пир', spacerBefore: true },
    { n: '07', title: 'Сервис' },
  ],
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      context: siteData,
    }),
    organizeDist('dist'),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''
          if (name.endsWith('.css')) return 'css/[name]-[hash][extname]'
          if (IMAGE_EXT.test(name)) return 'images/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
        // Разделяем бандлы: плагины (swiper / fancybox) и наши стили
        // (tailwind / global / style) попадают в отдельные js- и css-файлы.
        manualChunks(id) {
          if (id.includes('node_modules/@fancyapps')) return 'fancybox'
          if (id.includes('node_modules/swiper')) return 'swiper'
          if (id.endsWith('/tailwind.css')) return 'tailwind'
          if (id.endsWith('/global.css')) return 'global'
          if (id.endsWith('/style.css')) return 'style'
        },
      },
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        technologies: resolve(__dirname, 'technologies.html'),
        'techo-detail': resolve(__dirname, 'techno-details.html'),
        cases: resolve(__dirname, 'cases.html'),
        'case-details': resolve(__dirname, 'case-details.html'),
        solution: resolve(__dirname, 'solution.html'),
        'solution-details': resolve(__dirname, 'solution-details.html'),
        products: resolve(__dirname, 'products.html'),
        services: resolve(__dirname, 'services.html'),
        'service-detail': resolve(__dirname, 'service-detail.html'),
        'goods-details': resolve(__dirname, 'goods-details.html'),
        goods: resolve(__dirname, 'goods.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        404: resolve(__dirname, '404.html'),
      },
    },
  },
})
