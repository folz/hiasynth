import {
  createGenerators,
  createTransformChainClass,
} from './createGenerators';
import {
  generatorTransforms,
  modifierTransforms,
} from './transformDefinitions';

const TransformChainClass = createTransformChainClass(modifierTransforms);
const generators = createGenerators(generatorTransforms, TransformChainClass);

export const { gradient, noise, osc, shape, solid, sq, src, tri, voronoi } =
  generators;
