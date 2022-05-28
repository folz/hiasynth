import type { Environment } from './createEnvironment';
import { Output } from '../Output';

export function hush(environment: Environment): void {
  environment.outputs.forEach((output) => {
    output.hush();
  });
}

export function render(environment: Environment, output?: Output): void {
  environment.output = output ?? environment.outputs[0];
}

export function setResolution(
  environment: Environment,
  width: number,
  height: number,
): void {
  environment.synth.resolution[0] = width;
  environment.synth.resolution[1] = height;

  environment.outputs.forEach((output) => {
    output.resize(environment.synth);
  });
}

export function tick(environment: Environment, dt: number): void {
  environment.synth.time += dt * 0.001 * environment.synth.speed;

  environment.timeSinceLastUpdate += dt;

  if (
    !environment.synth.fps ||
    environment.timeSinceLastUpdate >= 1000 / environment.synth.fps
  ) {
    environment.synth.stats.fps = Math.ceil(
      1000 / environment.timeSinceLastUpdate,
    );

    environment.sources.forEach((source) => {
      source.draw(environment.synth);
    });

    environment.outputs.forEach((output) => {
      output.draw(environment.synth);
    });

    environment.renderFbo({
      oTex: environment.output.getCurrent(),
      resolution: environment.synth.resolution,
      time: environment.synth.time,
    });

    environment.timeSinceLastUpdate = 0;
  }
}

export function createActions(environment: Environment) {
  return {
    hush: () => hush(environment),
    render: (output?: Output) => render(environment, output),
    setResolution: (width: number, height: number) =>
      setResolution(environment, width, height),
    tick: (dt: number) => tick(environment, dt),
  };
}
