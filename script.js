/* --- CONFIG PARTICLES --- */
particlesJS("particles-js", {
    "particles": {
        "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.2, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
        "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
        "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } } }
    },
    "retina_detect": true
});

/* --- SCROLL REVEAL --- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active'); 
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* --- GALLERY & POPUP --- */
function loadGallery(category) {
    const area = document.querySelector(".gallery-container");
    area.innerHTML = ""; 

    for (let i = 1; i <= 15; i++) {
        const imgPath = `projects/${category}/${i}.png`;
        let img = new Image();
        img.src = imgPath;
        img.onload = function() {
            let galleryImg = document.createElement("img");
            galleryImg.src = imgPath;
            galleryImg.className = "gallery-img";
            galleryImg.onclick = function() { openPopup(imgPath); };
            area.appendChild(galleryImg);
        };
    }
}

function openPopup(src) {
    const popup = document.querySelector(".popup-bg");
    document.querySelector("#popup-img").src = src;
    popup.style.display = "flex";
    setTimeout(() => { popup.style.opacity = "1"; }, 10);
}

function closePopup() {
    const popup = document.querySelector(".popup-bg");
    popup.style.opacity = "0";
    setTimeout(() => { popup.style.display = "none"; }, 300);
}