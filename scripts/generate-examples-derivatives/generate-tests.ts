import * as FS from 'node:fs/promises'
import * as Path from 'node:path'
import { deleteFiles } from '../lib/deleteFiles.js'
import { getOutputFilePathFromExampleFilePath } from './generate-outputs.js'
import { directories, type Example } from './helpers.js'

// const encodedOutputExtension = `.output.test.txt`

export const generateTests = async (examples: Example[]) => {
  // Handle case of renaming or deleting examples.
  await Promise.all([
    // ...hm, Do not delete test output files because then that means having to re-run the tests to get the snaps back.
    // Manually cleaning them up is not so bad.
    // deleteFiles({ pattern: `${directories.outputs}/*/*${encodedOutputExtension}` }),
    deleteFiles({ pattern: `${directories.tests}/*.test.ts` }),
  ])

  await Promise.all(examples.map(async (example) => {
    const dir = Path.join(directories.tests, example.group.dirName)
    const outputFilePath = getOutputFilePathFromExampleFilePath(example.file.path.full).replace(
      `.txt`,
      example.output.encoder ? `.test.txt` : `.txt`,
    )
    const relativePathToSnapshot = Path.relative(dir, outputFilePath)
    const code = `// @vitest-environment node

// WARNING:
// This test is generated by scripts/generate-example-derivatives/generate.ts
// Do not modify this file directly.

import { runExample } from '../../../scripts/generate-examples-derivatives/helpers.js'
import { expect, test } from 'vitest'${
      example.output.encoder
        ? `\nimport { encode } from '${Path.relative(dir, example.output.encoder.filePath.replace(`.ts`, `.js`))}'`
        : ``
    }

test(\`${example.file.name}\`, async () => {
  const exampleResult = await runExample(\`${example.file.path.full.replace(`./examples/`, `./`)}\`)
  // Examples should output their data results.
  const exampleResultMaybeEncoded = ${example.output.encoder ? `encode(exampleResult)` : `exampleResult`} 
  // If ever outputs vary by Node version, you can use this to snapshot by Node version.
  // const nodeMajor = process.version.match(/v(\\d+)/)?.[1] ?? \`unknown\`
  await expect(exampleResultMaybeEncoded).toMatchFileSnapshot(\`${relativePathToSnapshot}\`)
})
`
    await FS.mkdir(dir, { recursive: true })
    const testFileName = `${example.file.name}.test.ts`
    const testFilePath = Path.join(dir, testFileName)
    await FS.writeFile(testFilePath, code)
    console.log(`Generated test for`, example.file.name)
  }))

  console.log(`Generated a test for each example.`)
}
