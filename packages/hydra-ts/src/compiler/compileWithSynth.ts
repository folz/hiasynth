import { utilityFunctions } from '../glsl/utilityFunctions';
import { TransformApplication } from '../glsl/Glsl';
import { DynamicVariable, DynamicVariableFn, Texture2D, Uniform } from 'regl';
import { generateGlsl, TypedArg } from './generateGlsl';
import { Synth } from '../Hydra';

export type CompiledTransform = {
  frag: string;
  uniforms: {
    [name: string]:
      | string
      | Uniform
      | ((context: any, props: any) => number | number[])
      | Texture2D
      | DynamicVariable<any>
      | DynamicVariableFn<any, any, any>
      | undefined;
  };
};

export function compileWithSynth(
  transformApplications: TransformApplication[],
  synth: Synth,
): CompiledTransform {
  const transformApplicationsRef: TransformApplication[] = [];
  const typedArgsRef: TypedArg[] = [];

  // Note: generateGlsl() mutates typedArgsRef and transformApplicationsRef
  const fragColor = generateGlsl(
    transformApplications,
    typedArgsRef,
    transformApplicationsRef,
  )('st');

  const uniformMap: Record<TypedArg['name'], TypedArg['value']> = {};
  typedArgsRef.forEach((uniform) => {
    uniformMap[uniform.name] = uniform.value;
  });

  const frag = `
  precision ${synth.precision} float;
  
  #define PI 3.1415926538

  ${typedArgsRef
    .map((uniform) => {
      return `
      uniform ${uniform.type} ${uniform.name};`;
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
  `;

  return {
    frag: frag,
    uniforms: { ...synth.environment.defaultUniforms, ...uniformMap },
  };
}
