(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".js-menu-toggle");
        var nav = document.querySelector(".js-site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector(".js-hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            slides[index].classList.remove("is-active");
            dots[index].classList.remove("is-active");
            index = next;
            slides[index].classList.add("is-active");
            dots[index].classList.add("is-active");
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".js-filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
            var search = panel.querySelector(".js-filter-search");
            var type = panel.querySelector(".js-type-filter");
            var year = panel.querySelector(".js-year-filter");
            var category = panel.querySelector(".js-category-filter");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && search) {
                search.value = query;
            }
            function match(card) {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var categoryValue = category ? category.value : "";
                var haystack = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.category
                ].join(" ").toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    return false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    return false;
                }
                if (categoryValue && card.dataset.category !== categoryValue) {
                    return false;
                }
                return true;
            }
            function apply() {
                cards.forEach(function (card) {
                    card.hidden = !match(card);
                });
            }
            [search, type, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.MoviePlayer = {
        start: function (videoId, url) {
            var video = document.getElementById(videoId);
            if (!video) {
                return;
            }
            var root = video.closest(".player");
            var overlay = root ? root.querySelector(".player-start") : null;
            var loaded = false;
            var hls = null;

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    return;
                }
                video.src = url;
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            }

            function play() {
                load();
                hideOverlay();
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }

            function toggle() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", toggle);
            video.addEventListener("play", hideOverlay);
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        }
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
