# Metaflow UI Plugin API

This folder contains the JS API for making UI plugins for Metaflow UI. There are a few ways to use this API. The Entrypoint for a plugin is a single HTML file.

## API

Plugins will use JS API to communicate with the host application. Plugins must call at least the `register` function from the API to get rendered.

| function               | type                                                                           | description                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| onReady                | (callback: (configuration, resource, settings) => void) => void                | Register callback function to be run when host and plugin iframe are ready.                                        |
| subscribe              | (paths: string[], cb: (message: { path: string, data: any }) => void) => void  | Subscribe to contextual data updates from application. Possible paths: 'metadata', 'run-metadata', and 'task-info' |
| subscribeToMetadata    | (callback: (message: Record<string,string>) => void) => void                   | Subscribe to task metadata                                                                                         |
| subscribeToRunMetadata | (callback: (message: Record<string,string>) => void) => void                   | Subscribe to run metadata                                                                                          |
| on                     | (events: string[], cb: (message: { type: string, data: any }) => void) => void | Subscribe to any event by event string.                                                                            |
| call                   | (event: string, data: any) => void                                             | Call any custom event with string and any data.                                                                    |
| sendNotification       | (message: string \| { type: string, message: string }) => void                 | Call notification API from host application.                                                                       |
| setHeight              | (height: number \| undefined) => void                                          | Update height of iframe container for plugin.                                                                      |
| setVisibility          | (visibility: boolean) => void                                                  | Update visibility of the plugin. Note that if will stay in iframe even if visibility is set false.                 |

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
Metaflow.onReady(() => ReactDOM.render(<App />, root));
```

## Configuration

Plugins requires some configuration to their manifest.json

```json
{
  "name": "Plugin name", // Name will be visible in UI
  "version": "0.0.1",
  "entrypoint": "index.html", // Name for HTML file used
  "slot": "run-header", // Slot in UI where plugin is rendered. "run-header", "task-details", "header", "top-nav"
  "visible": true, // (Optional) Define if plugin should be visible by default. Default: true
  "container": "titled-container", // (Optional) Define what kind of container is used for plugin. "collapsable" or "titled-container". Default: "collapsable"
  "containerProps": {}, // (Optional) Properties for container element. For example collapsable can take { "initialState": true } to be open by default. Default: null
  "useApplicationStyles": false // (Optional) Disable injecting basic styles from main application. Default: true
}
```
