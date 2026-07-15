export const slideToggle = (el, duration = 500) => {

    const isHidden = getComputedStyle(el).display === "none";

    if (isHidden) {
        // SLIDE DOWN — grow the whole window downward via clip-path on the WINDOW (the title bar
        // stays put; the content area and the window's pink background reveal below it together).
        // The window takes its full height in one layout, then the reveal runs on the compositor —
        // no per-frame relayout/repaint, which is what made the height version jitter.
        const win = el.closest(".🎨lsdev-window") || el;
        const collapsedH = win.getBoundingClientRect().height; // title bar only (chrome hidden)

        el.style.removeProperty("display");
        let display = getComputedStyle(el).display;
        if (display === "none") display = "block";
        el.style.display = display;

        const hideBottom = win.getBoundingClientRect().height - collapsedH; // the chrome's height
        win.style.clipPath = `inset(0 0 ${hideBottom}px 0)`; // reveal starts at just the title bar
        win.style.willChange = "clip-path";
        win.offsetHeight; // force reflow
        win.style.transition = `clip-path ${duration}ms ease`;
        win.style.clipPath = "inset(0 0 0 0)"; // grow down to full

        setTimeout(() => {
            win.style.removeProperty("clip-path");
            win.style.removeProperty("transition");
            win.style.removeProperty("will-change");
        }, duration);

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
