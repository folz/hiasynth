declare module "hydra-synth" {
  export type Precision = "lowp" | "mediump" | "highp";

  // eslint-disable-next-line import/no-default-export
  export default class HydraSynth {
    constructor(options: { canvas?: HTMLCanvasElement; precision?: Precision });
  }
}
