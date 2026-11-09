import {
    slideToggle,
    cssToken,
} from "./utils.js";

import { useScrim } from "./features/charms.js";

const originalWindowRects = new Map();
const clones = new WeakMap();
const animationDuration = 500;
const BASE_TRANSFORM = "translateY(0px)"; // window's RESTING transform: the intro fade-in-down ends at translateY(0) with fill-mode:forwards, overriding the -10px CSS base
const LIGHTBOX_WIDTH = 0.86;   // of the viewport's width, before the height cap below
const LIGHTBOX_HEIGHT = 0.84;  // of its height — whichever runs out first decides the size
const LIGHTBOX_MAX_PX = 1100;  // so it stops growing on very wide screens
const CARD_REVEAL_STAGGER = 120; // ms between each card sliding into place after a FLIP

// After a window FLIP, slide each project card (its text AND image tile together) back into place
// one at a time in reading order, instead of snapping them all on at once. Each card's animation
// actually STARTS at its staggered time, which also spreads the rasterization so no single frame
// is heavy. The card being closed ([data-flip-landed]) already animated in via its image's own FLIP,
// so it's skipped and left visible.
// Slide the given cards into place one at a time, in reading order. Each card's animation actually
// STARTS at its staggered time (rather than all starting at once with a CSS delay), which also
// spreads the rasterisation so no single frame is heavy. Callers pass whichever cards should
// animate; they are held hidden first so none of them flash before their turn.
export const staggerCardsIn = (cards) => {

    // A card only earns a turn if the visitor can actually see it. Testing against the viewport
    // alone isn't enough: the grid clips with overflow:scroll, so a card scrolled out of view
    // inside it still reports a rect that lands on screen. Those would take their turn first and
    // hold up the cards that are genuinely visible. Anything skipped here simply appears at once,
    // which is invisible to the visitor by definition.
    const scroller = document.getElementById("🫆lsdev-projects__grid-container");
    const clip = scroller?.getBoundingClientRect();

    const top = Math.max(0, clip ? clip.top : 0);
    const bottom = Math.min(window.innerHeight, clip ? clip.bottom : window.innerHeight);

    const ordered = cards
        .map(el => ({ el, r: el.getBoundingClientRect() }))
        .filter(o => o.r.width > 0 && o.r.bottom > top && o.r.top < bottom)
        .sort((a, b) => (a.r.top - b.r.top) || (a.r.left - b.r.left))
        .map(o => o.el);

    ordered.forEach(el => el.dataset.pendingReveal = "");

    ordered.forEach((el, i) => {
        setTimeout(() => {
            el.removeAttribute("data-pending-reveal");
            el.dataset.slidingIn = "";
            setTimeout(() => el.removeAttribute("data-sliding-in"), 400);
        }, i * CARD_REVEAL_STAGGER);
    });

    return ordered;
};

const revealGridImages = (windowEl) => {
    const cards = [...windowEl.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => !el.hasAttribute("data-flip-landed"));

    staggerCardsIn(cards);

    // Drop the scale-time class so the rest of the window (shadows, the focal image) is back to
    // normal while the cards wait their turn.
    windowEl.removeAttribute("data-flipping");
    // Note: [data-flip-landed] is owned and removed by closeProjectDetail (per-card), not here, so
    // overlapping flips can't strip each other's exemption.
};

// Smoothly FLIP a window between its cell and full-screen states using a single
// composited transform, instead of animating top/left/width/height (which jitters).
const flipWindow = (windowEl, toMaximized) => {
    const first = windowEl.getBoundingClientRect();
    windowEl.style.transition = "none";
    windowEl.style.transform = "";
    if (toMaximized) {
        maximizeWindow(windowEl);
    } else {
        unmaximizeWindow(windowEl);
        windowEl.style.position = "";
        clearRectStyles(windowEl);
    }
    const last = windowEl.getBoundingClientRect();
    const sx = (first.width / last.width) || 1;
    const sy = (first.height / last.height) || 1;
    windowEl.style.transformOrigin = "top left";
    windowEl.style.willChange = "transform";
    windowEl.dataset.flipping = ""; // drop shadows + heavy screenshots while scaling
    windowEl.style.transform =
        `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${sx}, ${sy}) ${BASE_TRANSFORM}`;
    void windowEl.offsetWidth;
    windowEl.style.transition = `transform ${animationDuration}ms ${cssToken("--💾lsdev-ease-flip")}`;
    windowEl.style.transform = BASE_TRANSFORM;
    setTimeout(() => {
        windowEl.style.transition = "";
        windowEl.style.transform = "";
        windowEl.style.transformOrigin = "";
        windowEl.style.willChange = "";
        revealGridImages(windowEl); // staggered slide-in, then drops [data-flipping]
    }, animationDuration);
};

const clearRectStyles = (el) => {
    Object.assign(el.style, {
        top: "",
        left: "",
        width: "",
        height: ""
    });
};
// Put the enlarged image back on its tile and lower the scrim.
const closeProjectDetail = () => {

    const frame = document.querySelector(".🎨lsdev-project__img-bg[data-portaled]");

    projectDetailOpen = null;
    useScrim("project", false);
    document.body.style.overflow = "";
    document.removeEventListener("keydown", lightboxKeydown);

    if (!frame || !savedImgTile) return;

    // Reverse FLIP: from where it is now, back onto the tile it came from. The tile rect is the
    // one measured at open, which is still good because the page could not scroll while it was up.
    const firstNow = frame.getBoundingClientRect();

    frame.style.transition = "none";
    frame.style.transform = "none";
    frame.style.top = `${savedImgTile.top}px`;
    frame.style.left = `${savedImgTile.left}px`;
    frame.style.width = `${savedImgTile.width}px`;
    frame.style.height = `${savedImgTile.height}px`;

    const lastNow = frame.getBoundingClientRect();
    const sx = (firstNow.width / lastNow.width) || 1;
    const sy = (firstNow.height / lastNow.height) || 1;

    frame.style.transformOrigin = "top left";
    frame.style.transform =
        `translate(${firstNow.left - lastNow.left}px, ${firstNow.top - lastNow.top}px) scale(${sx}, ${sy})`;
    frame.style.willChange = "transform";

    void frame.offsetWidth;

    frame.style.transition = `transform ${animationDuration}ms ease`;
    frame.style.transform = "none";

    // Home again, and every inline style the portal and the FLIP left behind goes with it.
    setTimeout(() => {
        if (imgHome) imgHome.parent.insertBefore(frame, imgHome.next);
        frame.removeAttribute("data-portaled");
        frame.style.cssText = "";
    }, animationDuration);
}

const lightboxKeydown = (event) => {
    if (event.key === "Escape" && projectDetailOpen) closeProjectDetail();
};

export const closeWindow = (window) => window.removeAttribute("data-open");

const createClone = (window) => {
    const clone = window.cloneNode(true)
    clone.dataset.clone = "";
    window.after(clone);
    clones.set(window, clone);
}
const handleMinimizeDuringShrink = (window, windowBody) => {
    closeWindow(window);
    slideToggle(windowBody);
};
const maximizeWindow = (window) => window.dataset.view = "maximized";
const openWindow = (window) => window.dataset.open = "";
const removeClone = (window) => {
    const clone = clones.get(window);
    clone?.remove();
    clones.delete(window);
};
// Clicking a project lifts its image — frame, background and all — off the grid and shows it
// large over the page, on the same scrim the charms panel uses. The window itself is left alone:
// this is a lightbox over the page, not a view inside the window.
const showProject = (project) => {

    const frame = project.querySelector(".🎨lsdev-project__img-bg");

    if (!frame || projectDetailOpen) return;

    const first = frame.getBoundingClientRect();

    savedImgTile = first;
    imgHome = { parent: frame.parentNode, next: frame.nextSibling };
    projectDetailOpen = project;

    // Out of the window and onto <body>, so nothing the window does to its own transform or
    // overflow can reach it.
    document.body.appendChild(frame);
    frame.dataset.portaled = "";

    // The page is held still while it is up, which is also what keeps the tile rect above valid
    // for the close.
    document.body.style.overflow = "hidden";

    // Final layout first, with no transition, so it can be measured.
    frame.style.transition = "none";
    frame.style.transform = "none";
    frame.style.transformOrigin = "top left";
    frame.style.position = "fixed";
    frame.style.top = "0px";
    frame.style.left = "0px";
    frame.style.height = "auto";
    frame.style.width = `${Math.min(window.innerWidth * LIGHTBOX_WIDTH, LIGHTBOX_MAX_PX)}px`;

    // Height follows the image's own proportions, so it is only known once laid out. When that
    // overshoots, solve for the width that lands exactly on the cap instead of scaling by the
    // overshoot: the padding is a fixed band that does not scale with the image, so a plain
    // ratio lands wide of it.
    let box = frame.getBoundingClientRect();

    const heightCap = window.innerHeight * LIGHTBOX_HEIGHT;

    if (box.height > heightCap) {

        const band = parseFloat(getComputedStyle(frame).paddingTop) * 2;
        const picture = frame.querySelector("img")?.getBoundingClientRect();
        const aspect = picture && picture.height ? picture.width / picture.height : 1.6;

        frame.style.width = `${band + (heightCap - band) * aspect}px`;
        box = frame.getBoundingClientRect();
    }

    frame.style.left = `${(window.innerWidth - box.width) / 2}px`;
    frame.style.top = `${(window.innerHeight - box.height) / 2}px`;

    // Invert: put it back on its tile visually, then animate the transform away.
    const last = frame.getBoundingClientRect();
    const sx = (first.width / last.width) || 1;
    const sy = (first.height / last.height) || 1;

    frame.style.transform =
        `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${sx}, ${sy})`;

    useScrim("project", true);

    frame.style.willChange = "transform";

    void frame.offsetWidth;

    frame.style.transition = `transform ${animationDuration}ms ease`;
    frame.style.transform = "none";

    setTimeout(() => { frame.style.willChange = ""; }, animationDuration);

    // Anywhere outside the image closes it, and so does the image itself — there is nothing to
    // interact with inside, so a second click reads as "put it back".
    frame.addEventListener("click", closeProjectDetail, { once: true });
    document.addEventListener("keydown", lightboxKeydown);
    setTimeout(() => {
        document.addEventListener("pointerdown", lightboxPointerDown, { once: true });
    });
}

const lightboxPointerDown = (event) => {
    if (!projectDetailOpen) return;
    const frame = document.querySelector(".🎨lsdev-project__img-bg[data-portaled]");
    if (frame && !frame.contains(event.target)) closeProjectDetail();
};

const shrinkMaximizedWindow = (window, minimizeClicked) => {
    
    const normalRect = originalWindowRects.get(window);
    const windowBody = window.querySelector(".🎨lsdev-window__body");

    if (!normalRect) return;

    // The project image (if any) is portaled to <body>, so the window is free to use the same
    // clean transform FLIP as the plain path — no layout animation, no leftover inline styles.
    if (projectDetailOpen){
        closeProjectDetail();
    }
    removeClone(window);
    flipWindow(window, false);

    if (minimizeClicked){
        setTimeout(() => {
            handleMinimizeDuringShrink(window, windowBody);
        }, animationDuration - 50);
    }
};
const unmaximizeWindow = (window) => window.removeAttribute("data-view");

let projectDetailOpen = null;
let imgHome = null; // where the portaled project image came from, so it can be put back
let savedImgTile = null; // the project image's grid-tile rect at open, for the close FLIP back


export const minimizeWindows = (() => {
    
    const minimizeButtons = document.querySelectorAll('.🎨lsdev-window__control[data-control="minimize"]');

    const minimizeButtonClick = (e) => {

        const button = e.currentTarget;
        const window = button.closest(".🎨lsdev-window"); 
        const windowBody = window.querySelector(".🎨lsdev-window__body");
        const isMaximized = window.dataset.view === "maximized"; 
 

        if (isMaximized){
            shrinkMaximizedWindow(window, true);
        }
        else {
            slideToggle(windowBody);
            window.toggleAttribute("data-open");
        }

        if (projectDetailOpen){
            closeProjectDetail();
        }
    }

    minimizeButtons.forEach((button) => {
        button.addEventListener("click", minimizeButtonClick);
    });
})();

export const maximizeWindows = (() => {
    
    const maximizeButtons = document.querySelectorAll('.🎨lsdev-window__control[data-control="maximize"]');
    const projects = document.querySelectorAll(".🎨lsdev-projects__project");

    const maximizeButtonClick = (e) => {
        
        const button = e.currentTarget;
        const windowEl = button.closest(".🎨lsdev-window");
        const windowBody = windowEl.querySelector(".🎨lsdev-window__body");
        const isMaximized = windowEl.dataset.view === "maximized";
        const isOpen = windowEl.hasAttribute("data-open");

        if (!isMaximized) {

            const originalRect = windowEl.getBoundingClientRect();
            
            if (!originalWindowRects.has(windowEl)) {
                originalWindowRects.set(windowEl, originalRect);
            }

            if (!isOpen) {
                slideToggle(windowBody, 100);
                openWindow(windowEl);
            }

            createClone(windowEl);
            windowEl.style.display = "block";

            flipWindow(windowEl, true);

            return;
        }

        else {
            shrinkMaximizedWindow(windowEl);
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        
        maximizeButtons.forEach(el => {
            el.addEventListener("click", e => maximizeButtonClick(e));
        });

        // A project no longer maximizes the window — it raises its own image over the page.
        projects.forEach(el => {
            el.addEventListener("click", () => showProject(el));
        });
    });
})();

document.querySelectorAll('.🎨lsdev-window__control[data-control="close"]').forEach(button => {
    
    button.addEventListener("click", e => {
        
        const windowToClose = button.closest(".🎨lsdev-window");
        const clone = clones.get(windowToClose);
        const windows = [...document.querySelectorAll(".🎨lsdev-window")]
                .filter(el => el !== windowToClose);
        
            windows.forEach(window => {
                originalWindowRects.set(window, window.getBoundingClientRect());
            });

        if (projectDetailOpen){
            closeProjectDetail();
            return;
        }

        windowToClose.dataset.poofing = "";

        setTimeout(() => {

            windowToClose.remove();
            if (clone) removeClone(windowToClose);

            // read phase: measure how far each window shifts (no writes -> no thrash)
            const movedWindows = [];
            windows.forEach(window => {
                const originalRect = originalWindowRects.get(window);
                if (!originalRect) return;
                const dy = originalRect.top - window.getBoundingClientRect().top;
                if (dy === 0) return;
                movedWindows.push({ window, dy });
            });

            // write phase: invert all at once, then play to identity
            movedWindows.forEach(({ window, dy }) => {
                window.style.transition = "none";
                window.style.willChange = "transform";
                window.style.transform = `translateY(${dy}px)`;
            });

            movedWindows[0]?.window.offsetHeight;

            requestAnimationFrame(() => {
                movedWindows.forEach(({ window }) => {
                    window.style.transition = "transform 280ms cubic-bezier(0.2, 0, 0, 1)";
                    window.style.transform = "";
                });
            });

            // 5. CLEANUP
            setTimeout(() => {
                movedWindows.forEach(({ window }) => {
                    window.style.transition = "";
                    window.style.willChange = "";
                });
            }, 400);
        }, 400);
    });
});