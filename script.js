const video = document.getElementById('webcam');
const countdownDisplay = document.getElementById('countdown-display');
const captureBtn = document.getElementById('capture-btn');
const downloadArea = document.getElementById('download-area');
const stripCanvas = document.getElementById('strip-canvas');
const photoCanvas = document.getElementById('photo-canvas');

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzaE4kCLQz-FFdNXD3mtqAkZRvMViRdFx120bjO5BspQkD9KHvrxgwlxQZq8edpkyVuzQ/exec";

let capturedImage = null;

// Ambil Akses Kamera
navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
})
.then(stream => video.srcObject = stream)
.catch(() => alert("Kamera tidak tersedia"));

function takeSnapshot() {
    const ctx = photoCanvas.getContext('2d');
    const outW = 800;
    const outH = 1000; // Rasio 4:5
    photoCanvas.width = outW;
    photoCanvas.height = outH;

    const targetRatio = outW / outH;
    const videoRatio = video.videoWidth / video.videoHeight;
    let sWidth, sHeight, sx, sy;

    if (videoRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = sHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
    } else {
        sWidth = video.videoWidth;
        sHeight = sWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
    }

    ctx.save();
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, outW, outH);
    ctx.restore();

    return photoCanvas.toDataURL('image/jpeg', 0.8);
}

captureBtn.addEventListener('click', async () => {
    try {
        captureBtn.disabled = true;
        downloadArea.innerHTML = "📸 STANDBY...";

        for (let i = 3; i > 0; i--) {
            countdownDisplay.innerText = i;
            await new Promise(r => setTimeout(r, 1000));
        }
        countdownDisplay.innerText = "";

        // Efek Flash Visual
        const flash = document.createElement('div');
        flash.className = 'flash';
        document.getElementById('booth-container').appendChild(flash);
        setTimeout(() => flash.remove(), 400);

        capturedImage = takeSnapshot();
        await createFinalLayout();

    } catch (e) {
        alert("Gagal memotret");
        console.error(e);
    } finally {
        captureBtn.disabled = false;
    }
});

async function createFinalLayout() {
    const ctx = stripCanvas.getContext('2d');
    const canvasW = 800;
    const canvasH = 1000;
    stripCanvas.width = canvasW;
    stripCanvas.height = canvasH;

    // 1. Gambar Foto
    const img = new Image();
    img.src = capturedImage;
    await new Promise(r => img.onload = r);
    ctx.drawImage(img, 0, 0, 800, 1000); 

    // 2. Gambar Frame
    const frame = new Image();
    frame.src = "frame.png"; 
    await new Promise(r => {
        frame.onload = r;
        frame.onerror = () => { console.warn("Frame tidak ditemukan"); r(); };
    });
    
    if (frame.complete && frame.naturalWidth !== 0) {
        ctx.drawImage(frame, 0, 0, canvasW, canvasH);
    }

    const finalData = stripCanvas.toDataURL('image/jpeg', 0.8);
    const fileName = `PB_${Date.now()}.jpg`;

    // 3. Upload (Background process)
    uploadToGoogle(finalData, fileName);

    // 4. Update Area Download
    downloadArea.innerHTML = `<a href="${finalData}" download="${fileName}" class="btn-download">DOWNLOAD PHOTO</a>`;
}

function uploadToGoogle(base64Data, name) {
    const rawBase = base64Data.split(',')[1];
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        body: JSON.stringify({ image: rawBase, name: name })
    }).catch(e => console.error("Upload error", e));
}