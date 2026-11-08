import { 
    delay,
    isMobileLayout,
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
    suggestIcebreaker
} from "./features/icebreakers.js";

import {
    charms
} from "./features/charms.js";

import {
    moveTitleIntoSidebar
} from "./effects/move-title.js";

import {
    collapseNavIntoHero
} from "./nav/mobile-nav.js";

import {
    tooltips
} from "./features/tooltips.js";

import {
    scrollProjects,
    filterProjects
} from "./features/projects.js";

import {
    toggleMusic
} from "./features/music.js";

import { 
    startTheClock
} from './hud/time.js';

import { 
    createMouseTracker
} from './hud/mouse-coords.js';

import {
    watchFooter
} from './effects/footer-observer.js';

import {
    weather
} from './hud/weather.js';

import {
    buttonPress
} from './utils.js';

import {
    contactForm
} from './contact-form.js';

import { initDom } from "./dom.js";
const dom = initDom();
const {windows} = dom;


export const animateSequence = async () => {


    const glitchOuter = document.querySelectorAll(".has-glitch");
    const glitchInner = document.querySelectorAll(".has-glitch span");
    const introTexts = document.querySelectorAll(".🎨lsdev-intro-text");
    const stage = document.getElementById("🫆lsdev-stage");
    const sidebarNav = document.getElementById("🫆lsdev-external-nav");
    const firstWindow = document.querySelector(".🎨lsdev-window");
    const firstWindowBody = document.querySelector(".🎨lsdev-window__body");
    const lastI = setElementIndices();

    let gridResizeTimer;


    createGrid();

    await Promise.all([
        glitchInner.forEach(function(el){
            shuffleTextEffect(el, 200, 30, 0.75)
        }),
        delay(2500)
    ]);
    
    window.addEventListener("resize", () => {
        clearTimeout(gridResizeTimer);
        gridResizeTimer = setTimeout(createGrid, 150);
    });

    weather();
    charms();
    suggestIcebreaker();
    tooltips();
    buttonPress();
    toggleMusic();

    // The stage has to be on screen before the title moves: its destination is inside the sidebar,
    // and a display:none ancestor measures as zero. Everything in here is still faded out at this
    // point, so revealing it early shows nothing.
    stage.style.display = "block";

    // Two halves of the same decision. Above the breakpoint the title retires into the sidebar
    // beside the nav; below it there is no sidebar to retire into, and the nav comes the other way
    // instead — into the hero, collapsed behind one control — so the title, intro and nav can be
    // centred together in the first viewport.
    if (!isMobileLayout()) moveTitleIntoSidebar(glitchOuter[0]);
    else collapseNavIntoHero();

    await delay(500);

    introTexts.forEach(function(el){
        el.dataset.animated = "";
    });

    await delay(500);

    sidebarNav.style.animation = "✨lsdev-fx-stretch-down 0.2s linear forwards";

    await delay(350);

    initNavAnimations(lastI);

    await delay (1400);
    
    requestAnimationFrame(() => {
        
        // Only the first window arrives with the intro. The rest keep the stylesheet's
        // opacity: 0 — they are in the layout, so the page is its full length and each has a
        // real position to be triggered on, but they are not on screen yet. Each one fades in
        // on its own as the visitor scrolls down to it; see arriveThenOpen in section-tracking.
        firstWindow.dataset.animation = "in";

        setTimeout(function(){
            
            slideToggle(firstWindowBody);
            
            firstWindow.dataset.open = "";
            firstWindow.dataset.animation = "none";

            scrollProjects();
            filterProjects();

            // Hand over once the first window has finished opening, not when it starts. Until
            // that slide ends, every window below is still most of a screen too high — and the
            // next one's turn comes when its title bar reaches the bottom of the viewport, a
            // position it would otherwise be sitting past before the visitor had moved at all.
            Promise.allSettled(firstWindowBody.getAnimations().map(a => a.finished))
                .then(() => document.body.removeAttribute("data-loading"));

        // The one window's fade with nothing staggered ahead of it, and a beat. This used to
        // wait out the whole queue; with only one arriving there is nothing to wait for.
        }, 250 + 100);

        sectionTrackingInit();
        startTheClock();
        createMouseTracker();
    });


    await delay(1200);

    //floatingSquares();

    //await delay(750);

    document.querySelector(".🎨lsdev-hud").dataset.animated = "";


    await delay(2500);
    

    const glitch = () => {

        let hasRunOnce = false;

        const triggerAnimation = () => {

            if (!hasRunOnce) {

                hasRunOnce = true;

                setTimeout(triggerAnimation, 1000);

                return;
            }
            
            // Run the animation on all elements with the "glitch" class.
            const elements = document.querySelectorAll(".has-glitch");
            
            elements.forEach(el => {
                el.style.setProperty("--lsdev-glitch-animation-state-before", "none"); // Reset animation
                el.style.setProperty("--lsdev-glitch-animation-state-after", "none");
                void el.offsetWidth; // Force reflow to restart animation
                el.style.setProperty("--lsdev-glitch-animation-state-before", "✨lsdev-fx-glitch-before 10s linear alternate-reverse");
                el.style.setProperty("--lsdev-glitch-animation-state-after", "✨lsdev-fx-glitch-after 9s linear alternate-reverse");
            });

            // Schedule the next animation
            setTimeout(triggerAnimation, 27500);
        };

        // Immediately invoke triggerAnimation; the first execution will simply schedule the animation.
        triggerAnimation();
        watchFooter();
    };

    if (!isMobileLayout()) glitch();

    loadingPhrases();
    
    await delay(3000);
};