export const catbotButton = () => {   
    
    const status = Math.random() < 0.5 ? "online" : "offline";            
    const cat = document.querySelector("#🫆lsdev-catbot-button__cat");
    const targetX = 75;   // where cat should settle
    const speed = 1.5;

    let x = -160;

    const moveCat = () => {

        if (x < targetX) {
            x += speed;
            cat.style.left = `${x}px`;
            requestAnimationFrame(moveCat);
        } 
        else {
            
            cat.classList.remove("is-walking");

            setTimeout(function(){
                cat.style.left = `${targetX}px`;
                cat.classList.add("is-sleeping");
            },750);
        }
    };

    moveCat();

    $("#🫆lsdev-online-status").addClass(status);

    offlineHTML = `<p>Catbot is trying to sleep! Please refresh the page or try again later. 🐱💬</p>`;

    if (status == "offline") {
        $("#🫆lsdev-catbot-window__chat").html(offlineHTML);
        $("#🫆lsdev-catbot-window").addClass("is-offline");
    }

    $("#🫆lsdev-catbot-button").click(function(){
        $("#🫆lsdev-catbot-window").slideToggle();
    });

    $("#🫆lsdev-catbot-window__close").click(function(){
        $("#🫆lsdev-catbot-window").hide();
    });
};
