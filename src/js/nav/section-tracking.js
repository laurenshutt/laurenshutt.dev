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

    let currentIndex = 0;
    let userHasScrolled = false;

    sectionObserver.observe(document.querySelector("#🫆lsdev-window--projects"));

    window.addEventListener("scroll", () => {
        userHasScrolled = true;
    }, { passive: true, once: true });

    const observer = new IntersectionObserver(async (entries, obs) => {
        
        const entry = entries.find(e => e.isIntersecting);

        if (!entry) return;

        const el = entry.target;
        const li = mainNav.querySelector(`li:has(a[href="#${el.id}"])`);

        switch (el.id){
            
            case "🫆lsdev-window--about":

                if (!userHasScrolled) return;

                // Slick measures slide widths at init, so the carousel needs layout. Give the
                // reviews chrome layout just long enough to initialise it — this is synchronous,
                // so the browser never paints the intermediate state and nothing flashes. It used
                // to slideToggle the window open and straight back closed, which only stayed
                // invisible while the slide-down was silently snapping; once the open actually
                // animated, that hack became a visible open-then-close.
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
            
        obs.unobserve(entry.target);
        
        setTimeout(function(){

            currentIndex++;

            if (currentIndex < targets.length) {
                obs.observe(targets[currentIndex]);
            } 
            else {
                obs.disconnect();
            }
        },1250);
    }, {
        threshold: .5,
        rootMargin: `0px 0px -${offset}px 0px`
    });

    observer.observe(targets[0]);
}