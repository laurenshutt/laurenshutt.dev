export const watchFooter = () => {
    
    const footer = document.querySelector("footer");
    const coolStuff = document.querySelector(".🎨lsdev-hud");

    const footerObserver = new IntersectionObserver((entries) => {
    
        entries.forEach((entry) => {
            
            if (entry.isIntersecting) {
                coolStuff.style.marginBottom = "130px";
            } 
            else {
                // Hand the resting position back to the stylesheet rather than restating it
                // here. This branch runs on the observer's very first callback, before any
                // scrolling, so a literal here overrides the CSS and the HUD visibly slides
                // from its real position down to whatever the literal says.
                coolStuff.style.removeProperty("margin-bottom");
            }
        });

    }, {
        threshold: 0.1
    });

    footerObserver.observe(footer);
}
