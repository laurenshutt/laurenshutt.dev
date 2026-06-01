export const weather = () => {
    
    const getWeatherData = async () => {

        console.log("loading weather");

        try {
            const res = await fetch(
                "https://api.openweathermap.org/data/2.5/weather?q=Blacksburg,Virginia&units=imperial&appid=61d80150d7a07a8b55fbe1ddf6f6fbd9"
            );

            const data = await res.json();
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;

            document.getElementById("🫆lsdev-hud__weather").innerHTML = `${temp} &deg;F ${desc}`;

        } catch (err) {

            console.error("Weather fetch failed:", err);

        }
    };

    window.addEventListener("load", () => {
        getWeatherData();
    });
}
