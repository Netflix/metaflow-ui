import { Plugin, PluginInit } from '../';

const plugin: PluginInit = (): Plugin => {
  return {
    task: {
      transform: (task, artifacts) => {
        return {
          task,
          artifacts: artifacts
            ? artifacts.map((artifact) => {
                const pathComponents = artifact.location.split('/');
                const dotMetaflowIndex = pathComponents.indexOf('.metaflow');

                if (artifact.ds_type === 'local' && dotMetaflowIndex) {
                  const location = dotMetaflowIndex
                    ? pathComponents.splice(dotMetaflowIndex + 1).join('/')
                    : artifact.location;

                  return { ...artifact, location: location };
                }

                return artifact;
              })
            : null,
        };
      },
    },
  };
};

export default {
  name: 'task.localArtifacts',
  plugin: plugin,
};
