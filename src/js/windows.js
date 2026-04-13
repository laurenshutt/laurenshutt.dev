import { 
    slideToggle,
} from "./utils.js";

const originalRects = new WeakMap();
const projectInfoModal = document.getElementById("project-info-modal");
const projectSecondaryImages = document.querySelectorAll(".project-secondary-image");

let isMaximized = null;
let projectDetailOpen = null;

const setRectStyles = (el, rect) => {
    Object.assign(el.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
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
const closeProjectDetail = () => {

    const client = projectDetailOpen.querySelector(".🎨lsdev-project_client-info");
    const projectName = projectDetailOpen.querySelector("p");
    const projectImg = projectDetailOpen.querySelector(".🎨lsdev-project_img-bg");
    const otherProjects = [...document.querySelectorAll(".🎨lsdev-projects__project")]
        .filter(el => el !== projectDetailOpen);

    projectName.style.display = "block";

    otherProjects.forEach(project => {
        project.style.display = "flex";
    });

    client.style.display = "";
    projectImg.classList.remove("is-expanded");

    [projectInfoModal, ...projectSecondaryImages].forEach(el => {
        el && (el.style.display = "none");
        requestAnimationFrame(() => {
            el.classList.remove("fade-in");
        });
    });

    projectDetailOpen = null;
}

export const minimizeWindows = (() => {
    
    const minimizeButtons = document.querySelectorAll(".🎨lsdev-window__button--minimize");

    const minimizeButtonClick = (e) => {

        const button = e.currentTarget;
        const window = button.closest(".🎨lsdev-window");
        const chrome = window.querySelector(".🎨lsdev-window__chrome");
        const clone = document.querySelector(".is-clone");

        clone && clone.remove();

        slideToggle(chrome);

        window.classList.remove("is-maximized");
        window.classList.toggle("is-open");

        Object.assign(window.style, {
            top: "",
            left: "",
            width: "",
            height: ""
        });

        if (projectDetailOpen){
            closeProjectDetail();
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

        if (projectDetailOpen) return;
        
        const button = e.currentTarget;
        const windowEl = button.closest(".🎨lsdev-window");
        isMaximized = windowEl.classList.contains("is-maximized");
        const isOpen = windowEl.classList.contains("is-open");

        if (!isMaximized) {
            
            const originalRect = windowEl.getBoundingClientRect();
            originalRects.set(windowEl, originalRect);

            if (!isOpen) {
                
                const chrome = windowEl.querySelector(".🎨lsdev-window__chrome");

                setRectStyles(windowEl, originalRect);
                slideToggle(chrome, 100);
                windowEl.classList.add("is-open");

                const clone = windowEl.cloneNode(true)
                clone.classList.add("is-clone");
                windowEl.after(clone);
                windowEl._clone = clone;

                requestAnimationFrame(() => {
                    windowEl.classList.add("is-maximized");
                    windowEl.style.display = "block";
                });
            }

            else {

                const clone = windowEl.cloneNode(true)
                clone.classList.add("is-clone");
                windowEl.after(clone);
                windowEl._clone = clone;

                setRectStyles(windowEl, originalRect);

                requestAnimationFrame(() => {
                    windowEl.classList.add("is-maximized");
                    windowEl.style.display = "block";
                });
            }

            if (project){

                const client = project.querySelector(".🎨lsdev-project_client-info");
                const projectName = project.querySelector("p");
                const projectImg = project.querySelector(".🎨lsdev-project_img-bg");
                const otherProjects = [...document.querySelectorAll(".🎨lsdev-projects__project")]
                    .filter(el => el !== project);
                const clientNameStr = client.innerText;
                const projectNameStr = projectName.innerText;

                const text = 
                    `<p>Cursed vanquish fly charming evil golden princess fair princess hidden wise princess. Vanquish awaken spell wand steal shining crown curse hidden royal fairy. Crown sleeping sword sword goblin beast dance.</p>
                    <p>Brave gentle magic golden king slipper forgotten enchant cursed hide defeat. Quest queen bewitched beast witch. Fearsome elf potion kingdom noble enchantment hide grant noble wise king. Silver steal break save cursed beast. Crown slipper dwarf protect fair haunted castle silver giant troll.</p>
                    <p>Beast defeat magic bewitch trick knight save. Trick steal troll hidden gentle slipper royal sing sing discover goblin. Princess enchantment vanquish forgotten shining sing hide mythical cast.</p>`;

                projectDetailOpen = project;
                    
                [client, projectName, ...otherProjects].forEach(el => {
                    el.style.display = "none";
                });

                projectImg.classList.add("is-expanded");
                
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

            return;
        }

        else {

            const originalRect = originalRects.get(windowEl);
            
            if (!originalRect) return;

            const clone = windowEl._clone;
            const maxRect = windowEl.getBoundingClientRect();

            if (projectDetailOpen){
                closeProjectDetail();
            }

            setRectStyles(windowEl, maxRect);
            windowEl.style.position = "fixed";
            windowEl.classList.remove("is-maximized");

            requestAnimationFrame(() => {
                
                setRectStyles(windowEl, originalRect);

                setTimeout(() => {
                    clone?.remove();
                    windowEl.style.position = "";
                    clearRectStyles(windowEl);
                    delete windowEl._clone;
                }, 200);
            });
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

        console.log("clicked");
        console.log(isMaximized);
        
        if (projectDetailOpen){

            const windowEl = button.closest(".🎨lsdev-window");
            const originalRect = originalRects.get(windowEl);
            
            if (!originalRect) return;

            const clone = windowEl._clone;
            const maxRect = windowEl.getBoundingClientRect();

            setRectStyles(windowEl, maxRect);

            windowEl.style.position = "fixed";
            windowEl.classList.remove("is-maximized");

            requestAnimationFrame(() => {
                
                setRectStyles(windowEl, originalRect);

                setTimeout(() => {
                    clone?.remove();
                    windowEl.style.position = "";
                    clearRectStyles(windowEl);
                    delete windowEl._clone;
                }, 200);
            });

            closeProjectDetail();
        }
        else if (isMaximized) {
            console.log("maximized window should close");
        }
    });
})