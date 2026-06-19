(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var emptyState = scope.querySelector("[data-empty-state]");
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
        var activeType = "all";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            var shown = 0;

            cards.forEach(function (card) {
                var searchable = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var typeText = normalize(card.getAttribute("data-type"));
                var matchQuery = !query || searchable.indexOf(query) !== -1;
                var matchType = activeType === "all" || typeText.indexOf(normalize(activeType)) !== -1;
                var visible = matchQuery && matchType;
                card.style.display = visible ? "" : "none";
                shown += visible ? 1 : 0;
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", shown === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });

        if (buttons[0]) {
            buttons[0].classList.add("is-active");
        }

        if (scope.hasAttribute("data-query-page") && input) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");
            if (queryValue) {
                input.value = queryValue;
            }
        }

        applyFilter();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");

        function startVideo() {
            if (!video) {
                return;
            }

            var stream = video.getAttribute("data-stream");
            if (!stream) {
                return;
            }

            if (video.getAttribute("data-started") === "true") {
                video.play().catch(function () {});
                return;
            }

            video.setAttribute("data-started", "true");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.play().catch(function () {});
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = stream;
                video.play().catch(function () {});
            }

            if (button) {
                button.classList.add("is-hidden");
            }
        }

        if (button) {
            button.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.getAttribute("data-started") !== "true") {
                    startVideo();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        }
    });
})();
