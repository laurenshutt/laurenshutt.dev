export const initReviewsSlider = () => {
    const track = document.getElementById("🫆lsdev-reviews__carousel");
    const slides = Array.from(track.children);

    const prevBtn = document.getElementById("🫆lsdev-reviews-carousel__prev-button");
    const nextBtn = document.getElementById("🫆lsdev-reviews-carousel__next-button");
    const pauseBtn = document.getElementById("🫆lsdev-reviews-carousel__pause-button");

    const slidesToShow = 2;
    const autoplaySpeed = 7500;

    let index = slidesToShow;
    let isPaused = false;
    let interval;

    // --- CLONE SLIDES (infinite loop effect)
    const setupClones = () => {
        const firstClones = slides.slice(0, slidesToShow).map(s => s.cloneNode(true));
        const lastClones = slides.slice(-slidesToShow).map(s => s.cloneNode(true));

        lastClones.forEach(c => track.prepend(c));
        firstClones.forEach(c => track.append(c));
    };

    setupClones();

    const allSlides = Array.from(track.children);

    const setLayout = () => {
        const width = 100 / slidesToShow;

        allSlides.forEach(slide => {
            slide.style.flex = `0 0 ${width}%`;
        });

        track.style.display = "flex";
        track.style.transition = "transform 0.5s ease";
    };

    const moveTo = (i, animate = true) => {
        track.style.transition = animate ? "transform 0.5s ease" : "none";
        track.style.transform = `translateX(-${i * (100 / slidesToShow)}%)`;
    };

    const next = () => {
        index++;
        moveTo(index);
    };

    const prev = () => {
        index--;
        moveTo(index);
    };

    // --- infinite correction after transition
    track.addEventListener("transitionend", () => {
        const realCount = slides.length;

        if (index >= realCount + slidesToShow) {
            index = slidesToShow;
            moveTo(index, false);
        }

        if (index <= 0) {
            index = realCount;
            moveTo(index, false);
        }
    });

    const play = () => {
        interval = setInterval(next, autoplaySpeed);
    };

    const pause = () => clearInterval(interval);

    // init
    setLayout();
    moveTo(index, false);
    play();

    // controls
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    pauseBtn.addEventListener("click", () => {
        pauseBtn.classList.toggle("is-paused");

        if (isPaused) {
            play();
            pauseBtn.textContent = "Pause";
        } else {
            pause();
            pauseBtn.textContent = "Play";
        }

        isPaused = !isPaused;
    });
};