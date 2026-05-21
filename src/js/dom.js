export function initDom() {
  
    const mainNav = document.getElementById("🫆lsdev-nav");
    const mainNavItems = mainNav.querySelectorAll("li");
    const caret = mainNav.querySelector(".🎨lsdev-nav__caret");
    const windows = document.querySelectorAll(".🎨lsdev-window");
    const contact = document.getElementById("🫆lsdev-contact");
    const contactH2Span = contact.querySelector("h2 span");
    const contactEls = contact.querySelectorAll(
        ":scope > p, fieldset, :scope div:has(>[type='submit'])"
    );

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

