// Below the desktop breakpoint the section nav collapses behind a single control and moves into the
// hero, so the title, the intro text and the nav can be centred in the first viewport as one group.
//
// The move has to happen in JS because the two live in different subtrees — the hero is a direct
// child of <body>, while the nav sits inside the sidebar, four levels down inside <main> — and CSS
// cannot reparent. This is the same manoeuvre moveTitleIntoSidebar performs in the other direction
// for desktop.
//
// Moving the element rather than cloning it keeps every existing reference valid: dom.js holds
// mainNav by id and mainNavItems as a NodeList of its <li>s, and appendChild moves the same nodes,
// so the caret, the section observer and the highlight all carry on pointing at the right things.
import {
    cssToken
} from "../utils.js";

export const collapseNavIntoHero = () => {

    const nav = document.getElementById("🫆lsdev-on-page-nav");
    const hero = document.querySelector('[data-show-on="mobile"]');
    const toggle = document.getElementById("🫆lsdev-on-page-nav__toggle");

    if (!nav || !hero || !toggle) return;

    hero.append(nav);

    // The menu is absolutely positioned, so it adds no height of its own — but the hero centres
    // what it contains, and without accounting for the menu the centred group sits too low and an
    // open menu runs past the fold. Reserving its height under the toggle lifts the group by half
    // that, which is exactly enough for the menu to open into the space it left behind.
    //
    // Measured rather than hardcoded so it follows the number of links. The transition has to come
    // off for the measurement: with it on, reading the height straight after opening returns the
    // start of the animation — zero — not the height it is heading for.
    const measure = () => {

        const list = document.getElementById("🫆lsdev-on-page-nav__list");

        if (!list) return;

        // The nav holds a fixed box so the button's hover growth cannot resize it. Taken at rest,
        // which is what it is at this point in the sequence.
        nav.style.setProperty(
            "--lsdev-nav-toggle-height",
            `${Math.round(toggle.getBoundingClientRect().height)}px`
        );

        const wasOpen = nav.hasAttribute("data-open");

        list.style.transition = "none";
        nav.setAttribute("data-open", "");

        const height = list.getBoundingClientRect().height;

        if (!wasOpen) nav.removeAttribute("data-open");

        // Flush the reverted state before the transition goes back on, or removing the attribute
        // animates the menu shut on load.
        void list.offsetHeight;
        list.style.removeProperty("transition");

        nav.style.setProperty("--lsdev-nav-menu-height", `${Math.round(height)}px`);
    };

    measure();

    // Measured at full size, then collapsed and released so it grows into place. Landing at full
    // size would add its height and its margin to the hero in one frame, and since the hero centres
    // its contents that shunts the name up the screen with no motion at all — which is exactly what
    // it was doing: the name jumped as the nav arrived instead of gliding.
    //
    // Released on a painted frame rather than after a forced reflow. The nav has just been
    // reparented into the hero and measure() has toggled data-open on it, both in this same task;
    // an element that has just been inserted somewhere has no before-change style for the browser
    // to interpolate from, so the first style it computes is the collapsed one and setting and
    // clearing the attribute inside one task leaves nothing to animate. Reading offsetHeight forces
    // layout but does not give the collapsed state a frame of its own. Two frames does: the first
    // paints it collapsed, so by the second there is a real value to grow from.
    // Both endpoints are measured and handed straight to the animation, rather than collapsing the
    // nav in CSS and hoping a transition picks the change up. A transition needs a before-change
    // style to interpolate from, and this element has just been reparented into the hero and had
    // data-open toggled on it by measure(), all inside this one task — so the first style it
    // computes is the collapsed one and there is nothing to animate away from. Neither a forced
    // reflow nor waiting for painted frames fixed that; the name kept jumping to its final place.
    //
    // Reading the title's position with the nav collapsed and again with it settled gives the exact
    // distance the group travels. Every child of a centred column shifts by the same amount when
    // the last one grows, so one number moves all three.
    const title = hero.querySelector(".has-glitch");
    const intro = hero.querySelector(".🎨lsdev-intro-text");

    nav.setAttribute("data-settling", "");
    const collapsed = title?.getBoundingClientRect().top ?? 0;

    nav.removeAttribute("data-settling");
    const settled = title?.getBoundingClientRect().top ?? 0;

    const shift = Math.round(collapsed - settled);

    if (shift > 0) {

        const ease = cssToken("--💾lsdev-ease-flip") || "ease";

        // `translate`, not `transform`: these elements have their own fade-in-up keyframes running
        // on transform, and animations compose per property — the same reason move-title.js reaches
        // for it. Being composited, it also costs no layout per frame, which animating the nav's
        // height did.
        // `none`, deliberately, rather than `backwards`. Holding the opening offset before the
        // animation starts would guard against a first frame painted at the final position, but it
        // also means anything that stops these from running at all — and the layout is already
        // where it belongs by this point — leaves the group parked 40px low with the nav invisible.
        // Unfilled, that same failure just costs the glide: everything sits correctly, unanimated.
        [title, intro, nav].forEach(el => el?.animate(
            [{ translate: `0 ${shift}px` }, { translate: "0 0" }],
            { duration: 450, easing: ease, fill: "none" }
        ));

        nav.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 300, easing: "ease", fill: "none" }
        );
    }

    // Both numbers depend on the pixel font's metrics, and it may not have arrived yet — measuring
    // against the fallback would leave the box a few pixels wrong once Silkscreen swaps in.
    document.fonts?.ready.then(measure);

    window.addEventListener("resize", measure, { passive: true });

    // Decide which way the menu opens, and how tall it is allowed to be, from the room actually
    // available at the moment it is asked for. The hero centres its contents without reserving
    // anything for the menu, so on a short screen the control ends up too low for the menu to hang
    // below it — in which case it opens upward instead. The cap is a backstop for the case where
    // neither side has room: the menu scrolls rather than running off the screen.
    const GUTTER = 12;

    const placeMenu = () => {

        const box = toggle.getBoundingClientRect();
        const menuHeight = parseFloat(nav.style.getPropertyValue("--lsdev-nav-menu-height")) || 0;

        const below = innerHeight - box.bottom - GUTTER;
        const above = box.top - GUTTER;
        const dropUp = menuHeight > below && above > below;

        nav.toggleAttribute("data-drop-up", dropUp);
        nav.style.setProperty(
            "--lsdev-nav-menu-limit",
            `${Math.round(Math.max(0, dropUp ? above : below))}px`
        );
    };

    const setOpen = (open) => {

        if (open) placeMenu();

        nav.toggleAttribute("data-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(!nav.hasAttribute("data-open")));

    // Picking a section should close the menu behind you — the page is about to scroll away from
    // it, and leaving it open would cover the thing you just asked to see.
    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });

    // Escape closes it, matching how the charms panel behaves.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.hasAttribute("data-open")) {
            setOpen(false);
            toggle.focus();
        }
    });
};
