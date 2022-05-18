import REGL from 'regl';
import { TransformApplication } from './glsl/TransformChain';
import { compileWithSynth } from './compiler/compileWithSynth';
import { Synth } from './Hydra';

export class Output {
  attributes: REGL.Attributes;
  draw: REGL.DrawCommand | (() => void);
  fbos: REGL.Framebuffer2D[];
  synth: Synth;
  pingPongIndex = 0;

  constructor(synth: Synth) {
    this.synth = synth;

    this.draw = () => {};

    this.attributes = {
      position: synth.environment.regl.buffer([
        [-2, 0],
        [0, -2],
        [2, 2],
      ]),
    };

    // for each output, create two fbos for pingponging
    this.fbos = Array(2)
      .fill(undefined)
      .map(() =>
        synth.environment.regl.framebuffer({
          color: synth.environment.regl.texture({
            mag: 'nearest',
            width: synth.resolution[0],
            height: synth.resolution[1],
            format: 'rgba',
          }),
          depthStencil: false,
        }),
      );
  }

  resize(synth: Synth) {
    const [width, height] = synth.resolution;

    this.fbos.forEach((fbo) => {
      fbo.resize(width, height);
    });
  }

  hush() {
    this.draw = () => {};

    this.fbos.forEach((fbo) =>
      fbo.use(() => this.synth.environment.regl.clear({ color: [0, 0, 0, 0] })),
    );
  }

  getCurrent() {
    return this.fbos[this.pingPongIndex];
  }

  // Used by glsl-utils/formatArguments
  getTexture() {
    const index = this.pingPongIndex ? 0 : 1;
    return this.fbos[index];
  }

  render(transformApplications: TransformApplication[]) {
    if (transformApplications.length === 0) {
      return;
    }

    const pass = compileWithSynth(transformApplications, this.synth);

    this.draw = this.synth.environment.regl({
      frag: pass.frag,
      vert: pass.vert,
      attributes: this.attributes,
      uniforms: {
        ...this.synth.environment.defaultUniforms,
        ...pass.uniforms,
      },
      count: 3,
      framebuffer: () => {
        this.pingPongIndex = this.pingPongIndex ? 0 : 1;
        return this.fbos[this.pingPongIndex];
      },
    });
  }
}
