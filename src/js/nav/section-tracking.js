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

        // slideToggle is a toggle, so calling this on a window that is already open slides it
        // shut again. Opening has to be idempotent: a second call reaching the same window shows
        // up as it snapping open, closing, and reopening — the first slide is cancelled mid-flight
        // by the second call, which is why the snap looks instant rather than animated.
        // Guard on the body's computed display, because that is the exact thing slideToggle
        // branches on; the maximize button already takes the same precaution before calling it.
        if (getComputedStyle(windowBody).display !== "none") return;

        !skipIsOpen && window.toggleAttribute("data-open", true);
        slideToggle(windowBody);
    }
    const reviews = document.getElementById("🫆lsdev-window--reviews")
    const reviewsBody = reviews.querySelector(".🎨lsdev-window__body")

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

    const REVEAL_GAP = 600;  // ms of cooldown before the next section starts watching
    const FADE_MS = 250;     // the window fade-in in the stylesheet, [data-animation="in"]
    const SLIDE_MS = 500;    // slideToggle's own default, so how long the window takes to open

    // What `win` will measure once it is open, worked out while it is still shut.
    //
    // The body is given layout, but collapsed and clipped, never at its full size: a window left
    // momentarily full-height and in flow is the one thing here that could look like it opened,
    // shut and opened again. The height comes in two parts instead — the window's own chrome
    // with the body at zero, plus what the body's content would need — which costs nothing and
    // removes the risk. Transitions are off for the measurement because the open state adds
    // padding-bottom over .25s, and reading the box the instant data-open goes on would miss it.
    const openHeightOf = (win) => {

        const body = win.querySelector(".🎨lsdev-window__body");

        if (!body || getComputedStyle(body).display !== "none") {
            return win.getBoundingClientRect().height;
        }

        const wasOpen = win.hasAttribute("data-open");

        win.style.transition = "none";

        body.style.display = "block";
        body.style.visibility = "hidden";
        body.style.overflow = "hidden";
        body.style.height = "0px";

        win.toggleAttribute("data-open", true);

        const height = win.getBoundingClientRect().height + body.scrollHeight;

        if (!wasOpen) win.removeAttribute("data-open");

        body.style.removeProperty("display");
        body.style.removeProperty("visibility");
        body.style.removeProperty("overflow");
        body.style.removeProperty("height");
        win.style.removeProperty("transition");

        return height;
    };

    // Hold the page exactly where it is, and hand back a way to let it go.
    //
    // Nothing is scrolled: a window's turn comes at the position that already centres it, so the
    // page is in the right place the moment the lock goes on and only has to be kept there. That
    // is the whole reason this can be a lock rather than a lock and a glide, and why there is
    // nothing here for an in-flight fling to pull against.
    //
    // Refusing the gestures rather than setting overflow:hidden on the body: that would take the
    // scrollbar out of the layout and shift the page sideways anywhere without overlay
    // scrollbars. Anything that still gets through is put back by the scroll listener.
    const holdScroll = (targetY) => {

        const limit = () => document.documentElement.scrollHeight - window.innerHeight;

        // Where the page is being held. Usually that is simply where it already is, because a
        // window's turn comes at the position that centres it — but the last window sits close
        // enough to the bottom that the page is not yet long enough to reach that position, and
        // the room only appears as the window itself opens. So the pin follows the space as it
        // arrives rather than being fixed: a short, downward drift of a few dozen pixels in the
        // one case that needs it, and no movement at all in every other.
        let pinned = Math.round(Math.min(targetY, limit()));
        let held = true;

        const keep = () => {

            if (!held) return;

            const want = Math.round(Math.min(targetY, limit()));

            if (want !== pinned || Math.round(window.scrollY) !== pinned) {
                pinned = want;
                window.scrollTo(0, pinned);
            }

            requestAnimationFrame(keep);
        };

        requestAnimationFrame(keep);

        const refuse = (e) => e.preventDefault();

        const restore = () => {
            if (Math.round(window.scrollY) !== pinned) window.scrollTo(0, pinned);
        };

        // The keys that scroll, unless the visitor is typing: a lock that ate a space bar would
        // be worse than one that let a keypress through, and `restore` catches it either way.
        const SCROLLS = [" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"];

        const refuseKey = (e) => {
            if (!SCROLLS.includes(e.key)) return;
            if (e.target?.closest?.("input, textarea, select, [contenteditable]")) return;
            e.preventDefault();
        };

        window.addEventListener("wheel", refuse, { passive: false });
        window.addEventListener("touchmove", refuse, { passive: false });
        window.addEventListener("keydown", refuseKey, { passive: false });
        window.addEventListener("scroll", restore, { passive: true });

        return () => {
            held = false;
            window.removeEventListener("wheel", refuse);
            window.removeEventListener("touchmove", refuse);
            window.removeEventListener("keydown", refuseKey);
            window.removeEventListener("scroll", restore);
        };
    };

    // Bring the window itself on screen, then open it.
    //
    // Only the first window arrives with the intro. The rest sit at the stylesheet's opacity: 0
    // — in the layout, so the page scrolls its full length and each one has a real position to
    // be triggered on, but not yet on screen. This is the arrival: the same fade the intro uses,
    // with the stagger zeroed because this window is coming on its own rather than as one of a
    // queue, and then the slide.
    //
    // Switching to [data-animation="none"] afterwards is not just tidiness. It holds the
    // finished state in plain declarations and takes the animation off the element; the fade
    // fills forwards, and filled animations left attached are paid for on every frame after.
    const arriveThenOpen = (win, li, whenOpen, targetY) => {

        const release = holdScroll(targetY);

        win.style.setProperty("--i", 0);
        win.dataset.animation = "in";

        setTimeout(() => {

            win.dataset.animation = "none";

            openWindow(win);
            moveCaret(li, true);
            sectionObserver.observe(win);

            // Scrolling comes back once the window is actually open, not when it starts.
            setTimeout(() => {
                release();
                whenOpen();
            }, SLIDE_MS);

        }, FADE_MS);
    };

    // `whenOpen` is called once the section has finished revealing, so the cooldown before the
    // next one is measured from the moment this window was actually on screen and scrolling had
    // been handed back — and the sequence stays serialised: nothing else is watched for until
    // then, so two windows can never be grabbing the page at the same time.
    const revealSection = (el, whenOpen, targetY) => {

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

                arriveThenOpen(el, li, whenOpen, targetY);
                break;

            case "🫆lsdev-window--reviews":

                arriveThenOpen(el, li, whenOpen, targetY);
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
                whenOpen();
                break;
        }
    };

    // Sections reveal one at a time, in order. A section's turn comes when the bottom of its
    // collapsed title bar reaches the bottom of the viewport: the window fades in where it sits
    // and then slides open, so the visitor meets each one as they arrive at it rather than
    // finding the whole page already laid out in front of them.
    //
    // Watching one at a time is what keeps the order: nothing fires ahead of its turn. The check
    // also runs once at arming rather than only on the next scroll, so a section the visitor has
    // already gone past still opens instead of stalling everything behind it.
    let currentIndex = 0;

    const advance = () => {
        setTimeout(() => {

            currentIndex++;

            if (currentIndex < revealTargets.length) armTarget(revealTargets[currentIndex]);
            else footer?.removeAttribute("data-deferred");

        }, REVEAL_GAP);
    };

    const armTarget = (el) => {

        // Contact is a section rather than a window: there is nothing to open, so nothing to
        // centre and no reason to take the scroll away. It reveals once it is properly in view,
        // the way every section used to.
        if (el.id === "🫆lsdev-contact") {

            const inView = () => {
                if (el.getBoundingClientRect().top > window.innerHeight * 0.75) return;
                window.removeEventListener("scroll", inView);
                revealSection(el, advance);
            };

            window.addEventListener("scroll", inView, { passive: true });
            inView();
            return;
        }

        // A window's turn comes at the scroll position that would put the middle of the *open*
        // window in the middle of the viewport. Measured on the open shape rather than the title
        // bar that is there now, so the window ends up centred once it has finished opening —
        // it grows downward from a top that does not move, so the centre it is heading for is
        // the one worked out here.
        const openHeight = openHeightOf(el);

        const check = () => {

            const top = el.getBoundingClientRect().top;

            const centred = top + openHeight / 2 <= window.innerHeight / 2;

            // The page may not have the room to reach that position — the last window, with the
            // footer still held out of the flow, can be close to the bottom of the document.
            // Opening it where it is beats never opening it at all.
            const bottomedOut =
                window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;

            if (!centred && !(bottomedOut && top < window.innerHeight)) return;

            // The scroll position that puts the middle of the open window in the middle of the
            // viewport. Handed to the hold, which will reach it if the page has the room and
            // follow the page down to it as the window's own height creates the room if not.
            const targetY = Math.round(window.scrollY + top + openHeight / 2 - window.innerHeight / 2);

            window.removeEventListener("scroll", check);
            revealSection(el, advance, targetY);
        };

        window.addEventListener("scroll", check, { passive: true });
        check();
    };

    // Start the sequence on the first scroll. Every window is collapsed to its title bar on load,
    // so they can all be on screen at once — observing them before the visitor moves would fire
    // them immediately, and invisibly, since the reviews window is still at opacity 0 until the
    // About step restores it.
    //
    // Not until the intro has handed over, though. sectionTrackingInit() is called about a second
    // before the intro's own timeout opens the first window and unlocks scrolling, so a scroll
    // arriving inside that gap — a page opened on a #hash, a restored scroll position — would run
    // this sequence on top of the intro, with both sides opening windows the other is midway
    // through. body[data-loading] is already the signal for "the intro still owns the page".
    const armRevealSequence = () => {

        // Already scrolled by the time the intro handed over — a page opened on a #hash, a
        // position the browser restored. The move this is waiting for has effectively been made
        // already, and no further scroll event is owed, so start rather than wait for one.
        if (window.scrollY > 0) {
            armTarget(revealTargets[0]);
            return;
        }

        window.addEventListener("scroll", () => {
            armTarget(revealTargets[0]);
        }, { passive: true, once: true });
    };

    if (document.body.hasAttribute("data-loading")) {

        const whenHandedOver = new MutationObserver(() => {

            if (document.body.hasAttribute("data-loading")) return;

            whenHandedOver.disconnect();
            armRevealSequence();
        });

        whenHandedOver.observe(document.body, { attributes: true, attributeFilter: ["data-loading"] });

    } else {
        armRevealSequence();
    }

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