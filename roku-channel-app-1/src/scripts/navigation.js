// This file contains JavaScript for handling navigation between different pages.

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const targetPage = event.currentTarget.dataset.target;
            navigateToPage(targetPage);
        });
    });

    function navigateToPage(page) {
        window.location.href = `${page}.html`;
    }
});