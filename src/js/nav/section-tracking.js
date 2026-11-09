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

    // How far a section has to come into the viewport before it reveals, as a fraction of the
    // viewport height measured from the top. 0.65 means "once its top has risen past the 65%
    // line" — a bit beyond the usual scroll-reveal threshold (GSAP ScrollTrigger's "top 80%",
    // AOS's 120px offset, a -10% rootMargin on an observer), so it takes a little more scrolling
    // to earn. Lower it to make a section wait longer, raise it to reveal sooner. The windows
    // used to wait to be centred instead, which on windows this close to viewport-height meant
    // most of a screen longer again before anything happened.
    const REVEAL_AT = 0.65;

    const REVEAL_GAP = 600;  // ms of cooldown before the next section starts watching
    const FADE_MS = 250;     // the window fade-in in the stylesheet, [data-animation="in"]
    const SLIDE_MS = 500;    // slideToggle's own default, so how long the window takes to open

    // Room at the foot of the page, reserved only while it is needed.
    //
    // Until a window opens, the page is short by the height it is about to gain — and the
    // footer is display:none while deferred, so it is not making up the difference either. The
    // last window can then sit so close to the bottom of the document that it cannot be brought
    // far enough up the viewport to take its turn at all. Reserving the growth means the visitor
    // can scroll to where the turn happens, and the window opens into the space rather than the
    // page having to grow underneath it.
    //
    // The reserve is still the full growth now that the threshold is REVEAL_AT rather than
    // centring, even though reachability alone would need less: it is what keeps the page the
    // same length across the open, so nothing below shifts as the window claims the space.
    const headroom = document.createElement("div");

    headroom.dataset.revealHeadroom = "";
    headroom.style.height = "0px";
    headroom.setAttribute("aria-hidden", "true");

    revealTargets[0]?.parentElement?.append(headroom);

    // Stand in for the height `win` is about to gain, so the page is already as long as it will
    // be once the window has opened.
    //
    // Reserving exactly the growth rather than a measured shortfall: the shortfall is worked out
    // when the window is armed and the layout can still settle by a few pixels before its turn
    // actually comes, which left the position short by eight. The growth is a fact about the
    // window, not about where anything happens to be, and a window's turn is always reachable on
    // a page the length it will be once that window is open.
    //
    // It also means the page does not change length across the open at all: the window claims
    // the space as this gives it back.
    const reserveRoomFor = (grows) => {
        headroom.style.height = `${Math.max(0, Math.ceil(grows))}px`;
    };

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


    // Bring the window on screen, then open it, with the visitor free to scroll throughout.
    //
    // Only the first window arrives with the intro. The rest sit at the stylesheet's opacity: 0
    // — in the layout, so the page scrolls its full length and each has a real position to be
    // triggered on, but not yet on screen. This is the arrival: the same fade the intro uses,
    // with the stagger zeroed because this window is coming on its own rather than as one of a
    // queue, and then the slide.
    //
    // Switching to [data-animation="none"] afterwards is not just tidiness. It holds the
    // finished state in plain declarations and takes the animation off the element; the fade
    // fills forwards, and filled animations left attached are paid for on every frame after.
    const arriveThenOpen = (win, li, whenOpen) => {

        win.style.setProperty("--i", 0);
        win.dataset.animation = "in";

        setTimeout(() => {

            win.dataset.animation = "none";

            // Give the reserved room back at exactly the rate the window takes it up, so the
            // document stays the length it already is right through the open. It used to be
            // released in one go at the end, which was invisible only because the page could
            // not be scrolled; now that it can, a page growing by the window's height and then
            // dropping back would lurch under the visitor.
            //
            // Set to its final height first and animated down to the same value: a running
            // animation outranks the inline style, so the inline 0 is what is left when it
            // finishes and there is nothing to snap at the end. Same duration and easing as
            // slideToggle, which is what the window itself is growing on.
            const reserved = parseFloat(headroom.style.height) || 0;

            headroom.style.height = "0px";

            if (reserved > 0) {
                headroom.getAnimations().forEach(a => a.cancel());
                headroom.animate(
                    [{ height: `${reserved}px` }, { height: "0px" }],
                    { duration: SLIDE_MS, easing: "ease" }
                );
            }

            openWindow(win);
            moveCaret(li, true);
            sectionObserver.observe(win);

            // The page is never taken away from the visitor while this happens: the window
            // grows downward from a top that does not move, and they can scroll with it.
            //
            // If a hold is ever wanted again, make the page genuinely unscrollable rather than
            // snapping it back to a pin from a scroll handler. preventDefault on wheel only
            // binds a gesture that begins after the listener exists — a fling already in flight
            // has been handed to the compositor, which goes on scrolling whatever the main
            // thread decides, and the handler then snapped the page back once per event for as
            // long as the fling lasted. That repeated snap was a visible yank.
            setTimeout(whenOpen, SLIDE_MS);

        }, FADE_MS);
    };

    // `whenOpen` is called once the section has finished revealing, so the cooldown before the
    // next one is measured from the moment this window was actually on screen and scrolling had
    // been handed back — and the sequence stays serialised: nothing else is watched for until
    // then, so two windows can never be grabbing the page at the same time.
    const revealSection = (el, whenOpen) => {

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

                arriveThenOpen(el, li, whenOpen);
                break;

            case "🫆lsdev-window--reviews":

                arriveThenOpen(el, li, whenOpen);
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

            if (currentIndex < revealTargets.length) {
                armTarget(revealTargets[currentIndex]);
                return;
            }

            headroom.style.height = "0px";
            footer?.removeAttribute("data-deferred");

        }, REVEAL_GAP);
    };

    const armTarget = (el) => {

        // Contact is a section rather than a window: there is nothing to open, so nothing to
        // centre and no reason to take the scroll away. It reveals once it is properly in view,
        // the way every section used to.
        if (el.id === "🫆lsdev-contact") {

            const inView = () => {
                if (el.getBoundingClientRect().top > window.innerHeight * REVEAL_AT) return;
                window.removeEventListener("scroll", inView);
                revealSection(el, advance);
            };

            window.addEventListener("scroll", inView, { passive: true });
            inView();
            return;
        }

        // The open height is still wanted even though the turn no longer depends on it: the
        // headroom below reserves the growth so the page does not change length across the open.
        // Taken before the measurement, not after: openHeightOf toggles data-open to pick up the
        // padding the open state adds, and reading the collapsed height on the other side of
        // that caught it 25px tall mid-settle — which is exactly how much the page then gained
        // across the open instead of staying put.
        const closedHeight = el.getBoundingClientRect().height;
        const openHeight = openHeightOf(el);

        reserveRoomFor(openHeight - closedHeight);

        const check = () => {

            const top = el.getBoundingClientRect().top;

            // Its turn comes as it arrives from the bottom, on the same threshold the contact
            // section uses. The collapsed top is what is tested: the window grows downward from
            // a top that does not move, so this is where it will still be once it is open.
            const arrived = top <= window.innerHeight * REVEAL_AT;

            // The page may not have the room to reach even that — the last window, with the
            // footer still held out of the flow, can be close to the bottom of the document.
            // Opening it where it is beats never opening it at all.
            const bottomedOut =
                window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;

            if (!arrived && !(bottomedOut && top < window.innerHeight)) return;

            window.removeEventListener("scroll", check);
            revealSection(el, advance);
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