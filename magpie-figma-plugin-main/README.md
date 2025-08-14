# magpie figma plugin

## code organization:
Figma plugins operate with 2 separate pieces. A plugin that can interact with the elements in the Figma file and a UI that appears within an iframe. They communicate by passing messages back and forth.

|  path           | description                          |
| --------------- | ------------------------------------ |
| ui/             | React UI source                      |
| ui/index.html   | vite entry point for the UI code     |
| plugin/         | figma plugin source                  |
| dist/           | built output for our plugin          |

## scripts

plugin and ui are built separately

`build:plugin` - build plugin  
`build:plugin:watch` - build plugin, watch for changes  

`dev:ui` - UI local dev server  
`build:ui` - build ui  
`build:ui:watch` - build ui, watch for changes  

`build` - build plugin & UI  
`watch` - build plugin & UI, watch for changes  
