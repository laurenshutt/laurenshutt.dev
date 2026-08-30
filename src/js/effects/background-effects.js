import {
    cssToken,
    isMobileLayout
} from "../utils.js";

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
    if (isMobileLayout()) return;

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
            
    // One step each from the sage, mauve and blue ramps. These are read from the stylesheet rather
    // than restated here, but they have to stay hex tokens for hexToRgba below — a derived value
    // would arrive as an oklch() expression and parseInt would make nonsense of it.
    const glowColors = [
        cssToken("--💾lsdev-sage-600"),
        cssToken("--💾lsdev-mauve-400"),
        cssToken("--💾lsdev-blue-400")
    ];

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
        target.style.backgroundColor = cssToken("--💾lsdev-pink-700");
        trail.remove();
    }, 800);
};

const generatePoints = (width, height, minDist, maxPoints, padding = 0) => {

  const points = [];

  const minDistSq = minDist * minDist;

  let attempts = 0;

  const MAX_ATTEMPTS = maxPoints * 50;

  while (points.length < maxPoints && attempts++ < MAX_ATTEMPTS) {

    const x = padding + Math.random() * (width - padding * 2);

    const y = padding + Math.random() * (height - padding * 2);

    const valid = points.every(p => {

      const dx = x - p.x;

      const dy = y - p.y;

      return (dx * dx + dy * dy) >= minDistSq;

    });

    if (valid) points.push({ x, y });

  }

  return points;

};

export const floatingSquares = () => {

    const canvas = document.getElementById('🫆lsdev-floating-squares');
    const ctx = canvas.getContext('2d');

    const mouse = { x: null, y: null };

    // The other step of each of the same three ramps. Note the mauve does not follow the pattern:
    // the squares take the lighter sage and blue but the DARKER mauve, where the grid glow above
    // takes the darker sage and blue with the lighter mauve. That inconsistency is in the original
    // palette, not a slip here — preserved deliberately.
    const squareColors = [
        cssToken("--💾lsdev-sage-300"),
        cssToken("--💾lsdev-mauve-500"),
        cssToken("--💾lsdev-blue-300")
    ];
    const NUM_SQUARES = 5;

    let squares = [];

    class Square {

        constructor(delay = 0) {
            this.delay = delay;
            this.elapsed = 0;

            // 🟢 fallback prevents undefined errors before initSquares runs
            this.baseColor = squareColors[0];

            this.reset(true);
        }

        reset(initial = false) {
            this.size = 48 + Math.random() * 25;
            this.alpha = initial ? 0 : 0.01;
            this.fadeSpeed = 0.01 + Math.random() * 0.01;
            this.maxAlpha = 1;
            this.fadedIn = false;
            this.radius = 10 + Math.random() * 40;
            this.angle = Math.random() * Math.PI * 2;
            this.orbitSpeed = 0.0002 + Math.random() * 0.003;
        }

        update(deltaTime) {

            this.elapsed += deltaTime;

            if (this.elapsed < this.delay) return;

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

                    // 🟢 prevent divide-by-zero crash
                    const safeDist = dist || 0.0001;

                    this.centerX += (dx / safeDist) * force * 1.5;
                    this.centerY += (dy / safeDist) * force * 1.5;
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

            const half = this.size / 2;

            ctx.shadowColor = `rgba(0, 0, 0, ${this.alpha * 0.3})`;
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = this.hexToRgba(this.baseColor, this.alpha);
            ctx.fillRect(x - half, y - half, this.size, this.size);

            ctx.shadowColor = "transparent";
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - half, y - half, this.size, this.size);
        }

        hexToRgba(hex, alpha) {
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }

    const initSquares = () => {

        const padding = 75;

        const points = generatePoints(
            canvas.width,
            canvas.height,
            80,
            NUM_SQUARES,
            padding
        );

        // 🟢 guarantee at least one of each color
        const colorPool = [...squareColors];

        while (colorPool.length < NUM_SQUARES) {
            colorPool.push(
                squareColors[Math.floor(Math.random() * squareColors.length)]
            );
        }

        // 🟣 shuffle for natural distribution
        for (let i = colorPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
        }

        squares = points.map((p, i) => {

            const delay = i * 100;
            const sq = new Square(delay);

            sq.centerX = sq.homeX = p.x;
            sq.centerY = sq.homeY = p.y;

            // 🟣 controlled color assignment
            sq.baseColor = colorPool[i];

            return sq;
        });
    };

    const resizeCanvas = () => {

        const { width, height } = canvas.getBoundingClientRect();

        canvas.width = width;
        canvas.height = height;

        initSquares();
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

    

    