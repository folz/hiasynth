import REGL from 'regl';
import { TransformChain, TransformApplication } from '../glsl/TransformChain';
import arrayUtils from '../lib/array-utils';
import { Source } from '../Source';
import { Output } from '../Output';
import { src } from '../glsl';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';

export type GlslGenerator = (uv: string) => string;

export function generateGlsl(
  transformApplications: TransformApplication[],
  formattedArgumentsRef: FormattedArgument[],
  transformApplicationsRef: TransformApplication[],
): GlslGenerator {
  let generateFragColor: GlslGenerator = () => '';

  transformApplications.forEach((transformApplication) => {
    let f1: (
      uv: string,
    ) =>
      | string
      | number
      | number[]
      | ((context: any, props: any) => number | number[])
      | REGL.Texture2D
      | undefined;

    const formattedArguments = formatArguments(
      transformApplication,
      formattedArgumentsRef.length,
    );

    formattedArguments.forEach((formattedArgument) => {
      if (formattedArgument.isUniform) {
        formattedArgumentsRef.push(formattedArgument);
      }
    });

    // add new glsl function to running list of functions
    const isNewTransform = transformApplicationsRef.every(
      (paramTransformApplication) =>
        transformApplication.transform.name !==
        paramTransformApplication.transform.name,
    );

    if (isNewTransform) {
      transformApplicationsRef.push(transformApplication);
    }

    // current function for generating frag color shader code
    const f0 = generateFragColor;
    if (transformApplication.transform.type === 'src') {
      generateFragColor = (uv) =>
        `${shaderString(
          uv,
          transformApplication,
          formattedArguments,
          formattedArgumentsRef,
          transformApplicationsRef,
        )}`;
    } else if (transformApplication.transform.type === 'coord') {
      generateFragColor = (uv) =>
        `${f0(
          `${shaderString(
            uv,
            transformApplication,
            formattedArguments,
            formattedArgumentsRef,
            transformApplicationsRef,
          )}`,
        )}`;
    } else if (transformApplication.transform.type === 'color') {
      generateFragColor = (uv) =>
        `${shaderString(
          `${f0(uv)}`,
          transformApplication,
          formattedArguments,
          formattedArgumentsRef,
          transformApplicationsRef,
        )}`;
    } else if (transformApplication.transform.type === 'combine') {
      // combining two generated shader strings (i.e. for blend, mult, add funtions)
      f1 =
        formattedArguments[0].value && formattedArguments[0].value.transforms
          ? (uv: string) =>
              `${generateGlsl(
                formattedArguments[0].value.transforms,
                formattedArgumentsRef,
                transformApplicationsRef,
              )(uv)}`
          : formattedArguments[0].isUniform
          ? () => formattedArguments[0].name
          : () => formattedArguments[0].value;
      generateFragColor = (uv) =>
        `${shaderString(
          `${f0(uv)}, ${f1(uv)}`,
          transformApplication,
          formattedArguments.slice(1),
          formattedArgumentsRef,
          transformApplicationsRef,
        )}`;
    } else if (transformApplication.transform.type === 'combineCoord') {
      // combining two generated shader strings (i.e. for modulate functions)
      f1 =
        formattedArguments[0].value && formattedArguments[0].value.transforms
          ? (uv: string) =>
              `${generateGlsl(
                formattedArguments[0].value.transforms,
                formattedArgumentsRef,
                transformApplicationsRef,
              )(uv)}`
          : formattedArguments[0].isUniform
          ? () => formattedArguments[0].name
          : () => formattedArguments[0].value;
      generateFragColor = (uv) =>
        `${f0(
          `${shaderString(
            `${uv}, ${f1(uv)}`,
            transformApplication,
            formattedArguments.slice(1),
            formattedArgumentsRef,
            transformApplicationsRef,
          )}`,
        )}`;
    }
  });
  return generateFragColor;
}

function shaderString(
  uv: string,
  transformApplication: TransformApplication,
  formattedArguments: FormattedArgument[],
  formattedArgumentsRef: FormattedArgument[],
  transformApplicationsRef: TransformApplication[],
): string {
  const str = formattedArguments
    .map((formattedArgument) => {
      if (formattedArgument.isUniform) {
        return formattedArgument.name;
      } else if (
        formattedArgument.value &&
        formattedArgument.value.transforms
      ) {
        // this by definition needs to be a generator, hence we start with 'st' as the initial value for generating the glsl fragment
        return `${generateGlsl(
          formattedArgument.value.transforms,
          formattedArgumentsRef,
          transformApplicationsRef,
        )('st')}`;
      }
      return formattedArgument.value;
    })
    .reduce((p, c) => `${p}, ${c}`, '');

  return `${transformApplication.transform.name}(${uv}${str})`;
}

export interface FormattedArgument {
  value: TransformDefinitionInput['default'];
  type: TransformDefinitionInput['type'];
  isUniform: boolean;
  name: TransformDefinitionInput['name'];
  vecLen: number;
}

export function formatArguments(
  transformApplication: TransformApplication,
  startIndex: number,
): FormattedArgument[] {
  const { transform, userArgs } = transformApplication;
  const { inputs } = transform;

  return inputs.map((input, index) => {
    let value: any = input.default;
    let isUniform = false;

    if (input.type === 'float') {
      value = ensureDecimalDot(value);
    }

    // if user has input something for this argument
    if (userArgs.length > index) {
      const userArg = userArgs[index];

      value = userArg;

      if (typeof userArg === 'function') {
        if (input.type === 'vec4') {
          value = (context: any, props: any) =>
            fillArrayWithDefaults(userArg(props), input.vecLen);
        } else {
          value = (context: any, props: any) => {
            try {
              return userArg(props);
            } catch (e) {
              console.log('ERROR', e);
              return input.default;
            }
          };
        }

        isUniform = true;
      } else if (Array.isArray(userArg)) {
        if (input.type === 'vec4') {
          isUniform = true;
          value = fillArrayWithDefaults(value, input.vecLen);
        } else {
          value = (context: any, props: any) =>
            arrayUtils.getValue(userArg)(props);
          isUniform = true;
        }
      }
    }

    if (value instanceof TransformChain) {
      // osc()

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
