/* Interactive enhancements for the Stranger Things Netflix template */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initCarouselButtons();
    initVideoPreviewModal();
    initPlanSelection();
    initEmailForms();
    initSeasonSelector();
    initCookiePreferencesLink();
    initOfflineIconFallbacks();
  });

  function showToast(message) {
    let toast = document.querySelector(".nf-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "nf-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  /* 1. Carousel Previous / Next scroll buttons */
  function initCarouselButtons() {
    var buttons = document.querySelectorAll(
      'button[aria-label="Next"], button[aria-label="Previous"], button[aria-label="Next navigation options"], button[aria-label="Previous navigation options"]'
    );

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isPrev = btn.getAttribute("aria-label").toLowerCase().includes("previous");
        var container = btn.parentElement;
        var scroller = null;

        // Walk up a few levels to find a horizontally scrollable list/container
        for (var i = 0; i < 4 && container; i++) {
          var candidate = container.querySelector("ul, [role='list'], [data-uia*='carousel']");
          if (candidate && candidate.scrollWidth > candidate.clientWidth + 10) {
            scroller = candidate;
            break;
          }
          if (container.scrollWidth > container.clientWidth + 10) {
            scroller = container;
            break;
          }
          container = container.parentElement;
        }

        if (scroller) {
          var delta = Math.max(280, scroller.clientWidth * 0.75);
          scroller.scrollBy({
            left: isPrev ? -delta : delta,
            behavior: "smooth",
          });
        }
      });
    });
  }

  /* 2. Trailer & Scene card preview modal */
  function initVideoPreviewModal() {
    var backdrop = document.createElement("div");
    backdrop.className = "nf-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.innerHTML =
      '<div class="nf-modal">' +
      '  <button type="button" class="nf-modal-close" aria-label="Close preview">&times;</button>' +
      '  <div class="nf-modal-media"><img src="" alt="" /></div>' +
      '  <div class="nf-modal-body">' +
      '    <h3 class="nf-modal-title"></h3>' +
      '    <p class="nf-modal-meta"></p>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(backdrop);

    var modalImg = backdrop.querySelector("img");
    var modalTitle = backdrop.querySelector(".nf-modal-title");
    var modalMeta = backdrop.querySelector(".nf-modal-meta");
    var closeBtn = backdrop.querySelector(".nf-modal-close");

    function closeModal() {
      backdrop.classList.remove("is-open");
    }

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    document.querySelectorAll('button[data-uia="video-card-container"]').forEach(function (card) {
      card.addEventListener("click", function () {
        var img = card.querySelector("img");
        var textParts = card.innerText
          .split("\n")
          .map(function (t) {
            return t.trim();
          })
          .filter(Boolean);

        modalImg.src = img ? img.src : "";
        modalImg.alt = textParts.join(" - ");
        modalTitle.textContent = textParts[textParts.length - 1] || "Stranger Things";
        modalMeta.textContent =
          (textParts.length > 1 ? textParts.slice(0, -1).join(" · ") + " — " : "") +
          "Static preview mode (video streaming requires an active Netflix session).";
        backdrop.classList.add("is-open");
      });
    });
  }

  /* 3. Plan card selection */
  function initPlanSelection() {
    var plansSection = document.getElementById("lodp-plans");
    if (!plansSection) return;

    var planButtons = plansSection.querySelectorAll("button");
    planButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        planButtons.forEach(function (b) {
          b.classList.remove("nf-plan-selected");
        });
        btn.classList.add("nf-plan-selected");
        var heading = btn.querySelector("h3");
        if (heading) {
          showToast("Selected plan: " + heading.textContent.trim());
        }
      });
    });
  }

  /* 4. Email signup form validation */
  function initEmailForms() {
    document.querySelectorAll('form[data-uia="cta-email-form"]').forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"], input[data-uia="email-input"]');
        var email = input ? input.value.trim() : "";

        var feedback = form.parentElement.querySelector(".nf-form-feedback");
        if (!feedback) {
          feedback = document.createElement("div");
          feedback.className = "nf-form-feedback";
          form.parentElement.appendChild(feedback);
        }

        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!valid) {
          feedback.className = "nf-form-feedback nf-form-feedback--error";
          feedback.textContent = "Please enter a valid email address.";
          if (input) input.focus();
        } else {
          feedback.className = "nf-form-feedback nf-form-feedback--success";
          feedback.textContent = "Thanks! Demo signup captured for " + email + ".";
        }
      });
    });
  }

  /* 5. Season selector feedback */
  function initSeasonSelector() {
    var select = document.querySelector('select[name="seasonSelect"]');
    var episodesSection = document.getElementById("episodes");
    if (!select || !episodesSection) return;

    var seasonSummaries = {
      "Stranger Things": "",
      "Stranger Things 2":
        "Season 2 (2017 · 9 Episodes): A year after Will's return, a larger threat looms over Hawkins as Eleven uncovers her past.",
      "Stranger Things 3":
        "Season 3 (2019 · 8 Episodes): Summer 1985 brings romance, Starcourt Mall, and a terrifying new Mind Flayer threat.",
      "Stranger Things 4":
        "Season 4 (2022 · 9 Episodes): Separated across Hawkins, California, and Russia, the group faces Vecna.",
      "Stranger Things 5":
        "Season 5 (2025 · 8 Episodes): The epic final chapter as Hawkins faces the Upside Down's ultimate invasion.",
    };

    select.addEventListener("change", function () {
      var val = select.value || select.options[select.selectedIndex].text;
      var note = episodesSection.querySelector(".nf-season-note");
      var summary = seasonSummaries[val] || "";

      if (!summary) {
        if (note) note.remove();
        return;
      }

      if (!note) {
        note = document.createElement("div");
        note.className = "nf-season-note";
        var header = select.closest("div");
        if (header && header.parentElement) {
          header.parentElement.insertAdjacentElement("afterend", note);
        } else {
          episodesSection.prepend(note);
        }
      }
      note.textContent = summary + " (Showing Season 1 episode cards below.)";
    });
  }

  /* 6. Cookie Preferences anchor */
  function initCookiePreferencesLink() {
    document.querySelectorAll('a[href="#cookie-preferences"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        showToast("Cookie preferences are disabled in this local static template.");
      });
    });
  }

  /* 7. Fallback inline SVGs for UI icon spans */
  function initOfflineIconFallbacks() {
    var iconContainers = document.querySelectorAll(
      '[data-uia="icon-button+icon-wrapper"] span, [data-uia="season-selector"] span[role="img"], [data-uia="language-picker+container"] span[role="img"]'
    );
    iconContainers.forEach(function (span) {
      if (span.querySelector("svg")) return;
      var btn = span.closest("button");
      var aria = btn ? (btn.getAttribute("aria-label") || "").toLowerCase() : "";
      var svg = "";

      if (aria.includes("previous")) {
        svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      } else if (aria.includes("next")) {
        svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
      } else {
        svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>';
      }

      span.style.maskImage = "none";
      span.style.webkitMaskImage = "none";
      span.style.backgroundColor = "transparent";
      span.style.display = "inline-flex";
      span.style.alignItems = "center";
      span.style.justifyContent = "center";
      span.innerHTML = svg;
    });
  }
})();
