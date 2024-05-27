// Selecting elements
const videoElement = document.getElementById('video');
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const recordedVideoElement = document.getElementById('recordedVideo');
const timerElement = document.getElementById('timer');

// MediaStream and MediaRecorder variables
let mediaStream;
let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let remainingTime = 20; // Initial timer value in seconds

// Function to start video capture
async function startCapture() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Use back camera
            audio: true
        });
        videoElement.srcObject = mediaStream;
    } catch (error) {
        console.error('Error accessing the camera:', error);
        alert('Error accessing the camera: ' + error.message);
    }
}

// Function to start video recording
function startRecording() {
    recordButton.disabled = true;
    stopButton.disabled = false;

    // Create a new MediaRecorder instance
    mediaRecorder = new RecordRTC(mediaStream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9', // Specify VP9 codec
        recorderType: RecordRTC.MediaStreamRecorder
    });

    // Start recording
    mediaRecorder.startRecording();

    // Start timer
    startTimer();
}

// Function to stop video recording
function stopRecording() {
    recordButton.disabled = false;
    stopButton.disabled = true;

    // Stop recording
    mediaRecorder.stopRecording(() => {
        // Get the recorded blob
        const blob = mediaRecorder.getBlob();
        
        // Set recorded video source
        recordedVideoElement.src = URL.createObjectURL(blob);
        
        // Release resources
        recordedChunks = [];
        mediaRecorder = null;

        // Stop timer
        clearInterval(timerInterval);
        timerElement.textContent = '00:20'; // Reset timer display
    });
}

// Function to start timer
function startTimer() {
    remainingTime = 20;
    timerElement.textContent = '00:20';
    timerInterval = setInterval(updateTimer, 1000);
}

// Function to update timer
function updateTimer() {
    remainingTime--;

    if (remainingTime <= 0) {
        stopRecording(); // Stop recording when timer reaches 0
    } else {
        const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }
}

// Start video capture immediately on page load
startCapture();
