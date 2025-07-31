// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.querySelector('.content-area');
    
    // Focus management
    let currentFocus = 'sidebar'; // 'sidebar' or 'content'
    let currentNavIndex = 1; // Start with Home (second item)
    let currentPageNavIndex = 1; // Track the current page/section (persists when focus moves to content)
    let currentContentRow = 0;
    let currentContentItem = 0;
    
    // Search functionality variables
    let searchQuery = '';
    let currentKeyboardRow = 0;
    let currentKeyboardCol = 0;
    let searchFocus = 'keyboard'; // 'keyboard' or 'results'
    
    const keyboardLayout = [
        ['a', 'b', 'c', 'd', 'e', 'f'],
        ['g', 'h', 'i', 'j', 'k', 'l'],
        ['m', 'n', 'o', 'p', 'q', 'r'],
        ['s', 't', 'u', 'v', 'w', 'x'],
        ['y', 'z', '1', '2', '3', '4'],
        ['5', '6', '7', '8', '9', '0'],
        ['delete', 'space', 'clear']
    ];

    // Add focus indicators
    addFocusStyles();

    // Initialize focus
    updateFocus();

    // Initialize progress bars
    initializeProgressBars();

    // Ensure all rows have exactly 10 items
    ensureMinimumItemsPerRow();

    // Handle navigation item clicks
    navItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Update current nav index to keep focus in sync
            currentNavIndex = index;
            currentPageNavIndex = index; // Also update current page
            
            // Get the section name
            const sectionName = this.querySelector('span').textContent;
            
            // Update content based on selection
            updateContent(sectionName);
        });
    });

    // Handle content item interactions
    function addContentItemListeners() {
        const contentItems = document.querySelectorAll('.content-item');
        contentItems.forEach(item => {
            item.addEventListener('click', function() {
                console.log('Content item clicked:', this.querySelector('h3').textContent);
            });
        });
    }

    // Add focus styles
    function addFocusStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .nav-item,
            .nav-item:hover,
            .nav-item:focus,
            .nav-item.active,
            .nav-item.focused,
            .sidebar .nav-item,
            .sidebar .nav-item:hover,
            .sidebar .nav-item:focus,
            .sidebar .nav-item.active,
            .sidebar .nav-item.focused,
            .sidebar.collapsed .nav-item,
            .sidebar.collapsed .nav-item:hover,
            .sidebar.collapsed .nav-item:focus,
            .sidebar.collapsed .nav-item.active,
            .sidebar.collapsed .nav-item.focused {
                transform: none !important;
                scale: none !important;
                -webkit-transform: none !important;
                -moz-transform: none !important;
                -ms-transform: none !important;
                -o-transform: none !important;
                transition: background-color 0.2s ease, border 0.2s ease, box-shadow 0.2s ease !important;
            }
            
            .nav-item {
                border: none !important;
                outline: none !important;
            }
            
            .nav-item.focused {
                background: rgba(255, 255, 255, 0.25) !important;
                border: 3px solid #FFFFFF !important;
                border-radius: 12px !important;
                margin: 0 !important;
                padding: 16px 40px !important;
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
            }
            
            .sidebar.collapsed .nav-item.focused {
                margin: 0 !important;
                padding: 16px 20px !important;
            }
            
            .content-item.focused {
                border: 4px solid #FFFFFF !important;
                border-radius: 0 !important;
                transition: all 0.2s ease;
                z-index: 10;
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize progress bars for Continue Watching row
    function initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        // Animate progress bars on load
        setTimeout(() => {
            progressBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress') || 0;
                bar.style.width = `${progress}%`;
            });
        }, 500); // Delay to allow for page load
    }

    // Ensure all content rows have exactly 10 items and create infinite carousel
    function ensureMinimumItemsPerRow() {
        const targetItemsPerRow = 10;
        const contentRows = document.querySelectorAll('.content-row');
        
        contentRows.forEach(row => {
            const contentGrid = row.querySelector('.content-grid');
            if (contentGrid) {
                const originalItems = Array.from(contentGrid.querySelectorAll('.content-item:not(.cloned)'));
                const currentItemCount = originalItems.length;
                
                // Remove any existing clones
                contentGrid.querySelectorAll('.content-item.cloned').forEach(item => item.remove());
                
                if (currentItemCount > 0) {
                    // If we have fewer than 10 items, create additional unique content
                    if (currentItemCount < targetItemsPerRow) {
                        const additionalItemsNeeded = targetItemsPerRow - currentItemCount;
                        
                        for (let i = 0; i < additionalItemsNeeded; i++) {
                            // Create a new unique content item
                            const newItem = createAdditionalContentItem(currentItemCount + i, row);
                            contentGrid.appendChild(newItem);
                        }
                    }
                    
                    // Update the list of original items after adding new ones
                    const updatedOriginalItems = Array.from(contentGrid.querySelectorAll('.content-item:not(.cloned)'));
                    const finalItemCount = updatedOriginalItems.length;
                    
                    // Create enough clones for seamless infinite scrolling
                    const totalItemsNeeded = Math.max(targetItemsPerRow, finalItemCount * 3);
                    
                    // Add clones after original items for seamless forward scrolling
                    for (let i = 0; i < totalItemsNeeded; i++) {
                        const sourceIndex = i % finalItemCount;
                        const sourceItem = updatedOriginalItems[sourceIndex];
                        const clonedItem = sourceItem.cloneNode(true);
                        
                        // Mark as cloned for identification
                        clonedItem.classList.add('cloned');
                        clonedItem.setAttribute('data-original-index', sourceIndex);
                        clonedItem.setAttribute('data-clone-group', Math.floor(i / finalItemCount));
                        
                        contentGrid.appendChild(clonedItem);
                    }
                    
                    // Add clones before original items for seamless backward scrolling
                    for (let i = 0; i < finalItemCount; i++) {
                        const sourceIndex = (finalItemCount - 1 - i);
                        const sourceItem = updatedOriginalItems[sourceIndex];
                        const clonedItem = sourceItem.cloneNode(true);
                        
                        clonedItem.classList.add('cloned', 'pre-clone');
                        clonedItem.setAttribute('data-original-index', sourceIndex);
                        
                        contentGrid.insertBefore(clonedItem, contentGrid.firstChild);
                    }
                    
                    // Store original count for navigation logic
                    contentGrid.setAttribute('data-original-count', finalItemCount);
                    
                    // Set initial scroll position to show original items
                    const firstOriginal = contentGrid.querySelector('.content-item:not(.cloned)');
                    if (firstOriginal) {
                        contentGrid.scrollLeft = firstOriginal.offsetLeft;
                    }
                    
                    // Add infinite scroll monitoring
                    addInfiniteScrollMonitoring(contentGrid, finalItemCount);
                }
            }
        });
        
        console.log(`Created infinite carousel with exactly ${targetItemsPerRow} items per row`);
    }
    
    // Create additional content items to reach the target count
    function createAdditionalContentItem(index, row) {
        const additionalContent = [
            { title: 'The Mandalorian', category: 'action' },
            { title: 'House of the Dragon', category: 'drama' },
            { title: 'Wednesday', category: 'comedy' },
            { title: 'Top Gun: Maverick', category: 'action' },
            { title: 'Everything Everywhere All at Once', category: 'sci-fi' },
            { title: 'The Menu', category: 'thriller' },
            { title: 'Glass Onion', category: 'mystery' },
            { title: 'RRR', category: 'action' },
            { title: 'Nope', category: 'horror' },
            { title: 'Euphoria', category: 'drama' },
            { title: 'Ozark', category: 'crime' },
            { title: 'Squid Game', category: 'thriller' },
            { title: 'The Crown', category: 'drama' },
            { title: 'Ted Lasso', category: 'comedy' },
            { title: 'Mare of Easttown', category: 'crime' },
            { title: 'Succession', category: 'drama' },
            { title: 'The White Lotus', category: 'drama' },
            { title: 'Bridgerton', category: 'romance' },
            { title: 'The Queen\'s Gambit', category: 'drama' },
            { title: 'Money Heist', category: 'crime' }
        ];
        
        const content = additionalContent[index % additionalContent.length];
        
        const newItem = document.createElement('div');
        newItem.className = 'content-item';
        newItem.innerHTML = `
            <div class="content-placeholder"></div>
            <h3>${content.title}</h3>
        `;
        
        return newItem;
    }
    
    // Monitor scroll position and reset when needed for infinite effect
    function addInfiniteScrollMonitoring(contentGrid, originalCount) {
        let isResetting = false;
        
        const handleInfiniteScroll = () => {
            if (isResetting) return;
            
            const scrollLeft = contentGrid.scrollLeft;
            const itemWidth = 300; // Approximate item width including gaps
            const preCloneWidth = originalCount * itemWidth;
            const originalSectionWidth = originalCount * itemWidth;
            
            // If scrolled too far right, reset to equivalent position on the left
            if (scrollLeft > preCloneWidth + (originalSectionWidth * 2)) {
                isResetting = true;
                const excessScroll = scrollLeft - (preCloneWidth + originalSectionWidth);
                const newPosition = preCloneWidth + (excessScroll % originalSectionWidth);
                
                contentGrid.style.scrollBehavior = 'auto';
                contentGrid.scrollLeft = newPosition;
                
                setTimeout(() => {
                    contentGrid.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);
            }
            
            // If scrolled too far left, reset to equivalent position on the right
            if (scrollLeft < preCloneWidth * 0.3) {
                isResetting = true;
                const deficit = preCloneWidth - scrollLeft;
                const newPosition = preCloneWidth + originalSectionWidth - (deficit % originalSectionWidth);
                
                contentGrid.style.scrollBehavior = 'auto';
                contentGrid.scrollLeft = newPosition;
                
                setTimeout(() => {
                    contentGrid.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);
            }
        };
        
        // Monitor scroll events
        contentGrid.addEventListener('scroll', handleInfiniteScroll);
        
        // Store the handler for potential cleanup
        contentGrid._infiniteScrollHandler = handleInfiniteScroll;
    }

    // Update focus visualization
    function updateFocus() {
        // Clear all focus states, focus titles, and row counters
        document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
        document.querySelectorAll('.content-focus-title').forEach(title => title.remove());
        document.querySelectorAll('.content-info-panel').forEach(panel => panel.remove());
        document.querySelectorAll('.content-row').forEach(row => {
            row.classList.remove('pushed-down');
            row.classList.remove('has-focus-title');
        });
        document.querySelectorAll('.row-counter').forEach(counter => counter.remove());
        
        // Update current page indicator (separate from focus)
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('current-page'));
        if (navItems[currentPageNavIndex]) {
            navItems[currentPageNavIndex].classList.add('current-page');
        }
        
        // Handle sidebar collapse/expand based on focus
        const sidebar = document.querySelector('.sidebar');
        if (currentFocus === 'sidebar') {
            // Expand sidebar when focused
            sidebar.classList.remove('collapsed');
            const navItem = navItems[currentNavIndex];
            if (navItem) {
                navItem.classList.add('focused');
                navItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Update current page when navigating in sidebar
                currentPageNavIndex = currentNavIndex;
                
                // Update content based on the focused navigation item
                const sectionName = navItem.querySelector('span').textContent;
                updateContentForNavigation(sectionName);
            }
        } else {
            // Collapse sidebar when focus moves away (content or search)
            sidebar.classList.add('collapsed');
            
            if (currentFocus === 'content') {
                const rows = document.querySelectorAll('.content-row');
                if (rows[currentContentRow]) {
                    const contentGrid = rows[currentContentRow].querySelector('.content-grid');
                    const originalCount = parseInt(contentGrid?.getAttribute('data-original-count') || 0);
                    
                    if (originalCount > 0) {
                        // Working with infinite carousel
                        const targetItem = findBestVisibleItem(contentGrid, currentContentItem);
                        
                        if (targetItem) {
                            targetItem.classList.add('focused');
                            
                            // Special handling for first tile (index 0) - keep it in place when transitioning from sidebar
                            if (currentContentItem === 0) {
                                // Don't scroll when focusing the first tile from sidebar transition
                                // The first tile should stay in its current position
                                console.log('🎯 Focusing first tile - staying in place');
                            } else {
                                // For other tiles, ensure optimal positioning
                                const itemLeft = targetItem.offsetLeft;
                                const gridWidth = contentGrid.clientWidth;
                                const currentScrollLeft = contentGrid.scrollLeft;
                                const optimalPosition = itemLeft - (gridWidth * 0.1);
                                
                                // Only scroll if the item isn't already well-positioned
                                const currentItemPosition = itemLeft - currentScrollLeft;
                                if (currentItemPosition < gridWidth * 0.05 || currentItemPosition > gridWidth * 0.8) {
                                    contentGrid.scrollTo({ left: optimalPosition, behavior: 'smooth' });
                                }
                            }
                            
                            // Show content title between rows
                            showContentTitleBetweenRows(targetItem, currentContentRow);
                            
                            // Add counter to row title
                            addRowCounter(currentContentRow);
                        }
                    } else {
                        // Fallback for non-infinite rows
                        const items = rows[currentContentRow].querySelectorAll('.content-item');
                        if (items[currentContentItem]) {
                            items[currentContentItem].classList.add('focused');
                            
                            // Snap-to-start scrolling logic for non-infinite rows
                            const contentGrid = items[currentContentItem].parentElement;
                            if (contentGrid) {
                                const itemLeft = items[currentContentItem].offsetLeft;
                                // Always snap to start position for focused tile
                                contentGrid.scrollTo({ left: itemLeft, behavior: 'smooth' });
                            }
                            
                            showContentTitleBetweenRows(items[currentContentItem], currentContentRow);
                            addRowCounter(currentContentRow);
                        }
                    }
                    
                    // Scroll vertically to align the focused row to the top of the screen
                    const contentArea = document.querySelector('.content-area');
                    const currentRow = rows[currentContentRow];
                    if (contentArea && currentRow) {
                        currentRow.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                }
            }
            // Search mode focus is handled separately in the search functions
        }
    }

    // Add counter to the row title
    function addRowCounter(rowIndex) {
        const rows = document.querySelectorAll('.content-row');
        const currentRow = rows[rowIndex];
        
        if (currentRow) {
            const rowTitle = currentRow.querySelector('.row-title');
            const contentGrid = currentRow.querySelector('.content-grid');
            const originalCount = parseInt(contentGrid?.getAttribute('data-original-count') || 0);
            
            if (rowTitle) {
                // Create counter element as a separate span
                const counter = document.createElement('span');
                counter.className = 'row-counter';
                
                if (originalCount > 0) {
                    // Use original count for infinite carousel
                    const currentItemPosition = currentContentItem + 1;
                    counter.textContent = `${currentItemPosition} of ${originalCount}`;
                } else {
                    // Fallback for non-infinite rows
                    const itemsInRow = currentRow.querySelectorAll('.content-item');
                    const totalItems = itemsInRow.length;
                    const currentItemPosition = currentContentItem + 1;
                    counter.textContent = `${currentItemPosition} of ${totalItems}`;
                }
                
                // Append to row title (will be positioned on the right due to flex layout)
                rowTitle.appendChild(counter);
            }
        }
    }

    // Show content title between the focused row and the next row
    function showContentTitleBetweenRows(contentItem, rowIndex) {
        const title = contentItem.querySelector('h3').textContent;
        const contentInfo = getContentInfo(contentItem);
        const rows = document.querySelectorAll('.content-row');
        const currentRow = rows[rowIndex];
        
        if (currentRow) {
            // Add class to reduce margin on current row
            currentRow.classList.add('has-focus-title');
            
            // Create content focus title element
            const focusTitle = document.createElement('div');
            focusTitle.className = 'content-focus-title';
            
            // Create title text element
            const titleText = document.createElement('span');
            titleText.className = 'title-text';
            titleText.textContent = title;
            
            // Create details text element
            const detailsText = document.createElement('span');
            detailsText.className = 'details-text';
            detailsText.textContent = contentInfo.meta;
            
            // Append both title and details to the focus title
            focusTitle.appendChild(titleText);
            focusTitle.appendChild(detailsText);
            
            // Insert after the current row
            currentRow.insertAdjacentElement('afterend', focusTitle);
            
            // Show with animation
            setTimeout(() => {
                focusTitle.classList.add('visible');
            }, 50);
        }
    }

    // Show content information panel
    function showContentInfo(contentItem, rowIndex) {
        const contentInfo = getContentInfo(contentItem);
        
        // Create info panel
        const infoPanel = document.createElement('div');
        infoPanel.className = 'content-info-panel';
        infoPanel.innerHTML = `
            <div class="content-info-title">${contentInfo.title}</div>
            <div class="content-info-meta">${contentInfo.meta}</div>
        `;
        
        // Add panel to content item
        contentItem.appendChild(infoPanel);
        
        // Show panel with animation
        setTimeout(() => {
            infoPanel.classList.add('visible');
        }, 50);
        
        // Push down subsequent rows
        const rows = document.querySelectorAll('.content-row');
        for (let i = rowIndex + 1; i < rows.length; i++) {
            rows[i].classList.add('pushed-down');
        }
    }

    // Get content information based on the content item
    function getContentInfo(contentItem) {
        const title = contentItem.querySelector('h3').textContent;
        const contentData = {
            'The Lion King': { rating: 'PG', runtime: '118 min', year: '2019' },
            'Avengers: Infinity War': { rating: 'PG-13', runtime: '149 min', year: '2018' },
            'The Shawshank Redemption': { rating: 'R', runtime: '142 min', year: '1994' },
            'Spider-Man: No Way Home': { rating: 'PG-13', runtime: '148 min', year: '2021' },
            'Stranger Things': { rating: 'TV-14', runtime: '51 min', year: '2016' },
            'Game of Thrones': { rating: 'TV-MA', runtime: '57 min', year: '2011' },
            'Breaking Bad': { rating: 'TV-MA', runtime: '47 min', year: '2008' },
            'The Office': { rating: 'TV-14', runtime: '22 min', year: '2005' },
            'Avatar': { rating: 'PG-13', runtime: '162 min', year: '2009' },
            'The Dark Knight': { rating: 'PG-13', runtime: '152 min', year: '2008' },
            'Forrest Gump': { rating: 'PG-13', runtime: '142 min', year: '1994' },
            'The Matrix': { rating: 'R', runtime: '136 min', year: '1999' },
            'Superbad': { rating: 'R', runtime: '113 min', year: '2007' },
            'Zombieland': { rating: 'R', runtime: '88 min', year: '2009' },
            'Pineapple Express': { rating: 'R', runtime: '111 min', year: '2008' },
            'Step Brothers': { rating: 'R', runtime: '98 min', year: '2008' },
            'Interstellar': { rating: 'PG-13', runtime: '169 min', year: '2014' },
            'Blade Runner 2049': { rating: 'R', runtime: '164 min', year: '2017' },
            'Star Wars: The Empire Strikes Back': { rating: 'PG', runtime: '124 min', year: '1980' },
            'Dune': { rating: 'PG-13', runtime: '155 min', year: '2021' },
            'Get Out': { rating: 'R', runtime: '104 min', year: '2017' },
            'Hereditary': { rating: 'R', runtime: '127 min', year: '2018' },
            'A Quiet Place': { rating: 'PG-13', runtime: '90 min', year: '2018' },
            'The Conjuring': { rating: 'R', runtime: '112 min', year: '2013' },
            'The Godfather': { rating: 'R', runtime: '175 min', year: '1972' },
            'Goodfellas': { rating: 'R', runtime: '146 min', year: '1990' },
            'Pulp Fiction': { rating: 'R', runtime: '154 min', year: '1994' },
            'Schindler\'s List': { rating: 'R', runtime: '195 min', year: '1993' },
            'Toy Story': { rating: 'G', runtime: '81 min', year: '1995' },
            'Shrek': { rating: 'PG', runtime: '90 min', year: '2001' },
            'Finding Nemo': { rating: 'G', runtime: '100 min', year: '2003' },
            'The Incredibles': { rating: 'PG', runtime: '125 min', year: '2004' },
            'Making a Murderer': { rating: 'TV-MA', runtime: '60 min', year: '2015' },
            'Tiger King': { rating: 'TV-MA', runtime: '47 min', year: '2020' },
            'The Staircase': { rating: 'TV-MA', runtime: '55 min', year: '2018' },
            'Wild Wild Country': { rating: 'TV-MA', runtime: '60 min', year: '2018' },
            'Parasite': { rating: 'R', runtime: '132 min', year: '2019' },
            'Amélie': { rating: 'R', runtime: '122 min', year: '2001' },
            'Cinema Paradiso': { rating: 'PG', runtime: '155 min', year: '1988' },
            'Life is Beautiful': { rating: 'PG-13', runtime: '116 min', year: '1997' },
            'The Notebook': { rating: 'PG-13', runtime: '123 min', year: '2004' },
            'Titanic': { rating: 'PG-13', runtime: '194 min', year: '1997' },
            'Casablanca': { rating: 'PG', runtime: '102 min', year: '1942' },
            'When Harry Met Sally': { rating: 'R', runtime: '96 min', year: '1989' },
            'Avengers: Endgame': { rating: 'PG-13', runtime: '181 min', year: '2019' },
            'Aquaman': { rating: 'PG-13', runtime: '143 min', year: '2018' },
            'Black Panther': { rating: 'PG-13', runtime: '134 min', year: '2018' },
            'Wonder Woman': { rating: 'PG-13', runtime: '141 min', year: '2017' },
            'Friends': { rating: 'TV-14', runtime: '22 min', year: '1994' },
            'Seinfeld': { rating: 'TV-PG', runtime: '22 min', year: '1989' },
            'The Sopranos': { rating: 'TV-MA', runtime: '55 min', year: '1999' },
            'Cheers': { rating: 'TV-PG', runtime: '30 min', year: '1982' }
        };
        
        const data = contentData[title] || { rating: 'NR', runtime: '120 min', year: '2023' };
        
        return {
            title: title,
            meta: `${data.rating} • ${data.runtime} • ${data.year}`
        };
    }

    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        e.preventDefault(); // Prevent default scrolling
        
        // Handle search interface navigation
        if (currentFocus === 'search') {
            switch(e.key) {
                case 'ArrowUp':
                    handleSearchNavigation('up');
                    break;
                case 'ArrowDown':
                    handleSearchNavigation('down');
                    break;
                case 'ArrowLeft':
                    handleSearchNavigation('left');
                    break;
                case 'ArrowRight':
                    handleSearchNavigation('right');
                    break;
                case 'Enter':
                case ' ': // Spacebar
                    handleKeyInput();
                    break;
                case 'Escape':
                case 'Backspace':
                    // Exit search mode
                    currentFocus = 'sidebar';
                    updateFocus();
                    // Switch back to Home
                    const homeNav = document.querySelector('.nav-item:nth-child(2)');
                    if (homeNav) {
                        homeNav.click();
                    }
                    break;
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp':
                handleArrowUp();
                break;
            case 'ArrowDown':
                handleArrowDown();
                break;
            case 'ArrowLeft':
                handleArrowLeft();
                break;
            case 'ArrowRight':
                handleArrowRight();
                break;
            case 'Enter':
            case ' ': // Spacebar
                handleSelect();
                break;
            case 'Escape':
            case 'Backspace':
                handleBack();
                break;
            case 'Home':
                handleHome();
                break;
            case 'End':
                handleEnd();
                break;
            // TV Remote specific buttons
            case 'F1': // Options/Menu button
                console.log('Options menu triggered');
                break;
            case 'F2': // Info button
                console.log('Info panel triggered');
                break;
            case 'F3': // Search button
                focusSearchNavigation();
                break;
        }
        
        updateFocus();
    });

    function handleArrowUp() {
        if (currentFocus === 'sidebar') {
            if (currentNavIndex > 0) {
                currentNavIndex--;
            }
        } else if (currentFocus === 'content') {
            if (currentContentRow > 0) {
                currentContentRow--;
                // Adjust content item index if new row has fewer items
                const newRowItems = document.querySelectorAll('.content-row')[currentContentRow]?.querySelectorAll('.content-item');
                if (newRowItems && currentContentItem >= newRowItems.length) {
                    currentContentItem = newRowItems.length - 1;
                }
            }
        }
    }

    function handleArrowDown() {
        if (currentFocus === 'sidebar') {
            if (currentNavIndex < navItems.length - 1) {
                currentNavIndex++;
            }
        } else if (currentFocus === 'content') {
            const rows = document.querySelectorAll('.content-row');
            if (currentContentRow < rows.length - 1) {
                currentContentRow++;
                // Adjust content item index if new row has fewer items
                const newRowItems = rows[currentContentRow]?.querySelectorAll('.content-item');
                if (newRowItems && currentContentItem >= newRowItems.length) {
                    currentContentItem = newRowItems.length - 1;
                }
            }
        }
    }

    function handleArrowLeft() {
        if (currentFocus === 'content') {
            // If on first tile, move focus back to sidebar (left navigation)
            if (currentContentItem === 0) {
                currentFocus = 'sidebar';
                console.log('🎯 Moving from first tile back to sidebar navigation');
                return;
            }
            
            const currentRow = document.querySelectorAll('.content-row')[currentContentRow];
            const contentGrid = currentRow?.querySelector('.content-grid');
            const originalCount = parseInt(contentGrid?.getAttribute('data-original-count') || 0);
            
            if (contentGrid && originalCount > 0) {
                // Move to previous item in infinite carousel
                currentContentItem = ((currentContentItem - 1) + originalCount) % originalCount;
                
                // Find the best visible item that matches this index
                const targetItem = findBestVisibleItem(contentGrid, currentContentItem);
                if (targetItem) {
                    smoothScrollToInfiniteItem(contentGrid, targetItem, currentContentItem, originalCount, true);
                }
            } else {
                // Fallback for non-infinite rows
                const items = currentRow?.querySelectorAll('.content-item');
                if (items && items.length > 0) {
                    if (currentContentItem > 0) {
                        currentContentItem--;
                    } else {
                        currentContentItem = items.length - 1;
                    }
                }
            }
        }
    }

    function handleArrowRight() {
        if (currentFocus === 'sidebar') {
            // Move to content area
            currentFocus = 'content';
            currentContentRow = 0;
            currentContentItem = 0;
        } else if (currentFocus === 'content') {
            const currentRow = document.querySelectorAll('.content-row')[currentContentRow];
            const contentGrid = currentRow?.querySelector('.content-grid');
            const originalCount = parseInt(contentGrid?.getAttribute('data-original-count') || 0);
            
            if (contentGrid && originalCount > 0) {
                // Move to next item in infinite carousel
                currentContentItem = (currentContentItem + 1) % originalCount;
                
                // Find the best visible item that matches this index
                const targetItem = findBestVisibleItem(contentGrid, currentContentItem);
                if (targetItem) {
                    smoothScrollToInfiniteItem(contentGrid, targetItem, currentContentItem, originalCount, true);
                }
            } else {
                // Fallback for non-infinite rows
                const items = currentRow?.querySelectorAll('.content-item');
                if (items && items.length > 0) {
                    if (currentContentItem < items.length - 1) {
                        currentContentItem++;
                    } else {
                        currentContentItem = 0;
                    }
                }
            }
        }
    }

    function handleSelect() {
        if (currentFocus === 'sidebar') {
            const navItem = navItems[currentNavIndex];
            if (navItem) {
                navItem.click();
            }
        } else if (currentFocus === 'content') {
            const rows = document.querySelectorAll('.content-row');
            if (rows[currentContentRow]) {
                const items = rows[currentContentRow].querySelectorAll('.content-item');
                if (items[currentContentItem]) {
                    items[currentContentItem].click();
                }
            }
        }
    }

    function handleBack() {
        if (currentFocus === 'content') {
            currentFocus = 'sidebar';
        }
    }

    function handleHome() {
        if (currentFocus === 'sidebar') {
            currentNavIndex = 0;
        } else if (currentFocus === 'content') {
            currentContentRow = 0;
            currentContentItem = 0;
        }
    }

    function handleEnd() {
        if (currentFocus === 'sidebar') {
            currentNavIndex = navItems.length - 1;
        } else if (currentFocus === 'content') {
            const rows = document.querySelectorAll('.content-row');
            currentContentRow = rows.length - 1;
            const lastRowItems = rows[currentContentRow]?.querySelectorAll('.content-item');
            currentContentItem = lastRowItems ? lastRowItems.length - 1 : 0;
        }
    }

    function focusSearchNavigation() {
        currentFocus = 'sidebar';
        currentNavIndex = 0; // Search is first item
    }

    // Update content based on navigation selection
    function updateContent(section) {
        const rowTitles = document.querySelectorAll('.row-title');
        const searchPage = document.querySelector('.search-page');
        const homeContent = document.querySelector('.home-content');
        const pageIndicator = document.querySelector('.page-indicator');
        
        // Update page indicator
        if (pageIndicator) {
            pageIndicator.textContent = `• ${section}`;
        }
        
        if (section === 'Search') {
            // Show search page, hide home content
            if (searchPage && homeContent) {
                searchPage.style.display = 'block';
                homeContent.style.display = 'none';
                initializeSearchInterface();
                return;
            }
        } else {
            // Show home content, hide search page
            if (searchPage && homeContent) {
                searchPage.style.display = 'none';
                homeContent.style.display = 'block';
            }
        }
        
        updateRowTitlesForSection(section);
        
        // Reset content focus when switching sections
        currentContentRow = 0;
        currentContentItem = 0;
        
        // Re-add event listeners to new content
        addContentItemListeners();
        
        // Ensure all rows have exactly 10 items after content update
        ensureMinimumItemsPerRow();
    }

    // Update content for navigation focus changes (without changing page state)
    function updateContentForNavigation(section) {
        // Only update if we're not in search mode
        const searchPage = document.querySelector('.search-page');
        if (searchPage && searchPage.style.display !== 'none') {
            return;
        }
        
        // Update page indicator
        const pageIndicator = document.querySelector('.page-indicator');
        if (pageIndicator) {
            pageIndicator.textContent = `• ${section}`;
        }
        
        updateRowTitlesForSection(section);
    }

    // Shared function to update row titles based on section
    function updateRowTitlesForSection(section) {
        switch(section) {
            case 'Home':
                updateRowTitles(['Featured Content', 'Continue Watching', 'Popular Movies']);
                break;
            case 'Movies':
                updateRowTitles(['Latest Movies', 'Classic Films', 'Independent Cinema']);
                break;
            case 'TV Series':
                updateRowTitles(['Popular Series', 'New Episodes', 'Binge-Worthy Shows']);
                break;
            case 'Live TV':
                updateRowTitles(['News Channels', 'Sports Channels', 'Entertainment']);
                break;
            case 'Premium':
                updateRowTitles(['Premium Movies', 'Premium Series', 'Exclusive Content']);
                break;
            case 'Kids & Family':
                updateRowTitles(['Kids Shows', 'Family Movies', 'Educational Content']);
                break;
            case 'Search':
                updateRowTitles(['Search Results', 'Popular Searches', 'Trending Now']);
                break;
            default:
                updateRowTitles(['Featured Movies', 'Popular TV Shows', 'Action & Adventure']);
        }
    }

    function updateRowTitles(titles) {
        const rowTitles = document.querySelectorAll('.row-title');
        titles.forEach((title, index) => {
            if (rowTitles[index]) {
                rowTitles[index].textContent = title;
            }
        });
    }

    // Initialize content item listeners
    addContentItemListeners();

    // Add smooth scrolling for content area
    function smoothScroll(element, to, duration) {
        const start = element.scrollTop;
        const change = to - start;
        const startTime = performance.now();

        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.scrollTop = start + change * easeInOutQuad(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        }
        
        requestAnimationFrame(animateScroll);
    }

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // Helper functions for infinite carousel
    function findBestVisibleItem(contentGrid, originalIndex) {
        if (!contentGrid) return null;
        
        const allItems = Array.from(contentGrid.querySelectorAll('.content-item'));
        const gridScrollLeft = contentGrid.scrollLeft;
        const gridWidth = contentGrid.clientWidth;
        
        // Find all items that match the original index
        const matchingItems = allItems.filter(item => {
            if (item.classList.contains('cloned')) {
                return parseInt(item.getAttribute('data-original-index')) === originalIndex;
            } else {
                // For original items, get their index among non-cloned items
                const originalItems = contentGrid.querySelectorAll('.content-item:not(.cloned)');
                return Array.from(originalItems).indexOf(item) === originalIndex;
            }
        });
        
        if (matchingItems.length === 0) return null;
        
        // Find the item closest to the center of the viewport
        let bestItem = matchingItems[0];
        let minDistance = Infinity;
        
        matchingItems.forEach(item => {
            const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
            const viewportCenter = gridScrollLeft + (gridWidth / 2);
            const distance = Math.abs(itemCenter - viewportCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestItem = item;
            }
        });
        
        return bestItem;
    }
    
    function smoothScrollToInfiniteItem(contentGrid, targetItem, originalIndex, originalCount, snapToStart = false) {
        if (!contentGrid || !targetItem) return;
        
        const itemLeft = targetItem.offsetLeft;
        const gridWidth = contentGrid.clientWidth;
        
        let targetScrollPosition;
        
        if (snapToStart || originalIndex === 0) {
            // Snap to start position - align the focused tile to the beginning of the row
            targetScrollPosition = itemLeft;
        } else {
            // Position item at 10% from left edge for optimal viewing
            targetScrollPosition = itemLeft - (gridWidth * 0.1);
        }
        
        // Smooth scroll to the target position
        contentGrid.scrollTo({ 
            left: targetScrollPosition, 
            behavior: 'smooth' 
        });
        
        console.log(`🔄 Infinite carousel: Navigated to item ${originalIndex + 1} of ${originalCount}${snapToStart ? ' (snapped to start)' : ''}`);
    }

    // Add time update functionality
    function updateTime() {
        const timeElement = document.querySelector('.time');
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        timeElement.textContent = timeString;
    }

    // Update time every minute
    updateTime();
    
    // Search interface functions
    function initializeSearchInterface() {
        const keys = document.querySelectorAll('.key');
        const searchInput = document.querySelector('.search-input');
        const sidebar = document.querySelector('.sidebar');
        
        currentFocus = 'search';
        currentSearchRow = 0;
        currentSearchCol = 0;
        
        // Collapse sidebar when entering search mode
        sidebar.classList.add('collapsed');
        
        // Focus first key
        if (keys.length > 0) {
            // Clear any existing focus
            keys.forEach(key => key.classList.remove('focused'));
            keys[0].classList.add('focused');
        }
    }

    function getKeyAt(row, col) {
        const keyboardRows = document.querySelectorAll('.keyboard-row');
        if (row >= 0 && row < keyboardRows.length) {
            const keys = keyboardRows[row].querySelectorAll('.key');
            if (col >= 0 && col < keys.length) {
                return keys[col];
            }
        }
        return null;
    }

    function handleSearchNavigation(direction) {
        const keyboardRows = document.querySelectorAll('.keyboard-row');
        const currentKey = getKeyAt(currentSearchRow, currentSearchCol);
        
        if (currentKey) {
            currentKey.classList.remove('focused');
        }
        
        switch (direction) {
            case 'left':
                currentSearchCol = Math.max(0, currentSearchCol - 1);
                break;
            case 'right':
                const currentRowKeys = keyboardRows[currentSearchRow]?.querySelectorAll('.key').length || 0;
                currentSearchCol = Math.min(currentRowKeys - 1, currentSearchCol + 1);
                break;
            case 'up':
                currentSearchRow = Math.max(0, currentSearchRow - 1);
                // Adjust column if new row has fewer keys
                const prevRowKeys = keyboardRows[currentSearchRow]?.querySelectorAll('.key').length || 0;
                currentSearchCol = Math.min(currentSearchCol, prevRowKeys - 1);
                break;
            case 'down':
                currentSearchRow = Math.min(keyboardRows.length - 1, currentSearchRow + 1);
                // Adjust column if new row has fewer keys
                const nextRowKeys = keyboardRows[currentSearchRow]?.querySelectorAll('.key').length || 0;
                currentSearchCol = Math.min(currentSearchCol, nextRowKeys - 1);
                break;
        }
        
        const newKey = getKeyAt(currentSearchRow, currentSearchCol);
        if (newKey) {
            newKey.classList.add('focused');
            newKey.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function handleKeyInput() {
        const currentKey = getKeyAt(currentSearchRow, currentSearchCol);
        const searchInput = document.querySelector('.search-input');
        
        if (!currentKey || !searchInput) return;
        
        const keyText = currentKey.textContent.trim();
        
        if (currentKey.classList.contains('key-delete')) {
            searchInput.value = searchInput.value.slice(0, -1);
        } else if (currentKey.classList.contains('key-space')) {
            searchInput.value += ' ';
        } else if (currentKey.classList.contains('key-clear')) {
            searchInput.value = '';
        } else {
            searchInput.value += keyText.toLowerCase();
        }
        
        // Trigger search if there's content
        if (searchInput.value.trim()) {
            performSearch(searchInput.value.trim());
        } else {
            clearSearchResults();
        }
    }

    function performSearch(query) {
        const searchResults = document.querySelector('.search-results');
        
        // Show search results area
        searchResults.classList.add('visible');
        
        // For demo purposes, create mock search results
        searchResults.innerHTML = `
            <div class="search-content-row">
                <div class="row-header">
                    <h2 class="row-title">Search Results for "${query}"</h2>
                </div>
                <div class="content-row">
                    ${Array.from({length: 6}, (_, i) => `
                        <div class="content-item" data-title="Search Result ${i + 1}">
                            <div class="content-placeholder"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function clearSearchResults() {
        const searchResults = document.querySelector('.search-results');
        searchResults.classList.remove('visible');
        searchResults.innerHTML = '';
    }
    
    // Add search navigation variables
    let currentSearchRow = 0;
    let currentSearchCol = 0;
    setInterval(updateTime, 60000);

    // Show keyboard instructions
    console.log(`
    🎮 ENHANCED KEYBOARD CONTROLS WITH INFINITE CAROUSEL:
    ==================================================
    ↑↓ Arrow Keys: Navigate up/down in sidebar or content rows
    ←→ Arrow Keys: Navigate left/right in infinite content tiles
    Enter/Space: Select item
    Escape/Backspace: Go back to sidebar
    Home: Go to first item
    End: Go to last item
    F1: Options menu
    F2: Info panel
    F3: Go to Search
    
    🔄 INFINITE CAROUSEL FEATURES:
    • Seamless tile navigation with no endpoints
    • After the last tile, continues with the first tile infinitely
    • Smooth scrolling with automatic position optimization
    • Visual indicator shows "∞" for infinite rows
    `);

    function initializeSearchInterface() {
        console.log('Initializing search interface');
        searchQuery = '';
        currentKeyboardRow = 0;
        currentKeyboardCol = 0;
        searchFocus = 'keyboard';
        
        const searchInput = document.querySelector('.search-input');
        const searchCursor = document.querySelector('.search-cursor');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        if (searchCursor) {
            searchCursor.classList.add('active');
        }
        
        updateKeyboardFocus();
        setupSearchKeyboardListeners();
    }

    function setupSearchKeyboardListeners() {
        const keyButtons = document.querySelectorAll('.key-btn');
        
        keyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                handleKeyInput(key);
            });
        });
    }

    function handleKeyInput(key) {
        const searchInput = document.querySelector('.search-input');
        
        switch(key) {
            case 'space':
                searchQuery += ' ';
                break;
            case 'delete':
                searchQuery = searchQuery.slice(0, -1);
                break;
            case 'clear':
                searchQuery = '';
                break;
            default:
                searchQuery += key;
        }
        
        if (searchInput) {
            searchInput.value = searchQuery;
            updateSearchCursor();
        }
        
        performSearch();
    }

    function updateSearchCursor() {
        const searchInput = document.querySelector('.search-input');
        const searchCursor = document.querySelector('.search-cursor');
        
        if (searchInput && searchCursor) {
            const textWidth = getTextWidth(searchQuery, '24px Arial');
            searchCursor.style.left = (20 + textWidth) + 'px';
        }
    }

    function getTextWidth(text, font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        return context.measureText(text).width;
    }

    function updateKeyboardFocus() {
        document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
        
        const keyRows = document.querySelectorAll('.keyboard-row');
        if (keyRows[currentKeyboardRow]) {
            const keys = keyRows[currentKeyboardRow].querySelectorAll('.key-btn');
            if (keys[currentKeyboardCol]) {
                keys[currentKeyboardCol].classList.add('focused');
            }
        }
    }

    function performSearch() {
        const resultsContainer = document.querySelector('.search-results-container');
        
        if (!searchQuery.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        // Mock search results - you can replace with real search functionality
        const mockResults = [
            { title: 'The Lion King', type: 'Movie' },
            { title: 'Friends', type: 'TV Series' },
            { title: 'Breaking Bad', type: 'TV Series' },
            { title: 'Avengers: Endgame', type: 'Movie' },
            { title: 'Stranger Things', type: 'TV Series' },
            { title: 'The Dark Knight', type: 'Movie' }
        ];
        
        const filteredResults = mockResults.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        resultsContainer.innerHTML = '';
        
        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }
        
        filteredResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.innerHTML = `
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-type">${result.type}</div>
            `;
            
            resultElement.addEventListener('click', function() {
                console.log('Selected:', result.title);
            });
            
            resultsContainer.appendChild(resultElement);
        });
    }

    // Add search keyboard navigation to existing keyboard handler
    const originalKeydownHandler = document.onkeydown;
    
    document.addEventListener('keydown', function(e) {
        const searchPage = document.querySelector('.search-page');
        
        if (searchPage && searchPage.style.display !== 'none') {
            handleSearchKeydown(e);
            return;
        }
        
        // Call original handler for non-search pages
        if (originalKeydownHandler) {
            originalKeydownHandler(e);
        }
    });

    function handleSearchKeydown(e) {
        const keyRows = document.querySelectorAll('.keyboard-row');
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentKeyboardRow > 0) {
                    currentKeyboardRow--;
                    // Adjust column if new row has fewer keys
                    const newRowKeys = keyRows[currentKeyboardRow].querySelectorAll('.key-btn');
                    if (currentKeyboardCol >= newRowKeys.length) {
                        currentKeyboardCol = newRowKeys.length - 1;
                    }
                    updateKeyboardFocus();
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (currentKeyboardRow < keyRows.length - 1) {
                    currentKeyboardRow++;
                    // Adjust column if new row has fewer keys
                    const newRowKeys = keyRows[currentKeyboardRow].querySelectorAll('.key-btn');
                    if (currentKeyboardCol >= newRowKeys.length) {
                        currentKeyboardCol = newRowKeys.length - 1;
                    }
                    updateKeyboardFocus();
                }
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (currentKeyboardCol > 0) {
                    currentKeyboardCol--;
                    updateKeyboardFocus();
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                const currentRowKeys = keyRows[currentKeyboardRow].querySelectorAll('.key-btn');
                if (currentKeyboardCol < currentRowKeys.length - 1) {
                    currentKeyboardCol++;
                    updateKeyboardFocus();
                }
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                const focusedKey = document.querySelector('.key-btn.focused');
                if (focusedKey) {
                    const key = focusedKey.getAttribute('data-key');
                    handleKeyInput(key);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                // Go back to sidebar
                const homeNavItem = document.querySelector('.nav-item[data-section="Home"]') || 
                                   document.querySelectorAll('.nav-item')[1];
                if (homeNavItem) {
                    homeNavItem.click();
                }
                break;
        }
    }
});
