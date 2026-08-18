export const toggleMusic = () => {
    
    const audio =  document.querySelector("audio");
    const button = document.querySelector(".🎨lsdev-external-nav__icon--music");

    button.addEventListener("click",function(){

        const isPlaying = !audio.paused;

        isPlaying ? audio.pause() : audio.play();

        button.setAttribute("aria-pressed", !isPlaying);
    });
};
        