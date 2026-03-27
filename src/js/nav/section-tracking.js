import { 
    mainNav,
    contact,
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

    const observer = new IntersectionObserver(async (entries, obs) => {
        
        const entry = entries.find(e => e.isIntersecting);

        if (!entry) return;

        const el = entry.target;
        const li = mainNav.querySelector(`li:has(a[href="#${el.id}"])`);
        
        const openWindow = (window) => {
            
            const chrome = window.querySelector(".🎨lsdev-window__chrome");
            
            window.classList.add("is-open");
            
            slideToggle(chrome);
        }

        switch (el.id){
            
            case "🫆lsdev-window--about":
                setTimeout(function(){
                    openWindow(el);
                    moveCaret(li, true);
                    sectionObserver.observe(el);
                }, 500);
                break;
            
            case "🫆lsdev-window--reviews":
                setTimeout(function(){
                    openWindow(el);
                    initReviewsSlider();
                    moveCaret(li, true);
                    sectionObserver.observe(el);
                }, 500);
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