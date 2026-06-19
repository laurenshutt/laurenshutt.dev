export const weather = () => {

    const getWeatherData = async () => {

        try {
            // Served by the fern service and refreshed every 15 min.
            // Same-origin JSON — no API key in the client (see fern/integrations/weather.js).
            const res = await fetch("/fern/weather/current.json", { cache: "no-store" });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const temp = Math.round(data.temp);
            const desc = data.description;

            document.getElementById("🫆lsdev-hud__weather").innerHTML = `${temp} &deg;F ${desc}`;

        } catch (err) {

            console.error("Weather fetch failed:", err);

        }
    };

    // weather() runs from animateSequence ~2.5s in — well after `load` has already
    // fired — so a plain load listener would never run (that's why it "only loaded on
    // hard refresh"). Run now if the page is already loaded; otherwise wait for load.
    if (document.readyState === "complete") {
        getWeatherData();
    } else {
        window.addEventListener("load", getWeatherData, { once: true });
    }
}
