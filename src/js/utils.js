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
        el.style.height = "0px";
        el.offsetHeight; // force reflow

        el.style.transition = `height ${duration}ms ease`;
        el.style.height = `${height}px`;

        setTimeout(() => {
            el.style.removeProperty("height");
            el.style.removeProperty("overflow");
            el.style.removeProperty("transition");
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
