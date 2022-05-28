import {
  ProcessedTransformDefinition,
  TransformDefinition,
  TransformDefinitionType,
} from './transformDefinitions.js';
import { TransformChain } from './TransformChain';

export type TransformChainGenerator = (...args: unknown[]) => TransformChain;

export function createTransformChainClass<
  T extends readonly TransformDefinition[],
>(transformDefinitions: T): typeof TransformChain {
  const TransformChainClass = class extends TransformChain {};

  transformDefinitions
    .map(processGlsl)
    .forEach((processedTransformDefinition) => {
      function addTransformApplicationToInternalChain(
        this: TransformChain,
        ...args: unknown[]
      ): TransformChain {
        const transform = {
          transform: processedTransformDefinition,
          userArgs: args,
        };

        return new TransformChainClass([...this.transforms, transform]);
      }

      // @ts-ignore
      TransformChainClass.prototype[processedTransformDefinition.name] =
        addTransformApplicationToInternalChain;
    });

  return TransformChainClass;
}

export function createGenerators(
  generatorTransforms: readonly TransformDefinition[],
  TransformChainClass: typeof TransformChain,
): Record<string, TransformChainGenerator> {
  const generatorMap: Record<string, TransformChainGenerator> = {};

  generatorTransforms
    .map(processGlsl)
    .forEach((processedTransformDefinition) => {
      generatorMap[processedTransformDefinition.name] = (...args: unknown[]) =>
        new TransformChainClass([
          {
            transform: processedTransformDefinition,
            userArgs: args,
          },
        ]);
    });

  return generatorMap;
}

const typeLookup: Record<
  TransformDefinitionType,
  { returnType: string; implicitFirstArg: string }
> = {
  src: {
    returnType: 'vec4',
    implicitFirstArg: 'vec2 _st',
  },
  coord: {
    returnType: 'vec2',
    implicitFirstArg: 'vec2 _st',
  },
  color: {
    returnType: 'vec4',
    implicitFirstArg: 'vec4 _c0',
  },
  combine: {
    returnType: 'vec4',
    implicitFirstArg: 'vec4 _c0',
  },
  combineCoord: {
    returnType: 'vec2',
    implicitFirstArg: 'vec2 _st',
  },
};

export function processGlsl(
  transformDefinition: TransformDefinition,
): ProcessedTransformDefinition {
  const { inputs, name, glsl, type } = transformDefinition;
  const { implicitFirstArg, returnType } = typeLookup[type];

  const signature = [
    implicitFirstArg,
    ...inputs.map((input) => `${input.type} ${input.name}`),
  ].join(', ');

  const glslFunction = `
  ${returnType} ${name}(${signature}) {
      ${glsl}
  }
`;

  return {
    ...transformDefinition,
    glsl: glslFunction,
    processed: true,
  };
}
