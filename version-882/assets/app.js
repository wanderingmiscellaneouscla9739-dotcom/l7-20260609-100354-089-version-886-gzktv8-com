(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var keywordInput = document.querySelector("[data-filter-keyword]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var sortSelect = document.querySelector("[data-filter-sort]");
    var resetButton = document.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    function matchCard(card) {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var regionOk = !region || card.dataset.region === region;
      var yearOk = !year || card.dataset.year === year;
      return keywordOk && regionOk && yearOk;
    }

    function compareCards(a, b) {
      var sort = sortSelect ? sortSelect.value : "year";
      if (sort === "rating") {
        return parseFloat(b.dataset.rating || "0") - parseFloat(a.dataset.rating || "0");
      }
      if (sort === "views") {
        return parseInt(b.dataset.views || "0", 10) - parseInt(a.dataset.views || "0", 10);
      }
      if (sort === "title") {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
      }
      return parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10);
    }

    function apply() {
      var ordered = cards.slice().sort(compareCards);
      ordered.forEach(function (card) {
        card.classList.toggle("is-hidden", !matchCard(card));
        grid.appendChild(card);
      });
    }

    [keywordInput, regionSelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (sortSelect) {
          sortSelect.value = "year";
        }
        apply();
      });
    }

    apply();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var mask = document.querySelector("[data-player-mask]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !source) {
      return;
    }

    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hls = hls;
      } else {
        video.src = source;
      }
      video.dataset.ready = "1";
    }

    function play() {
      attach();
      if (mask) {
        mask.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (mask) {
      mask.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "1") {
        play();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
