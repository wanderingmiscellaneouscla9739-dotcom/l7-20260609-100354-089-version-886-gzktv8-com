(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.dataset.active === "true";
    }));

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        if (slideIndex === current) {
          slide.dataset.active = "true";
        } else {
          slide.removeAttribute("data-active");
        }
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === current) {
          dot.dataset.active = "true";
        } else {
          dot.removeAttribute("data-active");
        }
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupHeroSearch() {
    var form = document.querySelector("[data-hero-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var url = "./search.html";
      if (query) {
        url += "?q=" + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!panel || !cards.length) {
      return;
    }
    var input = panel.querySelector("[data-filter-text]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function match(card) {
      var keyword = normalize(input ? input.value : "");
      var yearValue = normalize(year ? year.value : "");
      var regionValue = normalize(region ? region.value : "");
      var typeValue = normalize(type ? type.value : "");
      var text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.category,
        card.dataset.year
      ].join(" "));
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (yearValue && normalize(card.dataset.year) !== yearValue) {
        return false;
      }
      if (regionValue && normalize(card.dataset.region) !== regionValue) {
        return false;
      }
      if (typeValue && normalize(card.dataset.type) !== typeValue) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function attachPlayer(config) {
    var video = document.querySelector(config.selector);
    var shell = video ? video.closest("[data-player]") : null;
    var overlay = shell ? shell.querySelector("[data-player-toggle]") : null;
    var hls = null;
    if (!video) {
      return;
    }

    function ensureSource() {
      if (video.dataset.ready === "true") {
        return;
      }
      video.dataset.ready = "true";
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      }
    }

    function play() {
      ensureSource();
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.catch(function () {});
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        hideOverlay();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        hideOverlay();
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);
    video.addEventListener("loadedmetadata", function () {
      video.controls = true;
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
    ensureSource();
  }

  window.initMoviePlayer = attachPlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupFilters();
  });
})();
