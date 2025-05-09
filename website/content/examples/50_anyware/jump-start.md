---
aside: false
---

# Jump Start

This example shows how you can jump start your anyware into any hook.
This is more succinct than having to manually write each hook execution
until your reach your desired one.

<!-- dprint-ignore-start -->
```ts twoslash
// Our website uses Vitepress+Twoslash. Twoslash does not discover the generated Graffle modules.
// Perhaps we can configure Twoslash to include them. Until we figure that out, we have to
// explicitly import them like this.
import './graffle/modules/global.js'
// ---cut---

import { Graffle } from 'graffle'

Graffle
  .create()
  .transport({ url: `http://localhost:3000/graphql` })
  // Notice how we **start** with the `exchange` hook, skipping the `encode` and `pack` hooks.
  .anyware(async ({ exchange }) => {
    //              ^^^^^^^^
    if (exchange.input.transportType !== `http`) return exchange()

    const mergedHeaders = new Headers(exchange.input.request.headers)
    mergedHeaders.set(`X-Custom-Header`, `123`)

    const { unpack } = await exchange({
      input: {
        ...exchange.input,
        request: {
          ...exchange.input.request,
          headers: mergedHeaders,
        },
      },
    })
    const { decode } = await unpack()
    const result = await decode()
    return result
  })
```
<!-- dprint-ignore-end -->
