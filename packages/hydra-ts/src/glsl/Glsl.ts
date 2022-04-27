import { Output } from '../Output';
import { ProcessedTransformDefinition } from './transformDefinitions';

export interface TransformApplication {
  transform: ProcessedTransformDefinition;
  userArgs: unknown[];
}

export class Glsl {
  transforms: TransformApplication[];

  constructor(transforms: TransformApplication[]) {
    this.transforms = transforms;
  }

  out(output: Output) {
    output.render(this.transforms);
  }
}
