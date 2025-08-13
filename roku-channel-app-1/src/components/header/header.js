// filepath: /roku-channel-app/roku-channel-app/src/components/header/header.js
document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.querySelector('.time');
    const updateTime = () => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    updateTime();
    setInterval(updateTime, 60000); // Update time every minute
});