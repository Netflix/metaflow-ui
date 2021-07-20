# Metaflow UI Plugin API

This folder contains necessary JS API for making UI plugin to Metaflow UI. There is few ways to use this API. Entrypoint for plugin is single HTML file.

## API

Plugins will use JS API to communicate with host application. Plugin must call at least register function from API to get rendered.

| function         | type                                                                                                                                 | description                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| register         | (settings: 'headless'\|'run-header'\|'task-details'\|{slot:string,visible:boolean}, onReady: (config: PluginConfig) => void) => void | Register plugin to be rendered. Onready callback will be called when host application is all ready.                       |
| subscribe        | (paths: string[], cb: (message: { path: string, data: any }) => void) => void                                                        | Subscribe to contextual data updates from application. Possible paths: 'run', 'task', 'metadata', 'artifacts', 'location' |
| on               | (events: string[], cb: (message: { type: string, data: any }) => void) => void                                                       | Subscribe to any event by event string.                                                                                   |
| call             | (event: string, data: any) => void                                                                                                   | Call any custom event with string and any data.                                                                           |
| sendNotification | (message: string \| { type: string, message: string }) => void                                                                       | Call notification API from host application.                                                                              |
| setHeight        | (height: number \| undefined) => void                                                                                                | Update height of iframe container for plugin.                                                                             |
| setVisibility    | (visibility: boolean) => void                                                                                                        | Update visibility of the plugin. Note that if will stay in iframe even if visibility is set false.                        |

## How to

1. Download MetaflowPluginAPI.js and include it to your plugin folder. Don't forget to refer to it like:

```html
<script src="MetaflowPluginAPI.js"></script>
```

2. Store API to CDN and use it from there. Don't forget to refer to it like:

```html
<script src="PATH_TO_YOUR_CDN/MetaflowPluginAPI.js"></script>
```

3. Add plugin API to your bundled project. See example from [react-plugin](Examples/react-plugin/package.json) folder.

```js
import { Metaflow } from 'MetaflowPluginAPI.js'
...
Metaflow.register('run-header', () => ReactDOM.render(<App />, root));
```
