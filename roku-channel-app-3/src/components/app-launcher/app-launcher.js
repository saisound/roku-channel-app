// File: /roku-channel-app/roku-channel-app/src/components/app-launcher/app-launcher.js

document.addEventListener('DOMContentLoaded', () => {
    const appLauncherContainer = document.querySelector('.app-launcher-container');
    
    // Sample data for apps
    const apps = [
        { name: 'Netflix', icon: 'assets/icons/netflix.png' },
        { name: 'YouTube', icon: 'assets/icons/youtube.png' },
        { name: 'Hulu', icon: 'assets/icons/hulu.png' },
        { name: 'Disney+', icon: 'assets/icons/disney-plus.png' },
        { name: 'Amazon Prime', icon: 'assets/icons/amazon-prime.png' },
    ];

    // Function to render apps
    const renderApps = () => {
        apps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.classList.add('app-item');
            appItem.innerHTML = `
                <img src="${app.icon}" alt="${app.name} icon" class="app-icon">
                <span class="app-name">${app.name}</span>
            `;
            appLauncherContainer.appendChild(appItem);
        });
    };

    // Initialize the app launcher
    renderApps();
});