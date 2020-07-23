import { TFunction } from 'i18next';
import i18n from '../i18n';

import { Task, Artifact } from '../types';

interface PluginProps {
  t: TFunction;
}

export type PluginInit = (props: PluginProps) => Plugin;

interface RegisterProps {
  name: string;
  translations?: { [key: string]: Record<string, unknown> };
  plugin: PluginInit;
}

export interface Plugin {
  task?: PluginTask;
}

interface PluginTask {
  transform?: (task: Task | null, artifacts: Artifact[] | null) => { task: Task | null; artifacts: Artifact[] | null };
  sections?: PluginTaskSection[];
}

export interface PluginTaskSection {
  key: string;
  label?: string;
  order?: number;
  component?: React.FC<{ task: Task | null; artifacts: Artifact[] | null }>;
}

const PLUGINS: Plugin[] = [];
export default {
  all: (): Plugin[] => PLUGINS,
  register: ({ name, translations, plugin }: RegisterProps): Plugin => {
    const translationNamespace = `plugin.${name}`;

    const props: PluginProps = {
      t: i18n.getFixedT(null, translationNamespace),
    };

    // Load translations
    if (translations) {
      const languages = Object.keys(translations);
      for (let i = 0; i < languages.length; i++) {
        const language = languages[i];
        i18n.addResourceBundle(language, translationNamespace, translations[language]);
      }
    }

    const _plugin = plugin(props);
    PLUGINS.push(_plugin);
    return _plugin;
  },
};
