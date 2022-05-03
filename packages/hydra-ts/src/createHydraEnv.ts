import { createHydra } from './Hydra';
import type { Hydra, HydraRendererOptions } from './Hydra';
import { solid } from './glsl';
import { Output } from './Output';

export function hush(this: undefined, hydra: Hydra): void {
  hydra.outputs.forEach((output) => {
    solid(1, 1, 1, 0).out(output);
  });
}

export function render(this: undefined, hydra: Hydra, output?: Output): void {
  hydra.output = output ?? hydra.outputs[0];
}

export function setResolution(
  this: undefined,
  hydra: Hydra,
  width: number,
  height: number,
): void {
  hydra.synth.resolution = [width, height];

  hydra.outputs.forEach((output) => {
    output.resize(hydra.synth);
  });
}

export function tick(this: undefined, hydra: Hydra, dt: number): void {
  hydra.synth.time += dt * 0.001 * hydra.synth.speed;

  hydra.timeSinceLastUpdate += dt;

  if (!hydra.synth.fps || hydra.timeSinceLastUpdate >= 1000 / hydra.synth.fps) {
    hydra.synth.stats.fps = Math.ceil(1000 / hydra.timeSinceLastUpdate);

    hydra.sources.forEach((source) => {
      source.draw(hydra.synth);
    });

    hydra.outputs.forEach((output) => {
      output.draw(hydra.synth);
    });

    hydra.renderFbo({
      tex0: hydra.output.getCurrent(),
      resolution: hydra.synth.resolution,
    });

    hydra.timeSinceLastUpdate = 0;
  }
}

export interface HydraEnv {
  hydra: Hydra;
  hush: () => void;
  setResolution: (width: number, height: number) => void;
  render: (output?: Output) => void;
  tick: (dt: number) => void;
}

export function createHydraEnv(options: HydraRendererOptions): HydraEnv {
  const hydra = createHydra(options);

  return {
    hydra,
    hush: () => hush.apply(undefined, [hydra]),
    render: (output?: Output) => render.apply(undefined, [hydra, output]),
    setResolution: (width: number, height: number) =>
      setResolution.apply(undefined, [hydra, width, height]),
    tick: (dt: number) => tick.apply(undefined, [hydra, dt]),
  };
}
