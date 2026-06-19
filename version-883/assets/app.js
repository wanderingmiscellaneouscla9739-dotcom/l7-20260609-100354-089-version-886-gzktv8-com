(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function getRoot() {
    return document.body.getAttribute('data-root') || '';
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupSearch() {
    var forms = bySelector('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var query = input ? input.value.trim() : '';
        var grid = document.querySelector('[data-search-grid]');
        if (grid) {
          filterCards(query);
          var target = document.querySelector('#all-movies') || grid;
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (query) {
          window.location.href = getRoot() + 'index.html?q=' + encodeURIComponent(query);
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && document.querySelector('[data-search-grid]')) {
      bySelector('[data-search-form] input').forEach(function (input) {
        input.value = q;
      });
      filterCards(q);
      var target = document.querySelector('#all-movies');
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    }
  }

  function filterCards(query) {
    var keyword = normalize(query);
    var cards = bySelector('[data-movie-card]');
    var matched = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
      var visible = !keyword || haystack.indexOf(keyword) !== -1;
      card.hidden = !visible;
      if (visible) {
        matched += 1;
      }
    });
    bySelector('[data-search-count]').forEach(function (node) {
      node.textContent = keyword ? '筛选结果：' + matched + ' 部' : '';
    });
    bySelector('[data-no-results]').forEach(function (node) {
      node.classList.toggle('is-visible', keyword && matched === 0);
    });
  }

  function setupPlayer() {
    bySelector('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var loaded = false;
      var hls;

      function loadStream() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function playVideo() {
        loadStream();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      loadStream();
      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearch();
    setupPlayer();
  });
})();
