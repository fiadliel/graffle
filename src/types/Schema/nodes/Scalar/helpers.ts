import { type AnyAndUnknownToNever, type EmptyObject, emptyObject } from '../../../../lib/prelude.js'
import { String } from '../../StandardTypes/scalar.js'
import type { Mapper } from './codec.js'
import type { Scalar } from './Scalar.js'

// dprint-ignore
export type GetEncoded<$Scalar extends Scalar> =
  $Scalar extends Scalar<infer _, infer __, infer $Encoded>
    ? $Encoded
    : never

// dprint-ignore
export type GetDecoded<$Scalar extends Scalar> =
  $Scalar extends Scalar<infer _, infer $Decoded, infer __>
    ? $Decoded
    : never

export interface Registry<
  $Map extends ScalarMap = ScalarMap,
  $TypesEncoded = any,
  $TypesDecoded = any,
> {
  map: $Map
  typesEncoded: $TypesEncoded
  typesDecoded: $TypesDecoded
}

export interface RegistryEmpty {
  map: EmptyObject
  // Superficially "never" sounds right
  // But then it cannot be a sub-type of the generic Registry
  // TODO: could we use `unknown` instead?
  typesEncoded: any
  typesDecoded: any
}

export namespace Registry {
  export type Empty = RegistryEmpty

  export const empty = {
    map: emptyObject,
  } as RegistryEmpty

  export type AddScalar<$Registry extends Registry, $Scalar extends Scalar> = {
    map: $Registry['map'] & { [_ in $Scalar['name']]: $Scalar }
    typesEncoded: AnyAndUnknownToNever<$Registry['typesEncoded']> | GetEncoded<$Scalar>
    typesDecoded: AnyAndUnknownToNever<$Registry['typesDecoded']> | GetDecoded<$Scalar>
  }
}

export type ScalarMap = Record<string, Scalar>

// dprint-ignore
export type LookupCustomScalarOrFallbackToString<$Name extends string, $Scalars extends Registry> =
  $Name extends keyof $Scalars['map'] ? $Scalars['map'][$Name] : String

export const lookupCustomScalarOrFallbackToString = (scalars: ScalarMap, name: string): Scalar => {
  const scalar = scalars[name]
  if (scalar) return scalar
  return String
}

/**
 * Apply a codec's mapper function (decode or encode) to a GraphQL value.
 *
 * If value is an array then its members are traversed recursively.
 *
 * Null values are returned as is.
 */
export const applyCodec = <$Mapper extends Mapper>(
  mapper: $Mapper,
  value: any,
): null | ReturnType<$Mapper> | ReturnType<$Mapper>[] => {
  if (value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(item => applyCodec(mapper, item)) as ReturnType<$Mapper>
  }

  return mapper(value) as ReturnType<$Mapper>
}

export const isScalar = (value: unknown): value is Scalar =>
  typeof value === `object` && value !== null && `codec` in value && typeof value.codec === `object`
