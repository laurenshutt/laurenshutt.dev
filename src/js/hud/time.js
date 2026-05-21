export const startTheClock = () => {

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: false
    });

    const updateClock = () => {
        const now = new Date();
        const parts = formatter.formatToParts(now);
        const time = parts
            .filter(p => p.type !== 'timeZoneName')
            .map(p => p.value)
            .join('');
        const tz = parts.find(p => p.type === 'timeZoneName')?.value;
        document.getElementById('🫆lsdev-hud__time').textContent = time;
        document.getElementById('timezone').textContent = tz;
    };

    updateClock();
    setInterval(updateClock, 1000);
}