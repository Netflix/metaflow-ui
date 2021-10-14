# Plugin system

Metaflow UI has support for custom plugins. Plugins are limited on running in predefined slots within UI. Plugins are installed server side to Metaflow UI service.

You can find plugin JS api and examples from [plugin-api](../plugin-api/README.md) folder.

## Getting started with plugin development

Easiest way to start developing plugins is to start up local plugin development environment:

```sh
yarn dev:plugin
```

## How plugins works

Each plugin must have html file as an entrypoint. This html is rendered to iframe to certain spot within UI. Plugin can also have javascript and css files.

Basic plugin could be something like

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

This plugin is registered to be rendered in run header section (path /FLOW_ID/RUN_NUMBER in application). It subscribes to custom event "customEvent" and is prepared to send other custom event "customEvent" on button click.

## Plugin slots

There is three implemented plugin slots. run-header, task-details and headless. Wanted slot must be given as parameter to plugin API register message

### run-header

run-header plugin will be rendered below run details to collapsable element.

## task-details

task-details plugin will be rendered below task details to collapsable element.

## headless

headless plugin will not have any visible content but it can be used to send and receive events.

## Plugin configurations

Plugin can be given custom parameters server side. These parameters will be passed to plugin with onReady callback call.

### Iframe sandbox

Since plugins are running within iframe, they must comply to browser safety features. By default we only give plugin "allow-scripts" right. If your plugin required more, you need to define it server side with parameters.sandbox property.

For example, we could allow plugin to take main application to other url by giving it "allow-top-navigation" flag.

```JSON
{
  "run-history-plugin": {
    "parameters": {
      "sandbox": "allow-top-navigation"
    }
  }
}
```

You can read more about Iframe sandbox from [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
