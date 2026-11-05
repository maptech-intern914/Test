(() => {
  const scriptUrl = document.currentScript?.src;
  const catalogUrl = scriptUrl ? new URL("../../products.html", scriptUrl) : null;
  const catalogLabels = {
    "product-category-cyber-security": "Network security & firewalls",
    "product-category-endpoint-security": "Endpoint & email security",
    "product-category-data-security": "Data security & governance",
    "product-category-wireless-access-points": "Wireless access points & switches",
    "product-category-cctv": "CCTV",
    "product-category-computers-monitors": "Computers & monitors",
    "product-category-fiber-optic": "Fiber optic & structured cabling",
    "product-category-telephony": "Telephony",
    "product-category-door-access": "Door access",
    "product-category-biometrics": "Biometrics",
    "product-category-ups": "UPS & power protection",
    "product-category-storage-servers": "Storage & servers",
    "product-category-sd-wan": "SD-WAN",
    "product-category-printing": "Printing & consumables",
    "product-category-it-peripherals": "IT peripherals",
    "product-category-video-conferencing": "Video conferencing"
  };
  const solutions = [
    {
      title: "Cybersecurity",
      href: "cybersecurity.html",
      description: "Protect your organization with modern security solutions.",
      image: "assets/images/img-01-cyber.jpg",
      categories: [
        "product-category-cyber-security",
        "product-category-endpoint-security",
        "product-category-data-security",
        "product-category-door-access",
        "product-category-biometrics",
        "product-category-cctv"

      ]
    },
    {
      title: "Data Center Infrastructure",
      href: "data-infrastructure.html",
      description: "Build reliable networks, data centers and connected infrastructure.",
      image: "assets/images/img-02-data.jpg",
      categories: [
        "product-category-storage-servers",
        "product-category-wireless-access-points",
        "product-category-fiber-optic",
        "product-category-sd-wan",
        "product-category-ups"
        
      ]
    },
    {
      title: "IT Peripherals",
      href: "it-peripherals.html",
      description: "Find workplace printing, peripherals and meeting-room equipment.",
      image: "assets/images/img-03-peripherals.jpg",
      categories: [
        "product-category-it-peripherals",
        "product-category-printing",
        "product-category-computers-monitors",
        "product-category-video-conferencing"
        
      ]
    },
    {
      title: "Computing Devices",
      href: "computing-devices.html",
      description: "Explore business computers, desktops, laptops and displays.",
      image: "assets/images/img-04-computer.jpg",
      categories: [
        "product-category-computers-monitors",
        "product-category-it-peripherals",
        "product-category-video-conferencing"

      ]
    }
  ];
  const brandDetails = new Map();
  let catalogPromise;
  const isCompactMenu = () => window.matchMedia("(max-width: 991px)").matches;

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const capitalizeLabel = (label) => label.trim().toUpperCase();

  const addColumn = (menu, title, className) => {
    const column = create("li", `maptech-mega-column ${className || ""}`);
    column.append(create("h2", "maptech-mega-heading", title));
    menu.append(column);
    return column;
  };

  const loadCatalog = () => {
    if (!catalogUrl) return Promise.reject(new Error("The catalog URL is unavailable."));
    if (!catalogPromise) {
      catalogPromise = fetch(catalogUrl.href)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Catalog request failed with status ${response.status}.`);
          }
          return response.text();
        })
        .then((html) => {
          const page = new DOMParser().parseFromString(html, "text/html");
          const categories = Array.from(page.querySelectorAll("main > section.portfolio"))
            .map((section) => {
              const heading = section.querySelector("h2[id^='product-category-']");
              const brands = Array.from(section.querySelectorAll(".portfolio-item a[href]"))
                .map((link) => {
                  const image = link.querySelector("img");
                  return {
                    name: image?.alt.trim() || link.textContent.trim(),
                    image: image?.getAttribute("src"),
                    href: new URL(link.getAttribute("href"), catalogUrl).href
                  };
                })
                .filter((brand) => brand.name && brand.href);
              if (!heading || brands.length === 0) return null;
              return {
                id: heading.id,
                label: catalogLabels[heading.id] || heading.textContent.trim(),
                brands
              };
            })
            .filter(Boolean);

          if (categories.length === 0) {
            throw new Error("The product catalog does not contain any categories.");
          }
          return categories;
        });
    }
    return catalogPromise;
  };

  const getProductNames = (brandUrl) => {
    if (!brandDetails.has(brandUrl)) {
      const request = fetch(brandUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Brand page request failed with status ${response.status}.`);
          }
          return response.text();
        })
        .then((html) => {
          const page = new DOMParser().parseFromString(html, "text/html");
          const article =
            page.querySelector(".tabs-content article#tabs-1") ||
            page.querySelector(".tabs-content article");
          const headings = article
            ? Array.from(article.querySelectorAll("h2, h3, h4"))
            : [];
          const excluded = /^(product listing|product brochure|product brochures|download pdfs?|inquire about\b)/i;
          const headingNames = Array.from(new Set(
            headings
              .map((heading) => heading.textContent.trim().replace(/\s+/g, " "))
              .filter((name) => name && name.length <= 90 && !excluded.test(name))
          ));
          if (headingNames.length > 0) return headingNames;

          const linkNames = article
            ? Array.from(article.querySelectorAll("a"))
                .map((link) => link.textContent.trim().replace(/\s+/g, " "))
                .filter((name) =>
                  name &&
                  name.length <= 90 &&
                  !/^(download|view here|explore .* products|inquire about|contact us)/i.test(name)
                )
            : [];
          if (linkNames.length > 0) {
            return Array.from(new Set(
              linkNames.map((name) => name.replace(/^Exreme\b/i, "Extreme"))
            ));
          }

          const productLineSentence = article
            ? Array.from(article.querySelectorAll("p"))
                .map((paragraph) => paragraph.textContent.trim())
                .map((text) => text.match(/product lines? expanded to\s+([^.]*)/i)?.[1])
                .find(Boolean)
            : null;
          return productLineSentence
            ? productLineSentence
                .replace(/\s+and\s+/i, ", ")
                .split(",")
                .map((name) => name.trim())
                .filter(Boolean)
            : [];
        })
        .catch((error) => {
          brandDetails.delete(brandUrl);
          throw error;
        });
      brandDetails.set(brandUrl, request);
    }
    return brandDetails.get(brandUrl);
  };

  const buildProductsMenu = (menu, categories, menuIndex) => {
    menu.replaceChildren();
    menu.classList.add("maptech-mega-menu");
    let activeCategoryToggle = null;

    const backButton = create("button", "maptech-mega-mobile-back", "Back to product categories");
    backButton.type = "button";
    backButton.addEventListener("click", () => {
      menu.classList.remove("has-selected-category");
      menu.scrollTop = 0;
      activeCategoryToggle?.classList.remove("active", "bi-chevron-down");
      activeCategoryToggle?.classList.add("bi-chevron-right");
      activeCategoryToggle?.setAttribute("aria-expanded", "false");
      if (activeCategoryToggle?.dataset.categoryLabel) {
        activeCategoryToggle.setAttribute("aria-label", `Open ${activeCategoryToggle.dataset.categoryLabel} brands`);
      }
      activeCategoryToggle = null;
      window.requestAnimationFrame(() => {
        menu.querySelector(".maptech-mega-category-column .maptech-mobile-submenu-toggle")?.focus();
      });
    });
    menu.append(backButton);

    const categoryColumn = addColumn(menu, "Browse by category", "maptech-mega-category-column");
    const categoryList = create("ul", "maptech-mega-link-list");
    categoryColumn.append(categoryList);

    const brandColumn = addColumn(menu, "Brands", "maptech-mega-brand-column");
    brandColumn.id = `maptech-product-brands-${menuIndex}`;
    const brandList = create("ul", "maptech-mega-link-list");
    brandColumn.append(brandList);
    const allBrands = create("a", "maptech-mega-all-link");
    brandColumn.append(allBrands);

    const detailColumn = addColumn(menu, "Products & ranges", "maptech-mega-detail-column");
    const detailContent = create("div", "maptech-mega-detail-content");
    const detailToggle = create("button", "maptech-mega-mobile-toggle", "Products & ranges");
    detailToggle.type = "button";
    detailToggle.setAttribute("aria-expanded", "false");
    detailToggle.setAttribute("aria-controls", `maptech-product-ranges-${menuIndex}`);
    const detailPanel = create("div", "maptech-mega-mobile-content");
    detailPanel.id = `maptech-product-ranges-${menuIndex}`;
    detailPanel.append(detailContent);

    const productPageLink = create("a", "maptech-mega-all-link", "View all products");
    productPageLink.href = catalogUrl.href;
    detailPanel.append(productPageLink);
    detailColumn.append(detailToggle, detailPanel);

    const toggleDetails = (expanded) => {
      detailColumn.classList.toggle("is-expanded", expanded);
      detailToggle.setAttribute("aria-expanded", String(expanded));
    };
    detailToggle.addEventListener("click", () => {
      toggleDetails(detailToggle.getAttribute("aria-expanded") !== "true");
    });

    let activeBrandUrl = "";
    const showBrand = async (brand) => {
      if (isCompactMenu()) toggleDetails(true);
      if (brand.href === activeBrandUrl) return;
      activeBrandUrl = brand.href;
      detailContent.replaceChildren();
      detailContent.append(create("p", "maptech-mega-brand-name", capitalizeLabel(brand.name)));
      detailContent.append(create("p", "maptech-mega-loading", "Loading product details…"));

      if (brand.image) {
        const image = create("img", "maptech-mega-brand-logo");
        image.src = new URL(brand.image, catalogUrl).href;
        image.alt = `${brand.name} logo`;
        detailContent.prepend(image);
      }

      try {
        const names = await getProductNames(brand.href);
        if (activeBrandUrl !== brand.href) return;
        const loading = detailContent.querySelector(".maptech-mega-loading");
        loading?.remove();
        if (names.length > 0) {
          const list = create("ul", "maptech-mega-product-list");
          names.forEach((name) => list.append(create("li", "", capitalizeLabel(name))));
          detailContent.append(list);
        } else {
          detailContent.append(create(
            "p",
            "maptech-mega-product-note",
            "See this brand page for its available products and solution details."
          ));
        }
      } catch (error) {
        if (activeBrandUrl !== brand.href) return;
        detailContent.querySelector(".maptech-mega-loading")?.remove();
        detailContent.append(create(
          "p",
          "maptech-mega-error",
          "Product details could not be loaded. Open the brand page to view its catalog."
        ));
        console.error("Unable to load brand product details.", error);
      }
    };

    let activeCategoryItem = null;
    const selectCategory = (category, item, categoryToggle) => {
      activeCategoryItem?.classList.remove("is-active");
      activeCategoryItem = item;
      activeCategoryItem?.classList.add("is-active");
      if (isCompactMenu()) {
        activeCategoryToggle?.classList.remove("active", "bi-chevron-down");
        activeCategoryToggle?.classList.add("bi-chevron-right");
        activeCategoryToggle?.setAttribute("aria-expanded", "false");
        activeCategoryToggle = categoryToggle;
        activeCategoryToggle?.classList.add("active");
        activeCategoryToggle?.classList.remove("bi-chevron-right");
        activeCategoryToggle?.classList.add("bi-chevron-down");
        activeCategoryToggle?.setAttribute("aria-expanded", "true");
        activeCategoryToggle?.setAttribute("aria-label", `Close ${category.label} brands`);
        menu.classList.add("has-selected-category");
        menu.scrollTop = 0;
      }
      brandList.replaceChildren();
      activeBrandUrl = "";
      const destination = new URL(`products.html#${category.id}`, catalogUrl).href;
      category.brands.forEach((brand) => {
        const item = create("li", "maptech-mega-brand-item");
        const link = create("a", "maptech-mega-link", capitalizeLabel(brand.name));
        link.href = brand.href;
        link.addEventListener("mouseenter", () => {
          if (!isCompactMenu()) showBrand(brand);
        });
        link.addEventListener("focus", () => {
          if (!isCompactMenu()) showBrand(brand);
        });
        item.append(link);
        brandList.append(item);
      });
      allBrands.href = destination;
      allBrands.textContent = `ALL ${capitalizeLabel(category.label)}`;
      const firstBrand = category.brands[0];
      if (firstBrand) showBrand(firstBrand);
      if (isCompactMenu()) {
        toggleDetails(true);
        detailColumn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    categories.forEach((category, index) => {
      const item = create("li", "maptech-mega-category-item");
      const categoryClass = category.label.length > 28 ? " maptech-mega-link-long" : "";
      const link = create("a", `maptech-mega-link${categoryClass}`, capitalizeLabel(category.label));
      link.href = new URL(`products.html#${category.id}`, catalogUrl).href;
      const categoryToggle = create("button", "maptech-mobile-submenu-toggle bi bi-chevron-right");
      categoryToggle.type = "button";
      categoryToggle.dataset.categoryLabel = category.label;
      categoryToggle.setAttribute("aria-label", `Open ${category.label} brands`);
      categoryToggle.setAttribute("aria-expanded", "false");
      categoryToggle.setAttribute("aria-controls", brandColumn.id);
      link.addEventListener("mouseenter", () => {
        if (!isCompactMenu()) selectCategory(category, item);
      });
      link.addEventListener("focus", () => {
        if (!isCompactMenu()) selectCategory(category, item);
      });
      categoryToggle.addEventListener("click", () => {
        selectCategory(category, item, categoryToggle);
      });
      item.append(link, categoryToggle);
      categoryList.append(item);
      if (index === 0 && !isCompactMenu()) selectCategory(category, item);
    });
  };

  const buildSolutionsMenu = (menu, menuIndex) => {
    menu.replaceChildren();
    menu.classList.add("maptech-mega-menu");
    const solutionColumn = addColumn(menu, "Our solutions", "maptech-mega-solution-column");
    const solutionList = create("ul", "maptech-mega-link-list");
    solutionColumn.append(solutionList);

    const categoryColumn = addColumn(menu, "Related products", "maptech-mega-related-column");
    const categoryList = create("ul", "maptech-mega-link-list");
    categoryList.id = `maptech-related-products-${menuIndex}`;
    categoryList.classList.add("maptech-mega-mobile-content");
    categoryColumn.append(categoryList);

    const featureColumn = addColumn(menu, "Technology for your business", "maptech-mega-solution-feature");
    const featureToggle = create("button", "maptech-mega-mobile-toggle", "Technology for your business");
    featureToggle.type = "button";
    featureToggle.setAttribute("aria-expanded", "false");
    featureToggle.setAttribute("aria-controls", `maptech-solution-feature-${menuIndex}`);
    const featureContent = create("div", "maptech-mega-mobile-content");
    featureContent.id = `maptech-solution-feature-${menuIndex}`;
    const featureImage = create("img", "maptech-mega-solution-image");
    const featureDescription = create("p", "maptech-mega-solution-description");
    const featureLink = create("a", "maptech-mega-all-link", "Explore this solution");
    featureContent.append(featureImage, featureDescription, featureLink);
    featureColumn.append(featureToggle, featureContent);

    const toggleMobileSection = (column, toggle, expanded) => {
      column.classList.toggle("is-expanded", expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
    };

    featureToggle.addEventListener("click", () => {
      const expanded = featureToggle.getAttribute("aria-expanded") !== "true";
      toggleMobileSection(featureColumn, featureToggle, expanded);
    });

    let activeSolutionItem = null;
    let activeSolutionToggle = null;
    const setSolution = (solution, item, solutionToggle) => {
      activeSolutionItem?.classList.remove("is-active");
      activeSolutionItem = item;
      activeSolutionItem?.classList.add("is-active");
      if (isCompactMenu()) {
        item.after(categoryColumn);
      } else if (categoryColumn.parentElement !== menu) {
        menu.insertBefore(categoryColumn, featureColumn);
      }
      categoryList.replaceChildren();
      solution.categories.forEach((id) => {
        const item = create("li");
        const link = create("a", "maptech-mega-link", capitalizeLabel(catalogLabels[id] || id));
        link.href = new URL(`products.html#${id}`, catalogUrl).href;
        item.append(link);
        categoryList.append(item);
      });
      featureImage.src = new URL(solution.image, catalogUrl).href;
      featureImage.alt = "";
      featureDescription.textContent = solution.description;
      featureLink.href = new URL(solution.href, catalogUrl).href;
      featureLink.textContent = `EXPLORE ${capitalizeLabel(solution.title)}`;
      if (isCompactMenu()) {
        menu.classList.add("has-selected-solution");
        activeSolutionToggle?.classList.remove("active", "bi-chevron-down");
        activeSolutionToggle?.classList.add("bi-chevron-right");
        activeSolutionToggle?.setAttribute("aria-expanded", "false");
        if (activeSolutionToggle?.dataset.solutionTitle) {
          activeSolutionToggle.setAttribute("aria-label", `Show ${activeSolutionToggle.dataset.solutionTitle} related products`);
        }
        activeSolutionToggle = solutionToggle;
        activeSolutionToggle?.classList.add("active");
        activeSolutionToggle?.classList.remove("bi-chevron-right");
        activeSolutionToggle?.classList.add("bi-chevron-down");
        activeSolutionToggle?.setAttribute("aria-expanded", "true");
        activeSolutionToggle?.setAttribute("aria-label", `Hide ${solution.title} related products`);
        categoryColumn.classList.add("is-expanded");
      }
    };

    solutions.forEach((solution, index) => {
      const item = create("li", "maptech-mega-category-item");
      const link = create("a", "maptech-mega-link", capitalizeLabel(solution.title));
      link.href = new URL(solution.href, catalogUrl).href;
      const solutionToggle = create("button", "maptech-mobile-submenu-toggle bi bi-chevron-right");
      solutionToggle.type = "button";
      solutionToggle.dataset.solutionTitle = solution.title;
      solutionToggle.setAttribute("aria-label", `Show ${solution.title} related products`);
      solutionToggle.setAttribute("aria-expanded", "false");
      solutionToggle.setAttribute("aria-controls", categoryList.id);
      link.addEventListener("mouseenter", () => {
        if (!isCompactMenu()) setSolution(solution, item);
      });
      link.addEventListener("focus", () => {
        if (!isCompactMenu()) setSolution(solution, item);
      });
      solutionToggle.addEventListener("click", () => {
        if (isCompactMenu() && activeSolutionToggle === solutionToggle) {
          menu.classList.remove("has-selected-solution");
          categoryColumn.classList.remove("is-expanded");
          activeSolutionItem?.classList.remove("is-active");
          activeSolutionItem = null;
          activeSolutionToggle.classList.remove("active", "bi-chevron-down");
          activeSolutionToggle.classList.add("bi-chevron-right");
          activeSolutionToggle.setAttribute("aria-expanded", "false");
          activeSolutionToggle.setAttribute("aria-label", `Show ${solution.title} related products`);
          activeSolutionToggle = null;
          return;
        }
        setSolution(solution, item, solutionToggle);
      });
      item.append(link, solutionToggle);
      solutionList.append(item);
      if (index === 0 && !isCompactMenu()) setSolution(solution, item);
    });

  };

  document.querySelectorAll(".maptech-products-menu").forEach((menu, menuIndex) => {
    loadCatalog()
      .then((categories) => buildProductsMenu(menu, categories, menuIndex))
      .catch((error) => {
        console.error("Unable to build the products mega-menu.", error);
      });
  });

  document.querySelectorAll(".maptech-solutions-menu").forEach(buildSolutionsMenu);

  document.querySelectorAll(".maptech-mega-item").forEach((item) => {
    const trigger = item.querySelector(":scope > .maptech-mega-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", (event) => {
      if (!window.matchMedia("(min-width: 992px)").matches) return;

      const targetUrl = new URL(trigger.href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;

      const target = targetUrl.hash ? document.querySelector(targetUrl.hash) : null;
      if (!target) return;

      event.preventDefault();
      item.classList.add("is-dismissed");
      trigger.setAttribute("aria-expanded", "false");
      if (event.detail > 0 && document.activeElement === trigger) {
        trigger.blur();
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", targetUrl.hash);
    });

    item.addEventListener("mouseenter", () => {
      if (window.matchMedia("(min-width: 992px)").matches) {
        item.classList.remove("is-dismissed");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
    item.addEventListener("mouseleave", () => {
      if (window.matchMedia("(min-width: 992px)").matches) {
        if (!item.matches(":focus-within")) {
          item.classList.remove("is-dismissed");
        }
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    item.addEventListener("focusin", () => {
      if (window.matchMedia("(min-width: 992px)").matches) {
        item.classList.remove("is-dismissed");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
    item.addEventListener("focusout", (event) => {
      if (
        window.matchMedia("(min-width: 992px)").matches &&
        !(event.relatedTarget instanceof Node && item.contains(event.relatedTarget))
      ) {
        if (!item.matches(":hover")) {
          item.classList.remove("is-dismissed");
        }
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  });

  const header = document.querySelector(".header-area");
  if (header && "IntersectionObserver" in window) {
    const dismissMenus = () => {
      document.querySelectorAll(".maptech-mega-item").forEach((item) => {
        item.classList.add("is-dismissed");
        item.querySelector(":scope > .maptech-mega-trigger")?.setAttribute("aria-expanded", "false");
      });
    };

    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) dismissMenus();
    }, { threshold: 0 }).observe(header);
  }
})();
