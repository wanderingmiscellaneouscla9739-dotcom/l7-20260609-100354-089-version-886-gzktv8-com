(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]'));
  var noResults = document.querySelector('[data-no-results]');
  var currentFilter = '';
  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var cardText = function (card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
  };

  var applyFilters = function () {
    var text = normalize(searchInputs[0] ? searchInputs[0].value : queryValue);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = cardText(card);
      var matchSearch = !text || haystack.indexOf(text) !== -1;
      var matchFilter = !currentFilter || haystack.indexOf(normalize(currentFilter)) !== -1;
      var shouldShow = matchSearch && matchFilter;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });
    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
    }
  };

  if (queryValue && searchInputs.length) {
    searchInputs.forEach(function (input) {
      input.value = queryValue;
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      applyFilters();
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-quick-filter') || '';
      currentFilter = currentFilter === value ? '' : value;
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button && currentFilter === value);
      });
      applyFilters();
    });
  });

  if (cards.length && (searchInputs.length || filterButtons.length)) {
    applyFilters();
  }
})();

function setupMoviePlayer(src) {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');
  var attached = false;
  var hls = null;

  if (!video || !button || !src) {
    return;
  }

  var attach = function () {
    if (attached) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
    attached = true;
  };

  var start = function () {
    attach();
    button.classList.add('is-hidden');
    video.controls = true;
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      start();
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
