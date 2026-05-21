export const watchFooter = () => {
    
    const footer = document.querySelector("footer");
    const coolStuff = document.querySelector(".🎨lsdev-hud");

    const footerObserver = new IntersectionObserver((entries) => {
    
        entries.forEach((entry) => {
            
            if (entry.isIntersecting) {
                coolStuff.style.bottom = "130px";
            } 
            else {
                coolStuff.style.bottom = "40px";
            }
        });

    }, {
        threshold: 0.1
    });

    footerObserver.observe(footer);
}
