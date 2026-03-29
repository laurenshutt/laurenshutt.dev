import { 
    slideToggle,
    delay
} from "./utils.js";

const originalRects = new WeakMap();

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
    }

    minimizeButtons.forEach((button) => {
        button.addEventListener("click", minimizeButtonClick);
    });
})();

export const maximizeWindows = (() => {
    
    const maximizeButtons = document.querySelectorAll(".🎨lsdev-window__button--maximize");

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

    const maximizeButtonClick = (e) => {
        
        const button = e.currentTarget;
        const windowEl = button.closest(".🎨lsdev-window");
        const isMaximized = windowEl.classList.contains("is-maximized");
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

            return;
        }

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
    };

    maximizeButtons.forEach((button) => {
        button.addEventListener("click", maximizeButtonClick);
    });
})();