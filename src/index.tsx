import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './i18n';
import * as serviceWorker from './serviceWorker';

// Register plugins
import Plugins from './plugins';
import TaskLocalArtifacts from './plugins/TaskLocalArtifacts';
import S3Plugin from './plugins/TaskS3Links';

Plugins.register(TaskLocalArtifacts);
Plugins.register(S3Plugin);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
