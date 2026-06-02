// Framework-agnostic engine for explorable explanations.
export * from './schema/types'
export * from './schema/factory'
export {
  parseDoc,
  serializeDoc,
  cloneDoc,
  SchemaError,
} from './schema/serialize'
export { encodeDocToUrl, decodeDocFromUrl } from './schema/url'
export { computeScope, type ScopeResult } from './reactive/scope'
export { interpolate, formatValue } from './interpolate'
export {
  compile,
  evaluate,
  references,
  ExpressionError,
  BUILTIN_FUNCTIONS,
  BUILTIN_CONSTANTS,
  type Value as ExprValue,
  type CompiledExpression,
} from './expression'
