(function () {
  const NAV_ITEMS = [
    { label: "About me", href: "about.html" },
    { label: "Projects", href: "services.html" },
    { label: "Blog post", href: "blog.html" },
    { label: "Fashion inspo", href: "link-in-bio.html" },
    {
      label: "Pinterest",
      href: "https://www.pinterest.com/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  function executeScripts(root) {
    const scripts = Array.from(root.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  async function injectFragment(rootId, fragmentPath) {
    const root = document.getElementById(rootId);
    if (!root) {
      return;
    }

    const response = await fetch(fragmentPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load " + fragmentPath + ": " + response.status);
    }

    root.innerHTML = await response.text();
    executeScripts(root);
  }

  function buildDesktopNavMarkup() {
    return NAV_ITEMS.map((item) => {
      const target = item.target ? ` target="${item.target}"` : "";
      const rel = item.rel ? ` rel="${item.rel}"` : "";
      return [
        '<div class="header-nav-item header-nav-item--collection">',
        `  <a href="${item.href}" data-animation-role="header-element"${target}${rel}>`,
        `    ${item.label}`,
        "  </a>",
        "</div>",
      ].join("\n");
    }).join("\n\n");
  }

  function buildMobileNavMarkup() {
    return NAV_ITEMS.map((item) => {
      const target = item.target ? ` target="${item.target}"` : "";
      const rel = item.rel ? ` rel="${item.rel}"` : "";
      return [
        '<div class="container header-menu-nav-item header-menu-nav-item--collection">',
        `  <a href="${item.href}"${target}${rel}>`,
        `    <div class="header-menu-nav-item-content">${item.label}</div>`,
        "  </a>",
        "</div>",
      ].join("\n");
    }).join("\n");
  }

  function normalizeSharedNavbar() {
    const desktopNavLists = document.querySelectorAll("#shared-navbar-root nav.header-nav-list");
    desktopNavLists.forEach((nav) => {
      nav.innerHTML = buildDesktopNavMarkup();
    });

    const mobileNavWrappers = document.querySelectorAll("#shared-navbar-root .header-menu-nav-wrapper");
    mobileNavWrappers.forEach((wrapper) => {
      wrapper.innerHTML = buildMobileNavMarkup();
    });
  }

  function updateActiveNav() {
    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const navLinks = document.querySelectorAll("#shared-navbar-root a[href]");

    navLinks.forEach((link) => {
      const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0].toLowerCase();
      if (!href) {
        return;
      }
      const isCurrent = href === currentFile || (href === "index.html" && currentFile === "");
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    try {
      await injectFragment("shared-navbar-root", "/shared/navbar.html");
      await injectFragment("shared-footer-root", "/shared/footer.html");
      normalizeSharedNavbar();
      updateActiveNav();
    } catch (error) {
      console.error("Shared layout load failed:", error);
    }
  });
})();
