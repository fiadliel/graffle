import type { Grafaid } from '../../../../lib/grafaid/_namespace.js'
import { Nodes } from '../../../../lib/grafaid/_Nodes.js'
import { Schema } from '../../../../types/Schema/_namespace.js'
import { SchemaDrivenDataMap } from '../../../../types/SchemaDrivenDataMap/_namespace.js'
import type { OperationContext } from '../context.js'
import { type GraphQLPostOperationMapper } from '../mapper.js'

export const toGraphQLValue: ValueMapper = (context, sddm, value) => {
  // todo remove? unused.
  // const hookResult = context.hooks?.value?.(context, index, value)
  // if (hookResult) return hookResult

  if (SchemaDrivenDataMap.isScalarLike(sddm?.nt)) {
    const scalar = SchemaDrivenDataMap.isScalar(sddm.nt)
      ? sddm.nt
      : Schema.Scalar.lookupCustomScalarOrFallbackToString(context.scalars, sddm.nt)
    return applyScalar(context, scalar, value)
  }

  if (SchemaDrivenDataMap.isEnum(sddm?.nt)) {
    return Nodes.EnumValue({ value: String(value) })
  }

  if (value === null) {
    return Nodes.NullValue()
  }

  if (Array.isArray(value)) {
    return Nodes.ListValue({
      values: value.map(oneValue =>
        toGraphQLValue(
          context,
          sddm,
          oneValue,
        )
      ),
    })
  }

  if (typeof value === `object`) {
    const sddmInputObject = sddm?.nt
    return Nodes.ObjectValue({
      fields: Object.entries(value).map(([fieldName, fieldValue]) => {
        return Nodes.ObjectField({
          name: Nodes.Name({ value: fieldName }),
          value: toGraphQLValue(context, sddmInputObject?.f?.[fieldName], fieldValue),
        })
      }),
    })
  }

  if (typeof value === `string`) {
    if (context.value.isEnum) {
      return Nodes.EnumValue({ value: String(value) })
    }
    return Nodes.StringValue({ value })
  }

  if (typeof value === `boolean`) {
    return Nodes.BooleanValue({ value })
  }

  if (typeof value === `number`) {
    return Nodes.FloatValue({ value: String(value) })
  }

  throw new Error(`Unsupported value: ${String(value)}`)
}

export type ValueMapper = GraphQLPostOperationMapper<
  SchemaDrivenDataMap.ArgumentOrInputField,
  Grafaid.Document.ValueNode,
  [value: unknown],
  AdditionalContext
>

interface AdditionalContext {
  value: {
    isEnum: boolean
  }
}

const applyScalar = (
  context: OperationContext & AdditionalContext,
  scalar: Schema.Scalar,
  value: unknown,
): Grafaid.Document.ValueNode => {
  if (value === null) return Nodes.NullValue()

  if (Array.isArray(value)) {
    return Nodes.ListValue({
      values: value.map(oneValue => applyScalar(context, scalar, oneValue)),
    })
  }

  const valueEncoded = scalar.codec.encode(value)

  return toGraphQLValue(context, undefined, valueEncoded)
}
