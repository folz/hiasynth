import { ProcessedTransformDefinition } from './transformDefinitions';
import { Output } from '../Output';

export interface TransformApplication {
  transform: ProcessedTransformDefinition;
  userArgs: unknown[];
}

export class TransformChain {
  transforms: TransformApplication[];

  constructor(transforms: TransformApplication[]) {
    this.transforms = transforms;
  }

  out(output: Output) {
    output.render(this.transforms);
  }
}
