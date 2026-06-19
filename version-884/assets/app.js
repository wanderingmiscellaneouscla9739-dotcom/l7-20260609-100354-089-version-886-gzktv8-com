
(function(){
  function qs(sel, root){return (root||document).querySelector(sel)}
  function qsa(sel, root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  var toggle = qs('[data-mobile-toggle]');
  var mobile = qs('[data-mobile-nav]');
  if(toggle && mobile){toggle.addEventListener('click', function(){mobile.classList.toggle('open')})}

  var hero = qs('[data-hero-slider]');
  if(hero){
    var slides = qsa('[data-hero-slide]', hero), dots = qsa('[data-hero-dot]', hero), index = 0, timer;
    function show(i){
      if(!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach(function(s,k){s.classList.toggle('active', k===index)});
      dots.forEach(function(d,k){d.classList.toggle('active', k===index)});
    }
    function next(){show(index+1)}
    function prev(){show(index-1)}
    var nextBtn = qs('[data-hero-next]', hero), prevBtn = qs('[data-hero-prev]', hero);
    if(nextBtn) nextBtn.addEventListener('click', function(){next(); restart()});
    if(prevBtn) prevBtn.addEventListener('click', function(){prev(); restart()});
    dots.forEach(function(d){d.addEventListener('click', function(){show(parseInt(d.getAttribute('data-hero-dot'),10)||0); restart()})});
    function restart(){clearInterval(timer); timer=setInterval(next, 5200)}
    restart();
  }

  function textMatch(card, q){
    if(!q) return true;
    var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre, card.dataset.category, card.dataset.keywords, card.textContent].join(' ').toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  }
  function setupFilter(root){
    var grid = qs('[data-filter-grid]', root || document);
    if(!grid) return;
    var wrap = (root && root.nodeType ? root : document);
    var input = qs('[data-filter-input]', wrap) || qs('#librarySearch', wrap);
    var region = qs('[data-region-filter]', wrap);
    var year = qs('[data-year-filter]', wrap);
    var category = qs('[data-category-filter]', wrap);
    var count = qs('[data-filter-count]', wrap) || qs('#libraryCount', wrap);
    var cards = qsa('.filter-item', grid);
    function apply(){
      var q = input ? input.value.trim() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var c = category ? category.value : '';
      var visible = 0;
      cards.forEach(function(card){
        var ok = textMatch(card, q) && (!r || card.dataset.region===r) && (!y || card.dataset.year===y) && (!c || card.dataset.category===c);
        card.classList.toggle('hidden-by-filter', !ok);
        if(ok) visible++;
      });
      if(count) count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
    }
    [input, region, year, category].forEach(function(el){if(el){el.addEventListener('input', apply); el.addEventListener('change', apply)}});
    var params = new URLSearchParams(location.search);
    var q = params.get('q') || params.get('keyword') || params.get('genre') || '';
    if(input && q){input.value = q}
    var pRegion = params.get('region'); if(region && pRegion){region.value = pRegion}
    var pYear = params.get('year'); if(year && pYear){year.value = pYear}
    var pCat = params.get('category'); if(category && pCat){category.value = pCat}
    apply();
  }
  setupFilter(document);

  qsa('[data-page-filter]').forEach(function(panel){setupFilter(panel.parentNode)});

  qsa('.player-button').forEach(function(btn){btn.addEventListener('click', function(){btn.classList.add('pulse'); setTimeout(function(){btn.classList.remove('pulse')}, 420)})});
})();
