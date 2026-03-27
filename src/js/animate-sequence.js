import {
    windows
} from "./dom.js";

import { 
    delay,
    slideToggle
} from './utils.js';

import { 
    createGrid,
    floatingSquares
} from './effects/background-effects.js';

import { 
    shuffleTextEffect,
    loadingPhrases
} from './effects/text-effects.js';

import {
    setElementIndices
} from "./init.js";

import {
    initNavAnimations
} from "./nav/nav-interactions.js";

import {
    sectionTrackingInit
} from "./nav/section-tracking.js";

import { 
    catbotButton
} from './features/catbotButton.js';


export const animateSequence = (async () => {

    const h1 = document.querySelector("h1");
    const h1Span = document.querySelector("h1 span");
    const stage = document.getElementById("🫆lsdev-stage");
    const sidebarNav = document.getElementById("🫆lsdev-sidebar-nav");
    const firstWindow = document.querySelector(".🎨lsdev-window");
    const firstWindowChrome = document.querySelector(".🎨lsdev-window__chrome");
    const lastI = setElementIndices();

    let gridResizeTimer;


    createGrid();

    await Promise.all([
        shuffleTextEffect(h1Span, 200, 30, 0.75),
        delay(2500)
    ]);
    
    window.addEventListener("resize", () => {
        clearTimeout(gridResizeTimer);
        gridResizeTimer = setTimeout(createGrid, 150);
    });

    h1.classList.add("moved");

    stage.style.display = "block";

    await delay(500);

    sidebarNav.style.animation = "✨lsdev-fx-stretch-down 0.2s linear forwards";

    await delay(350);

    initNavAnimations(lastI);

    await delay (1400);
    
    requestAnimationFrame(() => {
        
        Array.from(windows).forEach(window => {
            
            const chrome = window.querySelector(".🎨lsdev-window__chrome");
            const i = window.style.getPropertyValue("--i");

            window.classList.add("is-animated");                        
        });

        setTimeout(function(){
            slideToggle(firstWindowChrome);
            firstWindow.classList.add("is-animated", "is-open");
        }, 250 * windows.length + 100);

    });

    floatingSquares();

    await delay(2500);
    
    sectionTrackingInit();

    const glitch = (() => {

        let hasRunOnce = false;

        const triggerAnimation = () => {

            if (!hasRunOnce) {

                hasRunOnce = true;

                setTimeout(triggerAnimation, 1000);

                return;
            }
            
            // Run the animation on all elements with the "glitch" class.
            const elements = document.querySelectorAll(".✨lsdev-fx-glitch");
            
            elements.forEach(el => {
                el.style.setProperty("--💾lsdev-glitch-animation-state-before", "none"); // Reset animation
                el.style.setProperty("--💾lsdev-glitch-animation-state-after", "none");
                void el.offsetWidth; // Force reflow to restart animation
                el.style.setProperty("--💾lsdev-glitch-animation-state-before", "✨lsdev-fx-glitch-before 10s linear alternate-reverse");
                el.style.setProperty("--💾lsdev-glitch-animation-state-after", "✨lsdev-fx-glitch-after 9s linear alternate-reverse");
            });

            // Schedule the next animation
            setTimeout(triggerAnimation, 27500);
        };

        // Immediately invoke triggerAnimation; the first execution will simply schedule the animation.
        triggerAnimation();
    })();

    loadingPhrases();
    
    await delay(3000);

    catbotButton();
})();