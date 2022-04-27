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

export type Precision = 'lowp' | 'mediump' | 'highp';

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
  bpm: number;
  fps?: number;
  resolution: Resolution;
  speed: number;
  stats: {
    fps: number;
  };
  time: number;
}

export interface GlEnvironment {
  defaultUniforms: {
    [name: string]: DynamicVariable<any> | DynamicVariableFn<any, any, any>;
  };
  height: number;
  precision: Precision;
  regl: Regl;
  width: number;
}

export interface HydraRendererOptions {
  height: number;
  numOutputs?: number;
  numSources?: number;
  precision?: Precision;
  regl: Regl;
  width: number;
}

export class Hydra {
  readonly synth: Synth;
  readonly outputs: Output[];
  readonly sources: Source[];
  output: Output;
  readonly renderFbo: DrawCommand<DefaultContext>;
  timeSinceLastUpdate = 0;

  constructor({
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump',
    regl,
    width,
  }: HydraRendererOptions) {
    const outputs = [];
    const sources = [];

    const synth = {
      bpm: 60,
      fps: undefined,
      resolution: [width, height],
      speed: 1,
      stats: {
        fps: 0,
      },
      time: 0,
    } as const;

    const defaultUniforms = {
      time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
      resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
        'resolution',
      ),
    };

    const glEnvironment = {
      regl,
      width,
      height,
      precision,
      defaultUniforms,
    };

    const renderFbo = regl<HydraFboUniforms>({
      frag: `
      precision ${glEnvironment.precision} float;
      varying vec2 uv;
      uniform vec2 resolution;
      uniform sampler2D tex0;

      void main () {
        gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
      }
      `,
      vert: `
      precision ${glEnvironment.precision} float;
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
      const s = new Source(glEnvironment);
      sources.push(s);
    }

    for (let i = 0; i < numOutputs; i++) {
      const o = new Output(glEnvironment);
      outputs.push(o);
    }

    this.outputs = outputs;
    this.sources = sources;
    this.synth = synth;
    this.output = outputs[0];
    this.renderFbo = renderFbo;
  }
}
