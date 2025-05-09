::: details Example

<div class="ExampleSnippet">
<a href="../../examples/anyware/short-circuit">Short Circuit</a>

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
  .anyware(async ({ encode }) => {
    const { pack } = await encode()
    const { exchange } = await pack()

    if (exchange.input.transportType !== `http`) return exchange()

    const mergedHeaders = new Headers(exchange.input.request.headers)
    mergedHeaders.set(`X-Custom-Header`, `123`)
    // Notice how we **end** with the `exchange` hook, skipping the `unpack` and `decode` hooks.
    return await exchange({
      input: {
        ...exchange.input,
        request: {
          ...exchange.input.request,
          headers: mergedHeaders,
        },
      },
    })
  })
```
<!-- dprint-ignore-end -->

</div>
:::
