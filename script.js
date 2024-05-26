const video = document.getElementById('video');
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const recordedVideo = document.getElementById('recordedVideo');

let mediaRecorder;
let recordedChunks = [];

// Function to start the video capture
async function startCapture() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: { exact: "environment" } }
            });
            video.srcObject = stream;
            recordButton.disabled = false;
        } catch (err) {
            console.error('Error accessing the camera: ', err);
            alert('Error accessing the camera: ' + err.message);
        }
    } else {
        console.error('getUserMedia is not supported in your browser');
        alert('getUserMedia is not supported in your browser');
    }
}

// Function to start recording
function startRecording() {
    recordedChunks = [];
    const options = { mimeType: 'video/webm; codecs=vp9' };
    const stream = video.srcObject;
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        recordedVideo.src = url;
        recordedVideo.controls = true;
    };

    mediaRecorder.start();
    recordButton.disabled = true;
    stopButton.disabled = true;

    // Automatically stop recording after 10 seconds
    setTimeout(stopRecording, 10000);
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    recordButton.disabled = false;
    stopButton.disabled = true;
}

// Start capture immediately on page load
startCapture();

recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
