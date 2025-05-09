/**
 * This example shows how to use the `raw` configuration of transport configuration to easily access low-level `RequestInit` configuration.
 */

import { Graffle } from 'graffle'
import { show } from '../$/helpers.js'
import { publicGraphQLSchemaEndpoints } from '../$/helpers.js'

const graffle = Graffle
  .create()
  .transport({
    url: publicGraphQLSchemaEndpoints.Pokemon,
    raw: {
      mode: `cors`,
    },
  })
  .anyware(({ exchange }) => {
    show(exchange.input.request)
    return exchange()
  })

await graffle.gql`{ pokemons { name } }`.send()
