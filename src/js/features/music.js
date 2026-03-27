export const toggleMusic = (() => {
    
    const audio =  document.querySelector("audio");
    const $button = $(".🎨lsdev-sidebar-nav__icon--music");

    $button.click(function(){

        const isPlaying = !audio.paused;

        isPlaying ? audio.pause() : audio.play();

        $button.attr("aria-pressed", !isPlaying);
    });
})();
        