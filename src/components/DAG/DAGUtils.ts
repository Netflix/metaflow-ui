//
// Types
//

export type DAGModelItem = {
  // Type of step
  type: 'join' | 'foreach' | 'linear' | 'end' | 'start' | 'split-and';
  // Next step(s)
  next: string[];
  // docstring from step
  doc?: string;
};

export type StepInfoModel = Record<string, DAGModelItem>;
export type StepStructureModel = string | Array<StepStructureModel>;

export type GraphModel = {
  file: string;
  parameters: [
    {
      name: string;
      type: 'Parameter';
    },
  ];
  constants: Array<string>;
  steps_info: StepInfoModel;
  steps_structure: Array<StepStructureModel>;
  doc?: string;
  decorators: Array<string>;
};
