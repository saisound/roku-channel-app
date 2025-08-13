// This file contains the JavaScript functionality for the home screen component, including dynamic content loading.

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.querySelector('.home-content');

    // Function to load featured content dynamically
    const loadFeaturedContent = () => {
        // Example data for featured content
        const featuredItems = [
            {
                title: 'Stranger Things',
                image: 'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg',
                category: 'TV Series'
            },
            {
                title: 'Game of Thrones',
                image: 'https://image.tmdb.org/t/p/w500/1BIoJGKbXP6oFzwzqYgxuBvQMgm.jpg',
                category: 'TV Series'
            },
            {
                title: 'Breaking Bad',
                image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                category: 'TV Series'
            }
        ];

        // Create content items
        featuredItems.forEach(item => {
            const contentItem = document.createElement('div');
            contentItem.classList.add('content-item');

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;
            img.classList.add('poster-image');

            const overlay = document.createElement('div');
            overlay.classList.add('content-overlay');

            contentItem.appendChild(img);
            contentItem.appendChild(overlay);
            contentArea.appendChild(contentItem);
        });
    };

    loadFeaturedContent();
});