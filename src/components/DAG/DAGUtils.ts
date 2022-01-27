//
// Types
//

export type DAGNodeTypes =
  | 'start'
  | 'join'
  | 'linear'
  | 'split-static'
  | 'split-foreach'
  | 'split-parallel'
  | 'end'
  | 'unknown';

export type DAGModelItem = {
  // Type of step
  type: DAGNodeTypes;
  // Next step(s)
  next: string[];
  // docstring from step
  doc?: string;
  name: string;
  line: number;
  decorators?: Array<Decorator>;
  foreach_artifact: string | null;
};

export type StepInfoModel = Record<string, DAGModelItem>;
export type GraphStructureModel = string | Array<GraphStructureModel>;

export type Decorator = { name: string; attributes: Record<string, string | number>; statically_defined: boolean };

export type GraphModel = {
  file: string;
  parameters: {
    name: string;
    type: string;
  }[];
  constants: Array<string>;
  steps: StepInfoModel;
  graph_structure: Array<GraphStructureModel>;
  doc?: string;
};
