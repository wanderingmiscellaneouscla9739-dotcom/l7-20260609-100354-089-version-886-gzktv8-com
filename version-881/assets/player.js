(function () {
  const shell = document.querySelector('.js-player');
  const video = document.getElementById('movie-player');
  const cover = shell ? shell.querySelector('.player-cover') : null;
  const message = shell ? shell.querySelector('.player-message') : null;
  const configNode = document.getElementById('player-config');

  if (!shell || !video || !configNode) {
    return;
  }

  let config = {};
  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const source = config.source || '';
  const poster = config.poster || '';
  let hlsInstance = null;
  let ready = false;

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepareVideo() {
    if (!source) {
      setMessage('视频加载失败，请稍后重试');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        setMessage('');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('视频加载失败，请稍后重试');
        }
      });
      return;
    }

    video.src = source;
    ready = true;
  }

  function startPlayback() {
    if (!ready && !video.src) {
      prepareVideo();
    }
    if (cover) {
      cover.classList.add('hidden');
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('点击视频区域继续播放');
      });
    }
  }

  prepareVideo();

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
    setMessage('');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
