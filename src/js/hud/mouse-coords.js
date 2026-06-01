export const createMouseTracker = () => {

    const coordsEl = document.getElementById('🫆lsdev-hud__coords');
    coordsEl.textContent = "x: 0, y: 0";
    let client = { x: 0, y: 0 };
    let extraScroll = 0; // 👈 this will come from your container

    const update = () => {
        const x = Math.round(client.x + window.scrollX);
        const y = Math.round(client.y + window.scrollY + extraScroll);
        coordsEl.textContent = `x: ${x}, y: ${y}`;
    };

    window.addEventListener('mousemove', (e) => {
        client.x = e.clientX;
        client.y = e.clientY;
        update();
    });

    window.addEventListener('scroll', update);

    return {
        setExtraScroll: (val) => {
            extraScroll = val;
            update();
        }
    };
};

