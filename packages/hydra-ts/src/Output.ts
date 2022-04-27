import { Attributes, DrawCommand, Framebuffer2D } from 'regl';
import { TransformApplication } from './glsl/Glsl';
import { compileWithEnvironment } from './compiler/compileWithEnvironment';
import { Synth } from './Hydra';

export class Output {
  attributes: Attributes;
  draw: DrawCommand;
  fbos: Framebuffer2D[];
  synth: Synth;
  vert: string;
  pingPongIndex = 0;

  constructor(synth: Synth) {
    this.synth = synth;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.draw = () => {};

    this.vert = `
  precision ${synth.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`;

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

  resize(width: number, height: number) {
    this.synth.environment.resolution = [width, height];

    this.fbos.forEach((fbo) => {
      fbo.resize(width, height);
    });
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

    const pass = compileWithEnvironment(transformApplications, this.synth);

    this.draw = this.synth.environment.regl({
      frag: pass.frag,
      vert: this.vert,
      attributes: this.attributes,
      uniforms: pass.uniforms,
      count: 3,
      framebuffer: () => {
        this.pingPongIndex = this.pingPongIndex ? 0 : 1;
        return this.fbos[this.pingPongIndex];
      },
    });
  }
}
