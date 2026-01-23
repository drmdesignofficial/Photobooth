const video = document.getElementById('webcam');
const countdownDisplay = document.getElementById('countdown-display');
const captureBtn = document.getElementById('capture-btn');
const shutter = document.getElementById('shutter-effect');
const resultsPreview = document.getElementById('results-preview');
const downloadArea = document.getElementById('download-area');
const stripCanvas = document.getElementById('strip-canvas');

let capturedImages = [];

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { aspectRatio: 1.333, width: { ideal: 1280 }, facingMode: "user" } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Akses kamera ditolak.");
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        video.className = btn.getAttribute('data-filter');
    });
});

function takeSnapshot() {
    const photoCanvas = document.getElementById('photo-canvas');
    const ctx = photoCanvas.getContext('2d');
    
    // Smart Cropping Logic (Memaksa Landscape 4:3)
    const targetRatio = 4 / 3;
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const vRatio = vWidth / vHeight;

    let sWidth, sHeight, sx, sy;

    if (vRatio > targetRatio) {
        sHeight = vHeight;
        sWidth = vHeight * targetRatio;
        sx = (vWidth - sWidth) / 2;
        sy = 0;
    } else {
        sWidth = vWidth;
        sHeight = vWidth / targetRatio;
        sx = 0;
        sy = (vHeight - sHeight) / 2;
    }

    photoCanvas.width = 1024;
    photoCanvas.height = 768;

    // Flash Effect
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.getElementById('booth-container').appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    ctx.save();
    ctx.translate(photoCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, photoCanvas.width, photoCanvas.height);
    ctx.restore();
    
    return photoCanvas.toDataURL('image/png');
}

captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    capturedImages = [];
    resultsPreview.innerHTML = "";
    downloadArea.innerHTML = "";

    for (let i = 0; i < 4; i++) {
        let count = 3;
        while (count > 0) {
            countdownDisplay.innerText = count;
            await new Promise(r => setTimeout(r, 1000));
            count--;
        }
        countdownDisplay.innerText = "";
        const imgData = takeSnapshot();
        capturedImages.push(imgData);
        
        const thumb = document.createElement('img');
        thumb.src = imgData;
        resultsPreview.appendChild(thumb);
        await new Promise(r => setTimeout(r, 800)); 
    }
    
    await createStrip();
    captureBtn.disabled = false;
});

async function createStrip() {
    const ctx = stripCanvas.getContext('2d');
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    const imgWidth = 540; 
    const xPos = 30;
    const padding = 40;

    for (let i = 0; i < capturedImages.length; i++) {
        const img = new Image();
        img.src = capturedImages[i];
        await new Promise(r => img.onload = r);
        const imgHeight = (img.height / img.width) * imgWidth;
        const yPos = padding + (i * (imgHeight + 25)); 
        ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
    }

    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTOBOOTH BY DRM_DESIGN_OFFICIAL", stripCanvas.width / 2, stripCanvas.height - 60);
    
    ctx.font = "16px sans-serif";
    ctx.fillText(new Date().toLocaleDateString('id-ID', {year:'numeric', month:'long', day:'numeric'}), stripCanvas.width / 2, stripCanvas.height - 30);

    const finalLink = document.createElement('a');
    finalLink.href = stripCanvas.toDataURL('image/png');
    finalLink.download = `photobooth_${Date.now()}.png`;
    finalLink.className = "btn-download";
    finalLink.innerText = "DOWNLOAD PHOTO STRIP";
    downloadArea.appendChild(finalLink);
}

initCamera();