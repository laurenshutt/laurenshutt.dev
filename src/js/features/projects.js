import {
    createMouseTracker
} from "../hud/mouse-coords.js";

import {
    staggerCardsIn
} from "../windows.js";

export const scrollProjects = () => {

    if (window.innerWidth <= 1035) return;

    const scrollContainer = document.getElementById("🫆lsdev-projects__grid-container");
    const tracker = createMouseTracker();

    // Smooth, momentum-style scroll-jack: each wheel event nudges a `target`, and a rAF loop eases
    // the container toward it — instead of jumping scrollTop by the raw wheel delta every event
    // (which feels steppy). Gating is unchanged: while the page is at the top, wheeling drives the
    // grid (down until it bottoms out, up until it tops out); otherwise the page scrolls normally.
    const EASE = 0.2; // 0–1: higher = snappier, lower = floatier
    let target = scrollContainer.scrollTop;
    let rafId = null;

    const tick = () => {
        const current = scrollContainer.scrollTop;
        const diff = target - current;
        if (Math.abs(diff) < 0.5) {
            scrollContainer.scrollTop = target;
            tracker.setExtraScroll(target);
            rafId = null;
            return;
        }
        scrollContainer.scrollTop = current + diff * EASE;
        tracker.setExtraScroll(scrollContainer.scrollTop);
        rafId = requestAnimationFrame(tick);
    };

    const handleScroll = (event) => {

        if (document.querySelector('.🎨lsdev-window[data-view="maximized"]')) return;
        if (event.target.closest("#🫆lsdev-projects__menu")) return;

        // Normalize wheel delta to pixels (some mice report lines/pages) for consistent speed.
        const { deltaY, deltaMode } = event;
        const px = deltaMode === 1 ? deltaY * 16
                 : deltaMode === 2 ? deltaY * scrollContainer.clientHeight
                 : deltaY;

        const atBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 10;
        const atTop = scrollContainer.scrollTop <= 0;

        const driveDown = px > 0 && !atBottom;                  // grid fills downward
        const driveUp = window.scrollY <= 0 && px < 0 && !atTop; // grid rewinds, only at page top

        if (!driveDown && !driveUp) {

            // The page should scroll. Returning here isn't enough when the pointer is over the grid:
            // it's overflow:scroll, so the browser would scroll that container natively instead of
            // the page. Take the wheel over and move the page ourselves so the hijack rules apply
            // wherever the pointer happens to be.
            if (event.target.closest("#🫆lsdev-projects__grid-container")) {
                event.preventDefault();
                window.scrollBy(0, px);
            }

            return;
        }

        event.preventDefault();
        const max = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (rafId === null) target = scrollContainer.scrollTop; // re-sync after any external scroll
        target = Math.max(0, Math.min(max, target + px));
        if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    document.addEventListener("wheel", handleScroll, { passive: false });
};

export const filterProjects = () => {

    const nav = document.getElementById("🫆lsdev-projects__menu");
    const projects = document.querySelectorAll(".🎨lsdev-projects__project");
    
    nav.addEventListener("click", (event) => {
        
        const button = event.target.closest(".🎨lsdev-window__menu-title");

        if (!button) return;

        const filter = button.dataset.filter;

        // Step 2: Hide all projects
        projects.forEach(project => {
            project.dataset.filtered = "";
        });

        // Step 3: Show only filtered ones
        setTimeout(() => {

            const matching = [];

            projects.forEach(project => {

                const filters = project.dataset.filterby.split(",");

                if (filter === "all" || filters.includes(filter)) {
                    project.style.display = "";
                    project.removeAttribute("data-filtered");

                    matching.push(project);
                }
            });

            // Deal the whole matching set back in, staggered, exactly as the grid does after a
            // window un-maximises — every filter click re-animates, not just the cards that
            // happened to be hidden beforehand. Called in the same task as the un-hiding above, so
            // they're held hidden before the browser paints and none flash in ahead of their turn.
            staggerCardsIn(matching);
        }, 0);
    });
};
