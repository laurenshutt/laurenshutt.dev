import { 
    initDom
} from '../dom.js';

const dom = initDom();
const {mainNav, mainNavItems, caret} = dom;

export const moveCaret = (li, changedSection) => {

    const navTop = mainNav.getBoundingClientRect().top;
    const y = li.getBoundingClientRect().top - navTop;
    
    caret.style.setProperty("--caret-y", `${y - 3}px`);

    if (changedSection === true) {
        
        mainNavItems.forEach(li => {

            const link = li.querySelector("a");
            
            li.classList.remove("is-highlighted");

            if (link) link.removeAttribute("aria-current");
        });

        li.classList.add("is-highlighted");

        const link = li.querySelector("a");
        
        if (link) link.setAttribute("aria-current", "location");
    }
};
