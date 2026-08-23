export function initDom() {
  
    const mainNav = document.getElementById("🫆lsdev-on-page-nav");
    const mainNavItems = mainNav.querySelectorAll("li");
    const caret = mainNav.querySelector(".🎨lsdev-on-page-nav__caret");
    const windows = document.querySelectorAll(".🎨lsdev-window");
    const contact = document.getElementById("🫆lsdev-contact");
    const contactH2Span = contact.querySelector("h2 span");
    // Whatever opted in, in markup order. This used to describe the shapes it expected to find —
    // a direct child p, any fieldset, a div containing the submit — which meant CSS and JS each had
    // their own idea of what gets revealed.
    const contactEls = contact.querySelectorAll("[data-reveal]");

    return {
        mainNav,
        mainNavItems,
        caret,
        windows,
        contact,
        contactH2Span,
        contactEls,
        caret
    };
}

