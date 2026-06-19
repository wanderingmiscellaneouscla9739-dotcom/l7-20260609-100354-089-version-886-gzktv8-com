(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  var menuToggle = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = $('[data-hero]');

  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var filterInput = $('[data-filter-input]');
  var filterYear = $('[data-filter-year]');
  var filterType = $('[data-filter-type]');
  var cardList = $('[data-card-list]');
  var emptyState = $('[data-empty-state]');

  function applyLocalFilter() {
    if (!cardList) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : '');
    var year = normalize(filterYear ? filterYear.value : '');
    var type = normalize(filterType ? filterType.value : '');
    var visible = 0;

    $all('[data-movie-card]', cardList).forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = !year || cardYear.indexOf(year) !== -1;
      var matchesType = !type || cardType.indexOf(type) !== -1;
      var shouldShow = matchesQuery && matchesYear && matchesType;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [filterInput, filterYear, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyLocalFilter);
      control.addEventListener('change', applyLocalFilter);
    }
  });

  applyLocalFilter();

  var searchInput = $('#globalSearchInput');
  var searchResults = $('#searchResults');
  var searchStatus = $('#searchStatus');

  function cardHtml(movie) {
    var root = './';
    var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ')
      .replace(/"/g, '&quot;');
    return [
      '<a class="movie-card" href="' + root + 'movie/movie-' + movie.id + '.html" data-movie-card data-search="' + text + '">',
      '  <span class="poster-frame">',
      '    <img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="play-mark">▶</span>',
      '  </span>',
      '  <span class="card-title">' + escapeHtml(movie.title) + '</span>',
      '  <span class="card-line">' + escapeHtml(movie.oneLine) + '</span>',
      '  <span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function applySearch() {
    if (!searchInput || !searchResults || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }
    var query = normalize(searchInput.value);
    var list = window.SITE_MOVIES;
    var matches = !query ? list.slice(0, 48) : list.filter(function (movie) {
      return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ')).indexOf(query) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = matches.map(cardHtml).join('');

    if (searchStatus) {
      searchStatus.textContent = query ? (matches.length ? '相关影片' : '没有找到匹配内容') : '热门推荐';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    searchInput.addEventListener('input', applySearch);
    window.setTimeout(applySearch, 0);
  }
})();
