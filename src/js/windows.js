import { 
    slideToggle,
} from "./utils.js";

const originalRects = new Map();
const originalWindowRects = new Map();
const clones = new WeakMap();
const projectInfoModal = document.getElementById("🫆lsdev-project-modal");
const projectSecondaryImages = document.querySelectorAll(".🎨lsdev-project-modal__secondary-image");
const animationDuration = 500;

const animateWindowToRect = (window, fromRect, toRect) => {
    setRectStyles(window, fromRect);
    window.style.position = "fixed";
    unmaximizeWindow(window);
    requestAnimationFrame(() => {
        setRectStyles(window, toRect);
    });
};
const clearRectStyles = (el) => {
    Object.assign(el.style, {
        top: "",
        left: "",
        width: "",
        height: ""
    });
};
const closeProjectDetail = (currentRect) => {

    const client = projectDetailOpen.querySelector(".🎨lsdev-project_client-info");
    const projectName = projectDetailOpen.querySelector("p");
    const projectImg = projectDetailOpen.querySelector(".🎨lsdev-project_img-bg");
    const originalRect = originalRects.get(projectDetailOpen);
    const card = projectDetailOpen;
    // Restore visibility on ALL other cards — symmetric with showProject(), which
    // hides every other card. Restoring a still-filtered (display:none) card is a
    // no-op, but it clears the stale inline visibility:hidden that otherwise shows
    // as a blank grid cell once a later filter reveals that card.
    const otherProjects = [...document.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => el !== projectDetailOpen);

    projectName.style.display = "block";

    setTimeout(function(){
        otherProjects.forEach(project => {
            [project, client, projectName].forEach(function(el){
                el.style.visibility = "";
            });
        });
    });


    client.style.visibility = "";

    requestAnimationFrame(() => {

        // --- reverse FLIP: animate the image from full-screen back onto its card ---
        const first = projectImg.getBoundingClientRect();

        // drop the expansion so it returns to its natural grid spot, and measure it
        projectImg.style.transition = "none";
        projectImg.classList.remove("is-expanded");
        projectImg.style.position = "";
        projectImg.style.top = "";
        projectImg.style.left = "";
        projectImg.style.width = "";
        projectImg.style.height = "";
        projectImg.style.transform = "none";
        projectImg.style.transformOrigin = "top left";

        // Pin the grid to the saved scroll across the whole close + un-maximize. The
        // window resize keeps nudging the scroll, so a single restore would land as a
        // jump at the end; re-applying it each frame keeps the content steady.
        const gridContainer = document.getElementById("🫆lsdev-projects__grid-container");
        if (gridContainer) {
            gridContainer.scrollTop = savedGridScroll;
            const pinUntil = performance.now() + 600;
            const pinScroll = () => {
                gridContainer.scrollTop = savedGridScroll;
                if (performance.now() < pinUntil) requestAnimationFrame(pinScroll);
            };
            requestAnimationFrame(pinScroll);
        }

        const last = projectImg.getBoundingClientRect();

        // invert to full-screen, then play the transform back to the grid
        const sx = (first.width / last.width) || 1;
        const sy = (first.height / last.height) || 1;
        projectImg.style.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${sx}, ${sy})`;
        projectImg.style.willChange = "transform";
        void projectImg.offsetWidth;
        projectImg.style.transition = "transform 0.5s ease";
        projectImg.style.transform = "none";

        // clean up the leftover transform once it's home
        setTimeout(() => {
            projectImg.style.transition = "";
            projectImg.style.transform = "";
            projectImg.style.transformOrigin = "";
            projectImg.style.willChange = "";
            if (card) card.style.display = "";
        }, 500);
    });
    
    [projectInfoModal, ...projectSecondaryImages].forEach(el => {
        el && (el.style.display = "none");
        requestAnimationFrame(() => {
            el.classList.remove("fade-in");
        });
    });

    projectDetailOpen = null;
    document.body.style.overflow = "";
}
export const closeWindow = (window) => window.classList.remove("is-open");

const createClone = (window) => {
    const clone = window.cloneNode(true)
    clone.classList.add("is-clone");
    window.after(clone);
    clones.set(window, clone);
}
const handleMinimizeDuringShrink = (window, chrome) => {
    closeWindow(window);
    slideToggle(chrome);
};
const maximizeWindow = (window) => window.classList.add("is-maximized");
const openWindow = (window) => window.classList.add("is-open");
const removeClone = (window) => {
    const clone = clones.get(window);
    clone?.remove();
    clones.delete(window);
};
const resetWindowStyles = (window) => {
    window.style.position = "";
    clearRectStyles(window);
};
const setRectStyles = (el, rect) => {
    Object.assign(el.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
    });
};
const showProject = (project) => {

    // Remember the grid's scroll so it can be restored after closing (the maximize
    // resizes the grid-container and drops its scrollTop).
    const gridContainer = document.getElementById("🫆lsdev-projects__grid-container");
    savedGridScroll = gridContainer ? gridContainer.scrollTop : 0;

    const content = document.getElementById("🫆lsdev-project-content--" + project.id.split("--")[1]);
    const client = project.querySelector(".🎨lsdev-project_client-info");
    const projectName = project.querySelector("p");
    const projectImg = project.querySelector(".🎨lsdev-project_img-bg");
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

    // --- FLIP: animate the image straight from its current grid spot to full-screen ---
    // The maximize sequence offsets the (position:relative) window via inline top/left
    // before is-maximized pins it, which shifts the image right at measure time. Undo that
    // shift using the card's pre-maximize rect so the animation starts from the real spot.
    const imgNow = projectImg.getBoundingClientRect();
    // Only correct while the window is mid-maximize (not yet pinned by is-maximized);
    // if it's already maximized there's no shift to undo.
    const shifting = !project.closest(".🎨lsdev-window")?.classList.contains("is-maximized");
    const cardOrig = originalRects.get(project) || originalRect;
    const shiftX = shifting ? originalRect.left - cardOrig.left : 0;
    const shiftY = shifting ? originalRect.top - cardOrig.top : 0;
    const first = {
        left: imgNow.left - shiftX,
        top: imgNow.top - shiftY,
        width: imgNow.width,
        height: imgNow.height,
    };

    // jump to the final expanded layout (no transition)
    projectImg.style.transition = "none";
    projectImg.style.transform = "none";
    projectImg.style.transformOrigin = "top left";
    projectImg.style.position = "fixed";
    projectImg.style.top = "112px";
    projectImg.style.left = "29px";
    projectImg.style.width = "calc((100vw + 104px)/2)";
    projectImg.style.height = "auto";
    projectImg.classList.add("is-expanded");

    // invert: place it visually back where it started
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
    
    [...projectSecondaryImages, projectInfoModal].forEach((el, index) => {
        
        if (!el) return;

        el.style.display = el === projectInfoModal ? "block" : "flex";

        let delay = 750;

        requestAnimationFrame(() => {
            el.style.transitionDelay = `${delay + (index * 250)}ms`;
            el.classList.add("fade-in");
        });
    });

    const role = `
        <div class="role">
            <h3>
                Role
            </h3>
            <p>
                Designer & developer
            </p>
            <h3 class="awards">
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
    content.style.display = "block";
    projectSecondaryImages[0].innerHTML = `<img src="img/projects/carbon-colab-mobile.png"/>`;
    projectSecondaryImages[1].innerHTML = role;
}
const shrinkMaximizedWindow = (window, minimizeClicked) => {
    
    const maxRect = window.getBoundingClientRect();
    const normalRect = originalWindowRects.get(window);
    const chrome = window.querySelector(".🎨lsdev-window__chrome");

    if (!normalRect) return;

    if (projectDetailOpen){
            const currentRect = projectDetailOpen.querySelector(".🎨lsdev-project_img-bg").getBoundingClientRect();

        closeProjectDetail(currentRect);
    }

    animateWindowToRect(window, maxRect, normalRect);

    if (minimizeClicked){
        setTimeout(() => {
            handleMinimizeDuringShrink(window, chrome);
        }, animationDuration - 50);
    }

    setTimeout(() => {
        removeClone(window);
        resetWindowStyles(window);
    }, animationDuration);
};
const unmaximizeWindow = (window) => window.classList.remove("is-maximized");

let projectDetailOpen = null;
let savedGridScroll = 0;


export const minimizeWindows = (() => {
    
    const minimizeButtons = document.querySelectorAll(".🎨lsdev-window__button--minimize");

    const minimizeButtonClick = (e) => {

        const button = e.currentTarget;
        const window = button.closest(".🎨lsdev-window"); 
        const chrome = window.querySelector(".🎨lsdev-window__chrome");
        const isMaximized = window.classList.contains("is-maximized"); 
 

        if (isMaximized){
            shrinkMaximizedWindow(window, true);
        }
        else {
            slideToggle(chrome);
            window.classList.toggle("is-open");
        }

        if (projectDetailOpen){
            const currentRect = projectDetailOpen.querySelector(".🎨lsdev-project_img-bg").getBoundingClientRect();
            closeProjectDetail(currentRect);
        }
    }

    minimizeButtons.forEach((button) => {
        button.addEventListener("click", minimizeButtonClick);
    });
})();

export const maximizeWindows = (() => {
    
    const maximizeButtons = document.querySelectorAll(".🎨lsdev-window__button--maximize");
    const projects = document.querySelectorAll(".🎨lsdev-projects__project");

    const maximizeButtonClick = (e, project) => {
        
        const button = e.currentTarget;
        const windowEl = button.closest(".🎨lsdev-window");
        const chrome = windowEl.querySelector(".🎨lsdev-window__chrome");
        const isMaximized = windowEl.classList.contains("is-maximized");
        const isOpen = windowEl.classList.contains("is-open");

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
                slideToggle(chrome, 100);
                openWindow(windowEl);
            }

            createClone(windowEl);
            setRectStyles(windowEl, originalRect);

            requestAnimationFrame(() => {
                maximizeWindow(windowEl);
                windowEl.style.display = "block";
            });
            
            if (project){
                showProject(project);
            }

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

document.querySelectorAll(".🎨lsdev-window__button--close").forEach(button => {
    
    button.addEventListener("click", e => {
        
        const windowToClose = button.closest(".🎨lsdev-window");
        const clone = clones.get(windowToClose);
        const windows = [...document.querySelectorAll(".🎨lsdev-window")]
                .filter(el => el !== windowToClose);
        
            windows.forEach(window => {
                originalWindowRects.set(window, window.getBoundingClientRect());
            });

        if (projectDetailOpen){
            const currentRect = projectDetailOpen.querySelector(".🎨lsdev-project_img-bg").getBoundingClientRect();
            closeProjectDetail(currentRect);
            shrinkMaximizedWindow(windowToClose);
            return;
        }

        windowToClose.classList.add("is-poofing");

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