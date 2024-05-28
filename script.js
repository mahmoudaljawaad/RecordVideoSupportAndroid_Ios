
const data = {
  videoEl: null,
  canvasEl: null,
  fileData: null,
  currentStream: null,
  constraints: {},
  selectedDevice: null,
  options: [],
  mediaRecorder: null,
  recordedChunks: [],
   recordingTimer: null,
  recordingDuration: 20, // in seconds
};
function startRecord() {
  if (!data.currentStream) {
    console.error('No video stream available.');
    return;
  }

  data.recordedChunks = [];
  data.mediaRecorder = new MediaRecorder(data.currentStream);

  data.mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      data.recordedChunks.push(event.data);
    }
  };

  data.mediaRecorder.onstop = () => {
    const blob = new Blob(data.recordedChunks, { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const previewVideo = document.getElementById('preview-video');
    previewVideo.src = url;

    
    // Create a file object from the blob
    const videoFile = new File([blob], 'recorded_video.mp4', { type: 'video/mp4' });

    // Create a FileList object containing the file
    const fileList = new DataTransfer();
    fileList.items.add(videoFile);

    // Set the FileList object as the value of the file input element
    const fileInput = document.getElementById('fileRecord'); // Change 'file-input' to the ID of your file input element
    fileInput.files = fileList.files;
    show("SubmitButton")
    show('preview');
  };

  data.mediaRecorder.start();
  disableStartRecordButton(); // Disable the start record button
  startRecordingTimer(); // Start the recording timer

  // Automatically stop recording when the timer runs out
  setTimeout(stopRecord, data.recordingDuration * 1000); // Remove parentheses from stopRecord
}

function startRecordingTimer() {
  const timerElement = document.getElementById('timer');
  data.remainingTime = data.recordingDuration;
  updateTimerDisplay(timerElement);

  data.recordingTimer = setInterval(() => {
    data.remainingTime--;
    updateTimerDisplay(timerElement);
  }, 1000);
}

function updateTimerDisplay(timerElement) {
  const minutes = Math.floor(data.remainingTime / 60);
  const seconds = data.remainingTime % 60;
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerElement.textContent = `Recording Time: ${timerText}`;
}

function stopRecord() {
  if (data.mediaRecorder && data.mediaRecorder.state !== 'inactive') {
    data.mediaRecorder.stop();
    clearInterval(data.recordingTimer); // Clear the recording timer
    enableStartRecordButton(); // Enable the start record button
  }
}
function disableStartRecordButton(){
  hide('startbutton')
  show('StopButton')

}
function enableStartRecordButton() {
  show('startbutton')
  hide('StopButton')

}


function hide(id) {
  
  let el = document.querySelector(`#${id}`);
  if (!el.classList.contains("hidden")) {
    el.classList.add("hidden");
  }
}

function show(id) {
  let el = document.querySelector(`#${id}`);
  if (el.classList.contains("hidden")) {
    el.classList.remove("hidden");
  }
}

async function deviceChange() {
  stopVideoAndCanvas();
  setConstraints();
  const result = await getMedia();
  console.log("device change:", result);
}

async function start() {
  stop();
  show("video-container");

  const resultDevices = await getDevices();
  data.selectedDevice = data.options[0].value;
  setConstraints();
  console.log("get devices:", resultDevices);
  const resultMedia = getMedia();
  if (resultMedia) {
    console.log("get media", resultMedia);
  }
}

function setConstraints() {
  const videoConstraints = {};
  videoConstraints.deviceId = {
    exact: data.selectedDevice,
  };

  data.constraints = {
    video: videoConstraints,
    audio: false,
  };
}

async function getMedia() {
  try {
    data.stream = await navigator.mediaDevices.getUserMedia(data.constraints);
    window.stream = data.stream;
    data.currentStream = window.stream;
    data.videoEl.srcObject = window.stream;
    return true;
  } catch (err) {
    throw err;
  }
}
function deviceOptionChange() {
  const el = document.querySelector("#device-option");
  const value = el.value;
  const text = el.options[el.selectedIndex].text;
  data.selectedDevice = value;
  deviceChange();
}

async function getDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerated devices not supported");
    return false;
  }
  await navigator.mediaDevices.getUserMedia({ video: true });

  try {
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    data.options = [];

    // clear options before adding
    let select_item = document.querySelector("#device-option");
    let options = select_item.getElementsByTagName("option");
    for (var i = options.length; i--; ) {
      select_item.removeChild(options[i]);
    }

    // add options to camera facing selector
    const videoInputDevices = allDevices.filter(
      (device) => device.kind === "videoinput"
    );
    videoInputDevices.forEach((device) => {
      let option = {};
      option.text = device.label;
      option.value = device.deviceId;
      data.options.push(option);
      var selection = document.createElement("option");
      selection.value = option.value;
      selection.text = option.text;
      document.querySelector("#device-option").appendChild(selection);
    });
    if (options.length >= 1) show("device-form");
    return true;
  } catch (err) {
    throw err;
  }
}

function snapShot() {
  show("canvas-container");
  data.canvasEl.width = data.videoEl.videoWidth;
  data.canvasEl.height = data.videoEl.videoHeight;
  data.canvasEl
    .getContext("2d")
    .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
  data.fileData = data.canvasEl.toDataURL("image/jpeg");
}

function stopVideoAndCanvas() {
  data.videoEl.pause();
  if (data.currentStream) {
    data.currentStream.getTracks().forEach((track) => {
      track.stop();
    });
    data.videoEl.srcObject = null;
  }
  if (data.videoEl) {
    data.videoEl.removeAttribute("src");
    data.videoEl.load();
  }
  if (data.canvasEl) {
    data.canvasEl
      .getContext("2d")
      .clearRect(0, 0, data.canvasEl.width, data.canvasEl.height);
  }
}

function stop() {
  
  console.log("stop clicked");
  stopVideoAndCanvas();
  // hide video, canvas and form
  hide("video-container");
  hide("canvas-container");
  if (document.querySelector("#device-form")) {
    hide("device-form");
  }
}
function download() {
  // cleanup any existing hidden links
  let hiddenLinks = document.querySelectorAll(".hidden_links");
  for (let hiddenLink of hiddenLinks) {
    document.querySelector("body").remove(hiddenLink);
  }

  if (data.fileData) {
    let a = document.createElement("a");
    a.classList.add("hidden-link");
    a.href = data.fileData;
    a.textContent = "";
    a.target = "_blank";
    a.download = "photo.jpeg";
    document.querySelector("body").append(a);
    a.click();
  }
}

async function share() {
  // debugger
  let blob = await (await fetch(data.fileData)).blob();
  const filesArray = [
    new File([blob], "snapshot.jpg", {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  const shareData = {
    files: filesArray,
  };
  try {
    await navigator.share(shareData);
    alert("shared successfully");
  } catch (error) {
    alert("error attempting to share");
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  let elements = document.querySelectorAll(".home button");

  // set video
  data.videoEl = document.querySelector("#video");
  data.canvasEl = document.querySelector("#canvas");

  start();
});
