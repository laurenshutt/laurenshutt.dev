export const slideToggle = (el, duration = 500) => {

    const isHidden = getComputedStyle(el).display === "none";

    if (isHidden) {
        // SLIDE DOWN
        el.style.removeProperty("display");
        let display = getComputedStyle(el).display;
        if (display === "none") display = "block";
        el.style.display = display;

        const height = el.scrollHeight;

        el.style.overflow = "hidden";

        // Animate with the Web Animations API instead of a CSS transition. A transition needs a
        // previous computed style to interpolate from, and this element was display:none until a
        // moment ago — so 0 -> full height collapsed into a single frame, snapping every window
        // below down at once instead of pushing them gradually. (Slide-up doesn't hit this: the
        // element is already rendered, which is why minimizing was smooth.) animate() takes
        // explicit keyframes, so it always runs. No inline height is left behind either, so the
        // element settles at its natural height with nothing to snap at the end.
        el.getAnimations().forEach(a => a.cancel()); // guard against rapid re-toggling

        el.animate(
            [{ height: "0px" }, { height: `${height}px` }],
            { duration, easing: "ease" }
        ).finished
            .then(() => el.style.removeProperty("overflow"))
            .catch(() => {}); // cancelled by a re-toggle

    } else {
        // SLIDE UP
        const height = el.scrollHeight;

        el.style.overflow = "hidden";
        el.style.height = `${height}px`;
        el.offsetHeight; // force reflow

        el.style.transition = `height ${duration}ms ease`;
        el.style.height = "0px";

        setTimeout(() => {
            el.style.display = "none";
            el.style.removeProperty("height");
            el.style.removeProperty("overflow");
            el.style.removeProperty("transition");
        }, duration);
    }
};

export const scrollToTop = (() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
})();    

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const setSize = (el) => {

    el.style.height = el.offsetHeight + "px";

    window.addEventListener("resize", () => {
        el.style.height = "";
        requestAnimationFrame = () => {
            el.style.height = el.offsetHeight + "px";
        }
    });
}


export const buttonPress = () => {
    
    document.querySelectorAll('.🎨lsdev-button').forEach(button => {

                const removePress = () => {
            button.classList.remove('is-pressed');
        };
        
        button.addEventListener('pointerdown', () => {
            button.classList.add('is-pressed');

            setTimeout(function(){
                removePress();
            },200)
        });



        //button.addEventListener('pointerup', removePress);
        button.addEventListener('pointerleave', removePress);
        button.addEventListener('pointercancel', removePress);
    });
}
