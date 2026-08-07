// The caret-slide mechanism shared by the homepage nav and the inner pages' "Contents" tocs:
// place the ">" beside a list item by measuring the item's offset within the nav (a CSS
// transition on the caret turns the jump into a slide), and optionally mirror the highlight
// onto the item and its link. No DOM lookups at module scope, so any page can import it —
// unlike caret.js, which dereferences homepage-only elements the moment it loads.
export const slideCaret = ({ nav, caret, items, li, highlight = true, offset = 0 }) => {

    const navTop = nav.getBoundingClientRect().top;
    const y = li.getBoundingClientRect().top - navTop + offset;

    caret.style.setProperty("--caret-y", `${y}px`);

    if (highlight !== true) return;

    items.forEach(item => {

        item.classList.remove("is-highlighted");
        item.querySelector("a")?.removeAttribute("aria-current");
    });

    li.classList.add("is-highlighted");
    li.querySelector("a")?.setAttribute("aria-current", "location");
};
