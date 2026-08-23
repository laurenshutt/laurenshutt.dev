import { 
    slideToggle,
} from "./utils.js";

const originalRects = new Map();
const originalWindowRects = new Map();
const clones = new WeakMap();
const projectInfoModal = document.getElementById("🫆lsdev-project-modal");
// The two fixed panels beside the modal. They hold the secondary image and the role text — the
// __secondary-image class itself belongs to the <img> that goes inside one of them.
const projectSecondaryPanels = document.querySelectorAll(".🎨lsdev-project-modal__secondary-image-container");
const animationDuration = 500;
const BASE_TRANSFORM = "translateY(0px)"; // window's RESTING transform: the intro fade-in-down ends at translateY(0) with fill-mode:forwards, overriding the -10px CSS base
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
    windowEl.style.transition = `transform ${animationDuration}ms cubic-bezier(.22, 1, .36, 1)`;
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
const closeProjectDetail = () => {

    const card = projectDetailOpen;
    // Its image FLIPs back on its own path, so exempt this card from the slide-in cascade. Drop
    // the marker per-card just after the reveal has read it (it runs at animationDuration), so
    // overlapping open/close operations can't strip each other's exemption.
    card.dataset.flipLanded = "";
    setTimeout(() => card.removeAttribute("data-flip-landed"), animationDuration + 80);
    const client = card.querySelector(".🎨lsdev-project__client-info");
    const projectName = card.querySelector("p");

    // The image is still portaled to <body> from the open. Keep it there so the window's
    // transform FLIP (in shrinkMaximizedWindow) can't affect it, FLIP it independently back
    // onto its grid tile, then reparent it home at the end.
    const projectImg = document.querySelector(".🎨lsdev-project__img-bg[data-portaled]");

    // Restore visibility on ALL other cards — symmetric with showProject(), which hides every
    // other card. Restoring a still-filtered (display:none) card is a no-op, but it clears the
    // stale inline visibility:hidden that would otherwise show as a blank cell after a filter.
    const otherProjects = [...document.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => el !== card);

    projectName.style.display = "block";
    client.style.visibility = "";
    setTimeout(() => {
        otherProjects.forEach(p => [p, client, projectName].forEach(el => el.style.visibility = ""));
    });

    // Pin the grid to the saved scroll across the close. The un-maximize keeps nudging the
    // scroll, so re-apply it each frame; this also keeps the card (which the image reparents
    // into) exactly where the FLIP lands.
    const gridContainer = document.getElementById("🫆lsdev-projects__grid-container");
    if (gridContainer) {
        // Restore the grid scroll just twice instead of every frame for 600ms (that forced a
        // layout + fired scroll listeners each frame, stealing frames from the close). The FLIP
        // is transform-only, so layout only shifts twice: when the window un-maximizes (next
        // frame) and when the image reparents (the cleanup timeout below).
        gridContainer.scrollTop = savedGridScroll;
        requestAnimationFrame(() => { gridContainer.scrollTop = savedGridScroll; });
    }

    if (projectImg && savedImgTile) {
        // reverse FLIP in the overlay: from full-screen expanded back onto the tile
        const firstNow = projectImg.getBoundingClientRect();
        projectImg.style.transition = "none";
        projectImg.style.transform = "none";
        projectImg.style.top = `${savedImgTile.top}px`;
        projectImg.style.left = `${savedImgTile.left}px`;
        projectImg.style.width = `${savedImgTile.width}px`;
        projectImg.style.height = `${savedImgTile.height}px`;
        const lastNow = projectImg.getBoundingClientRect();
        const sx = (firstNow.width / lastNow.width) || 1;
        const sy = (firstNow.height / lastNow.height) || 1;
        projectImg.style.transformOrigin = "top left";
        projectImg.style.transform = `translate(${firstNow.left - lastNow.left}px, ${firstNow.top - lastNow.top}px) scale(${sx}, ${sy})`;
        projectImg.style.willChange = "transform";
        void projectImg.offsetWidth;
        projectImg.style.transition = "transform 0.5s ease";
        projectImg.style.transform = "none";

        // reparent home and strip every portal/FLIP inline style once it's back on its tile
        setTimeout(() => {
            if (imgHome) imgHome.parent.insertBefore(projectImg, imgHome.next);
            projectImg.removeAttribute("data-portaled");
            projectImg.style.cssText = "";
            // reparenting re-grows the card, nudging the grid scroll — re-pin once
            if (gridContainer) gridContainer.scrollTop = savedGridScroll;
        }, animationDuration);
    }

    [projectInfoModal, ...projectSecondaryPanels].forEach(el => {
        el && (el.style.display = "none");
        requestAnimationFrame(() => {
            el.removeAttribute("data-faded-in");
        });
    });

    projectDetailOpen = null;
    document.body.style.overflow = "";
}
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
const showProject = (project) => {

    // Remember the grid's scroll so it can be restored after closing (the maximize
    // resizes the grid-container and drops its scrollTop).
    const gridContainer = document.getElementById("🫆lsdev-projects__grid-container");
    savedGridScroll = gridContainer ? gridContainer.scrollTop : 0;

    const content = document.getElementById("🫆lsdev-project-content--" + project.id.split("--")[1]);
    const client = project.querySelector(".🎨lsdev-project__client-info");
    const projectName = project.querySelector("p");
    const projectImg = project.querySelector(".🎨lsdev-project__img-bg");
    const otherProjects = 
        [...document.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => el !== project);
    const clientNameStr = client.innerText;
    const projectNameStr = projectName.innerText;
    const originalRect = project.getBoundingClientRect();
            
    if (!originalRects.has(project)) {
        originalRects.set(project, originalRect);
    }

    document.body.style.overflow = "hidden";

    projectDetailOpen = project;

    // --- FLIP: portal the image to <body>, then scale it from its tile to full-screen ---
    // showProject runs BEFORE the window's transform FLIP, so the image is measured at its
    // real tile position (no maximize shift to undo). Moving it out of the window keeps the
    // window's transform from affecting it.
    // Measure the inner <img> (the actual screenshot), not the padded .img-bg frame. The
    // portaled image is full-bleed (padding:0), so targeting the frame's rect would land the
    // screenshot oversized and make it "pop" smaller when it reparents into the padded card
    // tile. Targeting the screenshot's own rect keeps it the same size through the reparent.
    const tileImg = projectImg.querySelector("img");
    const first = (tileImg || projectImg).getBoundingClientRect();
    savedImgTile = first; // remember the tile rect so the close can FLIP straight back to it
    imgHome = { parent: projectImg.parentNode, next: projectImg.nextSibling };
    document.body.appendChild(projectImg);
    projectImg.dataset.portaled = "";

    // jump to the final expanded layout (no transition)
    projectImg.style.transition = "none";
    projectImg.style.transform = "none";
    projectImg.style.transformOrigin = "top left";
    projectImg.style.position = "fixed";
    projectImg.style.top = "112px";
    projectImg.style.left = "29px";
    projectImg.style.width = "calc((100vw + 104px)/2)";
    projectImg.style.height = "auto";

    // invert: place it visually back on its tile
    const last = projectImg.getBoundingClientRect();
    const sx = (first.width / last.width) || 1;
    const sy = (first.height / last.height) || 1;
    projectImg.style.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${sx}, ${sy})`;

    [client, projectName, ...otherProjects].forEach(el => {
        el.style.visibility = "hidden";
    });

    // play: animate the transform away → one clean scale + move
    projectImg.style.willChange = "transform";
    void projectImg.offsetWidth;
    projectImg.style.transition = "transform 0.5s ease";
    projectImg.style.transform = "none";
    setTimeout(() => { projectImg.style.willChange = ""; }, 500);
    
    [...projectSecondaryPanels, projectInfoModal].forEach((el, index) => {
        
        if (!el) return;

        el.style.display = el === projectInfoModal ? "block" : "flex";

        let delay = 750;

        requestAnimationFrame(() => {
            el.style.transitionDelay = `${delay + (index * 250)}ms`;
            el.dataset.fadedIn = "";
        });
    });

    const role = `
        <div class="🎨lsdev-project-modal__secondary-info">
            <h3 class="🎨lsdev-project-modal__subheading">
                Role
            </h3>
            <p>
                Designer & developer
            </p>
            <h3 class="🎨lsdev-project-modal__subheading">
                Awards
            </h3>
            <p>
                Gold ADDY® American Advertising Award: Cross Platform
            </p>
            <h3>
                Technologies
            </h3>
            <p>
                Adobe Experience Manager, HTML, CSS, JavaScript, jQuery, Vanilla JSU Parallax, Parallax.js
            </p>
        </div>
    `;
    document.querySelectorAll("[id*='🫆lsdev-project-content'").forEach(function(content){
        content.style.display = "none";
    });
    // Projects without an authored write-up (07+) have no content div — guard so the
    // maximize still runs instead of throwing and leaving the window un-maximized.
    if (content) content.style.display = "block";
    projectSecondaryPanels[0].innerHTML = `<img class="🎨lsdev-project-modal__secondary-image" src="img/projects/carbon-colab-mobile.png"/>`;
    projectSecondaryPanels[1].innerHTML = role;
}
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
let savedGridScroll = 0;
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

    const maximizeButtonClick = (e, project) => {
        
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

            if (project){
                const projectRect = project.getBoundingClientRect();
                originalRects.set(project, projectRect);
            }

            if (!isOpen) {
                slideToggle(windowBody, 100);
                openWindow(windowEl);
            }

            createClone(windowEl);
            windowEl.style.display = "block";

            // For a project, showProject portals its image out of the window FIRST, so the
            // window's transform FLIP below can't affect it. Then both animate independently.
            if (project) {
                showProject(project);
            }
            flipWindow(windowEl, true);

            return;
        }

        else {
            if (!project){
                shrinkMaximizedWindow(windowEl);
            }
            else {
                showProject(project);
            }
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        
        maximizeButtons.forEach(el => {
            el.addEventListener("click", e => maximizeButtonClick(e));
        });

        projects.forEach(el => {
            el.addEventListener("click", e => maximizeButtonClick(e, el));
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
            shrinkMaximizedWindow(windowToClose);
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