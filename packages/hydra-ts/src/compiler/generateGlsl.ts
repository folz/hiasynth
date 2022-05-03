import { Texture2D } from 'regl';
import { Glsl, TransformApplication } from '../glsl/Glsl';
import { ShaderParams } from './compileWithSynth';
import arrayUtils from '../lib/array-utils';
import { Source } from '../Source';
import { Output } from '../Output';
import { src } from '../glsl';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';

export type GlslGenerator = (uv: string) => string;

export interface TypedArg {
  value: TransformDefinitionInput['default'];
  type: TransformDefinitionInput['type'];
  isUniform: boolean;
  name: TransformDefinitionInput['name'];
  vecLen: number;
}

export function generateGlsl(
  transformApplications: TransformApplication[],
  shaderParams: ShaderParams,
): GlslGenerator {
  let fragColor: GlslGenerator = () => '';

  transformApplications.forEach((transformApplication) => {
    let f1: (
      uv: string,
    ) =>
      | string
      | number
      | number[]
      | ((context: any, props: any) => number | number[])
      | Texture2D
      | undefined;

    const typedArgs = formatArguments(
      transformApplication,
      shaderParams.uniforms.length,
    );

    typedArgs.forEach((typedArg) => {
      if (typedArg.isUniform) {
        shaderParams.uniforms.push(typedArg);
      }
    });

    // add new glsl function to running list of functions
    if (!contains(transformApplication, shaderParams.transformApplications)) {
      shaderParams.transformApplications.push(transformApplication);
    }

    // current function for generating frag color shader code
    const f0 = fragColor;
    if (transformApplication.transform.type === 'src') {
      fragColor = (uv) =>
        `${shaderString(uv, transformApplication, typedArgs, shaderParams)}`;
    } else if (transformApplication.transform.type === 'coord') {
      fragColor = (uv) =>
        `${f0(
          `${shaderString(uv, transformApplication, typedArgs, shaderParams)}`,
        )}`;
    } else if (transformApplication.transform.type === 'color') {
      fragColor = (uv) =>
        `${shaderString(
          `${f0(uv)}`,
          transformApplication,
          typedArgs,
          shaderParams,
        )}`;
    } else if (transformApplication.transform.type === 'combine') {
      // combining two generated shader strings (i.e. for blend, mult, add funtions)
      f1 =
        // @ts-ignore
        typedArgs[0].value && typedArgs[0].value.transforms
          ? (uv: string) =>
              // @ts-ignore
              `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
          : typedArgs[0].isUniform
          ? () => typedArgs[0].name
          : () => typedArgs[0].value;
      fragColor = (uv) =>
        `${shaderString(
          `${f0(uv)}, ${f1(uv)}`,
          transformApplication,
          typedArgs.slice(1),
          shaderParams,
        )}`;
    } else if (transformApplication.transform.type === 'combineCoord') {
      // combining two generated shader strings (i.e. for modulate functions)
      f1 =
        // @ts-ignore
        typedArgs[0].value && typedArgs[0].value.transforms
          ? (uv: string) =>
              // @ts-ignore
              `${generateGlsl(typedArgs[0].value.transforms, shaderParams)(uv)}`
          : typedArgs[0].isUniform
          ? () => typedArgs[0].name
          : () => typedArgs[0].value;
      fragColor = (uv) =>
        `${f0(
          `${shaderString(
            `${uv}, ${f1(uv)}`,
            transformApplication,
            typedArgs.slice(1),
            shaderParams,
          )}`,
        )}`;
    }
  });
  return fragColor;
}

function shaderString(
  uv: string,
  transformApplication: TransformApplication,
  inputs: TypedArg[],
  shaderParams: ShaderParams,
): string {
  const str = inputs
    .map((input) => {
      if (input.isUniform) {
        return input.name;
        // @ts-ignore
      } else if (input.value && input.value.transforms) {
        // this by definition needs to be a generator, hence we start with 'st' as the initial value for generating the glsl fragment
        // @ts-ignore
        return `${generateGlsl(input.value.transforms, shaderParams)('st')}`;
      }
      return input.value;
    })
    .reduce((p, c) => `${p}, ${c}`, '');

  return `${transformApplication.transform.name}(${uv}${str})`;
}

function contains(
  transformApplication: TransformApplication,
  transformApplications: TransformApplication[],
): boolean {
  for (let i = 0; i < transformApplications.length; i++) {
    if (
      transformApplication.transform.name ==
      transformApplications[i].transform.name
    ) {
      return true;
    }
  }
  return false;
}

export function formatArguments(
  transformApplication: TransformApplication,
  startIndex: number,
): TypedArg[] {
  const { transform, userArgs } = transformApplication;
  const { inputs } = transform;

  return inputs.map((input, index) => {
    const vecLen = input.vecLen ?? 0;

    let value: any = input.default;
    let isUniform = false;

    if (input.type === 'float') {
      value = ensureDecimalDot(value);
    }

    // if user has input something for this argument
    if (userArgs.length > index) {
      const arg = userArgs[index];

      value = arg;
      // do something if a composite or transformApplication

      if (typeof arg === 'function') {
        if (vecLen > 0) {
          // expected input is a vector, not a scalar
          value = (context: any, props: any) =>
            fillArrayWithDefaults(arg(props), vecLen);
        } else {
          value = (context: any, props: any) => {
            try {
              return arg(props);
            } catch (e) {
              console.log('ERROR', e);
              return input.default;
            }
          };
        }

        isUniform = true;
      } else if (Array.isArray(arg)) {
        if (vecLen > 0) {
          // expected input is a vector, not a scalar
          isUniform = true;
          value = fillArrayWithDefaults(value, vecLen);
        } else {
          // is Array
          value = (context: any, props: any) => arrayUtils.getValue(arg)(props);
          isUniform = true;
        }
      }
    }

    if (value instanceof Glsl) {
      // GLSLSource

      isUniform = false;
    } else if (input.type === 'float' && typeof value === 'number') {
      // Number

      value = ensureDecimalDot(value);
    } else if (input.type.startsWith('vec') && Array.isArray(value)) {
      // Vector literal (as array)

      isUniform = false;
      value = `${input.type}(${value.map(ensureDecimalDot).join(', ')})`;
    } else if (input.type === 'sampler2D') {
      const ref = value;

      value = () => ref.getTexture();
      isUniform = true;
    } else if (value instanceof Source || value instanceof Output) {
      const ref = value;

      value = src(ref);
      isUniform = false;
    }

    // Add to uniform array if is a function that will pass in a different value on each render frame,
    // or a texture/ external source

    let { name } = input;
    if (isUniform) {
      name += startIndex;
    }

    return {
      value,
      type: input.type,
      isUniform,
      vecLen,
      name,
    };
  });
}

export function ensureDecimalDot(val: any): string {
  val = val.toString();
  if (val.indexOf('.') < 0) {
    val += '.';
  }
  return val;
}

export function fillArrayWithDefaults(arr: any[], len: number) {
  // fill the array with default values if it's too short
  while (arr.length < len) {
    if (arr.length === 3) {
      // push a 1 as the default for .a in vec4
      arr.push(1.0);
    } else {
      arr.push(0.0);
    }
  }
  return arr.slice(0, len);
}
