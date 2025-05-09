import { schema } from '../../../../../tests/_/fixtures/schemas/possible/schema.js'
import { Generator } from '../../../../entrypoints/generator.js'
import { SchemaErrors } from '../../gentime.js'

export default Generator
  .configure({
    name: `graffleSchemaErrors`,
    nameNamespace: true,
    schema: {
      type: `instance`,
      instance: schema,
    },
    lint: {
      missingCustomScalarCodec: false,
    },
    libraryPaths: {
      client: `../../../../entrypoints/client.ts`,
      schema: `../../../../entrypoints/schema.ts`,
      scalars: `../../../../types/Schema/StandardTypes/scalar.ts`,
      utilitiesForGenerated: `../../../../entrypoints/utilities-for-generated.ts`,
      extensionTransportHttp: `../../../../entrypoints/extensions/transport-http/runtime.ts`,
      extensionDocumentBuilder: `../../../../entrypoints/extensions/document-builder/runtime.ts`,
    },
    advanced: {
      schemaInterfaceExtendsEnabled: true,
    },
  })
  .use(SchemaErrors())
