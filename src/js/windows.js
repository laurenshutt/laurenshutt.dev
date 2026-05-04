import { 
    slideToggle,
} from "./utils.js";

const originalRects = new WeakMap();
const clones = new WeakMap();
const projectInfoModal = document.getElementById("project-info-modal");
const projectSecondaryImages = document.querySelectorAll(".project-secondary-image");
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
    const otherProjects = [...document.querySelectorAll(".🎨lsdev-projects__project:not(.is-filtered)")]
        .filter(el => el !== projectDetailOpen);

    projectName.style.display = "block";

    otherProjects.forEach(project => {
        project.style.display = "flex";
    });

    client.style.display = "";

    requestAnimationFrame(() => {

        const dy = originalRect.top - currentRect.top - 40;

        projectImg.style.width = "";
        projectImg.style.transform = `translate(0px, ${dy}px)`;
        projectImg.style.width = originalRect.width + "px";

        requestAnimationFrame(() => {
            projectImg.classList.remove("is-expanded");
            projectImg.style.position = "";
            projectImg.style.width = "";
            projectImg.style.transform = "";
            if (projectDetailOpen) {
                projectDetailOpen.style.display = "";
            }
        });
    });
    
    [projectInfoModal, ...projectSecondaryImages].forEach(el => {
        el && (el.style.display = "none");
        requestAnimationFrame(() => {
            el.classList.remove("fade-in");
        });
    });

    projectDetailOpen = null;
}
const closeWindow = (window) => window.classList.remove("is-open");
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
    
    const client = project.querySelector(".🎨lsdev-project_client-info");
    const projectName = project.querySelector("p");
    const projectImg = project.querySelector(".🎨lsdev-project_img-bg");
    const otherProjects = 
        [...document.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => el !== project);
    const clientNameStr = client.innerText;
    const projectNameStr = projectName.innerText;

    const text = `
        <p>Cursed vanquish fly charming evil golden princess fair princess hidden wise princess. Vanquish awaken spell wand steal shining crown curse hidden royal fairy. Crown sleeping sword sword goblin beast dance.</p>
        <p>Brave gentle magic golden king slipper forgotten enchant cursed hide defeat. Quest queen bewitched beast witch. Fearsome elf potion kingdom noble enchantment hide grant noble wise king. Silver steal break save cursed beast. Crown slipper dwarf protect fair haunted castle silver giant troll.</p>
        <p>Beast defeat magic bewitch trick knight save. Trick steal troll hidden gentle slipper royal sing sing discover goblin. Princess enchantment vanquish forgotten shining sing hide mythical cast.</p>
    `;

    projectDetailOpen = project;

    const originalRect = originalRects.get(project);

    projectImg.style.position = "fixed";
    projectImg.style.top = originalRect.top + "px";
    projectImg.style.left = originalRect.left + "px";
    projectImg.style.height = originalRect.height + "px";
    projectImg.style.width = originalRect.width + "px";

    const dy = 112 - originalRect.top;
    const dx = 29 - originalRect.left;

    requestAnimationFrame(() => {    
        [client, projectName, ...otherProjects].forEach(el => {
            el.style.display = "none";
        });
        projectImg.classList.add("is-expanded");
        projectImg.style.transition = "all .415s ease";
        projectImg.style.width = "calc((100vw + 104px)/2)";
        projectImg.style.height = "auto";
        projectImg.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    
    [projectInfoModal, ...projectSecondaryImages].forEach(el => {
        el && (el.style.display = "block");
        requestAnimationFrame(() => {
            el.classList.add("fade-in");
        });
    });

    projectInfoModal.innerHTML = `<h2>${projectNameStr}</h2>${text}`;
    projectSecondaryImages[0].innerHTML = `<img src="img/projects/carbon-colab-mobile.png"/>`;
    projectSecondaryImages[1].innerHTML = `<img src="img/projects/carbon-colab-tablet.png"/>`;
}
const shrinkMaximizedWindow = (window, minimizeClicked) => {
    
    const maxRect = window.getBoundingClientRect();
    const normalRect = originalRects.get(window);
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
            
            if (!originalRects.has(windowEl)) {
                originalRects.set(windowEl, originalRect);
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
        const originalRects = new Map();
            windows.forEach(window => {
                originalRects.set(window, window.getBoundingClientRect());
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

            const movedWindows = [];

            windows.forEach(window => {
                
                const currentRect = window.getBoundingClientRect();
                const originalRect = originalRects.get(window);

                if (!originalRect) return;

                const dy = originalRect.top - currentRect.top;
                
                if (dy === 0) return;

                window.style.transition = "none";
                window.style.willChange = "transform";
                window.style.transform = `translateY(${dy}px)`;                
                movedWindows.push(window);
            });

            movedWindows[0]?.offsetHeight;

            requestAnimationFrame(() => {
                movedWindows.forEach(window => {
                    window.style.transition = "transform 280ms cubic-bezier(0.2, 0, 0, 1)";
                    window.style.transform = "";
                });
            });

            // 5. CLEANUP
            setTimeout(() => {
                movedWindows.forEach(el => {
                    el.style.transition = "";
                });
            }, 400);
        }, 400);
    });
});