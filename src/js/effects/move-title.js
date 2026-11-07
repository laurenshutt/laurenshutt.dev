import {
    cssToken
} from "../utils.js";

// One box per word, created at the moment of the move.
//
// The title is a single text node until now, which is what the intro's shuffle reveal wants — one
// run of letters across "Lauren Shutt". But a single text node can only break between the two words
// by reflowing, and reflow is not interpolable: there is no half-broken line for a transition to
// land on. Animating the title's width towards min-content therefore looked smooth right up to the
// moment the width crossed below the one-line width, at which point "Shutt" was simply re-rendered
// on the second line.
//
// Splitting here, after the reveal has finished and before anything is measured, costs nothing
// visually — two inline-block words occupy the same pixels as the text node they replace — and it
// turns the break into something that can be animated: two boxes with a start and an end position.
const splitIntoWords = title => {

    const span = title.querySelector(".✨lsdev-fx-glitch");

    if (!span) return [];

    const words = (span.dataset.text ?? span.textContent).trim().split(/\s+/);

    // Nothing to break. Animate the one box as it stands.
    if (words.length < 2) return [span];

    const wordSpans = words.map(word => {

        const wordSpan = document.createElement("span");

        wordSpan.className = `${span.className} ✨lsdev-fx-glitch--word`;
        wordSpan.dataset.text = word;
        wordSpan.textContent = word;

        // The idle glitch loop writes its keyframes to inline custom properties. It re-queries the
        // document on every pass, so it will find these spans on its own from here on; this only
        // carries over whatever it had already set on the span being replaced, so the effect does
        // not drop out in the gap before the next pass.
        wordSpan.style.cssText = span.style.cssText;

        return wordSpan;
    });

    span.replaceWith(...wordSpans);

    return wordSpans;
};

// The page title starts life centred and position:fixed, outside the stage, so it can be the only
// thing on screen during the intro. This retires it into the sidebar's flow, first above the intro
// text, so that from then on it shares the column's padding with everything else — no viewport
// coordinates to keep in sync, and no separate `left` to re-tune whenever the sidebar moves.
//
// Position isn't animatable from fixed to relative, and neither is a line break, so rather than
// tweening the title's own box the move is a FLIP over its words:
//   1. measure where each word starts;
//   2. commit the title to the flow, so the final layout exists immediately and nothing further
//      reflows while the animation runs;
//   3. measure where each word landed, and play it back from where it started using transforms
//      only — the one kind of motion that cannot disturb layout.
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

    const words = splitIntoWords(title);

    if (!words.length) return;

    // Everything already in the column gets pushed down when the title lands in front of it. Held
    // now, before the title is ever inserted, so this is the list as it stands without it.
    const followers = [...column.children];
    const restingTop = followers[0]?.getBoundingClientRect().top ?? 0;

    // --- 1. where each word starts ------------------------------------------------------------
    const first = words.map(word => word.getBoundingClientRect());
    const firstFont = parseFloat(getComputedStyle(title).fontSize);

    // --- 2. commit to the flow, in one frame, untransitioned ----------------------------------
    // Everything the stylesheet changes between the two states — position, width, font-size — is
    // either discrete or would fight the transforms below, so the blanket `transition: all` on the
    // rule is suppressed across the swap and restored once the new layout has been flushed.
    title.style.transition = "none";

    column.prepend(title);
    title.dataset.moved = "";

    void title.offsetWidth;

    requestAnimationFrame(() => {
        title.style.transition = "";
    });

    // --- 3. where each word landed ------------------------------------------------------------
    const last = words.map(word => word.getBoundingClientRect());
    const lastFont = parseFloat(getComputedStyle(title).fontSize);

    // How far the rest of the column moved once the title really arrived. Measured rather than
    // derived from the title's height, so it accounts for its margins and any collapsing with the
    // intro text's own margin-top — whatever the stylesheet says, this is the observed distance.
    const displacement = (followers[0]?.getBoundingClientRect().top ?? 0) - restingTop;

    const ease = cssToken("--💾lsdev-ease-flip");

    // Invert and play. Scale carries the font-size change: scaling is the version of that which
    // leaves metrics alone, and metrics are exactly what must not move once the words have been
    // placed. transform-origin is the top left because that is the corner the words are aligned
    // on in both states, so it is the one point that does not need correcting for.
    words.forEach((word, i) => {

        const dx = first[i].left - last[i].left;
        const dy = first[i].top - last[i].top;
        const scale = firstFont / lastFont;

        word.animate([
            {
                transformOrigin: "left top",
                transform: `translate(${dx}px, ${dy}px) scale(${scale})`
            },
            {
                transformOrigin: "left top",
                transform: "none"
            }
        ], {
            duration,
            easing: ease,
            fill: "none"
        });
    });

    // The rest of the column travels the same distance over the same time, so the space for the
    // title closes up as the title arrives instead of appearing all at once. The title is already
    // in the flow, so these start displaced and settle, rather than the other way round.
    //
    // `translate`, not `transform`: these elements have their own fade-in-up keyframes running on
    // `transform`, and an animation beats an inline style in the cascade — it would simply erase
    // this. As a separate property `translate` composes with that animation rather than competing,
    // and being composited it costs no layout per frame either.
    followers.forEach(follower => {
        follower.animate([
            { translate: `0 ${-displacement}px` },
            { translate: "0 0" }
        ], {
            duration,
            easing: ease,
            fill: "none"
        });
    });
};
