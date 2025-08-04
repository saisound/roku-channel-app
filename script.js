// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.querySelector('.content-area');
    
    // Focus management
    let currentFocus = 'content'; // 'sidebar' or 'content' - Start with content focused
    let currentNavIndex = 1; // Start with Home (second item)
    let currentPageNavIndex = 1; // Track the current page/section (persists when focus moves to content)
    let currentContentRow = 0;
    let currentContentItem = 0;
    let currentSection = 'Home'; // Track current section for Live badge management
    
    // Remember last focused content position for restoration
    let lastContentRow = 0;
    let lastContentItem = 0;
    
    // Search functionality variables
    let searchQuery = '';
    let currentKeyboardRow = 0;
    let currentKeyboardCol = 0;
    let searchFocus = 'textbox'; // 'textbox', 'keyboard' or 'results'
    
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

    // Initialize focus - start with content focused and sidebar collapsed
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('collapsed');
    }
    updateFocus();

    // Initialize progress bars
    initializeProgressBars();

    // Ensure all rows have exactly 10 items
    ensureMinimumItemsPerRow();

    // Clean up any cloned rows from previous implementations
    cleanupClonedRows();

    // Initialize seamless infinite vertical scrolling (temporarily disabled for debugging)
    // initializeSeamlessVerticalScrolling();

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
    
    // Clean up any cloned rows from previous implementations
    function cleanupClonedRows() {
        const clonedRows = document.querySelectorAll('.content-row.cloned-row');
        clonedRows.forEach(row => row.remove());
        
        // Reset content area attributes
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.removeAttribute('data-original-row-count');
            // Reset scroll position to top if it was modified
            contentArea.scrollTop = 0;
        }
        
        console.log('🧹 Cleaned up cloned rows and reset content area');
    }

    // Initialize seamless infinite vertical scrolling (improved version)
    function initializeSeamlessVerticalScrolling() {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        // Store original rows for cloning
        const originalRows = Array.from(contentArea.querySelectorAll('.content-row:not(.cloned-row)'));
        if (originalRows.length === 0) return;

        // Clone rows for seamless scrolling - only one set before and after
        originalRows.forEach((row, index) => {
            // Clone for after (when scrolling down past the last row)
            const clonedRowAfter = row.cloneNode(true);
            clonedRowAfter.classList.add('cloned-row', 'clone-after');
            clonedRowAfter.setAttribute('data-original-index', index);
            updateClonedRowIds(clonedRowAfter, `after-${index}`);
            contentArea.appendChild(clonedRowAfter);

            // Clone for before (when scrolling up past the first row)
            const clonedRowBefore = row.cloneNode(true);
            clonedRowBefore.classList.add('cloned-row', 'clone-before');
            clonedRowBefore.setAttribute('data-original-index', index);
            updateClonedRowIds(clonedRowBefore, `before-${index}`);
            contentArea.insertBefore(clonedRowBefore, contentArea.firstChild);
        });

        // Store original count and setup monitoring
        contentArea.setAttribute('data-original-row-count', originalRows.length);
        addSeamlessScrollMonitoring(contentArea, originalRows);

        console.log(`🔄 Initialized seamless vertical scrolling with ${originalRows.length} original rows`);
    }

    // Monitor scroll position for seamless transitions
    function addSeamlessScrollMonitoring(contentArea, originalRows) {
        let isResetting = false;
        const originalRowCount = originalRows.length;

        const handleSeamlessScroll = () => {
            if (isResetting) return;

            const scrollTop = contentArea.scrollTop;
            const scrollHeight = contentArea.scrollHeight;
            
            // Calculate heights
            const singleSetHeight = calculateSingleSetHeight(originalRows);
            const beforeSectionHeight = singleSetHeight;
            const originalSectionStart = beforeSectionHeight;
            const originalSectionEnd = originalSectionStart + singleSetHeight;

            // If scrolled into the "after" section, reset to equivalent position in original section
            if (scrollTop > originalSectionEnd + (singleSetHeight * 0.1)) {
                isResetting = true;
                const offsetIntoAfterSection = scrollTop - originalSectionEnd;
                const newPosition = originalSectionStart + offsetIntoAfterSection;

                contentArea.style.scrollBehavior = 'auto';
                contentArea.scrollTop = newPosition;

                setTimeout(() => {
                    contentArea.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);

                console.log('🔄 Seamless scroll: Reset from after section to original');
            }

            // If scrolled into the "before" section, reset to equivalent position in original section
            if (scrollTop < originalSectionStart - (singleSetHeight * 0.1)) {
                isResetting = true;
                const offsetIntoBeforeSection = originalSectionStart - scrollTop;
                const newPosition = originalSectionEnd - offsetIntoBeforeSection;

                contentArea.style.scrollBehavior = 'auto';
                contentArea.scrollTop = newPosition;

                setTimeout(() => {
                    contentArea.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);

                console.log('🔄 Seamless scroll: Reset from before section to original');
            }
        };

        // Monitor scroll events with throttling
        let scrollTimeout;
        contentArea.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleSeamlessScroll, 10);
        });

        // Set initial scroll position to middle (original section)
        const initialOffset = calculateSingleSetHeight(originalRows);
        contentArea.scrollTop = initialOffset;
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
        
        // Add Live badge if we're in Live TV mode
        if (currentSection === 'Live TV') {
            newItem.style.position = 'relative';
            const liveBadge = createLiveBadge();
            newItem.appendChild(liveBadge);
        }
        
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

    // Initialize infinite vertical scrolling for content rows
    function initializeInfiniteVerticalScrolling() {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        // Store original rows for cloning
        const originalRows = Array.from(contentArea.querySelectorAll('.content-row:not(.cloned-row)'));
        if (originalRows.length === 0) return;

        // Set data attribute to track original count
        contentArea.setAttribute('data-original-row-count', originalRows.length);

        // Clone rows for seamless scrolling
        cloneRowsForInfiniteScroll(contentArea, originalRows);

        // Monitor scroll position for infinite effect
        addVerticalScrollMonitoring(contentArea, originalRows);

        console.log(`🔄 Initialized infinite vertical scrolling with ${originalRows.length} original rows`);
    }

    // Clone content rows for infinite vertical scrolling
    function cloneRowsForInfiniteScroll(contentArea, originalRows) {
        // Add rows after the originals for downward scrolling
        for (let i = 0; i < 2; i++) { // Create 2 full sets of clones
            originalRows.forEach((row, index) => {
                const clonedRow = row.cloneNode(true);
                clonedRow.classList.add('cloned-row');
                clonedRow.setAttribute('data-original-index', index);
                clonedRow.setAttribute('data-clone-set', i + 1);
                
                // Update any IDs to avoid conflicts
                updateClonedRowIds(clonedRow, `clone-${i + 1}-${index}`);
                
                contentArea.appendChild(clonedRow);
            });
        }

        // Add rows before the originals for upward scrolling
        originalRows.slice().reverse().forEach((row, index) => {
            const clonedRow = row.cloneNode(true);
            clonedRow.classList.add('cloned-row', 'pre-clone');
            clonedRow.setAttribute('data-original-index', originalRows.length - 1 - index);
            clonedRow.setAttribute('data-clone-set', 'pre');
            
            // Update any IDs to avoid conflicts
            updateClonedRowIds(clonedRow, `pre-clone-${index}`);
            
            contentArea.insertBefore(clonedRow, contentArea.firstChild);
        });
    }

    // Update IDs in cloned rows to avoid conflicts
    function updateClonedRowIds(clonedRow, suffix) {
        // Update any elements with IDs
        const elementsWithIds = clonedRow.querySelectorAll('[id]');
        elementsWithIds.forEach(element => {
            element.id = `${element.id}-${suffix}`;
        });
    }

    // Monitor vertical scroll position and reset when needed
    function addVerticalScrollMonitoring(contentArea, originalRows) {
        let isResetting = false;
        const originalRowCount = originalRows.length;

        const handleInfiniteVerticalScroll = () => {
            if (isResetting) return;

            const scrollTop = contentArea.scrollTop;
            const scrollHeight = contentArea.scrollHeight;
            const clientHeight = contentArea.clientHeight;

            // Calculate approximate height of one full set of rows
            const singleSetHeight = calculateSingleSetHeight(originalRows);
            const preCloneHeight = singleSetHeight; // Height of pre-cloned rows

            // If scrolled too far down, reset to equivalent position at the top
            if (scrollTop > preCloneHeight + (singleSetHeight * 2)) {
                isResetting = true;
                const excessScroll = scrollTop - (preCloneHeight + singleSetHeight);
                const newPosition = preCloneHeight + (excessScroll % singleSetHeight);

                contentArea.style.scrollBehavior = 'auto';
                contentArea.scrollTop = newPosition;

                setTimeout(() => {
                    contentArea.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);

                console.log('🔄 Vertical infinite scroll: Reset from bottom to equivalent top position');
            }

            // If scrolled too far up, reset to equivalent position at the bottom
            if (scrollTop < preCloneHeight * 0.3) {
                isResetting = true;
                const deficit = preCloneHeight - scrollTop;
                const newPosition = preCloneHeight + singleSetHeight - (deficit % singleSetHeight);

                contentArea.style.scrollBehavior = 'auto';
                contentArea.scrollTop = newPosition;

                setTimeout(() => {
                    contentArea.style.scrollBehavior = '';
                    isResetting = false;
                }, 10);

                console.log('🔄 Vertical infinite scroll: Reset from top to equivalent bottom position');
            }
        };

        // Monitor scroll events
        contentArea.addEventListener('scroll', handleInfiniteVerticalScroll);

        // Store the handler for potential cleanup
        contentArea._infiniteVerticalScrollHandler = handleInfiniteVerticalScroll;

        // Set initial scroll position to show original rows
        const preCloneHeight = calculateSingleSetHeight(originalRows);
        contentArea.scrollTop = preCloneHeight;
    }

    // Calculate the total height of one complete set of rows
    function calculateSingleSetHeight(originalRows) {
        let totalHeight = 0;
        originalRows.forEach(row => {
            const style = window.getComputedStyle(row);
            const marginTop = parseFloat(style.marginTop) || 0;
            const marginBottom = parseFloat(style.marginBottom) || 0;
            totalHeight += row.offsetHeight + marginTop + marginBottom;
        });
        return totalHeight;
    }

    // Update focus with infinite vertical scrolling awareness
    function getActualRowIndex(currentRow) {
        const contentArea = document.querySelector('.content-area');
        const originalRowCount = parseInt(contentArea.getAttribute('data-original-row-count')) || 0;
        
        if (originalRowCount === 0) return currentContentRow;

        // If it's a cloned row, map it back to the original index
        if (currentRow.classList.contains('cloned-row')) {
            const originalIndex = parseInt(currentRow.getAttribute('data-original-index')) || 0;
            return originalIndex;
        }

        // For original rows, find their position among non-cloned rows
        const originalRows = Array.from(contentArea.querySelectorAll('.content-row:not(.cloned-row)'));
        return originalRows.indexOf(currentRow);
    }

    // Find equivalent row when moving up in infinite scroll
    function findEquivalentRowUp(rows, originalRowCount) {
        // We're at the top, so we want to move to the last visible set
        // Find the last occurrence of the current row type
        const currentLogicalRow = currentContentRow % originalRowCount;
        const targetLogicalRow = (currentLogicalRow - 1 + originalRowCount) % originalRowCount;
        
        // Find the highest index row that matches our target
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            const rowLogicalIndex = getLogicalRowIndex(row, originalRowCount, i);
            if (rowLogicalIndex === targetLogicalRow) {
                return i;
            }
        }
        return -1;
    }

    // Find equivalent row when moving down in infinite scroll
    function findEquivalentRowDown(rows, originalRowCount) {
        // We're at the bottom, so we want to move to the first visible set
        // Find the first occurrence of the next row type
        const currentLogicalRow = currentContentRow % originalRowCount;
        const targetLogicalRow = (currentLogicalRow + 1) % originalRowCount;
        
        // Find the lowest index row that matches our target
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowLogicalIndex = getLogicalRowIndex(row, originalRowCount, i);
            if (rowLogicalIndex === targetLogicalRow) {
                return i;
            }
        }
        return -1;
    }

    // Get the logical row index (0 to originalRowCount-1) for any row
    function getLogicalRowIndex(row, originalRowCount, physicalIndex) {
        if (row.classList.contains('cloned-row')) {
            return parseInt(row.getAttribute('data-original-index')) || 0;
        } else {
            // For original rows, calculate their logical position
            const originalRows = Array.from(document.querySelector('.content-area').querySelectorAll('.content-row:not(.cloned-row)'));
            const originalIndex = originalRows.indexOf(row);
            return originalIndex >= 0 ? originalIndex : physicalIndex % originalRowCount;
        }
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
                
                // If Search is focused, show search interface but keep focus on sidebar
                if (sectionName === 'Search') {
                    // Don't change currentFocus yet - keep it as 'sidebar'
                    // The search interface will load but focus stays on Search nav item
                }
                
                updateContentForNavigation(sectionName);
            }
        } else {
            // Collapse sidebar when focus moves away (content or search)
            sidebar.classList.add('collapsed');
            
            if (currentFocus === 'content') {
                const originalRows = document.querySelectorAll('.content-row:not(.cloned-row)');
                
                // Ensure currentContentRow is within bounds
                if (currentContentRow >= originalRows.length) {
                    currentContentRow = Math.max(0, originalRows.length - 1);
                }
                if (currentContentRow < 0) {
                    currentContentRow = 0;
                }
                
                if (originalRows[currentContentRow]) {
                    const currentRow = originalRows[currentContentRow];
                    const contentGrid = currentRow.querySelector('.content-grid');
                    const originalCount = parseInt(contentGrid?.getAttribute('data-original-count') || 0);
                    
                    if (originalCount > 0) {
                        // Working with infinite carousel
                        const targetItem = findBestVisibleItem(contentGrid, currentContentItem);
                        
                        if (targetItem) {
                            targetItem.classList.add('focused');
                            
                            // Always snap focused item to the left edge of the viewport
                            const itemLeft = targetItem.offsetLeft;
                            console.log(`🎯 Snapping focused tile (index ${currentContentItem}) to left edge`);
                            contentGrid.scrollTo({ left: itemLeft, behavior: 'smooth' });
                            
                            // Show content title between rows
                            showContentTitleBetweenRows(targetItem, currentContentRow);
                            
                            // Add counter to row title
                            addRowCounter(currentContentRow);
                        }
                    } else {
                        // Fallback for non-infinite rows
                        const items = currentRow.querySelectorAll('.content-item');
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
                    
                    // Normal vertical scrolling
                    const contentArea = document.querySelector('.content-area');
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
        const originalRows = document.querySelectorAll('.content-row:not(.cloned-row)');
        const currentRow = originalRows[rowIndex];
        
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
        const originalRows = document.querySelectorAll('.content-row:not(.cloned-row)');
        const currentRow = originalRows[rowIndex];
        
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
                    // If on textbox, move back to Search navigation
                    if (searchFocus === 'textbox') {
                        currentFocus = 'sidebar';
                        currentNavIndex = 0; // Search is the first nav item
                        updateFocus();
                    } else {
                        handleSearchNavigation('left');
                    }
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
                    // Exit search mode - return to Search navigation item
                    currentFocus = 'sidebar';
                    currentNavIndex = 0; // Search is the first nav item
                    updateFocus();
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
        } else if (currentFocus === 'search') {
            // Handle search interface navigation
            if (searchFocus === 'keyboard') {
                // Check if we're at the top row of keyboard
                if (currentKeyboardRow === 0) {
                    // Move back to text box
                    searchFocus = 'textbox';
                    
                    // Remove focus from all keyboard buttons
                    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
                    
                    // Restore focus to text box and show cursor
                    const searchInput = document.querySelector('.search-input');
                    const searchCursor = document.querySelector('.search-cursor');
                    
                    if (searchInput) {
                        searchInput.focus(); // Restore focus to text input
                    }
                    
                    if (searchCursor) {
                        searchCursor.classList.add('active'); // Show text cursor
                    }
                    
                    console.log('🔼 Moving focus from keyboard back to text box');
                } else {
                    // Handle keyboard navigation up
                    handleSearchNavigation('up');
                }
            }
            // If already on textbox, do nothing (can't go further up)
        } else if (currentFocus === 'content') {
            const originalRows = document.querySelectorAll('.content-row:not(.cloned-row)');
            
            if (currentContentRow > 0) {
                currentContentRow--;
            } else {
                // Wrap to last row (infinite scroll)
                currentContentRow = originalRows.length - 1;
                console.log('🔄 Simple infinite scroll: Wrapping from first row to last row');
            }
            
            // Ensure we don't go out of bounds
            if (currentContentRow >= originalRows.length) {
                currentContentRow = originalRows.length - 1;
            }
            if (currentContentRow < 0) {
                currentContentRow = 0;
            }
            
            // Move focus to the left-most visible tile in the target row
            const targetRow = originalRows[currentContentRow];
            const contentGrid = targetRow?.querySelector('.content-grid');
            if (contentGrid) {
                currentContentItem = findLeftMostVisibleItem(contentGrid);
                console.log(`🎯 Arrow Up: Moving to left-most visible tile (index ${currentContentItem}) in row ${currentContentRow + 1}`);
            } else {
                currentContentItem = 0;
            }
            
            // Save the new position
            lastContentRow = currentContentRow;
            lastContentItem = currentContentItem;
            
            console.log(`🎯 Arrow Up: Moving to row ${currentContentRow + 1} of ${originalRows.length}`);
        }
    }

    function handleArrowDown() {
        if (currentFocus === 'sidebar') {
            if (currentNavIndex < navItems.length - 1) {
                currentNavIndex++;
            }
        } else if (currentFocus === 'search') {
            // Handle search interface navigation
            if (searchFocus === 'textbox') {
                // Move from text box to first keyboard key
                searchFocus = 'keyboard';
                currentKeyboardRow = 0;
                currentKeyboardCol = 0;
                
                // Remove focus from text box and hide cursor when moving to keyboard
                const searchInput = document.querySelector('.search-input');
                const searchCursor = document.querySelector('.search-cursor');
                
                if (searchInput) {
                    searchInput.blur(); // Remove focus from text input
                }
                
                if (searchCursor) {
                    searchCursor.classList.remove('active'); // Hide text cursor
                }
                
                updateKeyboardFocus();
                console.log('🔽 Moving focus from text box to keyboard');
            } else if (searchFocus === 'keyboard') {
                // Handle keyboard navigation down
                handleSearchNavigation('down');
            }
        } else if (currentFocus === 'content') {
            const originalRows = document.querySelectorAll('.content-row:not(.cloned-row)');
            
            if (currentContentRow < originalRows.length - 1) {
                currentContentRow++;
            } else {
                // Wrap to first row (infinite scroll)
                currentContentRow = 0;
                console.log('🔄 Simple infinite scroll: Wrapping from last row to first row');
            }
            
            // Ensure we don't go out of bounds
            if (currentContentRow >= originalRows.length) {
                currentContentRow = originalRows.length - 1;
            }
            if (currentContentRow < 0) {
                currentContentRow = 0;
            }
            
            // Move focus to the left-most visible tile in the target row
            const targetRow = originalRows[currentContentRow];
            const contentGrid = targetRow?.querySelector('.content-grid');
            if (contentGrid) {
                currentContentItem = findLeftMostVisibleItem(contentGrid);
                console.log(`🎯 Arrow Down: Moving to left-most visible tile (index ${currentContentItem}) in row ${currentContentRow + 1}`);
            } else {
                currentContentItem = 0;
            }
            
            // Save the new position
            lastContentRow = currentContentRow;
            lastContentItem = currentContentItem;
            
            console.log(`🎯 Arrow Down: Moving to row ${currentContentRow + 1} of ${originalRows.length}`);
        }
    }

    function handleArrowLeft() {
        if (currentFocus === 'search') {
            // Handle search interface navigation
            if (searchFocus === 'keyboard') {
                // Handle keyboard navigation left
                handleSearchNavigation('left');
            }
            // If on textbox, do nothing (can't go further left)
        } else if (currentFocus === 'content') {
            // If on first tile, move focus back to sidebar (left navigation)
            if (currentContentItem === 0) {
                // Save the current position before moving to sidebar
                lastContentRow = currentContentRow;
                lastContentItem = currentContentItem;
                
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
            
            // Save the new position
            lastContentRow = currentContentRow;
            lastContentItem = currentContentItem;
        }
    }

    function handleArrowRight() {
        if (currentFocus === 'sidebar') {
            const navItem = navItems[currentNavIndex];
            const sectionName = navItem ? navItem.querySelector('span').textContent : '';
            
            // Special handling for Search - move focus to text box only
            if (sectionName === 'Search') {
                currentFocus = 'search';
                searchFocus = 'textbox'; // Start with text box focused
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.add('collapsed'); // Collapse sidebar for search mode
                
                // Enable search interface elements when entering search mode
                const searchInput = document.querySelector('.search-input');
                const searchCursor = document.querySelector('.search-cursor');
                
                if (searchInput) {
                    searchInput.focus();
                }
                
                if (searchCursor) {
                    searchCursor.classList.add('active');
                }
                
                // Do NOT focus keyboard initially - user must press Down to get to keyboard
                // Remove any existing keyboard focus
                document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
                
                return;
            }
            
            // For other navigation items, move to content area
            currentFocus = 'content';
            
            // Restore the last focused content position
            currentContentRow = lastContentRow;
            currentContentItem = lastContentItem;
            
            console.log(`🔄 Restoring focus to Row ${currentContentRow + 1}, Item ${currentContentItem + 1}`);
        } else if (currentFocus === 'search') {
            // Handle search interface navigation
            if (searchFocus === 'keyboard') {
                // Handle keyboard navigation right
                handleSearchNavigation('right');
            }
            // If on textbox, do nothing (can't go further right)
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
            
            // Save the new position
            lastContentRow = currentContentRow;
            lastContentItem = currentContentItem;
        }
    }

    function handleSelect() {
        if (currentFocus === 'sidebar') {
            const navItem = navItems[currentNavIndex];
            if (navItem) {
                const sectionName = navItem.querySelector('span').textContent;
                
                // Special handling for Search - move focus to text box only
                if (sectionName === 'Search') {
                    currentFocus = 'search';
                    searchFocus = 'textbox'; // Start with text box focused
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.classList.add('collapsed'); // Collapse sidebar for search mode
                    
                    // Enable search interface elements when entering search mode
                    const searchInput = document.querySelector('.search-input');
                    const searchCursor = document.querySelector('.search-cursor');
                    
                    if (searchInput) {
                        searchInput.focus();
                    }
                    
                    if (searchCursor) {
                        searchCursor.classList.add('active');
                    }
                    
                    // Do NOT focus keyboard initially - user must press Down to get to keyboard
                    // Remove any existing keyboard focus
                    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
                    
                    updateFocus();
                    return;
                }
                
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
            // Check if we're already at the top (first tile of first row)
            if (currentContentRow === 0 && currentContentItem === 0) {
                // Second back press: Go to sidebar navigation (focus on active nav item)
                lastContentRow = currentContentRow;
                lastContentItem = currentContentItem;
                
                console.log(`💾 Saving content position: Row ${lastContentRow + 1}, Item ${lastContentItem + 1}`);
                console.log(`🔙 Second back press: Moving to sidebar navigation`);
                
                currentFocus = 'sidebar';
                // Focus on the active/current page nav item
                currentNavIndex = currentPageNavIndex;
            } else {
                // First back press: Go to first tile of first row
                console.log(`🔙 First back press: Going to top of page (Row 1, Item 1)`);
                
                currentContentRow = 0;
                currentContentItem = 0;
                
                // Update the saved position as well
                lastContentRow = currentContentRow;
                lastContentItem = currentContentItem;
            }
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
        // Update current section
        currentSection = section;
        
        // Add loading effect to make it look like new content is loading
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            // Dim the content to show loading state
            contentArea.style.opacity = '0.3';
            
            // Restore opacity after a short delay to simulate loading
            setTimeout(() => {
                contentArea.style.opacity = '1';
            }, 150);
        }
        
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
                initializeSearchInterface(false, false, false); // Don't auto-focus input, show cursor, or focus keyboard when loading from nav selection
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
        
        // Reapply Live badges if we're in Live TV mode
        if (section === 'Live TV') {
            addLiveBadgesToAllTiles();
        }
    }

    // Update content for navigation focus changes (without changing page state)
    function updateContentForNavigation(section) {
        // Add loading effect to make it look like new content is loading
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            // Dim the content to show loading state
            contentArea.style.opacity = '0.3';
            
            // Restore opacity after a short delay to simulate loading
            setTimeout(() => {
                contentArea.style.opacity = '1';
            }, 150);
        }
        
        // Handle Search section - show search interface immediately when focused
        if (section === 'Search') {
            const searchPage = document.querySelector('.search-page');
            const homeContent = document.querySelector('.home-content');
            
            if (searchPage && homeContent) {
                searchPage.style.display = 'block';
                homeContent.style.display = 'none';
                initializeSearchInterface(false, false, false); // Don't auto-focus input, show cursor, or focus keyboard when loading from nav
                
                // Update page indicator
                const pageIndicator = document.querySelector('.page-indicator');
                if (pageIndicator) {
                    pageIndicator.textContent = `• ${section}`;
                }
                return;
            }
        }
        
        // Only update other sections if we're not in search mode
        const searchPage = document.querySelector('.search-page');
        if (searchPage && searchPage.style.display !== 'none') {
            // If we're moving away from search, hide search page and show home content
            const homeContent = document.querySelector('.home-content');
            if (homeContent) {
                searchPage.style.display = 'none';
                homeContent.style.display = 'block';
            }
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
                updateRowTitles(['Featured Movies', 'Continue Watching', 'Popular TV Shows']);
                removeLiveBadgesFromAllTiles();
                break;
            case 'Movies':
                updateRowTitles(['Latest Movies', 'Classic Films', 'Independent Cinema']);
                removeLiveBadgesFromAllTiles();
                break;
            case 'TV Series':
                updateRowTitles(['Popular Series', 'New Episodes', 'Binge-Worthy Shows']);
                removeLiveBadgesFromAllTiles();
                break;
            case 'Live TV':
                updateRowTitles(['News Channels', 'Sports Channels', 'Entertainment']);
                addLiveBadgesToAllTiles();
                break;
            case 'Premium':
                updateRowTitles(['Premium Movies', 'Premium Series', 'Exclusive Content']);
                removeLiveBadgesFromAllTiles();
                break;
            case 'Kids & Family':
                updateRowTitles(['Kids Shows', 'Family Movies', 'Educational Content']);
                removeLiveBadgesFromAllTiles();
                break;
            case 'Search':
                updateRowTitles(['Search Results', 'Popular Searches', 'Trending Now']);
                removeLiveBadgesFromAllTiles();
                break;
            default:
                updateRowTitles(['Featured Movies', 'Continue Watching', 'Popular TV Shows']);
                removeLiveBadgesFromAllTiles();
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

    // Live Badge Management Functions
    function createLiveBadge() {
        const badge = document.createElement('div');
        badge.className = 'live-badge';
        badge.textContent = 'LIVE';
        return badge;
    }

    function addLiveBadgesToAllTiles() {
        // Remove existing badges first
        removeLiveBadgesFromAllTiles();
        
        // Get all content items and tile components
        const contentItems = document.querySelectorAll('.content-item, .tile-component');
        
        contentItems.forEach(item => {
            // Skip items that already have a live badge
            if (!item.querySelector('.live-badge')) {
                const liveBadge = createLiveBadge();
                item.appendChild(liveBadge);
                
                // Make sure the parent has relative positioning for absolute badge positioning
                if (getComputedStyle(item).position === 'static') {
                    item.style.position = 'relative';
                }
            }
        });
    }

    function removeLiveBadgesFromAllTiles() {
        const liveBadges = document.querySelectorAll('.live-badge');
        liveBadges.forEach(badge => {
            badge.remove();
        });
    }

    // Initialize content item listeners
    addContentItemListeners();

    // Auto-replace Continue Watching row with large 16:9 tiles
    setTimeout(() => {
        replaceContinueWatchingWithLargeTiles();
    }, 1000); // Wait 1 second for page to fully load

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
    function findLeftMostVisibleItem(contentGrid) {
        if (!contentGrid) return 0;
        
        const allItems = Array.from(contentGrid.querySelectorAll('.content-item'));
        const gridScrollLeft = contentGrid.scrollLeft;
        const originalCount = parseInt(contentGrid.getAttribute('data-original-count') || 0);
        
        // Since focused items always snap to the left edge, the left-most visible item 
        // is the one that starts at or very close to the current scroll position
        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            const itemLeft = item.offsetLeft;
            
            // Find the item that is positioned at the left edge (within a small tolerance)
            if (Math.abs(itemLeft - gridScrollLeft) < 5) {
                // For infinite carousel, get the original index
                if (originalCount > 0) {
                    if (item.classList.contains('cloned')) {
                        return parseInt(item.getAttribute('data-original-index') || 0);
                    } else {
                        const originalItems = contentGrid.querySelectorAll('.content-item:not(.cloned)');
                        return Array.from(originalItems).indexOf(item);
                    }
                } else {
                    // For non-infinite rows, return the actual index
                    return i;
                }
            }
        }
        
        // Fallback: find the first visible item (closest to scroll position)
        let closestItem = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            const itemLeft = item.offsetLeft;
            const distance = Math.abs(itemLeft - gridScrollLeft);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        }
        
        if (closestItem) {
            if (originalCount > 0) {
                if (closestItem.classList.contains('cloned')) {
                    return parseInt(closestItem.getAttribute('data-original-index') || 0);
                } else {
                    const originalItems = contentGrid.querySelectorAll('.content-item:not(.cloned)');
                    return Array.from(originalItems).indexOf(closestItem);
                }
            } else {
                return Array.from(allItems).indexOf(closestItem);
            }
        }
        
        // Final fallback to first item
        return 0;
    }
    
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
        
        // Always snap focused item to the left edge of the viewport
        const targetScrollPosition = itemLeft;
        
        // Smooth scroll to the target position
        contentGrid.scrollTo({ 
            left: targetScrollPosition, 
            behavior: 'smooth' 
        });
        
        console.log(`🔄 Infinite carousel: Navigated to item ${originalIndex + 1} of ${originalCount} (snapped to left edge)`);
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
    function getKeyAt(row, col) {
        const keyboardRows = document.querySelectorAll('.keyboard-row');
        if (row >= 0 && row < keyboardRows.length) {
            const keys = keyboardRows[row].querySelectorAll('.key-btn');
            if (col >= 0 && col < keys.length) {
                return keys[col];
            }
        }
        return null;
    }

    function handleSearchNavigation(direction) {
        const keyboardRows = document.querySelectorAll('.keyboard-row');
        const currentKey = getKeyAt(currentKeyboardRow, currentKeyboardCol);
        
        if (currentKey) {
            currentKey.classList.remove('focused');
        }
        
        switch (direction) {
            case 'left':
                // If at leftmost key, move back to Search navigation
                if (currentKeyboardCol === 0) {
                    currentFocus = 'sidebar';
                    currentNavIndex = 0; // Search is the first nav item
                    updateFocus();
                    return;
                }
                currentKeyboardCol = Math.max(0, currentKeyboardCol - 1);
                break;
            case 'right':
                const currentRowKeys = keyboardRows[currentKeyboardRow]?.querySelectorAll('.key-btn').length || 0;
                currentKeyboardCol = Math.min(currentRowKeys - 1, currentKeyboardCol + 1);
                break;
            case 'up':
                // If at top row, move back to textbox
                if (currentKeyboardRow === 0) {
                    searchFocus = 'textbox';
                    
                    // Remove focus from all keyboard buttons
                    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
                    
                    // Restore focus to text box and show cursor
                    const searchInput = document.querySelector('.search-input');
                    const searchCursor = document.querySelector('.search-cursor');
                    
                    if (searchInput) {
                        searchInput.focus(); // Restore focus to text input
                    }
                    
                    if (searchCursor) {
                        searchCursor.classList.add('active'); // Show text cursor
                    }
                    
                    console.log('🔼 Moving focus from keyboard back to text box');
                    return;
                }
                
                currentKeyboardRow = Math.max(0, currentKeyboardRow - 1);
                // Adjust column if new row has fewer keys
                const prevRowKeys = keyboardRows[currentKeyboardRow]?.querySelectorAll('.key-btn').length || 0;
                currentKeyboardCol = Math.min(currentKeyboardCol, prevRowKeys - 1);
                break;
            case 'down':
                currentKeyboardRow = Math.min(keyboardRows.length - 1, currentKeyboardRow + 1);
                // Adjust column if new row has fewer keys
                const nextRowKeys = keyboardRows[currentKeyboardRow]?.querySelectorAll('.key-btn').length || 0;
                currentKeyboardCol = Math.min(currentKeyboardCol, nextRowKeys - 1);
                break;
        }
        
        const newKey = getKeyAt(currentKeyboardRow, currentKeyboardCol);
        if (newKey) {
            newKey.classList.add('focused');
            newKey.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function handleKeyInput() {
        const currentKey = getKeyAt(currentKeyboardRow, currentKeyboardCol);
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
    🎮 ENHANCED KEYBOARD CONTROLS WITH INFINITE NAVIGATION:
    =====================================================
    ↑↓ Arrow Keys: Navigate up/down with infinite row wrapping
    ←→ Arrow Keys: Navigate left/right in infinite content tiles
    Enter/Space: Select item
    Escape/Backspace: Go back to sidebar
    Home: Go to first item
    End: Go to last item
    F1: Options menu
    F2: Info panel
    F3: Go to Search
    
    🔄 INFINITE NAVIGATION FEATURES:
    • Horizontal: Seamless tile navigation with no endpoints
    • Vertical: Simple row navigation that wraps at boundaries
    • After the last tile, continues with the first tile infinitely
    • From the last row, pressing down goes to the first row
    • From the first row, pressing up goes to the last row
    • Focus management works reliably with original content
    `);

    function initializeSearchInterface(autoFocus = true, showCursor = true, focusKeyboard = true) {
        console.log('Initializing search interface');
        searchQuery = '';
        currentKeyboardRow = 0;
        currentKeyboardCol = 0;
        searchFocus = 'textbox'; // Start with text box focused
        
        const searchInput = document.querySelector('.search-input');
        const searchCursor = document.querySelector('.search-cursor');
        
        if (searchInput) {
            searchInput.value = '';
            if (autoFocus) {
                searchInput.focus();
            }
        }
        
        if (searchCursor) {
            if (showCursor) {
                searchCursor.classList.add('active');
            } else {
                searchCursor.classList.remove('active');
            }
        }
        
        if (focusKeyboard) {
            updateKeyboardFocus();
            searchFocus = 'keyboard'; // Override to keyboard if we're focusing it
        } else {
            // Remove focus from all keyboard buttons
            document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('focused'));
        }
        
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
            const textWidth = getTextWidth(searchQuery, '24px RokuUI');
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

    // Tile Component System
    
    /**
     * Creates a tile component with specified type and size
     * @param {string} type - The aspect ratio type: "promo", "21:9", "16:9", "4:3", "2:3"
     * @param {string} size - The size variant: "small", "medium", "large"
     * @param {Object} content - Content object with title, image, etc.
     * @param {Object} options - Additional options (continueWatching, progress, etc.)
     * @returns {HTMLElement} The tile element
     */
    function createTile(type, size, content = {}, options = {}) {
        // Validate inputs
        const validTypes = ['promo', '21:9', '16:9', '4:3', '2:3'];
        const validSizes = ['small', 'medium', 'large'];
        
        if (!validTypes.includes(type)) {
            console.warn(`Invalid tile type: ${type}. Using default "16:9"`);
            type = '16:9';
        }
        
        if (!validSizes.includes(size)) {
            console.warn(`Invalid tile size: ${size}. Using default "medium"`);
            size = 'medium';
        }
        
        // Special handling for types that don't support all sizes
        if (type === 'promo' && !['small', 'large'].includes(size)) {
            size = 'large'; // Default promo to large
        }
        
        if (type === '4:3' && size !== 'small') {
            size = 'small'; // 4:3 only supports small
        }
        
        // Create the tile element
        const tile = document.createElement('div');
        
        // Add base classes
        tile.className = 'tile-component content-item';
        
        // Add type and size specific class
        const typeClass = type.replace(':', '-'); // Convert "16:9" to "16-9"
        tile.classList.add(`tile-${typeClass}-${size}`);
        
        // Add continue watching class if specified
        if (options.continueWatching) {
            tile.classList.add('continue-watching');
        }
        
        // Set default content if not provided
        const tileContent = {
            title: content.title || 'Sample Content',
            subtitle: content.subtitle || '',
            image: content.image || '',
            alt: content.alt || content.title || 'Content thumbnail',
            ...content
        };
        
        // Create tile HTML structure
        let tileHTML = '';
        
        if (tileContent.image) {
            tileHTML += `<img src="${tileContent.image}" alt="${tileContent.alt}" class="tile-image">`;
        } else {
            // Create a gradient placeholder if no image
            tileHTML += `<div class="tile-image" style="background: linear-gradient(45deg, #8B5A9B, #A066B0, #B573C4);"></div>`;
        }
        
        // Add overlay with title and subtitle
        tileHTML += `
            <div class="tile-overlay">
                <h3 class="tile-title">${tileContent.title}</h3>
                ${tileContent.subtitle ? `<p class="tile-subtitle">${tileContent.subtitle}</p>` : ''}
            </div>
        `;
        
        // Add progress bar for continue watching tiles
        if (options.continueWatching && options.progress !== undefined) {
            tileHTML += `
                <div class="progress-bar-container">
                    <div class="progress-bar" data-progress="${options.progress}" style="width: ${options.progress}%;"></div>
                </div>
            `;
        }
        
        tile.innerHTML = tileHTML;
        
        // Add event listeners
        addTileEventListeners(tile);
        
        return tile;
    }
    
    /**
     * Creates a grid of tiles with mixed types and sizes
     * @param {Array} tileConfigs - Array of tile configuration objects
     * @returns {HTMLElement} The grid container element
     */
    function createTileGrid(tileConfigs) {
        const grid = document.createElement('div');
        grid.className = 'content-grid';
        
        tileConfigs.forEach(config => {
            const tile = createTile(
                config.type || '16:9',
                config.size || 'medium',
                config.content || {},
                config.options || {}
            );
            grid.appendChild(tile);
        });
        
        return grid;
    }
    
    /**
     * Creates a complete content row with tiles
     * @param {string} title - Row title
     * @param {Array} tileConfigs - Array of tile configurations
     * @returns {HTMLElement} The complete row element
     */
    function createTileRow(title, tileConfigs) {
        const row = document.createElement('div');
        row.className = 'content-row';
        
        // Create row title
        const rowTitle = document.createElement('div');
        rowTitle.className = 'row-title';
        rowTitle.textContent = title;
        
        // Create tile grid
        const grid = createTileGrid(tileConfigs);
        
        row.appendChild(rowTitle);
        row.appendChild(grid);
        
        return row;
    }
    
    /**
     * Add event listeners to a tile
     * @param {HTMLElement} tile - The tile element
     */
    function addTileEventListeners(tile) {
        // Click handler
        tile.addEventListener('click', function() {
            const title = this.querySelector('.tile-title');
            console.log('Tile clicked:', title ? title.textContent : 'Unknown');
            
            // Add any custom click logic here
            if (this.classList.contains('continue-watching')) {
                console.log('Continue watching content clicked');
            }
        });
        
        // Hover handlers for non-touch devices
        if (!('ontouchstart' in window)) {
            tile.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            tile.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
        }
        
        // Keyboard navigation support
        tile.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        
        tile.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    }
    
    /**
     * Utility function to get tile dimensions for a given type and size
     * @param {string} type - The aspect ratio type
     * @param {string} size - The size variant
     * @returns {Object} Object with width and height properties
     */
    function getTileDimensions(type, size) {
        const dimensions = {
            'promo': {
                'small': { width: 343, height: 51 },
                'large': { width: 319, height: 116 }
            },
            '21:9': {
                'small': { width: 206, height: 88 },
                'medium': { width: 278, height: 119 },
                'large': { width: 423, height: 182 }
            },
            '16:9': {
                'small': { width: 206, height: 116 },
                'medium': { width: 278, height: 156 },
                'large': { width: 423, height: 237 }
            },
            '4:3': {
                'small': { width: 162, height: 122 }
            },
            '2:3': {
                'small': { width: 133, height: 200 },
                'medium': { width: 162, height: 243 },
                'large': { width: 206, height: 309 }
            }
        };
        
        return dimensions[type]?.[size] || dimensions['16:9']['medium'];
    }
    
    /**
     * Demo function to create sample tile layouts
     */
    function createSampleTileLayouts() {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;
        
        // Clear existing content for demo
        contentArea.innerHTML = '';
        
        // Sample content data
        const sampleContent = [
            { title: 'The Mandalorian', subtitle: 'Action • Sci-Fi', image: '' },
            { title: 'Stranger Things', subtitle: 'Thriller • Sci-Fi', image: '' },
            { title: 'The Crown', subtitle: 'Drama • Biography', image: '' },
            { title: 'Breaking Bad', subtitle: 'Crime • Drama', image: '' },
            { title: 'Friends', subtitle: 'Comedy • Romance', image: '' },
            { title: 'Game of Thrones', subtitle: 'Fantasy • Drama', image: '' },
            { title: 'The Office', subtitle: 'Comedy • Workplace', image: '' },
            { title: 'Black Mirror', subtitle: 'Sci-Fi • Anthology', image: '' }
        ];
        
        // Create rows with different tile configurations
        
        // Row 1: Mixed 16:9 tiles
        const row1Config = [
            { type: '16:9', size: 'large', content: sampleContent[0] },
            { type: '16:9', size: 'medium', content: sampleContent[1] },
            { type: '16:9', size: 'small', content: sampleContent[2] },
            { type: '16:9', size: 'medium', content: sampleContent[3] },
            { type: '16:9', size: 'large', content: sampleContent[4] }
        ];
        const row1 = createTileRow('Featured Movies & Shows', row1Config);
        contentArea.appendChild(row1);
        
        // Row 2: Continue Watching with progress bars
        const row2Config = [
            { 
                type: '16:9', 
                size: 'medium', 
                content: sampleContent[0], 
                options: { continueWatching: true, progress: 65 }
            },
            { 
                type: '16:9', 
                size: 'medium', 
                content: sampleContent[1], 
                options: { continueWatching: true, progress: 23 }
            },
            { 
                type: '16:9', 
                size: 'medium', 
                content: sampleContent[2], 
                options: { continueWatching: true, progress: 89 }
            },
            { 
                type: '16:9', 
                size: 'medium', 
                content: sampleContent[3], 
                options: { continueWatching: true, progress: 45 }
            }
        ];
        const row2 = createTileRow('Continue Watching', row2Config);
        contentArea.appendChild(row2);
        
        // Row 3: Mixed aspect ratios showcase
        const row3Config = [
            { type: 'promo', size: 'large', content: { title: 'Special Promotion', subtitle: 'Limited Time' } },
            { type: '21:9', size: 'medium', content: sampleContent[5] },
            { type: '4:3', size: 'small', content: sampleContent[6] },
            { type: '2:3', size: 'large', content: sampleContent[7] },
            { type: '21:9', size: 'small', content: sampleContent[0] }
        ];
        const row3 = createTileRow('Mixed Layout Showcase', row3Config);
        contentArea.appendChild(row3);
        
        // Re-initialize focus and event listeners
        ensureMinimumItemsPerRow();
        currentContentRow = 0;
        currentContentItem = 0;
        updateFocus();
        
        console.log('🎬 Created sample tile layouts with different aspect ratios and sizes');
    }
    
    // Expose tile creation functions globally for easy access
    window.TileComponent = {
        createTile,
        createTileGrid,
        createTileRow,
        getTileDimensions,
        createSampleTileLayouts
    };
    
    // Uncomment the next line to automatically create sample layouts on page load
    // createSampleTileLayouts();
    
    // Function to replace Continue Watching row with medium 16:9 tiles
    function replaceContinueWatchingWithLargeTiles() {
        const continueWatchingRow = document.querySelector('.continue-watching-row');
        if (!continueWatchingRow) {
            console.log('Continue Watching row not found');
            return;
        }
        
        // Define the Continue Watching content with medium 16:9 tiles
        const continueWatchingConfig = [
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'Stranger Things',
                    subtitle: 'S4 E7 • 42 min left',
                    image: 'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg',
                    alt: 'Stranger Things'
                },
                options: {
                    continueWatching: true,
                    progress: 65
                }
            },
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'Game of Thrones',
                    subtitle: 'S1 E3 • 51 min left',
                    image: 'https://image.tmdb.org/t/p/w500/1BIoJGKbXP6oFzwzqYgxuBvQMgm.jpg',
                    alt: 'Game of Thrones'
                },
                options: {
                    continueWatching: true,
                    progress: 23
                }
            },
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'Breaking Bad',
                    subtitle: 'S2 E12 • 8 min left',
                    image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                    alt: 'Breaking Bad'
                },
                options: {
                    continueWatching: true,
                    progress: 88
                }
            },
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'Top Gun: Maverick',
                    subtitle: '1h 18min left',
                    image: 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
                    alt: 'Top Gun: Maverick'
                },
                options: {
                    continueWatching: true,
                    progress: 45
                }
            },
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'The Office',
                    subtitle: 'S3 E14 • 19 min left',
                    image: 'https://image.tmdb.org/t/p/w500/6tfT03sGp9k4c0J3dypjrI8TSAI.jpg',
                    alt: 'The Office'
                },
                options: {
                    continueWatching: true,
                    progress: 12
                }
            },
            {
                type: '16:9',
                size: 'medium',
                content: {
                    title: 'Avengers: Infinity War',
                    subtitle: '38 min left',
                    image: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
                    alt: 'Avengers: Infinity War'
                },
                options: {
                    continueWatching: true,
                    progress: 76
                }
            }
        ];
        
        // Create the new Continue Watching row with medium tiles
        const newContinueWatchingRow = TileComponent.createTileRow('Continue Watching', continueWatchingConfig);
        
        // Add the continue-watching-row class to maintain styling compatibility
        newContinueWatchingRow.classList.add('continue-watching-row');
        
        // Replace the old row with the new one
        continueWatchingRow.parentNode.replaceChild(newContinueWatchingRow, continueWatchingRow);
        
        // Re-initialize the infinite carousel for the new row
        ensureMinimumItemsPerRow();
        
        console.log('✅ Continue Watching row updated to use medium 16:9 tiles');
        
        return newContinueWatchingRow;
    }
    
    // Expose the function globally for easy access
    window.replaceContinueWatchingWithLargeTiles = replaceContinueWatchingWithLargeTiles;
    
    console.log('🧩 Tile Component System Initialized');
    console.log('Available functions: TileComponent.createTile(), TileComponent.createTileGrid(), TileComponent.createTileRow()');
    console.log('Run TileComponent.createSampleTileLayouts() to see examples');
});
