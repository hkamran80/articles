I've been moving a few [utilities](https://github.com/hkamran80/utilities-js) that I use in multiple projects to npm libraries. But I needed an easy, reliable way to generate TypeScript declarations, since I primarily use TypeScript.

1. Open your project and ensure you have a `package.json`

2. Install the `typescript` library as a development dependency

    - With `pnpm`: `pnpm i -D typescript`
    - With `npm`: `npm i -D typescript`
    - With `yarn`: `yarn add typescript -D`

3. Add the `prepare` script to the `scripts` object in `package.json`

   For example, mine looks like this:
   ```json
   "scripts": {
       "prepare": "tsc --declaration --emitDeclarationOnly --allowJs index.js"
   },
   ```

    This command runs `tsc`, the TypeScript compiler, and tells it to only generate `.d.ts` files (declaration files). Be sure to replace `index.js` with your JavaScript files.

4. Run the [`prepare` script](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)

   - With `pnpm`: `pnpm prepare` or `pnpm run prepare`
   - With `npm`: `npm run prepare`
   - With `yarn`: `yarn run prepare`