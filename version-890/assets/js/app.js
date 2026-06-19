(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function textMatches(card, query) {
        if (!query) {
            return true;
        }
        var content = [
            card.dataset.title || "",
            card.dataset.genre || "",
            card.dataset.region || "",
            card.dataset.year || "",
            card.dataset.type || ""
        ].join(" ").toLowerCase();
        return content.indexOf(query) !== -1;
    }

    function typeMatches(card, type) {
        if (!type || type === "all") {
            return true;
        }
        return (card.dataset.type || "").indexOf(type) !== -1 || (card.dataset.genre || "").indexOf(type) !== -1;
    }

    function setupFilters(root) {
        var input = root.querySelector(".movie-filter-input");
        var buttons = root.querySelectorAll(".filter-button");
        var cards = root.querySelectorAll(".movie-card");
        var empty = root.querySelector(".search-empty");
        var selectedType = "all";

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var matched = textMatches(card, query) && typeMatches(card, selectedType);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                selectedType = button.dataset.filterType || "all";
                apply();
            });
        });

        apply();
    }

    function setupHero() {
        var root = document.querySelector(".hero-carousel");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = !nav.classList.contains("is-open");
            nav.classList.toggle("is-open", open);
            button.classList.toggle("is-active", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
            document.body.classList.toggle("is-menu-open", open);
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
                button.classList.remove("is-active");
                button.setAttribute("aria-expanded", "false");
                document.body.classList.remove("is-menu-open");
            });
        });
    }

    function setupBackTop() {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "back-top";
        button.setAttribute("aria-label", "返回顶部");
        button.textContent = "↑";
        document.body.appendChild(button);
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 600);
        });
    }

    window.initMoviePlayer = function (id, url) {
        ready(function () {
            var root = document.getElementById(id);
            if (!root) {
                return;
            }
            var video = root.querySelector("video");
            var overlay = root.querySelector(".player-overlay");
            var button = root.querySelector(".player-start");
            var loaded = false;
            var hls;

            function load() {
                if (loaded || !video || !url) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    root._hls = hls;
                } else {
                    video.src = url;
                }
            }

            function play(event) {
                if (event) {
                    event.preventDefault();
                }
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        video.muted = true;
                        video.play().catch(function () {});
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupBackTop();
        document.querySelectorAll("[data-filter-root]").forEach(setupFilters);
    });
})();
