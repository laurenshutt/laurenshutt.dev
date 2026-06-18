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

    window.addEventListener("load", () => {
        getWeatherData();
    });
}
