const grid = document.getElementById("🫆lsdev-bg-grid");

const hexToRgba = (hex, alpha) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const createGrid = () => {
            
    if (!grid) return;

    const cols = Math.floor(window.innerWidth / 32);
    const rows = Math.floor(window.innerHeight / 32);

    grid.innerHTML = "";
    Object.assign(grid.style, {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
    });

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement("div");
        cell.className = "🎨lsdev-bg-grid__cell";

        const row = Math.floor(i / cols);
        const col = i % cols;
        cell.style.animationDelay = `${row * 50 + col * 25}ms`;

        fragment.appendChild(cell);
    }

    grid.appendChild(fragment);

    grid.onpointerover = handleGridHover;
};

export const handleGridHover = ({ target }) => {
            
    const glowColors = ["#a7ba9e", "#c0a4c5", "#85a4c7"];

    if (!target.matches(".🎨lsdev-bg-grid__cell")) return;

    const baseColor = glowColors[Math.floor(Math.random() * glowColors.length)];
    const opacity = 0 + Math.random() * 1;
    target.style.backgroundColor = hexToRgba(baseColor, opacity);

    const trail = document.createElement("div");
    trail.className = "🎨lsdev-fade-trail";
    trail.style.left = target.offsetLeft + "px";
    trail.style.top = target.offsetTop + "px";
    grid.appendChild(trail);

    setTimeout(() => {
        target.style.backgroundColor = "#f8c9cd";
        trail.remove();
    }, 800);
};

export const floatingSquares = () => {

    const canvas = document.getElementById('🫆lsdev-floating-squares');
    const ctx = canvas.getContext('2d');
    const mouse = { x: null, y: null };
    const squareColors = ["#89a27d", "#a880ad", "#5e86b5"];
    const NUM_SQUARES = 10;

    const resizeCanvas = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX;
        mouse.y = (e.clientY - rect.top) * scaleY;
    });

    class Square {
        
        constructor(delay = 0) {
            this.delay = delay;          
            this.elapsed = 0;
            this.reset(true);
        }

        reset(initial = false) {
            this.size = 25 + Math.random() * 25;
            this.baseColor = squareColors[Math.floor(Math.random() * squareColors.length)];
            this.alpha = initial ? 0 : 0.01;
            this.fadeSpeed = 0.01 + Math.random() * 0.01;
            this.maxAlpha = 1;
            this.fadedIn = false;

            this.radius = 10 + Math.random() * 40;
            const buffer = this.radius + this.size;

            let x, y, valid = false, attempts = 0;
            while (!valid && attempts++ < 100) {
                x = buffer + Math.random() * (canvas.width - 2 * buffer);
                y = buffer + Math.random() * (canvas.height - 2 * buffer);
                valid = squares.every(other => {
                    const dx = x - other.centerX;
                    const dy = y - other.centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return dist >= (50 + Math.random() * 20);
                });
            }

            this.centerX = this.homeX = x;
            this.centerY = this.homeY = y;
            this.angle = Math.random() * Math.PI * 2;
            this.orbitSpeed = 0.0002 + Math.random() * 0.003;
        }

        update(deltaTime) {
            this.elapsed += deltaTime;
            if (this.elapsed < this.delay) return; // Wait for delay

            if (!this.fadedIn) {
                this.alpha += this.fadeSpeed;
                if (this.alpha >= this.maxAlpha) {
                    this.alpha = this.maxAlpha;
                    this.fadedIn = true;
                }
            }

            // Repel from mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.centerX - mouse.x;
                const dy = this.centerY - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.centerX += (dx / dist) * force * 1.5;
                    this.centerY += (dy / dist) * force * 1.5;
                }
            }

            // Return to home
            this.centerX += (this.homeX - this.centerX) * 0.01;
            this.centerY += (this.homeY - this.centerY) * 0.01;

            // Orbit motion
            this.angle += this.orbitSpeed;
            const offsetX = Math.cos(this.angle) * this.radius;
            let offsetY = Math.sin(this.angle) * this.radius;

            // Float-up during fade-in
            if (!this.fadedIn) {
                offsetY += Math.pow(1 - this.alpha, 2) * 30;
            }

            this.draw(this.centerX + offsetX, this.centerY + offsetY);
        }

        draw(x, y) {
            // Shadow settings
            ctx.shadowColor = `rgba(0, 0, 0, ${this.alpha * 0.3})`; // or any other color
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6; // shift the shadow downward

            ctx.shadowOffsetY = 4;

            // Draw filled square
            ctx.fillStyle = this.hexToRgba(this.baseColor, this.alpha);
            ctx.fillRect(x, y, this.size, this.size);

            // Reset shadow for stroke (optional — keeps stroke clean)
            ctx.shadowColor = "transparent";

            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, this.size, this.size);
        }

        hexToRgba(hex, alpha) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    }

    const squares = [];

    for (let i = 0; i < NUM_SQUARES; i++) {
        const delay = i * 75; 
        squares.push(new Square(delay));
    }

    let lastTime = performance.now();
    const animate = (currentTime) => {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        squares.forEach(square => square.update(deltaTime));
        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
};
    
export const createSquares = () => {
    
    const containers = document.querySelectorAll(".squares-bg");

    containers.forEach(container => {
        
        const size = 12;
        const minSpacing = 5;

        const width = container.clientWidth;
        const height = container.clientHeight;
        
        if (!width || !height) return;

        const existing = [...container.querySelectorAll(".square")].map(sq => ({
            x: parseFloat(sq.style.left) || 0,
            y: parseFloat(sq.style.top) || 0
        }));

        let validPosition = false;
        let x, y;

        let attempts = 0;
        const MAX_ATTEMPTS = 200;

        while (!validPosition && attempts++ < MAX_ATTEMPTS) {
            
            x = Math.random() * (width - size);
            y = Math.random() * (height - size);

            validPosition = true;

            for (let i = 0; i < existing.length; i++) {
                
                const dx = x - existing[i].x;
                const dy = y - existing[i].y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < size + minSpacing) {
                    validPosition = false;
                    break;
                }
            }
        }

        if (!validPosition) return;

        const square = document.createElement("div");
        
        square.className = "square";
        square.style.left = `${x}px`;
        square.style.top = `${y}px`;
        
        container.appendChild(square);

        setTimeout(() => square.remove(), 3000);
    });
};
    

    