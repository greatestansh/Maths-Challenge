# A Different Kind of Close

A local React and TypeScript essay about how the series of powers of two converges to −1 in the 2-adic metric. Readers can compare low bits, use the distance and factorization lab, build the residue tree one level at a time, and explore both errors in the final convergence lab. The opening, tree explorer, and final lab share the term count.

Run these commands from this directory with a Node.js version supported by Vite.

```sh
npm ci
npm run dev
```

`npm test` runs the supplied arithmetic fixtures. `npm run build` checks TypeScript and writes the static build into `dist/`. After building, run `npx playwright install chromium` and `npm run test:browser` for browser verification. To use an installed Playwright browser channel, set `ADIC_BROWSER_CHANNEL` to its name, for example `msedge`.

The article draft lives in [`src/content/article.ts`](src/content/article.ts). See the [content review](docs/CONTENT_REVIEW.md) and the [QA report](docs/QA_REPORT.md).
