# Roku Channel Tile Component System

A flexible tile component system for the Roku Channel web app that supports multiple aspect ratios and sizes with responsive design and accessibility features.

## Features

- **Multiple Aspect Ratios**: Support for Promo, 21:9, 16:9, 4:3, and 2:3 aspect ratios
- **Flexible Sizing**: Small, medium, and large variants for each tile type
- **Continue Watching**: Built-in progress bars for resume functionality
- **Responsive Design**: Automatic scaling across different screen sizes
- **Accessibility**: Keyboard navigation and ARIA support
- **Infinite Scrolling**: Seamless horizontal tile navigation
- **Smooth Animations**: Hover effects and focus transitions

## Tile Types and Dimensions

### Promo Banners
Wide promotional banners for featured content and announcements.

- **Small**: 1716×256 pixels (scaled: 343×51)
- **Large**: 1596×582 pixels (scaled: 319×116)

### 21:9 Cinematic Banners
Ultra-wide banners perfect for cinematic content.

- **Small**: 411×176 pixels (scaled: 206×88)
- **Medium**: 556×238 pixels (scaled: 278×119)
- **Large**: 846×363 pixels (scaled: 423×182)

### 16:9 Standard Video
Standard widescreen format for most video content.

- **Small**: 411×231 pixels (scaled: 206×116)
- **Medium**: 556×312 pixels (scaled: 278×156)
- **Large**: 846×474 pixels (scaled: 423×237)

### 4:3 Classic TV
Traditional TV format for classic shows and retro content.

- **Small**: 324×243 pixels (scaled: 162×122)

### 2:3 Portrait/Poster
Vertical format perfect for movie posters.

- **Small**: 266×399 pixels (scaled: 133×200)
- **Medium**: 324×486 pixels (scaled: 162×243)
- **Large**: 411×617 pixels (scaled: 206×309)

## Usage

### Basic Tile Creation

```javascript
// Create a standard 16:9 medium tile
const tile = TileComponent.createTile('16:9', 'medium', {
    title: 'The Mandalorian',
    subtitle: 'Sci-Fi • Action',
    image: 'path/to/image.jpg',
    alt: 'The Mandalorian poster'
});

// Append to container
document.querySelector('.content-grid').appendChild(tile);
```

### Continue Watching Tiles

```javascript
// Create a tile with progress bar
const continueWatchingTile = TileComponent.createTile('16:9', 'medium', {
    title: 'Stranger Things',
    subtitle: 'Season 4 • Episode 3'
}, {
    continueWatching: true,
    progress: 65  // 65% complete
});
```

### Creating Tile Grids

```javascript
// Create a grid of tiles
const tileConfigs = [
    { 
        type: '16:9', 
        size: 'large', 
        content: { title: 'Featured Movie', subtitle: 'Action • 2023' } 
    },
    { 
        type: '2:3', 
        size: 'medium', 
        content: { title: 'Poster Movie', subtitle: 'Drama • 2023' } 
    },
    { 
        type: '21:9', 
        size: 'small', 
        content: { title: 'Cinematic View', subtitle: 'Adventure • 2023' } 
    }
];

const grid = TileComponent.createTileGrid(tileConfigs);
```

### Creating Complete Rows

```javascript
// Create a complete content row
const rowConfig = [
    { type: '16:9', size: 'medium', content: { title: 'Movie 1' } },
    { type: '16:9', size: 'medium', content: { title: 'Movie 2' } },
    { type: '16:9', size: 'medium', content: { title: 'Movie 3' } }
];

const row = TileComponent.createTileRow('Popular Movies', rowConfig);
document.querySelector('.content-area').appendChild(row);
```

## API Reference

### TileComponent.createTile(type, size, content, options)

Creates a single tile element.

**Parameters:**
- `type` (string): Tile aspect ratio - 'promo', '21:9', '16:9', '4:3', '2:3'
- `size` (string): Tile size - 'small', 'medium', 'large'
- `content` (object): Content data
  - `title` (string): Tile title
  - `subtitle` (string): Optional subtitle
  - `image` (string): Optional image URL
  - `alt` (string): Optional alt text for image
- `options` (object): Additional options
  - `continueWatching` (boolean): Enable continue watching styling
  - `progress` (number): Progress percentage (0-100)

**Returns:** HTMLElement - The created tile element

### TileComponent.createTileGrid(tileConfigs)

Creates a grid container with multiple tiles.

**Parameters:**
- `tileConfigs` (array): Array of tile configuration objects

**Returns:** HTMLElement - The grid container element

### TileComponent.createTileRow(title, tileConfigs)

Creates a complete content row with title and tiles.

**Parameters:**
- `title` (string): Row title text
- `tileConfigs` (array): Array of tile configuration objects

**Returns:** HTMLElement - The complete row element

### TileComponent.getTileDimensions(type, size)

Gets the dimensions for a specific tile type and size.

**Parameters:**
- `type` (string): Tile aspect ratio
- `size` (string): Tile size

**Returns:** Object - `{ width: number, height: number }`

### TileComponent.createSampleTileLayouts()

Creates sample tile layouts to demonstrate the system capabilities.

## CSS Classes

### Base Classes
- `.tile-component` - Base tile styling
- `.content-item` - Integration with existing content system

### Type and Size Classes
- `.tile-promo-small`, `.tile-promo-large`
- `.tile-21-9-small`, `.tile-21-9-medium`, `.tile-21-9-large`
- `.tile-16-9-small`, `.tile-16-9-medium`, `.tile-16-9-large`
- `.tile-4-3-small`
- `.tile-2-3-small`, `.tile-2-3-medium`, `.tile-2-3-large`

### State Classes
- `.tile-component.focused` - Keyboard focus state
- `.tile-component.continue-watching` - Continue watching styling

### Sub-elements
- `.tile-image` - Tile image/background
- `.tile-overlay` - Content overlay
- `.tile-title` - Main title text
- `.tile-subtitle` - Subtitle text
- `.progress-bar-container` - Progress bar container
- `.progress-bar` - Progress bar element

## Responsive Behavior

The tile system automatically scales for different screen sizes:

- **Desktop (>1200px)**: Full size tiles
- **Tablet (768px-1200px)**: 80% scale
- **Mobile (<768px)**: 60% scale

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Focus Management**: Clear visual focus indicators
- **ARIA Labels**: Proper accessibility labels
- **Screen Reader**: Compatible with screen readers

## Integration with Existing App

The tile system is fully integrated with the existing Roku Channel app:

- Works with infinite horizontal scrolling
- Supports keyboard navigation
- Integrates with focus management
- Maintains progress bar animations
- Compatible with search functionality

## Demo

To see the tile system in action:

1. Open `tile-demo.html` in your browser
2. View examples of all tile types and sizes
3. Run `TileComponent.createSampleTileLayouts()` in the console
4. Navigate using keyboard controls (arrow keys)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Considerations

- Uses CSS transforms for smooth animations
- Optimized for 60fps scrolling
- Lazy loading compatible
- Memory efficient tile recycling
- Hardware accelerated transitions

## Customization

### Custom Tile Styles

```css
.tile-component.custom-theme {
    background: linear-gradient(45deg, #custom-color1, #custom-color2);
}

.tile-component.custom-theme .tile-title {
    color: #custom-text-color;
}
```

### Custom Tile Types

```javascript
// Extend the system with custom dimensions
const customDimensions = TileComponent.getTileDimensions('16:9', 'medium');
// Modify as needed for custom aspect ratios
```

## Examples

See `tile-demo.html` for comprehensive examples of all tile types and configurations.

## Contributing

When adding new tile types or sizes:

1. Add CSS classes following the naming convention
2. Update the `getTileDimensions()` function
3. Add validation to `createTile()` function
4. Update this documentation
5. Add examples to the demo page

## License

This tile component system is part of the Roku Channel web application.
