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
  decorators: string[];
  foreach_artifact: string | null;
};

export type StepInfoModel = Record<string, DAGModelItem>;
export type StepStructureModel = string | Array<StepStructureModel>;

export type GraphModel = {
  file: string;
  parameters: {
    name: string;
    type: string;
  }[];
  constants: Array<string>;
  steps_info: StepInfoModel;
  steps_structure: Array<StepStructureModel>;
  doc?: string;
  decorators: Array<string>;
};
