import REGL from 'regl';
import { Output } from '../Output';
import { Source } from '../Source';

export type Resolution = readonly [number, number];

export type Precision = 'lowp' | 'mediump' | 'highp';

export interface HydraDrawUniforms {
  oTex: REGL.Resource;
  resolution: Resolution;
  time: number;
}

export interface Synth {
  precision: Precision;
  bpm: number;
  fps?: number;
  readonly resolution: Resolution;
  speed: number;
  readonly stats: {
    fps: number;
  };
  time: number;
  readonly environment: {
    defaultUniforms: {
      time: REGL.DynamicVariable<HydraDrawUniforms[keyof HydraDrawUniforms]>;
      resolution: REGL.DynamicVariable<
        HydraDrawUniforms[keyof HydraDrawUniforms]
      >;
    };
    regl: REGL.Regl;
  };
}

export interface HydraRendererOptions {
  height: number;
  numOutputs?: number;
  numSources?: number;
  precision?: Precision;
  regl: REGL.Regl;
  width: number;
}

export interface Hydra {
  readonly synth: Synth;
  readonly outputs: Output[];
  readonly sources: Source[];
  output: Output;
  renderFbo: REGL.DrawCommand<REGL.DefaultContext, HydraDrawUniforms>;
  timeSinceLastUpdate: number;
}

export function createHydra(options: HydraRendererOptions): Hydra {
  const {
    height,
    numOutputs = 4,
    numSources = 4,
    precision = 'mediump' as const,
    regl,
    width,
  } = options;

  const outputs: Output[] = [];
  const sources: Source[] = [];

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
      defaultUniforms: {
        time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
        resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
          'resolution',
        ),
      },
    },
  } as const;

  const renderFbo = regl<{}, {}, HydraDrawUniforms>({
    frag: `
      precision ${synth.precision} float;

      #define PI 3.1415926538

      uniform vec2 resolution;
      uniform sampler2D oTex;
      uniform float time;
      varying vec2 uv;

      void main () {
        gl_FragColor = texture2D(oTex, vec2(1.0 - uv.x, uv.y));
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
      oTex: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('oTex'),
      time: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>('time'),
      resolution: regl.prop<HydraDrawUniforms, keyof HydraDrawUniforms>(
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
