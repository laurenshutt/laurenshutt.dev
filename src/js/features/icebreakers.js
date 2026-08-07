export const suggestIcebreaker = () => {
    
    const icebreakers = [
        "How did you get started in web development?",
        "How did you wind up in Blacksburg?",
        "What was it like riding polar bears to school?",
        "What does muktuk taste like?",
    ]        

    const icebreakerButton =  document.getElementById("🫆lsdev-button--icebreaker");
    const icebreakerText = document.getElementById("🫆lsdev-icebreaker__text");
    const sendIcebreaker = document.getElementById("🫆lsdev-send-icebreaker");

    let shuffled = [...icebreakers].sort(() => Math.random() - 0.5);
    let i = 0;

    icebreakerButton.addEventListener("click", () => {
        if (i >= shuffled.length) {
            shuffled = [...icebreakers].sort(() => Math.random() - 0.5);
            i = 0;
        }

        icebreakerText.textContent = shuffled[i++];
        sendIcebreaker.style.display = "inline";
    });
}        