// This file contains JavaScript for managing the on-screen keyboard functionality.

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const keyButtons = document.querySelectorAll('.key-btn');

    keyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            searchInput.value += key;
            searchInput.focus();
        });
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            searchInput.value = searchInput.value.slice(0, -1);
        }
    });
});