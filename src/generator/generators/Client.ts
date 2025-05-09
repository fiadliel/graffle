import { identifiers } from '../helpers/identifiers.js'
import { createModuleGenerator, importModuleGenerator } from '../helpers/moduleGenerator.js'
import { ModuleGeneratorData } from './Data.js'
import { ModuleGeneratorScalar } from './Scalar.js'
import { ModuleGeneratorSchemaDrivenDataMap } from './SchemaDrivenDataMap.js'

export const ModuleGeneratorClient = createModuleGenerator(
  `client`,
  ({ config, code }) => {
    code(importModuleGenerator(config, ModuleGeneratorSchemaDrivenDataMap))
    code(importModuleGenerator(config, ModuleGeneratorData))
    code(importModuleGenerator(config, ModuleGeneratorScalar))
    code(
      `import * as ${identifiers.$$Utilities} from '${config.paths.imports.grafflePackage.utilitiesForGenerated}'`,
      `import { TransportHttp } from '${config.paths.imports.grafflePackage.extensionTransportHttp}'`,
      `import { DocumentBuilder } from '${config.paths.imports.grafflePackage.extensionDocumentBuilder}'`,
    )
    code()
    code(`
      const context = ${identifiers.$$Utilities}.pipe(
        ${identifiers.$$Utilities}.contextEmpty,
        ctx => ${identifiers.$$Utilities}.Extensions.addAndApplyMany(ctx, [TransportHttp, DocumentBuilder]),
        ctx => ${identifiers.$$Utilities}.Transports.configureCurrentOrThrow(ctx, { url: $$Data.defaultSchemaUrl }),
        ctx => ${identifiers.$$Utilities}.Configuration.add(ctx, {
           schema: {
             name: $$Data.Name,
             map: $$SchemaDrivenDataMap.schemaDrivenDataMap,
           },
         }),
        ctx => ${identifiers.$$Utilities}.Scalars.set(ctx, { scalars: $$Scalar.$registry }),
      )

      export const create = ${identifiers.$$Utilities}.createConstructorWithContext(context)
    `)
  },
)
