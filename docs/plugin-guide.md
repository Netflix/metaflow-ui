# Step by step guide on plugin development

## Way 1: Develop with UI tooling

This way uses mock data and does not require other services for development.

1. Clone [Metaflow UI](https://github.com/Netflix/metaflow-ui)
2. Install dependencies `yarn install`
3. Open plugin development environment `yarn dev:plugin`. Cypress UI will open in browser in a while.
4. Click `index.plugin-dev.tsx` on left side of the screen. This is will show up the plugin example.
5. Open up `plugin-api/dev/plugins/dev-plugin/index.html` with your code editor and start developing your plugin here.
   > Alternatively you can make a new folder (`plugin-api/dev/plugins/new-plugin`) and add `index.html` and `manifest.json` like in dev-plugin. Also make copy of `index.plugin-dev.tsx` and update `PLUGIN_DEFINITIONS`. This is recommended so you can easily initialize this new folder as a git repo.
6. Before deployment add a copy of MetaflowPluginAPI.js with the plugin and make sure that index.html refers to it correctly.
7. See `Deployment guide` from below

## Way 2: Develop with backend services

This way requires the use of the UI application and Metaflow Metadata services.

1. Clone [Metaflow UI](https://github.com/Netflix/metaflow-ui)
2. Install dependencies `yarn install` and start up UI with `yarn start`
3. Clone [Metaflow Service](https://github.com/Netflix/metaflow-service)
4. Create a new folder to `services/ui_backend_service/plugins/installed/your-new-plugin` and add `index.html`, `manifest.json` and `MetaflowPluginAPI.js`.
5. Start up the backend service with docker-compose with [plugin configurations](https://github.com/Netflix/metaflow-service/blob/master/services/ui_backend_service/docs/plugins.md).

> `PLUGINS={"your-new-plugin": {}} docker-compose -f docker-compose.development.yml up`

6. Run Metaflow runs with the new backend service. https://github.com/Netflix/metaflow-service
7. Open UI in browser `http://localhost:3000` and start developing the plugin. Plugin should show up in `run-header`, `task-details`, or `header` depending on the manifest.json `slot` parameter.
8. See `Deployment guide` from below

# Deployment

Production stage plugins live on the server side. Detailed instructions at [Metaflow Service docs](https://github.com/Netflix/metaflow-service/blob/master/services/ui_backend_service/docs/plugins.md).

## Way 1: GIT

1. Setup GIT repo for your plugin.
2. Configure `PLUGINS` variable at metaflow-service/ui_backend_service with following example.
   > ```
   > {
   >  "plugin-example": "git@github.com:User/plugin-repo.git"
   > }
   > ```

or (all possible settings are described in Metaflow Service docs)

> ```
> {
>  "plugin-example": {
>    "repository": "path_to_your_repo",
>    "ref": "1234f5a",
>    "auth": { "user": "user", "password": "password" }
>  }
> }
> ```

3. Start up the service and the plugin is fetched and installed.

## Way 2: Manual

1. Move plugin folder to `services/ui_backend_service/plugins/installed` on the backend service.
2. Configure `PLUGINS` variable at metaflow-service/ui_backend_service with
   > ```
   > {
   >  "plugin-folder-name": {}
   > }
   > ```
3. Start up the service
