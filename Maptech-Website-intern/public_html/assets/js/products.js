(() => {
  const searchForm = document.querySelector(".products-search");
  const searchInput = document.querySelector("#brand-search");
  const clearButton = document.querySelector(".products-search-clear");
  const status = document.querySelector(".products-search-status");
  const emptyState = document.querySelector(".products-empty-state");
  const categoryNav = document.querySelector(".products-category-nav");
  const browseOrigin = document.querySelector("#products-mobile-browse-origin");
  const mobileSearchSlot = document.querySelector("#products-mobile-search-slot");
  const mobileCategoriesSlot = document.querySelector("#products-mobile-categories-slot");

  if (
    !(searchForm instanceof HTMLFormElement) ||
    !(searchInput instanceof HTMLInputElement) ||
    !(clearButton instanceof HTMLButtonElement) ||
    !(status instanceof HTMLElement) ||
    !(emptyState instanceof HTMLElement) ||
    !(categoryNav instanceof HTMLElement) ||
    !(browseOrigin instanceof HTMLElement) ||
    !(mobileSearchSlot instanceof HTMLElement) ||
    !(mobileCategoriesSlot instanceof HTMLElement)
  ) {
    return;
  }

  const mobileMenuQuery = window.matchMedia("(max-width: 991px)");
  const placeBrowseControls = () => {
    if (mobileMenuQuery.matches) {
      mobileSearchSlot.append(searchForm);
      mobileCategoriesSlot.append(categoryNav);
    } else {
      browseOrigin.after(searchForm, categoryNav);
    }
  };

  placeBrowseControls();
  mobileMenuQuery.addEventListener("change", placeBrowseControls);

  // Extra search terms per category. Key = category heading, lowercase.
  // Add more entries (or a data-keywords attribute on the section / brand) as needed.
  const ALIASES = {
    "video conferencing":
      "video conference videoconferencing video call meeting room collaboration huddle room vc",
  };

  // Product keywords per brand card. Key = the folder name in the card's link
// (products/<folder>/index.html). Add or edit terms here only.
const BRAND_KEYWORDS = {
  // Network, endpoint, and data security
  "cybersecurity-sangfor": "NGAF next generation firewall endpoint secure cyber command IAG HCI",
  "cybersecurity-fortinet": "FortiGate FortiAP FortiSwitch FortiAnalyzer FortiManager FortiClient FortiMail FortiWeb firewall",
  "cybersecurity-sophos": "Sophos Firewall XG Intercept X endpoint MDR Sophos Central antivirus",
  "cybersecurity-seqrite": "endpoint security EPS HawkkHunt XDR UTM mSuite MDM encryption DLP antivirus",
  "cybersecurity-escan": "eScan antivirus total security endpoint security MDM",
  "cybersecurity-eset": "NOD32 internet security endpoint security ESET Protect mail security antivirus",
  "cybersecurity-viettel-security": "Viettel cybersecurity endpoint security antivirus protection",
  "crowdstrike": "CrowdStrike Falcon endpoint protection antivirus EDR XDR cybersecurity",
  "secure-computing": "Secure Computing firewall network security cybersecurity",
  "varonis": "data security governance classification insider risk data protection",
  "kebos-ups": "Kebos UPS battery backup power protection",
  "charge-ups": "Charge UPS battery backup power protection",
  "ablerex-ups": "Ablerex UPS battery backup power protection",

  // Wireless access points and switches
  "sundray-wap": "WLAN controller access point wifi switch NAC SD-WAN",
  "alliedtelesis-wap": "switch AMF access point wireless TQ managed switch",
  "cisco-wap": "Catalyst Meraki Aironet access point switch router ISR",
  "ubiquiti-wap": "UniFi Dream Machine EdgeRouter airMAX NanoStation access point switch",
  "tplink-wap": "Omada Deco Archer Jetstream EAP access point router switch wifi",
  "bdcom-wap": "OLT ONU GPON EPON switch",
  "ruijie-wap": "Reyee RG-EG access point switch gateway wifi",
  "extreme-wap": "ExtremeCloud IQ access point switch wifi 6",
  "dlink-wap": "DAP DGS DWR Nuclias router switch access point wifi",
  "hpearuba-wap": "Instant On Aruba Central CX switch ClearPass access point",
  "h3c-wap": "switch WLAN router access point",
  "maipu-wap": "switch router WLAN",

  // CCTV
  "hikvision-cctv": "IP camera DVR NVR ColorVu AcuSense PTZ CCTV surveillance",
  "dahua-cctv": "IP camera NVR XVR WizSense PTZ CCTV surveillance",

  // Computers and monitors
  "benq-monitors": "monitor display",
  "hp-monitors": "monitor display laptop desktop ProBook EliteBook Pavilion Envy Omen",
  "lenovo-monitors": "monitor display laptop desktop ThinkPad ThinkCentre IdeaPad Legion ThinkVision",
  "dell-monitors": "monitor display laptop desktop Latitude Inspiron OptiPlex Vostro XPS Alienware UltraSharp",
  "viewsonic-monitors": "monitor display ViewBoard projector",
  "aoc-monitors": "monitor display gaming monitor AGON",
  "samsung-monitors": "monitor display Odyssey ViewFinity smart monitor",
  "lg-monitors": "monitor display UltraGear UltraWide",

  // Fiber optic and structured cabling
  "fiberrex-fiberoptic": "fiber optic cable patch cord pigtail splice ODF FTTH",
  "leviton-fiberoptic": "structured cabling patch panel cat6 keystone faceplate",
  "belden-fiberoptic": "cable cat6 copper fiber cabling",
  "commscope-fiberoptic": "SYSTIMAX structured cabling fiber connectivity",
  "panduit-fiberoptic": "structured cabling patch panel cable management cat6 rack fiber",
  "litech-fiberoptic": "fiber optic cabling patch cord",

  // Telephony
  "yeastar-telephony": "IP PBX P-Series S-Series cloud PBX VoIP gateway IP phone",
  "nec-telephony": "PBX telephone system SV9100 IP phone",
  "grandstream-telephony": "IP phone UCM IP PBX ATA VoIP gateway GXP",
  "fanvil-telephony": "IP phone VoIP SIP business telephone intercom",
  "mitel-telephony": "business communications IP phone VoIP telephony collaboration",

  // Door access and biometrics
  "zkteco-dooraccess": "door access access control turnstile controller card reader",
  "dahua-dooraccess": "door access access control card reader controller",
  "hikvision-dooraccess": "door access access control card reader controller",
  "zkteco-biometrics": "biometric fingerprint face recognition time attendance",
  "dahua-biometrics": "biometric fingerprint face recognition time attendance",
  "hikvision-biometrics": "biometric fingerprint face recognition time attendance",

  // UPS
  "awp-ups": "UPS battery backup power",
  "kstarups-ups": "UPS battery backup power",
  "apc-ups": "UPS Smart-UPS Back-UPS Easy UPS battery backup surge",
  "vertiv-ups": "UPS Liebert GXT battery backup power",

  // Storage and servers
  "dellemc-storage": "PowerEdge PowerVault PowerStore Unity server storage SAN",
  "synology-storage": "NAS DiskStation RackStation DSM backup storage",
  "qnap-storage": "NAS QTS backup storage",
  "h3c-storage": "UniServer server storage",

  // SD-WAN
  "fatpipe": "SD-WAN MPVPN load balancing WAN router",
  "peplink": "Balance MAX SpeedFusion InControl router bonding SD-WAN",

  // Printing
  "epson-consumables": "printer ink tank EcoTank ink scanner projector",
  "canon-consumables": "printer PIXMA imageCLASS ink toner home megatank portable",
  "brother-consumables": "printer label printer toner ink enterprise compact footprint",

  // IT peripherals and video conferencing
  "acer-peripherals": "keyboard mouse mice headset",
  "a4tech-peripherals": "keyboards mouses mice headsets webcam desktop device",
  "logitech-peripherals": " gaming keyboards mouse mice headset pads sims gears audios microphones gamepads pads",
  "logitech-videoconferencing": "Rally MeetUp Rally Bar Tap Brio conference camera huddle room space ideation immersive",
};

// "products/protect/network-security-firewalls/cybersecurity-sangfor/index.html" -> "cybersecurity-sangfor"
const brandKey = (item) =>
  item.querySelector("a")?.getAttribute("href")?.split("/").filter(Boolean).at(-2) ?? "";

  // Lowercase, strip accents and punctuation: "Video-Conferencing" -> "video conferencing"
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const squash = (value) => value.replace(/ /g, "");

  const categories = Array.from(document.querySelectorAll("main section.portfolio"))
    .map((section) => {
      const heading = section.querySelector("h2[id^='product-category-']");
      const brandItems = Array.from(section.querySelectorAll(".portfolio-item"));

      if (!heading || brandItems.length === 0) {
        console.warn("Product search skipped a section (no <h2> or no .portfolio-item):", section);
        return null;
      }

      const categoryLink = heading.id
        ? document.querySelector(`.products-category-nav a[href="#${CSS.escape(heading.id)}"]`)
        : null;

      const categoryText = normalize(
        [
          heading.textContent,
          categoryLink?.textContent,
          section.dataset.keywords,
          ALIASES[normalize(heading.textContent)],
        ]
          .filter(Boolean)
          .join(" ")
      );

      const brands = brandItems.map((item) => ({
        item,
        text: normalize(
          [
            item.querySelector("img")?.alt,
            item.getAttribute("aria-label"),
            item.getAttribute("title"),
            item.dataset.keywords,
            BRAND_KEYWORDS[brandKey(item)],
            item.textContent,
          ]
            .filter(Boolean)
            .join(" ")
        ),
      }));

      return { section, heading, categoryText, brands };
    })
    .filter(Boolean);

  // Every typed word must appear in the category or brand text.
  // Also matches with spaces removed, so "videoconferencing" finds "Video Conferencing".
  const matches = (haystack, tokens, squashedQuery) =>
    tokens.every((token) => haystack.includes(token)) ||
    squash(haystack).includes(squashedQuery);

  const updateResults = () => {
    const normalizedQuery = normalize(searchInput.value);
    const tokens = normalizedQuery ? normalizedQuery.split(" ") : [];
    const squashedQuery = squash(normalizedQuery);
    document.body.classList.toggle("products-search-active", tokens.length > 0);
    let visibleBrands = 0;
    let visibleCategories = 0;

    categories.forEach(({ section, heading, categoryText, brands }) => {
      let categoryBrandCount = 0;

      brands.forEach(({ item, text }) => {
        const isMatch =
          tokens.length === 0 ||
          matches(`${categoryText} ${text}`, tokens, squashedQuery);
        item.hidden = !isMatch;

        if (isMatch) {
          categoryBrandCount += 1;
        }
      });

      const categoryIsVisible = categoryBrandCount > 0;

      if (section.contains(searchForm)) {
        if (heading.parentElement) {
          heading.parentElement.hidden = !categoryIsVisible;
        }
        const container = section.querySelector(".portfolio-container");
        if (container) {
          container.hidden = !categoryIsVisible;
        }
      } else {
        section.hidden = !categoryIsVisible;
      }

      visibleBrands += categoryBrandCount;

      if (categoryIsVisible) {
        visibleCategories += 1;
      }
    });

    clearButton.hidden = tokens.length === 0;
    emptyState.hidden = visibleBrands > 0;

    if (tokens.length === 0) {
      status.textContent = `Showing all ${visibleBrands} brands across ${visibleCategories} categories`;
    } else if (visibleBrands > 0) {
      const brandLabel = visibleBrands === 1 ? "brand" : "brands";
      const categoryLabel = visibleCategories === 1 ? "category" : "categories";
      status.textContent = `Showing ${visibleBrands} ${brandLabel} in ${visibleCategories} ${categoryLabel}`;
    } else {
      status.textContent = "No matching brands or categories";
    }
  };

  const revealSearchResults = () => {
    if (!mobileMenuQuery.matches) return;

    const navbar = document.querySelector("#navbar");
    if (!navbar?.classList.contains("navbar-mobile")) return;

    updateResults();
    const matchingCategory = categories.find(({ brands }) =>
      brands.some(({ item }) => !item.hidden)
    );
    const target = matchingCategory?.heading || emptyState;
    searchInput.blur();
    navbar.querySelector(".mobile-nav-toggle")?.click();

    window.setTimeout(() => {
      const headerHeight = document.querySelector("#header")?.getBoundingClientRect().height || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }, 260);
  };

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    revealSearchResults();
  });

  searchInput.addEventListener("input", updateResults);
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    updateResults();
    searchInput.focus();
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      revealSearchResults();
      return;
    }

    if (event.key === "Escape") {
      searchInput.value = "";
      updateResults();
    }
  });

  updateResults();
})();