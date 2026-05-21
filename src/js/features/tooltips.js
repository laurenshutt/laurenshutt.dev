export const tooltips = () => {
    
    const tooltip = document.getElementById("🫆lsdev-tooltip");
    const tooltipText = document.getElementById("🫆lsdev-tooltip__text");
    const tooltipImg = document.getElementById("🫆lsdev-tooltip__img");

    let activeEl = null;

    document.querySelectorAll(".🎨lsdev-tooltip-trigger").forEach(el => {

        el.addEventListener("mouseenter", (e) => {
            
            activeEl = e.currentTarget;

            tooltipText.textContent = activeEl.dataset.tooltip;

            const img = activeEl.dataset.tooltipImg;

            if (img) {
                tooltipImg.src = img;

                // 🧠 add accessible alt text
                tooltipImg.alt = activeEl.dataset.tooltipImgAlt 
                    || activeEl.dataset.tooltip 
                    || "Tooltip image";

                tooltipImg.style.display = "block";
            } 
            else {
                tooltipImg.removeAttribute("src");
                tooltipImg.removeAttribute("alt");
                tooltipImg.style.display = "none";
            }

            tooltip.style.opacity = "1";
        });

        el.addEventListener("mousemove", (e) => {
            if (!activeEl) return;

            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
        });

        el.addEventListener("mouseleave", () => {
            activeEl = null;
            tooltip.style.opacity = "0";
        });
    });
}