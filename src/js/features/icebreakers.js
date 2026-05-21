export const suggestIcebreaker = () => {
    
    const icebreakers = [
        "What’s the story of the mysterious Samuel Shutt who lived in Blacksburg in the 1840s?",
        "If your “Rottweiler mix” puppy isn’t at all Rottweiler, what is he?",
        "What’s your interest in religion and gender?",
        "How did you get started in web development?",
        "How did you wind up in Blacksburg?",
        "What was it like riding polar bears to school?",
        "Why did you leave evangelicalism?",
        "What does muktuk taste like?",
        "What’s the most interesting interview question you’ve been asked?"
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