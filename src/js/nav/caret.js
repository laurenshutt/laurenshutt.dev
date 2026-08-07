import {
    initDom
} from '../dom.js';

import {
    slideCaret
} from './caret-slide.js';

const dom = initDom();
const {mainNav, mainNavItems, caret} = dom;

// Homepage wrapper around the shared caret-slide: same signature as always, with the homepage
// nav baked in. The -3px offset is the original alignment nudge.
export const moveCaret = (li, changedSection) => {

    slideCaret({
        nav: mainNav,
        caret,
        items: mainNavItems,
        li,
        highlight: changedSection === true,
        offset: -3
    });
};
