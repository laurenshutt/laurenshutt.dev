import { 
    caret,
    mainNavItems
} from '../dom.js';

import { 
    moveCaret
} from './caret.js';

export const initNavAnimations = (lastI) => {

    const lastNavItem = mainNavItems[mainNavItems.length - 1];

    mainNavItems.forEach(item => item.classList.add("is-animated"));

    caret.style.setProperty("--i", lastI + 1);
    caret.style.setProperty("--caret-y", "3px");
    caret.style.setProperty("opacity", "1");
            
    lastNavItem.addEventListener("animationend", () => {
        mainNavItems[0].classList.add("is-highlighted");
        caret.style.setProperty("transition-delay","100ms");
    }, { once: true });

    mainNavItems.forEach(li => {
        li.addEventListener("mouseenter", (e) => {
            moveCaret(e.currentTarget);
        });
    });

    mainNavItems.forEach(li => {
        
        li.addEventListener("mouseleave", function () {
            
            const current = mainNav
                .querySelector("[aria-current='location']")
                ?.closest("li");

            if (current) {
                moveCaret(current);
            }
        });
    });
}    