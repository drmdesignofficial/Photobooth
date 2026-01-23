const video = document.getElementById('webcam');
const countdownDisplay = document.getElementById('countdown-display');
const captureBtn = document.getElementById('capture-btn');
const shutter = document.getElementById('shutter-effect');
const resultsPreview = document.getElementById('results-preview');
const downloadArea = document.getElementById('download-area');
const stripCanvas = document.getElementById('strip-canvas');

let capturedImages = [];

// Memulai Kamera dengan rasio 4:3
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                aspectRatio: 1.3333333333,
                width: { ideal: 1280 },
                facingMode: "user" 
            } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Kamera tidak dapat diakses. Pastikan izin kamera sudah aktif.");
    }
}

// Event untuk tombol filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        video.className = btn.getAttribute('data-filter');
    });
});

// Fungsi Ambil Gambar
function takeSnapshot() {
    const photoCanvas = document.getElementById('photo-canvas');
    const ctx = photoCanvas.getContext('2d');
    
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    
    // Efek Shutter Visual
    shutter.style.opacity = "1";
    setTimeout(() => { shutter.style.opacity = "0"; }, 100);
    
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.getElementById('booth-container').appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Mirroring hasil capture
    ctx.translate(photoCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
    
    return photoCanvas.toDataURL('image/png');
}

// Logika Sesi Photobooth
captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    capturedImages = [];
    resultsPreview.innerHTML = "";
    downloadArea.innerHTML = "";

    for (let i = 0; i < 4; i++) {
        let count = 3;
        while (count > 0) {
            countdownDisplay.innerText = count;
            countdownDisplay.classList.remove('count-anim');
            void countdownDisplay.offsetWidth; // Reset animasi
            countdownDisplay.classList.add('count-anim');
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

// Membuat Foto Strip Vertikal
async function createStrip() {
    const ctx = stripCanvas.getContext('2d');
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    const imgWidth = 540; 
    const xPos = 30;
    const topPadding = 40;

    for (let i = 0; i < capturedImages.length; i++) {
        const img = new Image();
        img.src = capturedImages[i];
        await new Promise(r => img.onload = r);
        
        const imgHeight = (img.height / img.width) * imgWidth;
        const yPos = topPadding + (i * (imgHeight + 25)); 
        ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
    }

    // Teks Branding di Strip
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTOBOOTH BY DRM_DESIGN", stripCanvas.width / 2, stripCanvas.height - 60);
    
    ctx.font = "16px sans-serif";
    const dateStr = new Date().toLocaleDateString('id-ID', {year:'numeric', month:'long', day:'numeric'});
    ctx.fillText(dateStr, stripCanvas.width / 2, stripCanvas.height - 30);

    // Munculkan tombol download
    const finalLink = document.createElement('a');
    finalLink.href = stripCanvas.toDataURL('image/png');
    finalLink.download = `photobooth_${Date.now()}.png`;
    finalLink.className = "btn-download";
    finalLink.innerText = "DOWNLOAD PHOTO STRIP";
    downloadArea.appendChild(finalLink);
    finalLink.scrollIntoView({ behavior: 'smooth' });

    function takeSnapshot() {
    const photoCanvas = document.getElementById('photo-canvas');
    const ctx = photoCanvas.getContext('2d');
    
    // Tentukan target rasio (4:3)
    const targetRatio = 4 / 3;
    
    // Ukuran asli dari aliran video kamera
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const vRatio = vWidth / vHeight;

    let sWidth, sHeight, sx, sy;

    // Logika Pemotongan (Cropping) Tengah
    if (vRatio > targetRatio) {
        // Jika video terlalu lebar (seperti di laptop)
        sHeight = vHeight;
        sWidth = vHeight * targetRatio;
        sx = (vWidth - sWidth) / 2;
        sy = 0;
    } else {
        // Jika video terlalu tinggi (seperti di HP portrait)
        sWidth = vWidth;
        sHeight = vWidth / targetRatio;
        sx = 0;
        sy = (vHeight - sHeight) / 2;
    }

    // Set ukuran canvas hasil menjadi landscape 4:3 (misal 1024x768)
    photoCanvas.width = 1024; 
    photoCanvas.height = 768;

    // Efek visual Shutter
    shutter.style.opacity = "1";
    setTimeout(() => { shutter.style.opacity = "0"; }, 100);

    // Gambar ke canvas dengan cropping
    ctx.save();
    ctx.translate(photoCanvas.width, 0);
    ctx.scale(-1, 1); // Mirroring
    ctx.filter = getComputedStyle(video).filter;
    
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, photoCanvas.width, photoCanvas.height);
    ctx.restore();
    
    return photoCanvas.toDataURL('image/png');
}
}

initCamera();