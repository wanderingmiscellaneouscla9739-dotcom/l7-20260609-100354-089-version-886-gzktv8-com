(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim() === '') {
        event.preventDefault();
      }
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (filterBox) {
    const container = filterBox.closest('main') || document;
    const input = filterBox.querySelector('[data-filter-input]');
    const year = filterBox.querySelector('[data-filter-year]');
    const genre = filterBox.querySelector('[data-filter-genre]');
    const clear = filterBox.querySelector('[data-filter-clear]');
    const cards = Array.from(container.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      const selectedYear = normalize(year ? year.value : '');
      const selectedGenre = normalize(genre ? genre.value : '');

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        const matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        const matchesGenre = !selectedGenre || haystack.indexOf(selectedGenre) !== -1;
        card.hidden = !(matchesQuery && matchesYear && matchesGenre);
      });
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (genre) {
          genre.value = '';
        }
        applyFilter();
      });
    }
  });

  const resultsGrid = document.querySelector('[data-search-results]');
  if (resultsGrid && Array.isArray(window.SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-page-input]');
    const title = document.querySelector('[data-search-title]');
    const subtitle = document.querySelector('[data-search-subtitle]');

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    const normalizedQuery = normalize(query);
    let results = window.SEARCH_INDEX;

    if (normalizedQuery) {
      results = window.SEARCH_INDEX.filter(function (movie) {
        return normalize([
          movie.title,
          movie.description,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags
        ].join(' ')).indexOf(normalizedQuery) !== -1;
      });
    }

    if (title) {
      title.textContent = normalizedQuery ? '搜索结果：' + query : '热门影视推荐';
    }
    if (subtitle) {
      subtitle.textContent = results.length ? '点击影片卡片进入详情页播放。' : '没有匹配到相关影片，请更换关键词。';
    }

    const list = results.slice(0, 240);
    resultsGrid.innerHTML = list.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-wrap" href="./' + movie.file + '" title="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '    <span class="poster-rating">★ ' + escapeHtml(movie.rating) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="movie-meta-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
