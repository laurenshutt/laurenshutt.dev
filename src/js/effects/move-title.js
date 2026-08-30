import {
    cssToken
} from "../utils.js";

// The page title starts life centred and position:fixed, outside the stage, so it can be the only
// thing on screen during the intro. This retires it into the sidebar's flow, first above the intro
// text, so that from then on it shares the column's padding with everything else — no viewport
// coordinates to keep in sync, and no separate `left` to re-tune whenever the sidebar moves.
//
// Position isn't animatable from fixed to relative, so the move happens in three beats:
//   1. measure where it would land, by briefly putting it in the sidebar (synchronously, so
//      nothing paints in between);
//   2. animate to those coordinates while still fixed — font-size and width included, so the text
//      reflows on the way rather than snapping to its new line count first;
//   3. commit it to the flow, where it lands on the same pixels it just animated to.
export const moveTitleIntoSidebar = (title, { duration = 700 } = {}) => {

    // Into the sidebar's top group, not the sidebar itself. The sidebar is a flex column with
    // justify-content: space-between, sized to the viewport — it expects exactly two children (the
    // top group and the HUD) and pushes them apart. A title added as a third child would be spread
    // along with them, so the distance down to the intro text would be whatever free space happened
    // to be left over rather than anything the stylesheet asked for. Inside the top group it is a
    // normal block sibling of the intro text, and the gap is that element's own margin.
    const column = document.querySelector(".🎨lsdev-page__sidebar-top");

    if (!title || !column) return;

    // The column has to be laid out for this to measure anything — a display:none ancestor
    // reports zeroes and the title would fly off to the corner.
    if (!column.getBoundingClientRect().height) return;

    const first = title.getBoundingClientRect();
    const firstFont = getComputedStyle(title).fontSize;

    // Everything already in the column gets pushed down when the title lands in front of it. Held
    // now, before the title is ever inserted, so this is the list as it stands without it.
    const followers = [...column.children];
    const restingTop = followers[0]?.getBoundingClientRect().top ?? 0;

    // --- 1. measure the destination -----------------------------------------------------------
    const marker = document.createComment("page title");

    title.before(marker);
    column.prepend(title);
    title.dataset.moved = "";

    const last = title.getBoundingClientRect();
    const lastFont = getComputedStyle(title).fontSize;

    // How far the rest of the column moves once the title is really there. Measured rather than
    // derived from the title's height, so it accounts for its margins and any collapsing with the
    // intro text's own margin-top — whatever the stylesheet says, this is the observed distance.
    const displacement = (followers[0]?.getBoundingClientRect().top ?? 0) - restingTop;

    // back to where it was; no paint has happened, so none of this is visible
    title.removeAttribute("data-moved");
    marker.replaceWith(title);

    // --- 2. animate, still fixed --------------------------------------------------------------
    // The centring transform is baked into top/left first, so the transition has a single pair of
    // properties to move rather than fighting a translate.
    title.style.transition = "none";
    title.style.top = `${first.top}px`;
    title.style.left = `${first.left}px`;
    title.style.width = `${first.width}px`;
    title.style.fontSize = firstFont;
    title.style.transform = "none";

    void title.offsetWidth;

    const ease = cssToken("--💾lsdev-ease-flip");

    title.style.transition =
        `top ${duration}ms ${ease}, left ${duration}ms ${ease}, ` +
        `width ${duration}ms ${ease}, font-size ${duration}ms ${ease}`;

    title.style.top = `${last.top}px`;
    title.style.left = `${last.left}px`;
    title.style.width = `${last.width}px`;
    title.style.fontSize = lastFont;

    // The rest of the column travels the same distance over the same time, so the space for the
    // title opens up as the title arrives instead of appearing all at once when it commits.
    //
    // `translate`, not `transform`: these elements have their own fade-in-up keyframes running on
    // `transform`, and an animation beats an inline style in the cascade — it would simply erase
    // this. As a separate property `translate` composes with that animation rather than competing,
    // and being composited it costs no layout per frame either.
    followers.forEach(follower => {
        follower.style.transition = `translate ${duration}ms ${ease}`;
        follower.style.translate = `0 ${displacement}px`;
    });

    // --- 3. hand over to the flow -------------------------------------------------------------
    setTimeout(() => {

        column.prepend(title);
        title.dataset.moved = "";

        // The flow now provides the offset the translate was faking, so dropping both at the same
        // moment leaves everything exactly where it already appears to be.
        followers.forEach(follower => {
            follower.style.transition = "";
            follower.style.translate = "";
        });

        // Every inline value above was scaffolding for the animation; the stylesheet owns it now.
        title.style.cssText = "";
    }, duration);
};
