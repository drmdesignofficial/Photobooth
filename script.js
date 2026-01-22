const video = document.getElementById('webcam');
const countdownDisplay = document.getElementById('countdown-display');
const captureBtn = document.getElementById('capture-btn');
const shutter = document.getElementById('shutter-effect');
const resultsPreview = document.getElementById('results-preview');
const downloadArea = document.getElementById('download-area');
const stripCanvas = document.getElementById('strip-canvas');

let capturedImages = [];

// Memulai kamera
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Akses kamera ditolak atau tidak ditemukan.");
    }
}

// Logika Pemilihan Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        
        btn.classList.add('active');
        video.className = btn.getAttribute('data-filter');
    });
});

// Mengambil foto tunggal
function takeSnapshot() {
    const photoCanvas = document.getElementById('photo-canvas');
    const ctx = photoCanvas.getContext('2d');
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    
    // Efek Visual Shutter & Flash
    shutter.style.opacity = "1";
    setTimeout(() => { shutter.style.opacity = "0"; }, 100);
    
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.getElementById('booth-container').appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Mirroring (membalikkan gambar)
    ctx.translate(photoCanvas.width, 0);
    ctx.scale(-1, 1);
    
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
    return photoCanvas.toDataURL('image/png');
}

// Handler tombol start
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
            void countdownDisplay.offsetWidth; // Trigger reflow untuk animasi ulang
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
        
        await new Promise(r => setTimeout(r, 800)); // Jeda antar sesi foto
    }
    
    await createStrip();
    captureBtn.disabled = false;
});

// Membuat format Photo Strip vertikal
async function createStrip() {
    const ctx = stripCanvas.getContext('2d');
    
    // Background putih strip
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    const imgWidth = 540; 
    const xPos = 30;
    const padding = 30;

    for (let i = 0; i < capturedImages.length; i++) {
        const img = new Image();
        img.src = capturedImages[i];
        await new Promise(r => img.onload = r);
        
        const imgHeight = (img.height / img.width) * imgWidth;
        const yPos = padding + (i * (imgHeight + 25)); 
        
        ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
    }

    // Branding Footer
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHOTOBOOTH BY DRM_DESIGN_OFFICIAL", stripCanvas.width / 2, stripCanvas.height - 50);
    
    // Tanggal Footer
    ctx.font = "14px sans-serif";
    const dateStr = new Date().toLocaleDateString('id-ID', {year:'numeric', month:'long', day:'numeric'});
    ctx.fillText(dateStr, stripCanvas.width / 2, stripCanvas.height - 25);

    // Membuat tombol download
    const finalLink = document.createElement('a');
    finalLink.href = stripCanvas.toDataURL('image/png');
    finalLink.download = `photobooth_${Date.now()}.png`;
    finalLink.className = "btn-download";
    finalLink.innerText = "DOWNLOAD PHOTO STRIP";
    downloadArea.appendChild(finalLink);
    
    finalLink.scrollIntoView({ behavior: 'smooth' });
}

// Inisialisasi kamera saat load
initCamera();