import { TransformApplication, TransformChain } from '../glsl/TransformChain';
import { Synth } from '../Hydra';
import REGL from 'regl';
import { TransformDefinitionInput } from '../glsl/transformDefinitions';
import arrayUtils from '../lib/array-utils';
import { Source } from '../Source';
import { src } from '../glsl';
import { Output } from './Output';

export type GlslGenerator = (uv: string) => string;

export function generateGlsl(
  transformApplications: TransformApplication[],
  formattedArgumentsRef: FormattedArgument[],
  transformApplicationsRef: TransformApplication[],
): GlslGenerator {
  let generateFragColor: GlslGenerator = () => '';

  transformApplications.forEach((transformApplication) => {
    // TODO This is the same type as compileWithSynth's f1 L#11-18
    let f1: (
      uv: string,
    ) =>
      | string
      | string[]
      | number
      | number[]
      | ((_context: unknown, props: Synth) => number | number[])
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
      const { isUniform, name, value } = formattedArguments[0];
      f1 =
        value instanceof TransformChain
          ? (uv: string) =>
              `${generateGlsl(
                value.transforms,
                formattedArgumentsRef,
                transformApplicationsRef,
              )(uv)}`
          : isUniform
          ? () => name
          : () => value;
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
      const { isUniform, name, value } = formattedArguments[0];
      f1 =
        value instanceof TransformChain
          ? (uv: string) =>
              `${generateGlsl(
                value.transforms,
                formattedArgumentsRef,
                transformApplicationsRef,
              )(uv)}`
          : isUniform
          ? () => name
          : () => value;
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
      const { isUniform, name, value } = formattedArgument;

      if (isUniform) {
        return name;
      }

      if (value instanceof TransformChain) {
        // this by definition needs to be a generator, hence we start with 'st' as the initial value for generating the glsl fragment
        return `${generateGlsl(
          value.transforms,
          formattedArgumentsRef,
          transformApplicationsRef,
        )('st')}`;
      }

      return value;
    })
    .reduce((acc, referent) => `${acc}, ${referent}`, '');

  return `${transformApplication.transform.name}(${uv}${str})`;
}

export type FormattedValue =
  | undefined
  | string
  | string[]
  | number
  | number[]
  | ((
      _context: unknown,
      props: Synth,
    ) =>
      | number
      | number[]
      | REGL.Framebuffer2D
      | REGL.Texture2D
      | string
      | string[]
      | (string | number)[])
  | TransformChain;

export interface FormattedArgument {
  value: FormattedValue;
  type: TransformDefinitionInput['type'];
  isUniform: boolean;
  name: TransformDefinitionInput['name'];
}

export function formatArguments(
  transformApplication: TransformApplication,
  startIndex: number,
): FormattedArgument[] {
  const { transform, userArgs } = transformApplication;
  const { inputs } = transform;

  return inputs.map((input, index) => {
    let value: FormattedValue;
    let isUniform: boolean;

    // if user has input something for this argument
    if (userArgs.length > index) {
      const userArg = userArgs[index];

      if (typeof userArg === 'function') {
        if (input.type === 'vec4') {
          value = (_context: unknown, props: Synth) => {
            let evaluated;

            try {
              evaluated = userArg(props);
            } catch (e) {
              console.error('ERR:', e);
              evaluated = [1, 1, 1];
            }

            return fillArrayWithDefaults(evaluated, input.vecLen);
          };
          isUniform = true;
        } else if (input.type === 'float') {
          value = (_context: unknown, props: Synth) => {
            let evaluated;

            try {
              evaluated = userArg(props);
            } catch (e) {
              console.error('ERR:', e);
              evaluated = input.default;
            }

            if (Array.isArray(evaluated)) {
              return arrayUtils.getValue(evaluated)(props);
            } else {
              return evaluated;
            }
          };
          isUniform = true;
        } else {
          // 'sampler2D'
          value = (_context: unknown, props: Synth) => {
            let evaluated;

            try {
              evaluated = userArg(props);
            } catch (e) {
              console.error('ERR:', e);
              evaluated = undefined;
            }

            return evaluated;
          };
          isUniform = true;
        }
      } else if (userArg instanceof TransformChain) {
        value = userArg;
        isUniform = false;
      } else if (input.type === 'float' && typeof userArg === 'number') {
        // Number

        value = ensureDecimalDot(userArg);
        isUniform = false;
      } else if (input.type === 'float' && Array.isArray(userArg)) {
        value = (_context: unknown, props: Synth) =>
          arrayUtils.getValue(userArg)(props);
        isUniform = true;
      } else if (input.type === 'vec4' && Array.isArray(userArg)) {
        // Vector literal (as array)
        value = `${input.type}(${fillArrayWithDefaults(userArg, input.vecLen)
          .map(ensureDecimalDot)
          .join(', ')})`;
        isUniform = false;
      } else if (
        input.type === 'sampler2D' &&
        (userArg instanceof Source || userArg instanceof Output)
      ) {
        value = () => userArg.getTexture();
        isUniform = true;
      } else if (userArg instanceof Source || userArg instanceof Output) {
        value = src(userArg);
        isUniform = false;
      } else {
        // Could not convert

        value = undefined;
        isUniform = false;
      }
    } else {
      switch (input.type) {
        case 'vec4': {
          console.error(
            `ERR: ${input.type} ${input.name} did not receive an argument`,
          );
          value = `${input.type}(${fillArrayWithDefaults(
            [1, 1, 1],
            input.vecLen,
          )
            .map(ensureDecimalDot)
            .join(', ')})`;
          isUniform = false;
          break;
        }
        case 'float': {
          value = ensureDecimalDot(input.default);
          isUniform = false;
          break;
        }
        case 'sampler2D': {
          console.error(
            `ERR: ${input.type} ${input.name} did not receive an argument`,
          );
          value = undefined;
          isUniform = false;
          break;
        }
      }
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

export function fillArrayWithDefaults<T>(arr: (T | number)[], len: number) {
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
