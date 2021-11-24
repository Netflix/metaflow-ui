# Metaflow UI Plugin API

This folder contains the JS API for making UI plugins for Metaflow UI. There are a few ways to use this API. The Entrypoint for a plugin is a single HTML file.

## API

Plugins will use JS API to communicate with the host application. Plugins must call at least the `register` function from the API to get rendered.

| function         | type                                                                                                                                                                                                                      | description                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| register         | (settings: 'headless'\|'run-header'\|'run-tab'\|'task-details'\|{slot:string,visible:boolean,useApplicationStyles?:boolean,container?:'collapsable'\|'titled-container',containerProps?:Record<string, unknown>}, onReady: (config: PluginConfig) => void) => void | Register plugin to be rendered. Onready callback will be called when host application is all ready.                       |
| subscribe        | (paths: string[], cb: (message: { path: string, data: any }) => void) => void                                                                                                                                             | Subscribe to contextual data updates from application. Possible paths: 'run', 'task', 'metadata', 'artifacts', 'location' |
| on               | (events: string[], cb: (message: { type: string, data: any }) => void) => void                                                                                                                                            | Subscribe to any event by event string.                                                                                   |
| call             | (event: string, data: any) => void                                                                                                                                                                                        | Call any custom event with string and any data.                                                                           |
| sendNotification | (message: string \| { type: string, message: string }) => void                                                                                                                                                            | Call notification API from host application.                                                                              |
| setHeight        | (height: number \| undefined) => void                                                                                                                                                                                     | Update height of iframe container for plugin.                                                                             |
| setVisibility    | (visibility: boolean) => void                                                                                                                                                                                             | Update visibility of the plugin. Note that if will stay in iframe even if visibility is set false.                        |

## How to

Here are three different ways to use the plugin API file.

1. Add MetaflowPluginAPI.js to your plugin folder. Don't forget to refer to it like:

```html
<script src="MetaflowPluginAPI.js"></script>
```

2. Store the API to a CDN and use it from there. This might be a good option when you have lots of plugins and don't want to add the JS file to every single one. Don't forget to refer to it like:

```html
<script src="PATH_TO_YOUR_CDN/MetaflowPluginAPI.js"></script>
```

3. Add plugin API to your bundled project. See example from [react-plugin](Examples/react-plugin/package.json) folder.

```js
import { Metaflow } from 'MetaflowPluginAPI.js'
...
Metaflow.register('run-header', () => ReactDOM.render(<App />, root));
```
