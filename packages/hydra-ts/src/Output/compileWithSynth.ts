import { TransformApplication } from '../glsl/TransformChain';
import { Synth } from '../Hydra';
import { utilityFunctions } from '../glsl/utilityFunctions';
import REGL from 'regl';
import { FormattedArgument, generateGlsl } from './generateGlsl';

export type CompiledTransform = {
  frag: string;
  uniforms: {
    // TODO This is the same type as generateGlsl's f1 L#24-30
    [name: string]:
      | string
      | REGL.Uniform
      | ((_context: unknown, props: Synth) => number | number[])
      | REGL.Texture2D
      | REGL.DynamicVariable<unknown>
      | REGL.DynamicVariableFn<unknown>
      | undefined;
  };
  vert: string;
};

export function compileWithSynth(
  transformApplications: TransformApplication[],
  synth: Synth,
): CompiledTransform {
  const formattedArgumentsRef: FormattedArgument[] = [];
  const transformApplicationsRef: TransformApplication[] = [];

  // Note: generateGlsl() mutates formattedArgumentsRef and transformApplicationsRef
  const fragColor = generateGlsl(
    transformApplications,
    formattedArgumentsRef,
    transformApplicationsRef,
  )('st');

  const formattedArgumentsMap: Record<
    FormattedArgument['name'],
    FormattedArgument['value']
  > = {};
  formattedArgumentsRef.forEach((formattedArgument) => {
    formattedArgumentsMap[formattedArgument.name] = formattedArgument.value;
  });

  return {
    frag: `
  precision ${synth.precision} float;
  
  #define PI 3.1415926538

  ${formattedArgumentsRef
    .map(
      (formattedArgument) =>
        `
  uniform ${formattedArgument.type} ${formattedArgument.name};`,
    )
    .join('')}

  uniform sampler2D oTex;
  uniform vec2 resolution;
  uniform float time;
  varying vec2 uv;

  ${Object.values(utilityFunctions)
    .map((transform) => {
      return `
            ${transform.glsl}
          `;
    })
    .join('')}

  ${transformApplicationsRef
    .map((transformApplication) => {
      return `
            ${transformApplication.transform.glsl}
          `;
    })
    .join('')}

  void main () {
    vec4 c = vec4(1, 0, 0, 1);
    vec2 st = gl_FragCoord.xy/resolution.xy;
    gl_FragColor = ${fragColor};
  }
  `,
    vert: `
  precision ${synth.precision} float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,
    uniforms: formattedArgumentsMap,
  };
}
