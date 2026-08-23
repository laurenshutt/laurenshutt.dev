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

    const $slider = $("#🫆lsdev-reviews-carousel__track");
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
        
        pauseBtn.toggleAttribute("data-paused");

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
        
// True while the page sits at its very top or very bottom, where the caret is pinned to Work
// Portfolio / Contact Me instead (see pinCaretAtEdges). Visible sections are still tracked while
// pinned so the caret lands on the right one the moment the page leaves the extreme.
let caretPinned = false;

export const sectionObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            visibleSections.add(entry.target);
        } else {
            visibleSections.delete(entry.target);
        }
    });

    if (caretPinned) return;

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
        const windowBody = window.querySelector(".🎨lsdev-window__body");
        !skipIsOpen && window.toggleAttribute("data-open", true);
        slideToggle(windowBody);
    }
    const reviews = document.getElementById("🫆lsdev-window--reviews")
    const reviewsBody = reviews.querySelector(".🎨lsdev-window__body")
    const offset = window.innerHeight * 0.05;

    sectionObserver.observe(document.querySelector("#🫆lsdev-window--projects"));

    // The sections that actually reveal something, in order. Projects is deliberately absent: it
    // has no case below (the intro animation opens it), yet it used to take a turn in this
    // sequence and burn a whole gap before About was even watched.
    const revealTargets = targets.filter(Boolean).filter(el => el.id !== "🫆lsdev-window--projects");

    // Hold the footer out of the flow until every section has revealed. On a fast scroll the
    // visitor can reach the bottom before a window has opened, and the footer is then shoved down
    // as it does. Deferred, it simply appears below them once everything has settled. The attribute
    // is set from JS so the footer is never hidden for anyone without scripting.
    const footer = document.querySelector("footer");

    if (footer) footer.dataset.deferred = "";

    const REVEAL_GAP = 1250; // ms between reveals, so sections stagger instead of firing together

    const revealSection = (el) => {

        const li = mainNav.querySelector(`li:has(a[href="#${el.id}"])`);

        switch (el.id){

            case "🫆lsdev-window--about":

                // The carousel measures slide widths at init, so it needs layout. Give the reviews
                // body layout just long enough to initialise it — this is synchronous, so the
                // browser never paints the intermediate state and nothing flashes.
                reviewsBody.style.display = "block";
                reviewsBody.style.visibility = "hidden";
                initReviewsSlider();
                reviewsBody.style.removeProperty("display");
                reviewsBody.style.removeProperty("visibility");

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
                        contactEl.dataset.animated = "";
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

        // A section is due when it scrolls into view — or when the visitor has already gone clean
        // past it. On a fast scroll it can be above the viewport by the time its turn arrives, and
        // it would then never intersect again, stalling the sequence and everything behind it.
        const entry = entries.find(e => e.isIntersecting)
            || entries.find(e => e.boundingClientRect.bottom <= 0);

        if (!entry) return;

        obs.unobserve(entry.target);
        revealSection(entry.target);

        setTimeout(() => {

            currentIndex++;

            if (currentIndex < revealTargets.length) obs.observe(revealTargets[currentIndex]);
            else {
                obs.disconnect();
                footer?.removeAttribute("data-deferred");
            }
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

    // Pin the caret at the page extremes. sectionObserver highlights the bottom-most section that
    // is at least a quarter visible, so at the foot of the page a tall About still in view can
    // outrank Contact — and Contact may never register at all, since a section more than twice the
    // viewport tall can never reach that observer's 50% threshold.
    const topLi = mainNav.querySelector('li:has(a[href="#🫆lsdev-window--projects"])');
    const bottomLi = mainNav.querySelector('li:has(a[href="#🫆lsdev-contact"])');

    let pinnedLi = null;

    const pinCaretAtEdges = () => {

        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const atTop = window.scrollY <= 10;
        // Guard on `scrollable` so a page too short to scroll counts as the top, not the bottom.
        const atBottom = scrollable > 10 && window.scrollY >= scrollable - 10;
        const li = atBottom ? bottomLi : atTop ? topLi : null;

        caretPinned = !!li;

        if (li === pinnedLi) return;

        pinnedLi = li;

        if (li) moveCaret(li, true);
    };

    // Throttle to one check per frame: reading scrollHeight forces a layout, and this runs on
    // every scroll event.
    let ticking = false;

    const queueEdgeCheck = () => {

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            ticking = false;
            pinCaretAtEdges();
        });
    };

    window.addEventListener("scroll", queueEdgeCheck, { passive: true });
    window.addEventListener("resize", queueEdgeCheck, { passive: true });

    pinCaretAtEdges();
}