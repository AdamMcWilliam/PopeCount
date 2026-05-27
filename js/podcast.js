/**
 * Papal podcast player — autoplay when allowed, controls always available.
 */
function initPodcastPlayer() {
  const audio = document.getElementById("pope_audio");
  if (!audio) return;

  const playBtn = document.getElementById("playButton");
  const pauseBtn = document.getElementById("pauseButton");
  const muteBtn = document.getElementById("muteButton");
  const hint = document.getElementById("audioHint");

  const hideHint = () => {
    if (hint) hint.hidden = true;
  };

  const showHint = () => {
    if (hint) hint.hidden = false;
  };

  playBtn?.addEventListener("click", () => {
    audio.play().then(hideHint).catch(showHint);
  });

  pauseBtn?.addEventListener("click", () => {
    audio.pause();
  });

  muteBtn?.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteBtn.setAttribute("aria-pressed", audio.muted ? "true" : "false");
  });

  audio.addEventListener("play", hideHint);

  const tryAutoplay = () => {
    audio.play().then(hideHint).catch(showHint);
  };

  if (document.readyState === "complete") {
    tryAutoplay();
  } else {
    window.addEventListener("load", tryAutoplay, { once: true });
  }
}

initPodcastPlayer();
