import type { Grafaid } from '../../../lib/grafaid/_namespace.js'
import type { __typename } from './__typename.js'
import type { OutputField, OutputFields } from './OutputField.js'

export interface OutputObject<
  $Name extends string = string,
  $Fields extends OutputFields = OutputFields,
> {
  kind: Grafaid.Schema.TypeKind.Object
  name: $Name
  fields: {
    __typename: OutputField<'__typename', {}, [1], __typename<$Name>>
  } & $Fields
}
