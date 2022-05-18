import { createHydra } from './Hydra';
import type { Hydra, HydraRendererOptions } from './Hydra';
import { Output } from '../Output';

export function hush(hydra: Hydra): void {
  hydra.outputs.forEach((output) => {
    output.hush();
  });
}

export function render(hydra: Hydra, output?: Output): void {
  hydra.output = output ?? hydra.outputs[0];
}

export function setResolution(
  hydra: Hydra,
  width: number,
  height: number,
): void {
  hydra.synth.resolution[0] = width;
  hydra.synth.resolution[1] = height;

  hydra.outputs.forEach((output) => {
    output.resize(hydra.synth);
  });
}

export function tick(hydra: Hydra, dt: number): void {
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
      oTex: hydra.output.getCurrent(),
      resolution: hydra.synth.resolution,
      time: hydra.synth.time,
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
    hush: () => hush(hydra),
    render: (output?: Output) => render(hydra, output),
    setResolution: (width: number, height: number) =>
      setResolution(hydra, width, height),
    tick: (dt: number) => tick(hydra, dt),
  };
}
