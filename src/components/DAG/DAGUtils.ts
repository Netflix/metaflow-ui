//
// Types
//

export type DAGModelItem = {
  // Type of step
  type: 'join' | 'foreach' | 'linear' | 'end' | 'start' | 'split';
  // Next step(s)
  next: string[];
  // docstring from step
  doc?: string;
  name: string;
  line: number;
  decorators: Array<Decorator>;
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
