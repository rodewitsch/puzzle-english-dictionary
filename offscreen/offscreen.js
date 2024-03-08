chrome.runtime.onMessage.addListener((msg) => {
  if (!msg.offscreen) {
    return;
  }
  switch (msg.type) {
    case "play":
      playAudio(msg.play);
      break;
    case "pause":
      pauseAudio();
      break;
  }
});

const audio = document.querySelector("audio");

function playAudio(play) {
  const currSource = audio?.src?.split("/") || [];
  const currentSource = currSource.pop();

  const { source, volume, speed } = play;
  const file = source || "sound.mp3";

  if (audio.paused && currentSource === file) {
    audio.play();
  } else {
    console.log("playing", source, volume, speed);
    audio.src = file;
    audio.volume = volume;
    audio.playbackRate = speed;

    audio.play();
  }
}

function pauseAudio() {
  audio.pause();
}