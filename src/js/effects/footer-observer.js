export const watchFooter = () => {
    
    const footer = document.querySelector("footer");
    const coolStuff = document.querySelector(".🎨lsdev-hud");

    const footerObserver = new IntersectionObserver((entries) => {
    
        entries.forEach((entry) => {
            
            if (entry.isIntersecting) {
                coolStuff.style.marginBottom = "130px";
            } 
            else {
                coolStuff.style.marginBottom = "max(40px, 5vw)";
            }
        });

    }, {
        threshold: 0.1
    });

    footerObserver.observe(footer);
}
