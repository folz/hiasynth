import { utilityFunctions } from '../glsl/utilityFunctions';
import { TransformApplication } from '../glsl/TransformChain';
import REGL from 'regl';
import { generateGlsl, FormattedArgument } from './generateGlsl';
import { Synth } from '../Hydra';

export type CompiledTransform = {
  frag: string;
  uniforms: {
    [name: string]:
      | string
      | REGL.Uniform
      | ((context: any, props: any) => number | number[])
      | REGL.Texture2D
      | REGL.DynamicVariable<any>
      | REGL.DynamicVariableFn<any, any, any>
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
    .map((formattedArgument) => {
      return `
      uniform ${formattedArgument.type} ${formattedArgument.name};`;
    })
    .join('')}
  uniform float time;
  uniform vec2 resolution;
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
    uniforms: {
      ...synth.environment.defaultUniforms,
      ...formattedArgumentsMap,
    },
  };
}
