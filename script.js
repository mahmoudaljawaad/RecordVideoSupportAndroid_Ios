const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const screenVideo = document.getElementById("screenVideo");
const recordedVideo = document.getElementById("recordedVideo");

let mediaRecorder;
let recordedChunks = [];

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  const displayMediaOptions = {
    video: {
      cursor: "always",
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    screenVideo.srcObject = stream;

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType(),
    });

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    mediaRecorder.start();
  } catch (err) {
    alert("Error: " + err.message);
    console.error("Error: " + err);
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

stopBtn.addEventListener("click", () => {
  try {
    mediaRecorder.stop();
    screenVideo.srcObject.getTracks().forEach((track) => track.stop());
    startBtn.disabled = false;
    stopBtn.disabled = true;
  } catch (err) {
    alert("Error: " + err.message);
    console.error("Error: " + err);
  }
});

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

function handleStop() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  // Download the recorded video
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "screen-recording.webm";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);

  // Show the recorded video in the video element
  recordedVideo.src = url;
  recordedVideo.controls = true;
}

function getSupportedMimeType() {
  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  throw new Error("No supported MIME types.");
}
