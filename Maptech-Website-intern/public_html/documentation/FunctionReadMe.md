# Project File Functions

Annotated guide to the main website files and where to make common changes.
This is a static website: `public_html/` is the web root, and there is no
application build step.

## Project map

```text
Maptech-Website-intern/
├── README.md                         # Brief project/local preview note
├── public_html/                      # Deployable website root
│   ├── index.html                    # Homepage, testimonials, contact form
│   ├── products.html                 # Product catalog, brand cards, search
│   ├── cybersecurity.html            # Cybersecurity solutions page
│   ├── data-infrastructure.html      # Data/infrastructure solutions page
│   ├── it-peripherals.html           # IT peripherals solutions page
│   ├── computing-devices.html        # Computing devices solutions page
│   ├── under-repair.html             # Temporary/under-repair page
│   ├── _itperipherals.html           # Legacy page; no canonical URL
│   ├── robots.txt                    # Crawler access and sitemap location
│   ├── sitemap.xml                   # Public page URLs for search engines
│   ├── .htaccess                     # Apache/LiteSpeed and WordPress rules
│   ├── assets/
│   │   ├── css/                      # Site stylesheets (details below)
│   │   ├── js/                       # Shared and page-specific scripts
│   │   ├── images/                   # Logos, icons, backgrounds, content images
│   │   └── fonts/                    # Locally stored icon/font files
│   ├── assets2/
│   │   ├── css/                      # Product catalog template styles
│   │   ├── js/main.js                # Product catalog template interactions
│   │   └── vendor/                   # Third-party template libraries
│   ├── products/
│   │   ├── activate/                 # Networking, cabling, telephony, etc.
│   │   ├── modernize/                # Computers, printing, storage, etc.
│   │   └── protect/                  # Security, access control, power, etc.
│   │       └── .../<brand>/index.html # Individual brand/product landing pages
│   └── documentation/
│       ├── README.md                  # Developer setup and integration notes
│       ├── FunctionReadMe.md          # This annotated file/function guide
│       └── WEBSITE CHANGES.pdf        # Website change reference
└── selenium_tests/
    ├── test_site.py                  # Selenium browser tests
    ├── requirements.txt              # Python test dependency
    └── README.md                     # Test setup, coverage, and safety notes
```

## Main JavaScript

Paths below are relative to `public_html/`.

| File | Function |
|---|---|
| `assets/js/products.js` | Product-catalog search and filtering. Matches brand cards against their labels, categories, and `BRAND_KEYWORDS`; handles clearing, status text, and mobile search placement. Add product search terms here using the exact brand folder name from the card link. |
| `assets/js/contact-form.js` | Contact form behavior: service-based FormSubmit routing, validation feedback, attachment and sharing-link lists, AJAX submission for ordinary submissions, and result messages. The recipient routing is in `setRecipient()`. |
| `assets/js/mega-menu.js` | Builds the homepage/catalog mega menu and its category/brand navigation using the product catalog. |
| `assets/js/maptech-carousels.js` | Sets up elements marked with `data-carousel`, including navigation, position dots, and optional autoplay controls. |
| `assets/js/custom.js` | Shared legacy site behavior and theme toggle; loads the dark-mode stylesheet and includes common navigation/page interactions. |
| `assets/js/accordions.js` | Accordion behavior for pages that load it. |
| `assets/js/product-explorer.js` | Currently empty and not referenced by the HTML pages. The catalog search is implemented in `products.js`, not here. |
| `assets/js/bootstrap.min.js`, `popper.js`, `jquery-2.1.0.min.js` | Framework/dependency scripts used by pages that load them. Avoid editing vendor code for normal site changes. |
| `assets/js/imgfix.min.js`, `mixitup.js`, `scrollreveal.min.js`, `waypoints.min.js`, `jquery.counterup.min.js` | Third-party or template utility scripts for image/layout, filtering, scroll effects, and counters. Check page script tags before changing or removing one. |

## Main CSS

| File | Function |
|---|---|
| `assets/css/templatemo-training-studio.css` | Base/template styling used by the main solution pages and related legacy pages. |
| `assets/css/maptech-framework.css` | Shared Maptech component and layout styles. |
| `assets/css/mega-menu.css` | Mega menu and responsive navigation styles. |
| `assets/css/maptech-contact.css` | Contact form and its status/result interface. |
| `assets/css/maptech-carousels.css` | Shared carousel presentation. |
| `assets/css/our-solutions-panels.css` | Solution-page panels and related content blocks. |
| `assets/css/products.css` | Product catalog layout, search controls, and responsive behavior. |
| `assets/css/dark-mode.css` | Dark-theme overrides, loaded by `custom.js`. |
| `assets/css/bootstrap.min.css`, `font-awesome.css` | Framework and icon stylesheets. Treat these as dependencies rather than application styles. |

The Products page also loads styles and vendor scripts from `assets2/`.
`assets2/vendor/` contains third-party libraries such as Bootstrap, Bootstrap
Icons, AOS, Isotope, GLightbox, and Swiper. The catalog page combines these
template assets with Maptech styles and scripts; check its HTML before changing
dependencies.

## HTML and product pages

- The top-level `.html` files are page templates/content. Check their `<link>`
  and `<script>` tags to see which shared assets they actually use; not all
  pages load the same set.
- `products.html` contains the brand cards and category sections. Each card
  links to a nested brand page under `products/`.
- Nested `products/<group>/<category>/<brand>/index.html` pages are individual
  brand landing pages. Their relative paths to shared assets depend on folder
  depth; preserve or verify those paths when moving a page.
- `under-repair.html` is a temporary page. `_itperipherals.html` is a legacy
  page without a canonical URL; confirm its intended status before linking or
  promoting it.
- Images and PDFs are supporting content, not executable page logic. Keep image
  paths and alternative text aligned when changing logos or product cards.

## SEO, hosting, and integrations

- Update a page's canonical URL when its public URL changes. Keep
  `sitemap.xml` aligned with intended canonical public pages.
- `robots.txt` allows crawling and advertises the sitemap URL.
- `.htaccess` contains hosting, LiteSpeed, and WordPress-managed rules. Do not
  casually edit the marked/generated plugin or WordPress sections; server
  configuration changes can affect routing and caching across the site.
- FormSubmit handles contact-form delivery; recipient endpoint IDs are in
  `contact-form.js`. See `README.md` in this documentation folder before
  changing routing.
- The homepage loads the external ShowTrust testimonials widget. Its mount
  point, project configuration, and loader are in `index.html`.

## Local preview and tests

From the repository root, serve the website:

```powershell
py -m http.server 8000 --directory public_html
```

Open `http://localhost:8000`. For browser tests, keep the server running and
run this in another terminal from the repository root:

```powershell
python -m unittest discover -s selenium_tests -v
```

The Selenium suite uses local test data and blocks FormSubmit requests; it
does not verify real email delivery. See `selenium_tests/README.md` for
prerequisites, test coverage, and safe manual delivery-testing guidance.
