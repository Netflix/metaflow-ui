import React, { useEffect, useState } from 'react';
import { Step, Flow, Run, Task } from '../types';
import './Timeline.css';
import VirtualizedTimeline from './VirtualizedTimeline';

const FlowList: React.FC<{
  d: { s: number; d: Flow[] };
  openFlow: (id: string) => void;
}> = ({ d, openFlow }) => (
  <>
    {d.s === 1 && (
      <div className="flow-list">
        <b>Flows</b>
        {d.d.map((item) => (
          <div className="item" key={item.flow_id} onClick={() => openFlow(item.flow_id)}>
            {item.user_name}, {item.flow_id}
          </div>
        ))}
      </div>
    )}
  </>
);

const RunsList: React.FC<{ flow: string; openRun: (id: number) => void }> = ({ flow, openRun }) => {
  const [d, sd] = useState<{ s: number; d: Run[] }>({ s: 0, d: [] });

  useEffect(() => {
    fetch(`/flows/${flow}/runs`).then((resp) => {
      resp.json().then((data) => sd({ s: 1, d: data }));
    });
  }, [flow]);

  return (
    <div className="runs-list">
      <b>Runs</b>
      {d.s === 1 &&
        d.d.map((item) => (
          <div className="item" key={item.run_number} onClick={() => openRun(item.run_number)}>
            {item.run_number}, {item.ts_epoch}
          </div>
        ))}
    </div>
  );
};

const StepList: React.FC<{
  flow: string;
  run: number;
  openStep: (name: string) => void;
}> = ({ flow, run, openStep }) => {
  const [d, sd] = useState<{ s: number; d: Step[] }>({ s: 0, d: [] });

  useEffect(() => {
    fetch(`/flows/${flow}/runs/${run}/steps`).then((resp) => {
      resp.json().then((data) => sd({ s: 1, d: data }));
    });
  }, [flow, run]);

  return (
    <div className="runs-list">
      <VirtualizedTimeline data={d.d} onOpen={(item: Step) => openStep(item.step_name)} />
    </div>
  );
};

const TasksList: React.FC<{ flow: string; run: number; step: string }> = ({ flow, run, step }) => {
  const [d, sd] = useState<{ s: number; d: Task[] }>({ s: 0, d: [] });

  useEffect(() => {
    fetch(`/flows/${flow}/runs/${run}/steps/${step}/tasks`).then((resp) => {
      resp.json().then((data) => sd({ s: 1, d: data }));
    });
  }, [flow, run, step]);

  return (
    <div className="tasks-list">
      <b>Tasks</b>
      <VirtualizedTimeline data={d.d} onOpen={() => null} />
    </div>
  );
};

const Experiment: React.FC = () => {
  const [d, sd] = useState<{ s: number; d: Flow[] }>({ s: 0, d: [] });

  const [flow, setFlow] = useState<string | null>(null);
  const [run, setRun] = useState<number | null>(null);
  const [step, setStep] = useState<string | null>(null);

  useEffect(() => {
    fetch('/flows').then((resp) => {
      resp.json().then((data) => sd({ s: 1, d: data }));
    });
  }, []);

  return (
    <div className="experiment-view">
      <FlowList
        d={d}
        openFlow={(id: string) => {
          setRun(null);
          setStep(null);
          setFlow(id);
        }}
      />

      {flow && (
        <RunsList
          flow={flow}
          openRun={(id: number) => {
            setStep(null);
            setRun(id);
          }}
        />
      )}

      {flow && run && <StepList flow={flow} run={run} openStep={(id: string) => setStep(id)} />}

      {flow && run && step && <TasksList flow={flow} run={run} step={step} />}
    </div>
  );
};

export default Experiment;
