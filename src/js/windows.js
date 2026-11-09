import {
    slideToggle,
    cssToken,
} from "./utils.js";

import { useScrim } from "./features/charms.js";

const originalWindowRects = new Map();
const clones = new WeakMap();
const animationDuration = 500;
const BASE_TRANSFORM = "translateY(0px)"; // window's RESTING transform: the intro fade-in-down ends at translateY(0) with fill-mode:forwards, overriding the -10px CSS base
// Sized from the artwork outwards, not from the frame inwards: the picture is the point, and
// the band is trim around it. Keeping the band as a share of the frame rather than a fixed px
// means it still grows as the image does, just by less than it did on the card.
const LIGHTBOX_ART = 0.62;     // the artwork's share of the viewport's width at full size
const LIGHTBOX_ART_MAX = 760;  // and its ceiling, so it stops growing on very wide screens
const LIGHTBOX_BAND = 0.06;    // the band around it, as a share of the whole frame
const LIGHTBOX_HEIGHT = 0.84;  // the frame never takes more than this share of the height
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
// Put the enlarged image back on its tile and lower the scrim — the same tween in reverse, so
// the padding and corners come back as gradually as they went.
const closeProjectDetail = () => {

    const frame = document.querySelector(".🎨lsdev-project__img-bg[data-portaled]");
    const card = projectDetailOpen;

    projectDetailOpen = null;
    useScrim("project", false);
    document.body.style.overflow = "";
    document.removeEventListener("keydown", lightboxKeydown);
    document.removeEventListener("pointerdown", lightboxPointerDown);

    if (!frame || !savedImgTile) return;

    // The tile rect is the one measured at open, which is still good because the page could not
    // scroll while the lightbox was up.
    // Lands at rest, not at whatever scale the card happened to be giving it when it was picked
    // up: the hover is held off on arrival, so tweening back to a hovered 1.06 would leave a step
    // at the hand-over.
    tween(frame, animationDuration);
    settle(frame, savedImgTile, { ...savedImgLook, scale: "none" });

    // Home again, and every inline style the portal and the tween left behind goes with it.
    //
    // On the width transition actually ending rather than on a timer of the same length: a timer
    // can fire a frame before the last paint, handing over while the tween is still two or three
    // pixels short and stepping the rest. The timeout is only a backstop for a transition that
    // never reports — interrupted, or nothing to animate.
    let landed = false;

    const land = () => {

        if (landed) return;

        landed = true;

        frame.removeEventListener("transitionend", onEnd);

        holdHoverUntilPointerMoves(card);

        if (imgHome) imgHome.parent.insertBefore(frame, imgHome.next);

        frame.removeAttribute("data-portaled");
        frame.style.cssText = "";
    };

    const onEnd = (event) => {
        if (event.target === frame && event.propertyName === "width") land();
    };

    frame.addEventListener("transitionend", onEnd);
    setTimeout(land, animationDuration + 80);
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
// What the card looks like, read off it before it leaves the grid. These are the values the
// open animates away from and the close animates back to — in pixels, so they interpolate.
const lookOf = (el) => {
    const cs = getComputedStyle(el);
    return { padding: cs.padding, radius: cs.borderRadius, shadow: cs.boxShadow, scale: cs.scale };
};

// Everything that moves between the tile and the lightbox, animated as layout rather than as a
// transform.
//
// A transform FLIP was the obvious choice and it is the wrong one here. It animates the element
// as a flat picture: the padding and the corner radius jump to their lightbox values on the
// first frame and are then stretched by the scale, so the band of background around the artwork
// changes thickness the instant you click and the corners distort on the way. Animating the real
// properties costs a layout per frame — affordable, because the element is fixed and out of flow,
// so nothing else on the page is re-laid out with it.
const TWEENED = ["top", "left", "width", "height", "padding", "border-radius", "box-shadow", "scale"];

const tween = (el, ms) => {
    el.style.transition = TWEENED.map(prop => `${prop} ${ms}ms ease`).join(", ");
};

const settle = (el, geometry, look) => {
    el.style.top = `${geometry.top}px`;
    el.style.left = `${geometry.left}px`;
    el.style.width = `${geometry.width}px`;
    el.style.height = `${geometry.height}px`;
    el.style.padding = look.padding;
    el.style.borderRadius = look.radius;
    el.style.boxShadow = look.shadow;
    el.style.scale = look.scale;
};

// The card scales its image up 6% on hover. While the image is away on <body> that variable
// cannot reach it, and the scrim means the card is not hovered either — so the hover only
// asserts itself at the instant the image lands, springing it larger under a cursor that never
// moved. That is the jump.
//
// Asking whether the card is hovered at close time does not help: the scrim is still over it,
// so the answer is always no. Instead the card is marked on arrival and the hover is held off
// until the visitor actually moves the pointer, at which point growing is a response to them
// rather than something the close did on its own.
const holdHoverUntilPointerMoves = (card) => {

    if (!card) return;

    card.dataset.justReturned = "";

    const release = () => card.removeAttribute("data-just-returned");

    document.addEventListener("pointermove", release, { once: true });
    card.addEventListener("pointerleave", release, { once: true });
};

// Clicking a project lifts its image — frame, background and all — off the grid and shows it
// large over the page, on the same scrim the charms panel uses. The window itself is left alone:
// this is a lightbox over the page, not a view inside the window.
const showProject = (project) => {

    const frame = project.querySelector(".🎨lsdev-project__img-bg");

    if (!frame || projectDetailOpen) return;

    const first = frame.getBoundingClientRect();
    const tileLook = lookOf(frame);

    // Read here, off the card, because a moment from now the element has no width of its own to
    // measure the image against.
    const picture = frame.querySelector("img")?.getBoundingClientRect();
    const aspect = picture && picture.height ? picture.width / picture.height : 1.6;

    savedImgTile = first;
    savedImgLook = tileLook;
    imgHome = { parent: frame.parentNode, next: frame.nextSibling };
    projectDetailOpen = project;

    // Out of the window and onto <body>, so nothing the window does to its own transform or
    // overflow can reach it.
    document.body.appendChild(frame);
    frame.dataset.portaled = "";

    // The page is held still while it is up, which is also what keeps the tile rect above valid
    // for the close.
    document.body.style.overflow = "hidden";

    frame.style.transition = "none";
    frame.style.position = "fixed";

    // Decide how big the artwork should be, then wrap the band around it. The band is a share of
    // the finished frame, so frame = art + 2 x band x frame, which rearranges to the line below.
    let art = Math.min(window.innerWidth * LIGHTBOX_ART, LIGHTBOX_ART_MAX);
    let width = art / (1 - (2 * LIGHTBOX_BAND));
    let height = (2 * LIGHTBOX_BAND * width) + (art / aspect);

    // Every part of that is a multiple of the artwork's width, so a tall viewport is handled by
    // scaling the whole thing down by one factor rather than re-solving it.
    if (height > window.innerHeight * LIGHTBOX_HEIGHT) {

        const shrink = (window.innerHeight * LIGHTBOX_HEIGHT) / height;

        art *= shrink;
        width *= shrink;
        height *= shrink;
    }

    const target = {
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2
    };

    // Corners and shadow come from the stylesheet; the band is worked out above, so it overrides
    // whatever padding the lightbox rule happens to carry.
    const grownLook = lookOf(frame);

    grownLook.padding = `${LIGHTBOX_BAND * width}px`;

    // Back onto the tile — same place, same padding, same corners as the card it came from. All
    // of this is inside one task, so none of it is painted.
    settle(frame, first, tileLook);

    void frame.offsetWidth;

    useScrim("project", true);

    tween(frame, animationDuration);
    settle(frame, target, grownLook);

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
let savedImgTile = null; // the image's grid-tile rect at open, to animate back to
let savedImgLook = null; // its padding, corners and shadow there, to animate back to


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