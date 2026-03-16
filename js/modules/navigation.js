export const createNavigationController = ({ elements, mobileMediaQuery }) => {
  let skipNextToggleScrollId = "";

  const scrollAccordionItemIntoView = (item) => {
    requestAnimationFrame(() => {
      item.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const setCurrentNavItem = (targetId = "") => {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const linkTarget = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("is-current", Boolean(targetId) && linkTarget === targetId);
    });
  };

  const syncCurrentNavItemFromAccordion = (accordionItems = []) => {
    const openItem = accordionItems.find((item) => item.open);
    setCurrentNavItem(openItem?.id || "");
  };

  const closeMobileNav = () => {
    document.body.classList.remove("nav-open");
    if (elements.mobileNavToggle) {
      elements.mobileNavToggle.setAttribute("aria-expanded", "false");
    }
  };

  const openMobileNav = () => {
    document.body.classList.add("nav-open");
    if (elements.mobileNavToggle) {
      elements.mobileNavToggle.setAttribute("aria-expanded", "true");
    }
  };

  const setupMobileNav = () => {
    const toggle = elements.mobileNavToggle;
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      const shouldOpen = !document.body.classList.contains("nav-open");
      if (shouldOpen) {
        openMobileNav();
      } else {
        closeMobileNav();
      }
    });

    elements.mobileNavBackdrop?.addEventListener("click", closeMobileNav);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    });

    const onMediaChange = (event) => {
      if (!event.matches) {
        closeMobileNav();
      }
    };

    if (typeof mobileMediaQuery.addEventListener === "function") {
      mobileMediaQuery.addEventListener("change", onMediaChange);
    } else if (typeof mobileMediaQuery.addListener === "function") {
      mobileMediaQuery.addListener(onMediaChange);
    }
  };

  const openAccordionFromHash = () => {
    const accordion = document.getElementById("prepAccordion");
    const accordionItems = accordion
      ? Array.from(accordion.querySelectorAll("details.accordion-item"))
      : [];
    const targetId = window.location.hash.replace("#", "");
    skipNextToggleScrollId = "";
    if (!targetId) {
      accordionItems.forEach((item) => {
        item.open = false;
      });
      setCurrentNavItem("");
      return;
    }
    const target = document.getElementById(targetId);
    if (target && target.tagName === "DETAILS") {
      const targetWasOpen = target.open;
      if (!targetWasOpen) {
        skipNextToggleScrollId = targetId;
      }
      accordionItems.forEach((item) => {
        item.open = item === target;
      });
      target.open = true;
      scrollAccordionItemIntoView(target);
    } else {
      accordionItems.forEach((item) => {
        item.open = false;
      });
    }
    setCurrentNavItem(target && target.tagName === "DETAILS" ? targetId : "");
  };

  const setupAccordionBehavior = () => {
    const accordion = document.getElementById("prepAccordion");
    if (!accordion) {
      return;
    }

    const accordionItems = Array.from(accordion.querySelectorAll("details.accordion-item"));
    accordionItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) {
          syncCurrentNavItemFromAccordion(accordionItems);
          return;
        }

        accordionItems.forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });

        if (skipNextToggleScrollId === item.id) {
          skipNextToggleScrollId = "";
        } else {
          scrollAccordionItemIntoView(item);
        }

        setCurrentNavItem(item.id);
      });
    });
  };

  return {
    setCurrentNavItem,
    closeMobileNav,
    setupMobileNav,
    setupAccordionBehavior,
    openAccordionFromHash,
  };
};
