import { 
    initDom
} from '../dom.js';

const dom = initDom();
const {mainNav, contactH2Span, contactEls} = dom;

import { 
    slideToggle
} from '../utils.js';

import { 
    shuffleTextEffect
} from '../effects/text-effects.js';

import { 
    moveCaret
} from './caret.js';

import {
    closeWindow
} from '../windows.js';

import {
    contactForm
} from "../contact-form.js";

import {
    setSize
} from "../utils.js";

import {
    initReviewsSlider
} from "../features/carousel.js";



const visibleSections = new Set();
const navMap = new Map();
const sectionTopCache = new Map();
const targets = [
    document.querySelector("#🫆lsdev-window--projects"),
    document.querySelector("#🫆lsdev-window--about"),
    document.querySelector("#🫆lsdev-window--reviews"),
    document.querySelector("#🫆lsdev-contact")
];
/*const initReviewsSlider = () => {

    const $slider = $("#🫆lsdev-reviews__carousel");
    const pauseBtn = document.getElementById("🫆lsdev-reviews-carousel__pause-button");
    let isPaused = false;

    $slider.slick({
        slidesToShow: 2,
        autoplay: true,
        autoplaySpeed: 7500,
        prevArrow: $('#🫆lsdev-reviews-carousel__prev-button'),
        nextArrow: $('#🫆lsdev-reviews-carousel__next-button')
    });

    pauseBtn.addEventListener("click",function(){
        
        pauseBtn.classList.toggle("is-paused");

        if (isPaused) {
            $slider.slick('slickPlay');
            $(this).text('Pause');
        } else {
            $slider.slick('slickPause');
            $(this).text('Play');
        }
        
        isPaused = !isPaused;
    });
}*/
const updateSectionCache = () => {
    targets.forEach(section => {
        if (section) {
            sectionTopCache.set(section, section.offsetTop);
        }
    });
};

updateSectionCache();

document.querySelectorAll('a[href^="#"]').forEach(a => {
    navMap.set(a.getAttribute("href").slice(1), a.closest("li"));
});
        
export const sectionObserver = new IntersectionObserver((entries) => {
    
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            visibleSections.add(entry.target);
        } else {
            visibleSections.delete(entry.target);
        }
    });

    if (!visibleSections.size) return;

    let bottomMost = null;
    let maxTop = -Infinity;

    visibleSections.forEach(section => {
        
        const top = sectionTopCache.get(section);

        if (top > maxTop) {
            maxTop = top;
            bottomMost = section;
        }
    });


    const li = navMap.get(bottomMost.id);

    moveCaret(li, true);
}, {
    threshold: .5
});

export const sectionTrackingInit = () => {

    const openWindow = (window, skipIsOpen) => {
        const chrome = window.querySelector(".🎨lsdev-window__chrome");
        !skipIsOpen && window.classList.add("is-open");
        slideToggle(chrome);
    }
    const reviews = document.getElementById("🫆lsdev-window--reviews")
    const reviewsChrome = reviews.querySelector(".🎨lsdev-window__chrome")
    const offset = window.innerHeight * 0.05;

    sectionObserver.observe(document.querySelector("#🫆lsdev-window--projects"));

    // The sections that actually reveal something, in order. Projects is deliberately absent: it
    // has no case below (the intro animation opens it), yet it used to take a turn in this
    // sequence and burn a whole gap before About was even watched.
    const revealTargets = targets.filter(Boolean).filter(el => el.id !== "🫆lsdev-window--projects");

    const REVEAL_GAP = 1250; // ms between reveals, so sections stagger instead of firing together

    const revealSection = (el) => {

        const li = mainNav.querySelector(`li:has(a[href="#${el.id}"])`);

        switch (el.id){

            case "🫆lsdev-window--about":

                // The carousel measures slide widths at init, so it needs layout. Give the reviews
                // chrome layout just long enough to initialise it — this is synchronous, so the
                // browser never paints the intermediate state and nothing flashes.
                reviewsChrome.style.display = "block";
                reviewsChrome.style.visibility = "hidden";
                initReviewsSlider();
                reviewsChrome.style.removeProperty("display");
                reviewsChrome.style.removeProperty("visibility");

                setTimeout(function(){
                    document.getElementById("🫆lsdev-window--reviews").style.opacity = "1";
                    openWindow(el);
                    moveCaret(li, true);
                    sectionObserver.observe(el);
                }, 250);
                break;

            case "🫆lsdev-window--reviews":

                setTimeout(function(){
                    openWindow(el);
                    moveCaret(li, true);
                    sectionObserver.observe(el);
                }, 250);
                break;

            case "🫆lsdev-contact":
                moveCaret(li, true);
                sectionObserver.observe(el);
                shuffleTextEffect(contactH2Span, 90, 45, 0.75);
                setTimeout(function(){
                    contactEls.forEach(function(contactEl){
                        contactEl.classList.add("is-animated");
                    });
                },2000);
                contactForm();
                setSize(document.querySelector("form"));
                break;
        }
    };

    // Sections reveal one at a time, in order, REVEAL_GAP apart. Each is only observed once its
    // turn comes, which matters twice over: an IntersectionObserver reports the element's current
    // state as soon as it is observed, so a section already scrolled past opens straight away
    // instead of waiting to cross the threshold again — and nothing can fire ahead of its turn.
    let currentIndex = 0;

    const observer = new IntersectionObserver((entries, obs) => {

        const entry = entries.find(e => e.isIntersecting);

        if (!entry) return;

        obs.unobserve(entry.target);
        revealSection(entry.target);

        setTimeout(() => {

            currentIndex++;

            if (currentIndex < revealTargets.length) obs.observe(revealTargets[currentIndex]);
            else obs.disconnect();
        }, REVEAL_GAP);
    }, {
        threshold: .5,
        rootMargin: `0px 0px -${offset}px 0px`
    });

    // Start the sequence on the first scroll. Every window is collapsed to its title bar on load,
    // so they can all be on screen at once — observing them before the visitor moves would fire
    // them immediately, and invisibly, since the reviews window is still at opacity 0 until the
    // About step restores it.
    window.addEventListener("scroll", () => {
        observer.observe(revealTargets[0]);
    }, { passive: true, once: true });
}