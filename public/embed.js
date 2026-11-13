/*!
 * Widget de prise de rendez-vous — Mathieu Cerenzia
 *
 * Intégré dans la page :
 *   <div data-rdv-embed="slug-de-l-agenda"></div>
 *   <script src="https://rdv.mathieucerenzia.fr/embed.js" async></script>
 *
 * Bouton qui ouvre l'agenda dans une fenêtre :
 *   <button type="button" data-rdv-popup="slug-de-l-agenda">Prendre rendez-vous</button>
 *   <script src="https://rdv.mathieucerenzia.fr/embed.js" async></script>
 *
 * Après une réservation, l'évènement « rdv:booked » est émis sur `document`
 * (detail : { slug, startsAt }) pour un éventuel suivi de conversion.
 */
(function () {
  "use strict";

  if (window.RdvEmbed) {
    window.RdvEmbed.scan();
    return;
  }

  var script = document.currentScript;
  var ORIGIN = script && script.src ? new URL(script.src).origin : "https://rdv.mathieucerenzia.fr";
  var inlineFrames = [];
  var popup = null;

  function embedUrl(slug, mode) {
    return ORIGIN + "/embed/" + encodeURIComponent(slug) + (mode === "popup" ? "?mode=popup" : "");
  }

  function createFrame(slug, mode) {
    var frame = document.createElement("iframe");
    frame.src = embedUrl(slug, mode);
    frame.title = "Prise de rendez-vous";
    frame.setAttribute("allow", "clipboard-write");
    frame.style.cssText = "display:block;width:100%;border:0;background:transparent;color-scheme:light;";
    return frame;
  }

  function mountInline(container) {
    if (container.getAttribute("data-rdv-mounted")) return;

    var slug = container.getAttribute("data-rdv-embed");
    if (!slug) return;

    container.setAttribute("data-rdv-mounted", "true");
    var frame = createFrame(slug, "inline");
    // Hauteur provisoire, ajustée dès que le widget a mesuré son contenu.
    frame.style.height = (container.getAttribute("data-rdv-height") || "720") + "px";
    frame.style.transition = "height 150ms ease";
    container.appendChild(frame);
    inlineFrames.push(frame);
  }

  function closePopup() {
    if (!popup) return;
    popup.overlay.remove();
    document.documentElement.style.overflow = popup.previousOverflow;
    document.removeEventListener("keydown", popup.onKeyDown);
    if (popup.trigger && popup.trigger.focus) popup.trigger.focus();
    popup = null;
  }

  function openPopup(slug, trigger) {
    closePopup();

    var overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Prise de rendez-vous");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;" +
      "padding:16px;background:rgba(15,23,42,0.55);";

    var panel = document.createElement("div");
    panel.style.cssText =
      "position:relative;width:100%;max-width:960px;height:min(90vh,820px);background:#fff;" +
      "border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(15,23,42,0.35);";

    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Fermer");
    close.innerHTML = "&times;";
    close.style.cssText =
      "position:absolute;top:10px;right:10px;z-index:1;width:36px;height:36px;border:0;border-radius:9999px;" +
      "background:rgba(15,23,42,0.06);color:#0f172a;font:400 24px/36px system-ui,sans-serif;cursor:pointer;";
    close.addEventListener("click", closePopup);

    var frame = createFrame(slug, "popup");
    frame.style.height = "100%";

    panel.appendChild(close);
    panel.appendChild(frame);
    overlay.appendChild(panel);
    overlay.addEventListener("mousedown", function (event) {
      if (event.target === overlay) closePopup();
    });

    var onKeyDown = function (event) {
      if (event.key === "Escape") closePopup();
    };

    popup = {
      overlay: overlay,
      frame: frame,
      trigger: trigger,
      onKeyDown: onKeyDown,
      previousOverflow: document.documentElement.style.overflow,
    };

    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    document.body.appendChild(overlay);
    close.focus();
  }

  function bindPopupTrigger(element) {
    if (element.getAttribute("data-rdv-mounted")) return;

    var slug = element.getAttribute("data-rdv-popup");
    if (!slug) return;

    element.setAttribute("data-rdv-mounted", "true");
    element.addEventListener("click", function (event) {
      event.preventDefault();
      openPopup(slug, element);
    });
  }

  function scan() {
    document.querySelectorAll("[data-rdv-embed]").forEach(mountInline);
    document.querySelectorAll("[data-rdv-popup]").forEach(bindPopupTrigger);
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== ORIGIN || !event.data || typeof event.data.type !== "string") return;

    var frame = null;
    for (var i = 0; i < inlineFrames.length; i += 1) {
      if (inlineFrames[i].contentWindow === event.source) frame = inlineFrames[i];
    }
    var fromPopup = popup && popup.frame.contentWindow === event.source;
    if (!frame && !fromPopup) return;

    var data = event.data;

    if (data.type === "rdv-embed:height" && frame && data.height > 0) {
      frame.style.height = Math.ceil(data.height) + "px";
    }

    // Le widget demande à montrer une zone (étape suivante, champ à corriger) :
    // la page hôte défile seulement si cette zone n'est pas déjà bien visible.
    if (data.type === "rdv-embed:scroll" && frame) {
      var frameTop = frame.getBoundingClientRect().top + window.pageYOffset;
      var targetTop = frameTop + Number(data.top || 0);
      var viewTop = window.pageYOffset;
      var viewBottom = viewTop + window.innerHeight;
      var visible = targetTop >= viewTop + 8 && targetTop + Math.min(Number(data.height || 0), 200) <= viewBottom - 8;

      if (!visible) {
        var offset = data.block === "center" ? window.innerHeight / 2 - Number(data.height || 0) / 2 : 16;
        window.scrollTo({ top: Math.max(0, targetTop - offset), behavior: "smooth" });
      }
    }

    if (data.type === "rdv-embed:booked") {
      document.dispatchEvent(new CustomEvent("rdv:booked", { detail: { slug: data.slug, startsAt: data.startsAt } }));
    }
  });

  window.RdvEmbed = {
    scan: scan,
    open: function (slug) {
      openPopup(slug, null);
    },
    close: closePopup,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
})();
