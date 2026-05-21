import { 
    initDom
} from './dom.js';

const dom = initDom();
const {mainNavItems, windows, contactEls, caret} = dom;

export const setElementIndices = () => {
    
    mainNavItems.forEach((li, i) => {
        li.style.setProperty('--i', i);
    });

    windows.forEach((windowEl, i) => {
        windowEl.style.setProperty('--i', i);
    });

    contactEls.forEach(function(el, i){
        el.style.setProperty("--i", i);
    });    

    return mainNavItems.length - 1;
};

    

        
  