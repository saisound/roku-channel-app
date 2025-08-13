// filepath: /roku-channel-app/roku-channel-app/src/components/sidebar/sidebar.js

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            // Add navigation logic here
        });
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', (event) => {
        const activeItem = document.querySelector('.nav-item.active');
        let index = Array.from(navItems).indexOf(activeItem);
        
        if (event.key === 'ArrowDown') {
            index = (index + 1) % navItems.length;
            navItems[index].focus();
        } else if (event.key === 'ArrowUp') {
            index = (index - 1 + navItems.length) % navItems.length;
            navItems[index].focus();
        }
    });
});