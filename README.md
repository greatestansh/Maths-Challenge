# A Different Kind of Close

An eight-stage React and TypeScript essay about how the series of powers of two converges to −1 in the 2-adic metric. The article develops the residue tree, describes closed balls and the strong triangle inequality, shows finite binary carrying, and constructs the address of 1/3. The opening, tree explorer, and convergence lab share the term count. [Read the deployed essay](https://maths-challenge-kappa.vercel.app).

Run these commands from this directory with a Node.js version supported by Vite.

```sh
npm ci
npm run dev
```

`npm test` runs the supplied arithmetic fixtures. `npm run build` checks TypeScript and writes the static build into `dist/`. After building, run `npx playwright install chromium` and `npm run test:browser` for browser verification. To use an installed Playwright browser channel, set `ADIC_BROWSER_CHANNEL` to its name, for example `msedge`.

The article copy lives in [`src/content/article.ts`](src/content/article.ts) and [`src/content/exposition.ts`](src/content/exposition.ts). See the [content review](docs/CONTENT_REVIEW.md) and the [QA report](docs/QA_REPORT.md).
