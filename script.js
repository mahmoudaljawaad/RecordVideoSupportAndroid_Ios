const video = document.getElementById('video');
const startButton = document.getElementById('startButton');

// Function to start the video capture
async function startCapture() {
    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            // Request access to the user's camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Set the video element's source to the stream
            video.srcObject = stream;
        } catch (err) {
            console.error('Error accessing the camera: ', err);
        }
    } else {
        console.error('getUserMedia is not supported in your browser');
        alert('getUserMedia is not supported in your browser');
    }
}

// Add event listener to the start button
startButton.addEventListener('click', startCapture);
