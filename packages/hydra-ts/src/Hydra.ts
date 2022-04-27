import {
  DefaultContext,
  DrawCommand,
  DynamicVariable,
  DynamicVariableFn,
  Regl,
  Resource,
} from 'regl';
import { Output } from './Output';
import { Source } from './Source';
import { Precision } from './types';

export type Resolution = readonly [number, number];

export interface HydraFboUniforms {
  resolution: Resolution;
  tex0: Resource;
}

export interface HydraDrawUniforms {
  resolution: Resolution;
  time: number;
}

export interface Synth {
  precision: Precision;
  bpm: number;
  fps?: number;
  resolution: Resolution;
  speed: number;
  stats: {
    fps: number;
  };
  time: number;
  environment: {
    defaultUniforms: {
      [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
    };
    regl: Regl;
  };
}

export interface HydraRendererOptions {
  height: number;
  numOutputs?: number;
  numSources?: number;
  precision?: Precision;
  regl: Regl;
  width: number;
}

export interface Hydra {
  readonly synth: Synth;
  readonly outputs: Output[];
  readonly sources: Source[];
  output: Output;
  readonly renderFbo: DrawCommand<DefaultContext>;
  timeSinceLastUpdate: number;
}

export function createHydra(options: HydraRendererOptions): Hydra {
  const {
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump',
    regl,
    width,
  } = options;

  const outputs = [];
  const sources = [];

  const defaultUniforms = {
    time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
    resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
      'resolution',
    ),
  };

  const synth = {
    precision,
    bpm: 60,
    fps: undefined,
    resolution: [width, height],
    speed: 1,
    stats: {
      fps: 0,
    },
    time: 0,
    environment: {
      regl,
      defaultUniforms,
    },
  } as const;

  const renderFbo = regl<HydraFboUniforms>({
    frag: `
      precision ${synth.precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
    vert: `
      precision ${synth.precision} float;
      attribute vec2 position;
      varying vec2 uv;

      void main () {
        uv = position;
        gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
      }`,
    attributes: {
      position: [
        [-2, 0],
        [0, -2],
        [2, 2],
      ],
    },
    uniforms: {
      tex0: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>('tex0'),
      resolution: regl.prop<HydraFboUniforms, keyof HydraFboUniforms>(
        'resolution',
      ),
    },
    count: 3,
    depth: { enable: false },
  });

  for (let i = 0; i < numSources; i++) {
    const s = new Source(synth);
    sources.push(s);
  }

  for (let i = 0; i < numOutputs; i++) {
    const o = new Output(synth);
    outputs.push(o);
  }

  return {
    outputs,
    sources,
    synth,
    output: outputs[0],
    renderFbo,
    timeSinceLastUpdate: 0,
  };
}
