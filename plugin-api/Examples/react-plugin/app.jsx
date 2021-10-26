import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import { Metaflow } from '../../MetaflowPluginAPI'
import './style.css';

function App() {
  const [run, setRun] = useState(null)

  // subscribe to listen run resource.
  useEffect(() => {
    Metaflow.subscribe(['run'], (event) => {
      setRun(event.data);
    });
    Metaflow.setHeight(100)
  }, []);

  return (
    <div className="App">
      <div>
        {run ? (
          <div>
            <div>{run.flow_id}/{run.run_number}</div>
          </div>
        ) : 'Waiting for data'}
      </div>
    </div>
  )
}


Metaflow.register('run-header', () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
});
