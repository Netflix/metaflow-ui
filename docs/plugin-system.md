# Plugin system

![Metaflow UI Plugin system](images/metaflow-ui-plugins.png)

Metaflow UI has support for custom plugins. Plugins are limited to running in predefined slots within UI. Plugins are installed server-side on the Metaflow UI service.

You can find the plugin JS API and examples from the [plugin-api](../plugin-api/README.md) folder.

## Getting started with plugin development

The easiest way to start developing plugins is to start up a local plugin development environment:

```sh
yarn dev:plugin
```

## How plugins works

Each plugin must have an HTML file as an entrypoint. This HTML is rendered to an iframe at a certain spot within the UI. Plugins can also have javascript and CSS files.

A basic plugin could be something like

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div class="container" id="container">
      <h1>Plugin</h1>
      <div id="received"></div>
      <button id="button">click me to send custom event!</button>
    </div>

    <script src="MetaflowPluginAPI.js"></script>
    <script>
      (function () {
        Metaflow.register('run-header', () => {
          Metaflow.on(['customEventB'], (message) => {
            document.getElementById('received').textContent = 'Got message: ' + message.data;
          });

          Metaflow.subscribe(['run'], (message) => {
            console.log(`Run ${message.data.run_number} got update!`);
          });
        });

        document.getElementById('button').onclick = function () {
          Metaflow.call('customEvent', 'Hello world');
        };
      })();
    </script>
  </body>
</html>
```

This plugin is registered to be rendered in the run header section (path /FLOW_ID/RUN_NUMBER in application). It subscribes to a custom event "customEvent" and is prepared to send another custom event "customEvent" on button click.

## Plugin slots

There are three implemented plugin slots. `run-header`, `task-details`, and `headless`. The desired slot must be given as a parameter to a plugin API register message.

### run-header

The `run-header` plugin will be rendered below run details in a collapsable element.

### run-tab

The `run-tab` plugin will be rendered as a new tab in the run's view, next to the DAG, Timeline, and Task tabs. This slot is better for plugins that need more screen space.

## task-details

The `task-details` plugin will be rendered below task details in a collapsable element.

## headless

The `headless` plugin will not have any visible content, but it can be used to send and receive events.

## Plugin configurations

Plugins can be given custom parameters from the server-side. These parameters will be passed to the plugin with the `onReady` callback call.

### Iframe sandbox

![Metaflow UI Plugin system sandbox](images/metaflow-ui-plugins-sandbox.png)

Since plugins are running within an iframe, they must comply with browser safety features. By default, we only give plugins "allow-scripts" rights. If your plugin requires more, you need to define them server-side with the `parameters.sandbox` property.

For example, we could allow plugins to take the main application to other URLs by giving them the "allow-top-navigation" flag.

```JSON
{
  "run-history-plugin": {
    "parameters": {
      "sandbox": "allow-top-navigation"
    }
  }
}
```

You can read more about iframe sandboxes in the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
