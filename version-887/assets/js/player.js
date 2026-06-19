(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var hlsInstance = null;
    var ready = false;

    if (!video || !button) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function prepare() {
      var stream = video.getAttribute('data-stream');

      if (ready || !stream) {
        return;
      }

      ready = true;
      setStatus('正在加载');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放失败，请稍后重试');
          }
        });
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      video.controls = true;
      button.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
          setStatus('点击继续播放');
        });
      }
    }

    button.addEventListener('click', play);

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        play();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        setStatus('点击继续播放');
      }
    });
  });
})();
