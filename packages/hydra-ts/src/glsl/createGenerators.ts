import {
  ProcessedTransformDefinition,
  TransformDefinition,
  TransformDefinitionType,
} from './transformDefinitions.js';
import { Glsl } from './Glsl';

type Generator = (...args: unknown[]) => Glsl;

export function createTransformChainClass<
  T extends readonly TransformDefinition[],
>(transformDefinitions: T): typeof Glsl {
  const sourceClass = class extends Glsl {};

  transformDefinitions
    .map(processGlsl)
    .forEach((processedTransformDefinition) => {
      function addTransformApplicationToInternalChain(
        this: Glsl,
        ...args: unknown[]
      ): Glsl {
        const transform = {
          transform: processedTransformDefinition,
          userArgs: args,
        };

        return new sourceClass([...this.transforms, transform]);
      }

      // @ts-ignore
      sourceClass.prototype[processedTransformDefinition.name] =
        addTransformApplicationToInternalChain;
    });

  return sourceClass;
}

export function createGenerators(
  generatorTransforms: readonly TransformDefinition[],
  sourceClass: typeof Glsl,
): Record<string, Generator> {
  const generatorMap: Record<string, Generator> = {};

  generatorTransforms
    .map(processGlsl)
    .forEach((processedTransformDefinition) => {
      generatorMap[processedTransformDefinition.name] = (...args: unknown[]) =>
        new sourceClass([
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
  const { implicitFirstArg, returnType } = typeLookup[transformDefinition.type];

  const signature = [
    implicitFirstArg,
    ...transformDefinition.inputs.map((input) => `${input.type} ${input.name}`),
  ].join(', ');

  const glslFunction = `
  ${returnType} ${transformDefinition.name}(${signature}) {
      ${transformDefinition.glsl}
  }
`;

  return {
    ...transformDefinition,
    glsl: glslFunction,
    processed: true,
  };
}
