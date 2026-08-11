export const initReviewsSlider = () => {
    const track = document.getElementById("🫆lsdev-reviews__carousel");
    const slides = Array.from(track.children);

    const prevBtn = document.getElementById("🫆lsdev-reviews-carousel__prev-button");
    const nextBtn = document.getElementById("🫆lsdev-reviews-carousel__next-button");
    const pauseBtn = document.getElementById("🫆lsdev-reviews-carousel__pause-button");

    // Below this, two reviews side by side get too narrow to read, so drop to one.
    const minSlideWidth = 320;
    const autoplaySpeed = 7500;

    let slidesToShow = 0;
    let allSlides = [];
    let index = 0;
    let isPaused = false;
    let interval;

    // Measured from the track itself rather than the viewport, so it also responds to the window
    // being maximised or restored — not just the screen changing size. A width of 0 means the
    // reviews window is closed, in which case keep whatever we already had.
    const slidesThatFit = () => {
        const width = track.getBoundingClientRect().width;

        if (!width) return slidesToShow || 2;

        return width < minSlideWidth * 2 ? 1 : 2;
    };

    const moveTo = (i, animate = true) => {
        track.style.transition = animate ? "transform 0.5s ease" : "none";
        track.style.transform = `translateX(-${i * (100 / slidesToShow)}%)`;
    };

    // --- (Re)build the loop clones for a given slide count.
    // The count decides how many slides are cloned onto each end, how wide each one is, and where
    // the loop wraps, so changing it means rebuilding rather than just reassigning.
    const build = (count) => {

        slidesToShow = count;

        track.querySelectorAll("[data-carousel-clone]").forEach(clone => clone.remove());

        const firstClones = slides.slice(0, count).map(s => s.cloneNode(true));
        const lastClones = slides.slice(-count).map(s => s.cloneNode(true));

        [...firstClones, ...lastClones].forEach(c => c.setAttribute("data-carousel-clone", ""));

        // Spread rather than prepending one at a time, which would reverse their order.
        track.prepend(...lastClones);
        track.append(...firstClones);

        allSlides = Array.from(track.children);

        allSlides.forEach(slide => {
            slide.style.flex = `0 0 ${100 / count}%`;
        });

        track.style.display = "flex";

        index = count;
        moveTo(index, false);
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
    build(slidesThatFit());
    play();

    // Rebuild only when the number of visible slides actually changes. Watching the track covers
    // both viewport resizes and the window being maximised; build() sets slidesToShow up front, so
    // the resize it triggers can't recurse.
    new ResizeObserver(() => {

        const count = slidesThatFit();

        if (count !== slidesToShow) build(count);
    }).observe(track);

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
