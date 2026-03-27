import { 
    mainNav,
    contactH2Span,
    contactEls
} from '../dom.js';

import { 
    slideToggle
} from '../utils.js';

import { 
    shuffleTextEffect
} from '../effects/text-effects.js';

import { 
    moveCaret
} from './caret.js';

const visibleSections = new Set();

const initReviewsSlider = () => {
    $("#🫆lsdev-reviews__carousel").slick({
        slidesToShow: 2,
        arrows:false
    });
}
        
export const sectionObserver = new IntersectionObserver((entries) => {
    
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            visibleSections.add(entry.target);
        } else {
            visibleSections.delete(entry.target);
        }
    });

    if (!visibleSections.size) return;

    const bottomMost = [...visibleSections].sort((a, b) => {
        return b.getBoundingClientRect().top - a.getBoundingClientRect().top;
    })[0];

    const li = mainNav.querySelector(`li:has(a[href="#${bottomMost.id}"])`);

    moveCaret(li, true);
}, {
    threshold: 0.5
});

export const sectionTrackingInit = () => {

    const targets = [
        document.querySelector("#🫆lsdev-window--about"),
        document.querySelector("#🫆lsdev-window--reviews"),
        document.querySelector("#🫆lsdev-contact")
    ];
    const offset = window.innerHeight * 0.05;

    let currentIndex = 0;

    sectionObserver.observe(document.querySelector("#🫆lsdev-window--projects"));

    const observer = new IntersectionObserver(async (entries, obs) => {
        
        const entry = entries.find(e => e.isIntersecting);

        if (!entry) return;

        const el = entry.target;
        const li = mainNav.querySelector(`li:has(a[href="#${el.id}"])`);
        
        const openWindow = (window, skipIsOpen) => {
            
            const chrome = window.querySelector(".🎨lsdev-window__chrome");
            
            !skipIsOpen && window.classList.add("is-open");
            
            slideToggle(chrome);
        }

        switch (el.id){
            
            case "🫆lsdev-window--about":
                setTimeout(function(){
                    openWindow(el);
                    moveCaret(li, true);
                    sectionObserver.observe(el);
                }, 100);
                break;
            
            case "🫆lsdev-window--reviews":

                const nav = el.querySelector(".🎨lsdev-window__menu");
                const windowContent = el.querySelector(".🎨lsdev-window__content");
                const carousel = windowContent.querySelector(".🎨lsdev-reviews__carousel");
                const paddingY = 60;
                const bottomBorderDelay = 500;
                const finalizeOpen = () => {
                    
                    const carouselHeight = carousel.getBoundingClientRect().height;
                    
                    windowContent.style.height = `${Math.ceil(carouselHeight + paddingY * 2)}px`;
                    nav.classList.add("is-initialized");

                    setTimeout(() => {
                        el.classList.add("is-open");
                    }, bottomBorderDelay);
                };

                openWindow(el, true);
                moveCaret(li, true);
                
                sectionObserver.observe(el);

                $(carousel).on("init", finalizeOpen);

                initReviewsSlider();

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
        threshold: 1,
        rootMargin: `0px 0px -${offset}px 0px`
    });

    observer.observe(targets[0]);
}