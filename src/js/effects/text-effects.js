export const shuffleTextEffect = (element, totalDuration, shuffleSpeed, overlapFactor) => {
            
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const text = element.getAttribute("data-text").split("");

    function revealLetter(index) {
        
        let shuffleCount = 0;
        
        const maxShuffles = Math.floor(totalDuration / shuffleSpeed);
        const targetLetter = text[index];

        const shuffleInterval = setInterval(() => {
            let displayedText = text
                .slice(0, index) // Keep all previous letters fixed
                .join("") +
                letters[Math.floor(Math.random() * letters.length)]; // Shuffle current letter

            element.textContent = displayedText;

            shuffleCount++;
            if (shuffleCount >= maxShuffles) {
                clearInterval(shuffleInterval);
                element.textContent = text.slice(0, index + 1).join(""); // Lock in letter
            }
        }, shuffleSpeed);

        if (index + 1 < text.length) {
            setTimeout(() => revealLetter(index + 1), shuffleSpeed * maxShuffles * overlapFactor);
        }
    }

    revealLetter(0);
}

export const loadingPhrases = () => {
        
    const phrases = [
        "Planting turnips, please wait...",
        "Mining for inspiration...",
        "Feeding the chickens",
        "Petting the cat (essential)",
        "Day 1 of Spring: Ready",
        "Upgrading pickaxe and portfolio...",
        "You fell asleep at 2 a.m., autosave",
        "Received letter: “Love your UI!” – Mayor Lewis",
        "Summoning cat on keyboard...",
        "Knocking code off the desk...",
        "Automating farm tasks with JavaScript...",
        "Rain forecasted, perfect day to build!",
        "Cloudy with a chance of feature requests",
        "Geodes cracked: Found a bug",
        "Starting day 102",
        "Shane gave you: A functional navbar!",
        "Received: Coffee buff (+25% typing speed)",
        "The traveling cart sells grid layouts today",
        "A junimo is gently debugging this for you...",
        "Foraging for ideas...",
        "Your code has levelled up!"
    ];

    let currentIndex = 0;
    let charIndex = 0;
    let currentPhrase = phrases[currentIndex];

    const line1 = document.getElementById('🫆line-1');
    const line2 = document.getElementById('🫆line-2');
    const line3 = document.getElementById('🫆line-3');

    const typingSpeed = 50;
    const pauseAfterTyping = 2000;

    function typeLoop() {
        if (charIndex <= currentPhrase.length) {
            line3.textContent = currentPhrase.substring(0, charIndex++);
            setTimeout(typeLoop, typingSpeed);
        } else {
            // shift lines up
            setTimeout(() => {
                line1.textContent = line2.textContent;
                line2.textContent = line3.textContent;
                charIndex = 0;
                currentIndex = (currentIndex + 1) % phrases.length;
                currentPhrase = phrases[currentIndex];
                typeLoop();
            }, pauseAfterTyping);
        }
    }

    typeLoop();
}

