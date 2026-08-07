import {
    slideCaret
} from './caret-slide.js';

const slugify = (text) => text
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Rebuild the contents list from the page's own h2s, so it can't drift out of sync with the
// article. Headings inside <details> are skipped: that's collapsed archive content, not part of
// the page's top-level structure. Headings without an id get one derived from their text, so a
// new section only has to exist to show up here. The links already in the markup act as the
// no-JS fallback and are replaced wholesale when this runs.
const buildLinks = (nav) => {

    const list = nav.querySelector("ul");
    const article = document.querySelector("article");

    if (!list || !article) return;

    const headings = [...article.querySelectorAll("h2")].filter(h2 => !h2.closest("details"));

    if (!headings.length) return;

    list.replaceChildren(...headings.map(h2 => {

        if (!h2.id) {

            const base = slugify(h2.textContent) || "section";
            let id = base;
            let n = 2;

            while (document.getElementById(id)) id = `${base}-${n++}`;

            h2.id = id;
        }

        const li = document.createElement("li");
        const link = document.createElement("a");

        link.href = `#${h2.id}`;
        link.textContent = h2.textContent.trim();
        li.append(link);

        return li;
    }));
};

// Reuses the homepage caret-slide on the inner pages' "Contents" nav: the ">" tracks whichever
// section heading was most recently scrolled past. The nav gets is-tracking so the CSS can hand
// the caret from its static no-JS spot (inline transform beside the first item) to the JS-driven
// slide; without JS the markup keeps that static look.
export const innerToc = () => {

    const nav = document.querySelector(".🎨lsdev-toc");

    if (!nav) return;

    buildLinks(nav);

    const caret = nav.querySelector(".🎨lsdev-toc__caret");
    const items = [...nav.querySelectorAll("li")];

    // Only items whose link points at a real heading take part. Anything else (like the
    // colophon's #accessibility link, which has no section) is simply never landed on.
    const pairs = items
        .map(li => {
            const hash = li.querySelector("a")?.getAttribute("href") ?? "";
            const target = hash.startsWith("#") ? document.getElementById(hash.slice(1)) : null;
            return target ? { li, target } : null;
        })
        .filter(Boolean);

    if (!caret || !pairs.length) return;

    nav.classList.add("is-tracking");
    caret.style.removeProperty("transform");
    items.forEach(li => li.style.removeProperty("padding-left"));

    let current = null;
    let locked = null;
    let hovered = null;

    // Move the caret and mark where it landed. The indent keys off is-caret rather than
    // is-highlighted because the two diverge while hovering: the highlight stays on the section
    // being read, the caret (and its indent) follows the pointer.
    const placeCaret = (li, highlight) => {

        items.forEach(item => item.classList.toggle("is-caret", item === li));

        slideCaret({ nav, caret, items, li, highlight });
    };

    const update = () => {

        // A click owns the highlight until its scroll settles — see the handler below.
        if (locked) return;

        // Measured live and re-sorted each pass: the now page's <details> archive shifts every
        // heading below it when it opens or closes.
        const ordered = pairs
            .map(pair => ({ ...pair, top: pair.target.getBoundingClientRect().top }))
            .sort((a, b) => a.top - b.top);

        // The current section is the last heading above the reading line. That line sits near the
        // top rather than mid-viewport because clicking a toc link parks its heading at y=0: with
        // a line 40% down, every heading in the first 40% counted as passed, so any section
        // shorter than that handed the highlight straight to the one after it.
        const line = 120;
        let active = ordered[0];

        ordered.forEach(pair => {
            if (pair.top <= line) active = pair;
        });

        // …pinned to the first/last item at the page extremes, where short end sections might
        // never reach the line.
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY <= 10) active = ordered[0];
        else if (scrollable > 10 && window.scrollY >= scrollable - 10) active = ordered[ordered.length - 1];

        if (active.li === current) return;

        current = active.li;
        placeCaret(active.li, true);

        // The highlight above is still correct while hovering, but the caret belongs on whatever
        // the pointer is previewing — put it back.
        if (hovered) placeCaret(hovered, false);
    };

    // One measurement per frame: the rects force layout and scroll events outpace paint.
    let ticking = false;

    const queueUpdate = () => {

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    };

    // Clicking a link claims the highlight immediately and holds it while the smooth scroll runs,
    // so the caret goes straight to the destination instead of chasing every section on the way.
    // Released on scrollend, with a timeout for browsers that don't fire it.
    let releaseTimer = null;

    const release = () => {

        if (!locked) return;

        clearTimeout(releaseTimer);
        locked = null;
        update();
    };

    nav.addEventListener("click", (event) => {

        const li = event.target.closest('a[href^="#"]')?.closest("li");

        if (!li || !pairs.some(pair => pair.li === li)) return;

        locked = li;
        current = li;
        placeCaret(li, true);

        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(release, 1200);
    });

    // Hovering a link previews it: the caret slides across with its usual transition while the
    // highlighted item stays put, and returns to the tracked section on the way out. Delegated
    // rather than bound per item, since the list is rebuilt from the page's headings.
    const previewCaret = (li) => {

        if (li === hovered) return;

        hovered = li;

        const destination = li ?? current;

        if (destination) placeCaret(destination, false);
    };

    nav.addEventListener("mouseover", (event) => {

        // Any li inside this nav is a contents entry, so containment is the whole test. Matching
        // against the captured `pairs` would silently stop previewing if the list were ever
        // rebuilt underneath us.
        const li = event.target.closest("li");

        previewCaret(li && nav.contains(li) ? li : null);
    });

    nav.addEventListener("mouseleave", () => previewCaret(null));

    window.addEventListener("scrollend", release);
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    document.querySelectorAll("details").forEach(d => d.addEventListener("toggle", queueUpdate));

    update();

    // Web fonts change the nav's metrics once they land — re-place the caret even if the active
    // section hasn't changed.
    document.fonts?.ready.then(() => {
        current = null;
        update();
    });
};
