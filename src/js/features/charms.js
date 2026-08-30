// Little collectibles awarded for exploring the page. The indicator lives in the HUD as one more
// line of ambient telemetry; clicking it raises a tray flyout rather than opening a window, so the
// interaction stays where the indicator is and nothing new has to be managed or dismissed.

const STORAGE_KEY = "🫆lsdev-charms";

// Only six slots are ever rendered — a wall of empty squares reads as a chore list rather than
// something to stumble across. The rest reveal themselves as the collection grows.
const VISIBLE_SLOTS = 6;

export const CHARMS = [
    {
        id: "maxed_scroll",
        name: "Maxed Scroll",
        glyph: "▤",
        earnedFor: "Scrolled to the bottom of the page"
    },
    {
        id: "bgm",
        name: "BGM Activated",
        glyph: "☾",
        earnedFor: "Activated background music"
    },
    {
        id: "night_owl",
        name: "Night Owl",
        glyph: "☾",
        earnedFor: "Visited after midnight, Blacksburg time"
    },
    {
        id: "petrichor",
        name: "Petrichor",
        glyph: "▤",
        earnedFor: "Visited on a rainy day in Blacksburg"
    },
    {
        id: "character_sheet",
        name: "Character Sheet",
        glyph: "▤",
        earnedFor: "Read the /now page"
    },
    {
        id: "behind_the_curtain",
        name: "Behind the Curtain",
        glyph: "▤",
        earnedFor: "Inspected the page source"
    }
];

const byId = (id) => CHARMS.find(charm => charm.id === id);

const read = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return stored && typeof stored === "object" ? stored : {};
    } catch {
        // Private browsing, disabled storage, or a value we didn't write. Collecting is a bonus,
        // never a dependency, so fall back to an empty (in-memory) collection.
        return {};
    }
};

const write = (earned) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
    } catch {
        /* nothing to do — the session still shows what was found */
    }
};

let earned = read();
let elements = null;

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// The toast sits in the empty stretch of the left column between the bottom of the section nav
// and the top of the HUD. That gap can't be expressed in CSS — the nav's top is a vw-based calc
// and the HUD is anchored to the viewport bottom — so it's measured when the toast is shown.
const placeInGap = (el) => {

    const hud = document.querySelector(".🎨lsdev-hud");

    if (!hud) return;

    const hudRect = hud.getBoundingClientRect();

    // Hidden (mobile) — nothing sensible to measure against.
    if (!hudRect.height) return;

    const nav = document.querySelector(".🎨lsdev-nav");
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;

    const top = navBottom + 24;
    const bottom = hudRect.top - 24;
    const height = el.offsetHeight;
    const centred = top + (bottom - top - height) / 2;

    el.style.left = `${hudRect.left}px`;
    el.style.top = `${Math.max(top, Math.min(centred, bottom - height))}px`;
};

// --- the tray flyout -------------------------------------------------------------------------

const renderPanel = () => {

    if (!elements) return;

    const found = CHARMS.filter(charm => earned[charm.id]);
    const shown = [
        ...found,
        ...CHARMS.filter(charm => !earned[charm.id])
    ].slice(0, VISIBLE_SLOTS);

    elements.count.textContent = `${found.length} / ${CHARMS.length}`;

    elements.grid.replaceChildren(...shown.map(charm => {

        const isFound = Boolean(earned[charm.id]);
        const tile = document.createElement("li");

        tile.className = "🎨lsdev-charm";

        if (isFound) tile.dataset.found = "";

        // Locked charms give nothing away — no name, no hint. Finding one is what explains it.
        tile.innerHTML = isFound
            ? `<span class="🎨lsdev-charm__glyph">${charm.glyph}</span>
               <span class="🎨lsdev-charm__name">${charm.name}</span>
               <span class="🎨lsdev-charm__earned-date">${formatDate(earned[charm.id])}</span>`
            : `<span class="🎨lsdev-charm__glyph">?</span>`;

        if (isFound) tile.title = charm.earnedFor;

        return tile;
    }));
};

const setOpen = (open) => {

    if (!elements) return;

    elements.panel.toggleAttribute("data-open", open);
    elements.backdrop.toggleAttribute("data-open", open);
    // Inline, for the reason noted where the backdrop is created.
    elements.backdrop.setBlur?.(open ? "5px" : "0px");
    elements.toggle.setAttribute("aria-expanded", String(open));

    if (open) {
        renderPanel();
        elements.panel.focus();
    }
};

const buildUi = () => {

    const hud = document.querySelector(".🎨lsdev-hud");

    if (!hud || elements) return;

    // The panel lives on <body>, not inside the HUD. The HUD keeps a transform after its fade-in
    // (fill-mode:forwards leaves it at translateY(0)), and a transformed ancestor becomes the
    // containing block for position:fixed descendants — so a panel nested inside it would resolve
    // its coordinates against the HUD rather than the viewport and land far off-screen.
    const panel = document.createElement("div");

    panel.className = "🎨lsdev-charms__panel";
    panel.id = "🫆lsdev-charms__panel";
    panel.tabIndex = -1;
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Charms");
    panel.innerHTML = `
        <div class="🎨lsdev-charms__panel-bar">
            <span>Charms Collected</span>
            <span class="🎨lsdev-charms__panel-count"></span>
        </div>
        <ul class="🎨lsdev-charms__panel-grid"></ul>
    `;

    // Backdrop before the panel so it paints beneath it; both are z-indexed regardless.
    const backdrop = document.createElement("div");

    backdrop.className = "🎨lsdev-charms__backdrop";

    // The blur is set here rather than in the stylesheet. It kept going missing from the CSS the
    // browser actually received, and inline styles can't be dropped by anything in between. Note
    // the element must never carry opacity < 1: that would make it its own backdrop root, cutting
    // it off from the page behind and leaving nothing to blur. The fade is the wash and the radius.
    const blur = (radius) => {
        backdrop.style.backdropFilter = `blur(${radius})`;
        backdrop.style.webkitBackdropFilter = `blur(${radius})`;
    };

    blur("0px");
    backdrop.setBlur = blur;

    document.body.append(backdrop, panel);

    elements = {
        panel,
        backdrop,
        toggle: document.querySelector(".🎨lsdev-hud__charms-toggle"),
        count: panel.querySelector(".🎨lsdev-charms__panel-count"),
        grid: panel.querySelector(".🎨lsdev-charms__panel-grid")
    };

    elements.toggle.addEventListener("click", (element) => {
        console.log(element);
        setOpen(!elements.panel.hasAttribute("data-open"));
    });

    // A disclosure, not a dialog: escape and click-away close it, focus returns to the toggle.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && elements.panel.hasAttribute("data-open")) {
            setOpen(false);
            elements.toggle.focus();
        }
    });

    document.addEventListener("pointerdown", (event) => {
        if (!elements.panel.hasAttribute("data-open")) return;
        if (!panel.contains(event.target)) setOpen(false);
    });

    refreshIndicator();
};

const refreshIndicator = () => {

    if (!elements) return;

    const found = CHARMS.filter(charm => earned[charm.id]).length;

    /*elements.wrap.classList.toggle("has-charms", found > 0);
    elements.label.textContent = found ? `charms ${found}/${CHARMS.length}` : "";
    elements.mark.textContent = found ? "◈" : "?";*/
};

// --- awarding --------------------------------------------------------------------------------

const toast = (charm) => {

    const note = document.createElement("div");

    note.className = "🎨lsdev-charm__toast";
    note.setAttribute("role", "status");
    note.innerHTML = `
        <span class="🎨lsdev-charm__toast-glyph">${charm.glyph}</span>
        <span>
            <b>${charm.name}</b>
            <i>charm found</i>
        </span>
    `;

    document.body.append(note);
    placeInGap(note);

    // Slides up into the same gap the panel occupies, so the two read as one place.
    requestAnimationFrame(() => note.dataset.shown = "");

    setTimeout(() => {
        note.removeAttribute("data-shown");
        setTimeout(() => note.remove(), 500);
    }, 4000);
};

export const awardCharm = (id) => {

    const charm = byId(id);

    if (!charm || earned[id]) return false;

    earned = { ...earned, [id]: new Date().toISOString() };
    write(earned);

    refreshIndicator();
    renderPanel();
    toast(charm);

    return true;
};

export const hasCharm = (id) => Boolean(earned[id]);

// --- hooks -----------------------------------------------------------------------------------

const watchNightOwl = () => {

    // Blacksburg time, matching the clock in the HUD rather than the visitor's own timezone.
    const hour = Number(new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        hour12: false
    }).format(new Date()));

    if (hour >= 0 && hour < 5) awardCharm("night_owl");
};

const watchProjectsGrid = () => {

    const grid = document.getElementById("🫆lsdev-projects__grid-container");

    if (!grid || hasCharm("bottom_of_the_stack")) return;

    const check = () => {

        if (grid.scrollTop + grid.clientHeight < grid.scrollHeight - 8) return;

        awardCharm("bottom_of_the_stack");
        grid.removeEventListener("scroll", check);
    };

    grid.addEventListener("scroll", check, { passive: true });
};

// Awarded for reaching the end of the page, which is the contact section — it runs from just under
// halfway down to the footer.
//
// Deliberately measured against the scroll position rather than by observing the section itself.
// Contact starts around 1000px into a ~2700px page and is 1500px tall, so the moment its top edge
// enters the viewport the visitor is only about a fifth of the way down — an intersection test
// fires there, long before they have arrived at anything. Where the scrollbar has got to has no
// such ambiguity, and it is what the charm claims: scrolled to the bottom.
const watchContactSection = () => {

    if (hasCharm("maxed_scroll")) return;

    const check = (event) => {

        // What scrolls the page changes with the breakpoint — the document on desktop,
        // #🫆lsdev-stage once the mobile styles give it its own overflow. Scroll events do not
        // bubble, so this listens in the capture phase and sorts out the source here. Other
        // scrollers on the page (the projects grid keeps its own) are not the page and are ignored.
        const target = event.target;
        const isDocument = target === document || target === document.documentElement;

        if (!isDocument && target.id !== "🫆lsdev-stage") return;

        const scroller = isDocument ? document.scrollingElement : target;

        // A few pixels of slack: sub-pixel layout and elastic scrolling mean the bottom is rarely
        // hit exactly.
        if (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 8) return;

        awardCharm("maxed_scroll");

        document.removeEventListener("scroll", check, true);
    };

    document.addEventListener("scroll", check, { capture: true, passive: true });
};

export const charms = () => {
    buildUi();

    watchNightOwl();
    watchProjectsGrid();
    watchContactSection();
};
